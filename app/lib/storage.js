import { v4 } from 'uuid'

/**
 * Accounts live in Telegram CloudStorage, one account per key.
 *
 * The first version of the app kept every account inside a single key, and
 * Telegram caps one value at 4096 characters — around 21 accounts. Writes
 * past that limit were refused by Telegram and reported as success by the
 * app, so accounts looked saved until the app was reopened. One key per
 * account moves the ceiling to 1024 accounts (Telegram's key limit) and
 * removes the single value that could overflow.
 */
const ACCOUNT_PREFIX = 'acc_'

/**
 * The original single-key storage. It is never deleted: it stays readable
 * for app versions still cached on a user's device, and LEGACY_BACKUP_KEY
 * keeps an untouched copy of whatever it held at migration time.
 */
const LEGACY_KEY = 'uris'
const LEGACY_BACKUP_KEY = 'uris_backup_v1'

/** Telegram has no documented cap on getItems, so keys are read in batches. */
const READ_BATCH = 100

/** Telegram refuses a stored value longer than this. */
const LEGACY_VALUE_LIMIT = 4096

const accountKey = (uuid) => `${ACCOUNT_PREFIX}${uuid}`

const byOrder = (a, b) => {
  return a.order === b.order ? a.uuid.localeCompare(b.uuid) : a.order - b.order
}

/**
 * @param {WebAppHelper} webApp
 * @returns {Promise<{accounts: Array, unreadable: number}>}
 */
export const loadAccounts = async (webApp) => {
  const keys = await webApp.storageKeys()
  const accountKeys = keys.filter((key) => key.startsWith(ACCOUNT_PREFIX))

  const stored = {}
  for (let i = 0; i < accountKeys.length; i += READ_BATCH) {
    Object.assign(stored, await webApp.storageGetMany(accountKeys.slice(i, i + READ_BATCH)))
  }

  const accounts = []
  let unreadable = 0

  for (const key of accountKeys) {
    const value = stored[key]
    if (!value || !value.uri) {
      // Left in place rather than dropped — the value is still in the cloud
      // and a later app version may be able to read it.
      unreadable += 1
      continue
    }
    accounts.push({
      uuid: key.slice(ACCOUNT_PREFIX.length),
      uri: value.uri,
      order: typeof value.order === 'number' ? value.order : accounts.length,
      group: value.group || null,
    })
  }

  const imported = await importLegacy(webApp, accounts, keys.includes(LEGACY_BACKUP_KEY))
  accounts.push(...imported)

  return { accounts: accounts.sort(byOrder), unreadable }
}

/**
 * Copies accounts the old single-key storage still holds and the new storage
 * does not. Runs on every load, so an account added by a cached old version
 * of the app is picked up instead of being invisible.
 *
 * Only additions are taken: an account missing from the legacy key is never
 * removed here, because the legacy key may itself have been truncated by
 * Telegram's 4096-character limit. An extra account is recoverable, a
 * deleted one is not.
 *
 * @param {WebAppHelper} webApp
 * @param {Array} accounts already stored under the new scheme
 * @param {boolean} hasBackup
 * @returns {Promise<Array>} newly imported accounts
 * @throws {Error} when a copied account cannot be read back
 */
const importLegacy = async (webApp, accounts, hasBackup) => {
  const legacy = await webApp.storageGet(LEGACY_KEY)
  if (!Array.isArray(legacy) || legacy.length === 0) {
    return []
  }

  if (!hasBackup) {
    // An untouched snapshot of the pre-migration state, kept forever.
    await webApp.storageSet(LEGACY_BACKUP_KEY, legacy)
  }

  // Matched on the account itself, not only on its id: an entry written by
  // an old version may have lost its uuid, and matching by id alone would
  // import it again on every single launch.
  const known = new Set(accounts.map(({ uuid }) => uuid))
  const seen = new Set(accounts.map(({ uri }) => uri))

  const missing = legacy.filter((item) => {
    if (!item || !item.uri || known.has(item.uuid) || seen.has(item.uri)) {
      return false
    }
    seen.add(item.uri)
    return true
  })

  if (missing.length === 0) {
    return []
  }

  let order = accounts.reduce((max, item) => Math.max(max, item.order), -1)
  const imported = missing.map((item) => {
    order += 1
    return { uuid: item.uuid || v4(), uri: item.uri, order, group: null }
  })

  for (const account of imported) {
    await writeAccount(webApp, account)
  }

  // Read back before reporting success: a write Telegram refused must not
  // pass for a migrated account.
  const written = await webApp.storageGetMany(imported.map(({ uuid }) => accountKey(uuid)))
  for (const account of imported) {
    const value = written[accountKey(account.uuid)]
    if (!value || value.uri !== account.uri) {
      throw new Error('Migration could not be verified')
    }
  }

  return imported
}

