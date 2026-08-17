/**
 * Проверка app/lib/totp.js — разбора того, что прилетает из сканера QR.
 * Сюда попадает любой мусор, на который навели камеру, поэтому главное
 * требование: функция сообщает «не распознал», но никогда не падает.
 */
const path = require('path')
const { transformFileSync } = require('@babel/core')

const ROOT = path.join(__dirname, '..')

/** Компилирует модуль приложения и разрешает webpack-алиасы вида @lib/... */
const load = (relative) => {
  const { code } = transformFileSync(path.join(ROOT, relative), {
    configFile: false,
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]],
  })

  const resolve = (request) => {
    if (request.startsWith('@lib/')) {
      return load(`app/lib/${request.slice('@lib/'.length).replace(/\.js$/, '')}.js`)
    }
    // otpauth-migration — ESM-пакет с директорными импортами, который node
    // напрямую не грузит (в сборке его разрешает webpack). Подменяем на
    // заглушку с тем же поведением: на битых данных библиотека бросает.
    // Проверяем этим свою обработку, а не чужую реализацию.
    if (request === 'otpauth-migration') {
      return {
        URI: {
          toOTPAuthURIs: (uri) => {
            if (!uri.includes('data=ok')) {
              throw new Error('malformed migration payload')
            }
            return [
              'otpauth://totp/Acme:one?issuer=Acme&secret=JBSWY3DPEHPK3PXP',
              'otpauth://hotp/Acme:two?issuer=Acme&secret=JBSWY3DPEHPK3PXP&counter=1',
              'garbage',
            ]
          },
        },
      }
    }
    return require(request)
  }

  const module_ = { exports: {} }
  new Function('module', 'exports', 'require', code)(module_, module_.exports, resolve)
  return module_.exports
}

const { ensureURIs, formatTitle } = load('app/lib/totp.js')

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures += 1
}

const safe = (name, fn, expected) => {
  let result
  try {
    result = fn()
  } catch (e) {
    check(name, false, `выброшено исключение: ${e.message}`)
    return
  }
  check(name, result.length === expected, `распознано ${result.length}, ожидалось ${expected}`)
}

console.log('\nРазбор QR-кодов')

const valid = 'otpauth://totp/GitHub:vova?issuer=GitHub&secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30'
safe('обычный otpauth распознан', () => ensureURIs(valid), 1)

safe('пустая строка', () => ensureURIs(''), 0)
safe('null', () => ensureURIs(null), 0)
safe('произвольный текст', () => ensureURIs('just some text from a poster'), 0)
safe('ссылка на сайт', () => ensureURIs('https://example.com/'), 0)

// Ровно тот случай, который ронял приложение: схема правильная, содержимое — нет.
safe('otpauth без секрета', () => ensureURIs('otpauth://totp/'), 0)
safe('otpauth с мусором внутри', () => ensureURIs('otpauth://totp/???&&&'), 0)
safe('hotp вместо totp', () => ensureURIs('otpauth://hotp/Acme:user?secret=JBSWY3DPEHPK3PXP&counter=1'), 0)

safe('битый otpauth-migration', () => ensureURIs('otpauth-migration://offline?data=not-base64!!'), 0)
safe('otpauth-migration без данных', () => ensureURIs('otpauth-migration://offline'), 0)

// Из пакетного импорта берём только рабочие TOTP: hotp и мусор отсеиваются,
// но не отменяют весь импорт целиком.
safe('импорт из Google Authenticator', () => ensureURIs('otpauth-migration://offline?data=ok'), 1)

console.log('\nПодписи аккаунтов')
try {
  check('issuer и label вместе', formatTitle('GitHub:vova', 'GitHub') === 'GitHub: vova', formatTitle('GitHub:vova', 'GitHub'))
  check('label совпадает с issuer', formatTitle('GitHub', 'GitHub') === 'GitHub')
  check('пустой label', formatTitle('', 'GitHub') === 'GitHub')
} catch (e) {
  check('formatTitle не падает', false, e.message)
}

console.log(failures === 0 ? '\nВСЁ ПРОШЛО' : `\nПРОВАЛОВ: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
