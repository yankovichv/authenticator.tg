/**
 * Проверка app/lib/storage.js против мока Telegram CloudStorage,
 * который ведёт себя как настоящий: значение больше 4096 символов
 * не сохраняется, и об этом сообщается через stored === false.
 */
const path = require('path')
const { transformFileSync } = require('@babel/core')

const ROOT = path.join(__dirname, '..')

const { code } = transformFileSync(path.join(ROOT, 'app/lib/storage.js'), {
  configFile: false,
  presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]],
})

const module_ = { exports: {} }
new Function('module', 'exports', 'require', code)(module_, module_.exports, require)
const storage = module_.exports

// --- мок Telegram CloudStorage -------------------------------------------

const VALUE_LIMIT = 4096
const KEY_LIMIT = 1024

class CloudStorage {
  constructor() {
    this.data = new Map()
    this.refused = 0
  }

  setItem(key, value, cb) {
    if (value.length > VALUE_LIMIT || (this.data.size >= KEY_LIMIT && !this.data.has(key))) {
      this.refused += 1
      cb(null, false)
      return
    }
    this.writes = (this.writes || 0) + 1
    this.data.set(key, value)
    cb(null, true)
  }

  getItem(key, cb) { cb(null, this.data.get(key) || '') }
  getItems(keys, cb) {
    const out = {}
    for (const k of keys) out[k] = this.data.get(k) || ''
    cb(null, out)
  }
  getKeys(cb) { cb(null, [...this.data.keys()]) }
  removeItem(key, cb) { this.data.delete(key); cb(null, true) }
}

/** Промис-обёртки — тот же контракт, что в WebAppHelper. */
const webAppFor = (cloud) => ({
  storageGet: (key) => new Promise((res, rej) =>
    cloud.getItem(key, (e, d) => e ? rej(new Error(e)) : res(d ? JSON.parse(d) : null))),
  storageGetMany: (keys) => new Promise((res, rej) =>
    cloud.getItems(keys, (e, v) => {
      if (e) return rej(new Error(e))
      const out = {}
      for (const k of Object.keys(v || {})) if (v[k]) out[k] = JSON.parse(v[k])
      res(out)
    })),
  storageKeys: () => new Promise((res, rej) =>
    cloud.getKeys((e, k) => e ? rej(new Error(e)) : res(k || []))),
  storageSet: (key, value) => new Promise((res, rej) =>
    cloud.setItem(key, JSON.stringify(value), (e, stored) => {
      if (e) return rej(new Error(e))
      if (stored === false) return rej(new Error(`Telegram refused to store "${key}"`))
      res()
    })),
  storageRemove: (key) => new Promise((res, rej) =>
    cloud.removeItem(key, (e, removed) => {
      if (e) return rej(new Error(e))
      if (removed === false) return rej(new Error('refused'))
      res()
    })),
})

const uri = (n) => `otpauth://totp/Service${n}:yankovichvladimir%40gmail.com?issuer=Service${n}&secret=JBSWY3DPEHPK3PXPJBSWY3DP&algorithm=SHA1&digits=6&period=30`

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures += 1
}