const writeAccount = (webApp, { uuid, uri, order, group }) => {
  return webApp.storageSet(accountKey(uuid), { uri, order, group })
}

/**
 * Accounts are written one by one and reported individually: when a QR code
 * carries several accounts and only some of them are stored, the user has to
 * learn which ones actually made it.
 *
 * @param {WebAppHelper} webApp
 * @param {string[]} uris
 * @param {Array} accounts current accounts
 * @returns {Promise<{added: Array, failed: number}>}
 */
export const addAccounts = async (webApp, uris, accounts) => {
  let order = accounts.reduce((max, item) => Math.max(max, item.order), -1)

  const added = []
  let failed = 0

  for (const uri of uris) {
    order += 1
    const account = { uuid: v4(), uri, order, group: null }

    try {
      await writeAccount(webApp, account)
      added.push(account)
    } catch (e) {
      failed += 1
    }
  }

  return { added, failed }
}

/**
 * @param {WebAppHelper} webApp
 * @param {Object} account
 * @returns {Promise<void>}
 */
export const updateAccount = (webApp, account) => {
  return writeAccount(webApp, account)
}

/**
 * @param {WebAppHelper} webApp
 * @param {string} uuid
 * @returns {Promise<void>}
 */
export const removeAccount = (webApp, uuid) => {
  return webApp.storageRemove(accountKey(uuid))
}

/**
 * Works out where a dragged account lands, without touching storage.
 *
 * The new order value is computed here, in the same step that produces the
 * list shown on screen, so what the user sees and what gets written can
 * never disagree. Splitting the two apart caused a real bug: the displayed
 * list was reordered while the accounts still carried their old order
 * values, so a second drag started from stale numbers and saved a different
 * order than the one on screen.
 *
 * Only the moved account needs writing — it takes a value between its new
 * neighbours, so a drag costs one round-trip instead of one per account.
 * Fractions eventually run out of precision; that case renumbers the whole
 * list rather than silently failing to move.
 *
 * @param {Array} accounts
 * @param {number} from
 * @param {number} to
 * @returns {{accounts: Array, dirty: Array}} the new list, and what to save
 */
export const planMove = (accounts, from, to) => {
  const next = [...accounts]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)

  const before = next[to - 1]
  const after = next[to + 1]

  let order
  if (!before) {
    order = (after ? after.order : 0) - 1
  } else if (!after) {
    order = before.order + 1
  } else {
    order = (before.order + after.order) / 2
    if (order === before.order || order === after.order) {
      const renumbered = next.map((account, index) => ({ ...account, order: index }))
      return { accounts: renumbered, dirty: renumbered }
    }
  }

  const updated = { ...moved, order }
  next[to] = updated

  return { accounts: next, dirty: [updated] }
}

/**
 * @param {WebAppHelper} webApp
 * @param {Array} accounts
 * @returns {Promise<void>}
 */
export const saveAccounts = async (webApp, accounts) => {
  for (const account of accounts) {
    await writeAccount(webApp, account)
  }
}

/**
 * Keeps the legacy key in step with the new storage, so an app version still
 * cached on another device shows the current list instead of a stale one.
 *
 * The legacy key holds every account in one value, and Telegram refuses it
 * past 4096 characters — so it is written with as many accounts as fit and
 * no more. Writing the truncated list rather than failing outright is what
 * keeps deletions honest: an account removed here is gone from the legacy
 * key too, so the next load cannot import it back.
 *
 * The write itself is best effort — it changes nothing about what was
 * actually saved, so a failure is not surfaced to the user.
 *
 * @param {WebAppHelper} webApp
 * @param {Array} accounts
 * @returns {Promise<void>}
 */
export const mirrorLegacy = async (webApp, accounts) => {
  const mirrored = []

  for (const { uuid, uri } of accounts) {
    const next = [...mirrored, { uuid, uri }]
    if (JSON.stringify(next).length > LEGACY_VALUE_LIMIT) {
      break
    }
    mirrored.push({ uuid, uri })
  }

  try {
    await webApp.storageSet(LEGACY_KEY, mirrored)
  } catch (e) {
    // Intentionally ignored, see above.
  }
}