const run = async () => {
  // --- 1. Старая схема: где именно она ломалась ---------------------------
  console.log('\n1. Старое хранилище (один ключ на всё)')
  {
    const cloud = new CloudStorage()
    const list = []
    let lost = 0
    for (let i = 1; i <= 30; i += 1) {
      list.push({ uuid: `uuid-${String(i).padStart(4, '0')}-aaaa-bbbb-cccc-dddddddddddd`, uri: uri(i) })
      await new Promise((res) => cloud.setItem('uris', JSON.stringify(list), (e, stored) => {
        if (stored === false) lost += 1
        res()
      }))
    }
    const saved = JSON.parse(cloud.data.get('uris')).length
    check('на 30 добавлений часть записей отвергнута Telegram', lost > 0, `сохранено ${saved}, отказов ${lost}`)
  }

  // --- 2. Миграция --------------------------------------------------------
  console.log('\n2. Миграция со старой схемы на новую')
  const cloud = new CloudStorage()
  const webApp = webAppFor(cloud)

  const legacy = []
  for (let i = 1; i <= 21; i += 1) {
    legacy.push({ uuid: `uuid-${String(i).padStart(4, '0')}-aaaa-bbbb-cccc-dddddddddddd`, uri: uri(i) })
  }
  cloud.data.set('uris', JSON.stringify(legacy))
  const legacyRaw = cloud.data.get('uris')

  let { accounts, unreadable } = await storage.loadAccounts(webApp)
  check('перенесены все аккаунты', accounts.length === 21, `перенесено ${accounts.length} из 21`)
  check('нечитаемых записей нет', unreadable === 0)
  check('старый ключ не тронут', cloud.data.get('uris') === legacyRaw)
  check('создан бэкап uris_backup_v1', cloud.data.has('uris_backup_v1'))
  check('каждый аккаунт лежит отдельным ключом', [...cloud.data.keys()].filter((k) => k.startsWith('acc_')).length === 21)

  // --- 3. Идемпотентность -------------------------------------------------
  console.log('\n3. Повторный запуск не дублирует')
  await storage.mirrorLegacy(webApp, accounts)
  const again = await storage.loadAccounts(webApp)
  check('количество не изменилось', again.accounts.length === 21, `стало ${again.accounts.length}`)
  accounts = again.accounts

  // --- 4. Потолок ушёл ----------------------------------------------------
  console.log('\n4. Новая схема выдерживает то, на чём ломалась старая')
  {
    const uris = []
    for (let i = 22; i <= 60; i += 1) uris.push(uri(i))
    const { added, failed } = await storage.addAccounts(webApp, uris, accounts)
    accounts = [...accounts, ...added]
    await storage.mirrorLegacy(webApp, accounts)
    check('добавлены все 39 аккаунтов', added.length === 39 && failed === 0, `добавлено ${added.length}, отказов ${failed}`)

    const reloaded = await storage.loadAccounts(webApp)
    check('после перезагрузки на месте все 60', reloaded.accounts.length === 60, `прочитано ${reloaded.accounts.length}`)
    accounts = reloaded.accounts
  }

  // --- 5. Удаление не откатывается миграцией ------------------------------
  console.log('\n5. Удалённый аккаунт не возвращается')
  {
    const victim = accounts[0]
    await storage.removeAccount(webApp, victim.uuid)
    accounts = accounts.filter((a) => a.uuid !== victim.uuid)
    await storage.mirrorLegacy(webApp, accounts)

    const reloaded = await storage.loadAccounts(webApp)
    check('аккаунтов стало 59', reloaded.accounts.length === 59, `стало ${reloaded.accounts.length}`)
    check('удалённый не вернулся', !reloaded.accounts.some((a) => a.uuid === victim.uuid))
  }

  // --- 6. Отказ записи виден ----------------------------------------------
  console.log('\n6. Отказ Telegram при записи не выдаётся за успех')
  {
    const full = new CloudStorage()
    full.setItem = (key, value, cb) => cb(null, false)
    const { added, failed } = await storage.addAccounts(webAppFor(full), [uri(1), uri(2)], [])
    check('ни один не записан и это сообщено', added.length === 0 && failed === 2, `added=${added.length}, failed=${failed}`)
  }

  // --- 7. Аккаунт, добавленный старой версией, подхватывается -------------
  console.log('\n7. Аккаунт, добавленный старой версией приложения')
  {
    const stale = JSON.parse(cloud.data.get('uris'))
    stale.push({ uuid: 'uuid-9999-aaaa-bbbb-cccc-dddddddddddd', uri: uri(99) })
    cloud.data.set('uris', JSON.stringify(stale))

    const reloaded = await storage.loadAccounts(webApp)
    check('подхвачен в новую схему', reloaded.accounts.some((a) => a.uuid === 'uuid-9999-aaaa-bbbb-cccc-dddddddddddd'))
  }

  // --- 8. Сорванная миграция не выдаётся за успешную ----------------------
  console.log('\n8. Миграция, которую не удалось проверить, падает честно')
  {
    const broken = new CloudStorage()
    broken.data.set('uris', JSON.stringify(legacy.slice(0, 3)))
    const brokenApp = webAppFor(broken)
    const realSet = broken.setItem.bind(broken)
    broken.setItem = (key, value, cb) => {
      if (key.startsWith('acc_')) return cb(null, true)   // соврал, что сохранил
      return realSet(key, value, cb)
    }

    let threw = false
    try {
      await storage.loadAccounts(brokenApp)
    } catch (e) {
      threw = true
      check('ошибка внятная', /verified/i.test(e.message), e.message)
    }
    check('загрузка завершилась ошибкой, а не тишиной', threw)
    check('старый ключ при этом цел', JSON.parse(broken.data.get('uris')).length === 3)
  }

  // --- 8b. Аккаунты не размножаются ---------------------------------------
  console.log('\n8b. Повторные запуски не плодят дубли')
  {
    const cloud8 = new CloudStorage()
    // Зеркало старого ключа не записывается: сеть моргнула, лимит, что угодно.
    const realSet = cloud8.setItem.bind(cloud8)
    cloud8.setItem = (key, value, cb) => (key === 'uris' ? cb('write failed') : realSet(key, value, cb))

    // Первая запись пришла из старой версии без uuid — раньше такой аккаунт
    // импортировался заново при каждом запуске.
    cloud8.data.set('uris', JSON.stringify([{ uri: uri(1) }, { uuid: 'kept-uuid-0001', uri: uri(2) }]))
    const app8 = webAppFor(cloud8)

    const counts = []
    for (let i = 0; i < 3; i += 1) {
      const result = await storage.loadAccounts(app8)
      await storage.mirrorLegacy(app8, result.accounts)
      counts.push(result.accounts.length)
    }

    check('на трёх запусках подряд ровно два аккаунта', counts.join(',') === '2,2,2', `получилось ${counts.join(',')}`)
  }

  // --- 9. Перетаскивание ---------------------------------------------------
  console.log('\n9. Перестановка аккаунтов')
  {
    const cloud9 = new CloudStorage()
    const app9 = webAppFor(cloud9)
    const names = (list) => list.map((a) => a.uri.match(/totp\/Service(\d+)/)[1]).join(',')

    const move = async (app, list, from, to) => {
      const { accounts, dirty } = storage.planMove(list, from, to)
      await storage.saveAccounts(app, dirty)
      return accounts
    }

    let list = (await storage.addAccounts(app9, [uri(1), uri(2), uri(3), uri(4)], [])).added
    check('исходный порядок', names(list) === '1,2,3,4', names(list))

    cloud9.writes = 0
    list = await move(app9, list, 0, 2)
    check('перетащили первый на третье место', names(list) === '2,3,1,4', names(list))
    check('записан только один аккаунт', cloud9.writes === 1, `записей: ${cloud9.writes}`)

    let reloaded = await storage.loadAccounts(app9)
    check('порядок пережил перезагрузку', names(reloaded.accounts) === '2,3,1,4', names(reloaded.accounts))

    list = await move(app9, reloaded.accounts, 3, 0)
    check('перетащили последний в начало', names(list) === '4,2,3,1', names(list))

    reloaded = await storage.loadAccounts(app9)
    check('и это пережило перезагрузку', names(reloaded.accounts) === '4,2,3,1', names(reloaded.accounts))

    // Дробный порядок рано или поздно упирается в точность float — тогда
    // список должен перенумероваться целиком, а не тихо перестать двигаться.
    let squeezed = reloaded.accounts
    for (let i = 0; i < 60; i += 1) {
      squeezed = await move(app9, squeezed, 3, 1)
      squeezed = await move(app9, squeezed, 1, 3)
    }
    check('после 120 перестановок порядок всё ещё меняется',
      names(await move(app9, squeezed, 0, 3)) !== names(squeezed))

    const final = await storage.loadAccounts(app9)
    check('и читается из облака без потерь', final.accounts.length === 4, `аккаунтов: ${final.accounts.length}`)
  }

  // --- 10. Быстрые перетаскивания подряд -----------------------------------
  console.log('\n10. Несколько перетаскиваний подряд')
  {
    // Запись в облако отвечает не мгновенно, а пользователь тащит дальше,
    // не дожидаясь её. Ровно так порядок и разъезжался с показанным.
    const slow = new CloudStorage()
    const realSet = slow.setItem.bind(slow)
    slow.setItem = (key, value, cb) => setTimeout(() => realSet(key, value, cb), 40)

    const app10 = webAppFor(slow)
    const names10 = (list) => list.map((a) => a.uri.match(/totp\/Service(\d+)/)[1]).join(',')

    let shown = (await storage.addAccounts(app10, [uri(1), uri(2), uri(3), uri(4), uri(5)], [])).added
    const writes = []

    // Три перетаскивания подряд: каждое считает от того, что уже на экране.
    for (const [from, to] of [[0, 4], [0, 4], [1, 3]]) {
      const { accounts, dirty } = storage.planMove(shown, from, to)
      shown = accounts
      writes.push(storage.saveAccounts(app10, dirty))
    }

    await Promise.all(writes)

    const after = await storage.loadAccounts(app10)
    check('в облаке ровно то, что было на экране',
      names10(after.accounts) === names10(shown),
      `на экране ${names10(shown)}, в облаке ${names10(after.accounts)}`)
  }

  console.log(failures === 0 ? '\nВСЁ ПРОШЛО' : `\nПРОВАЛОВ: ${failures}`)
  process.exit(failures === 0 ? 0 : 1)
}

run().catch((e) => { console.error('ОШИБКА ТЕСТА:', e); process.exit(1) })
