import WebApp from '@twa-dev/sdk'
import { parseJSON } from '@lib/json.js'
import {THEME_DARK, THEME_LIGHT} from '@lib/theme.js'

const ERROR_MESSAGE = 'Api is not available'

export default class WebAppHelper {
  constructor() {

    this.api = WebApp.default
    this.hasInitData = !!this.api['initData']

    this.mainButtonCallback = undefined
    this.backButtonCallback = undefined
    this.settingsButtonCallback = undefined
  }

  getTheme() {
    if (this.hasInitData) {
      return this.api.colorScheme === 'light' ? THEME_LIGHT : THEME_DARK
    }
    return THEME_DARK
  }

  /**
   *
   * @param {'themeChanged'} eventType
   * @param {Function} callback
   * @returns {this}
   */
  onEvent(eventType, callback) {
    if (this.hasInitData) {
      return this.api.onEvent(eventType, callback)
    }
    return this
  }

  /**
   *
   * @param {'themeChanged'} eventType
   * @param {Function} callback
   * @returns {this}
   */
  offEvent(eventType, callback) {
    if (this.hasInitData) {
      return this.api.onEvent(eventType, callback)
    }
    return this
  }

  expand() {
    if (this.hasInitData) {
      this.api.expand()
    }
    return this
  }

  disableVerticalSwipes() {
    if (this.hasInitData) {
      this.api.disableVerticalSwipes()
    }
    return this
  }

  /**
   * Telegram CloudStorage is the only place where accounts live, so every
   * call below reports failures instead of swallowing them. A write that
   * silently fails loses a secret the user cannot recover.
   *
   * @returns {Object} CloudStorage API
   * @throws {Error} when running outside Telegram or on a client without CloudStorage
   */
  get storage() {
    if (!this.hasInitData || !this.api.CloudStorage) {
      throw new Error(ERROR_MESSAGE)
    }
    return this.api.CloudStorage
  }

  /**
   * @param {string} key
   * @returns {Promise<*>} parsed value, or null when the key is empty
   */
  storageGet(key) {
    return new Promise((resolve, reject) => {
      this.storage.getItem(key, (error, data) => {
        if (error) {
          reject(new Error(error))
          return
        }
        resolve(data ? parseJSON(data) : null)
      })
    })
  }

  /**
   * @param {string[]} keys
   * @returns {Promise<Object>} map of key to parsed value; missing keys are omitted
   */
  storageGetMany(keys) {
    if (keys.length === 0) {
      return Promise.resolve({})
    }

    return new Promise((resolve, reject) => {
      this.storage.getItems(keys, (error, values) => {
        if (error) {
          reject(new Error(error))
          return
        }

        const result = {}
        for (const key of Object.keys(values || {})) {
          if (values[key]) {
            result[key] = parseJSON(values[key])
          }
        }
        resolve(result)
      })
    })
  }

  /**
   * @returns {Promise<string[]>}
   */
  storageKeys() {
    return new Promise((resolve, reject) => {
      this.storage.getKeys((error, keys) => {
        if (error) {
          reject(new Error(error))
          return
        }
        resolve(keys || [])
      })
    })
  }

  /**
   * Telegram caps a single value at 4096 characters and answers with
   * stored=false when it refuses the write, so both cases reject here.
   *
   * @param {string} key
   * @param {*} value
   * @returns {Promise<void>}
   */
  storageSet(key, value) {
    return new Promise((resolve, reject) => {
      this.storage.setItem(key, JSON.stringify(value), (error, stored) => {
        if (error) {
          reject(new Error(error))
          return
        }
        if (stored === false) {
          reject(new Error(`Telegram refused to store "${key}"`))
          return
        }
        resolve()
      })
    })
  }

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  storageRemove(key) {
    return new Promise((resolve, reject) => {
      this.storage.removeItem(key, (error, removed) => {
        if (error) {
          reject(new Error(error))
          return
        }
        if (removed === false) {
          reject(new Error(`Telegram refused to remove "${key}"`))
          return
        }
        resolve()
      })
    })
  }

  setHeaderColor(color) {
    if (this.hasInitData) {
      this.api.setHeaderColor(color)
    }
    return this
  }

  drawBackButton(callback) {
    if (this.hasInitData) {
      if (this.backButtonCallback) {
        this.api.BackButton.offClick(this.backButtonCallback)
      }
      this.backButtonCallback = callback
      this.api.BackButton.onClick(callback)
      this.api.BackButton.show()
    }
    return this
  }

  removeBackButton() {
    if (this.hasInitData) {
      this.api.BackButton.hide()
      if (this.backButtonCallback) {
        this.api.BackButton.offClick(this.backButtonCallback)
      }
    }
    return this
  }

  /**
   * The settings button lives in Telegram's own menu and needs client 6.10+.
   * On older clients it simply never appears, so it must not be the only way
   * to reach anything essential.
   *
   * @param {Function} callback
   * @returns {this}
   */
  drawSettingsButton(callback) {
    if (this.hasInitData) {
      if (this.settingsButtonCallback) {
        this.api.SettingsButton.offClick(this.settingsButtonCallback)
      }
      this.settingsButtonCallback = callback
      this.api.SettingsButton.onClick(callback)
      this.api.SettingsButton.show()
    }
    return this
  }

  removeSettingsButton() {
    if (this.hasInitData) {
      this.api.SettingsButton.hide()
      if (this.settingsButtonCallback) {
        this.api.SettingsButton.offClick(this.settingsButtonCallback)
      }
    }
    return this
  }

  removeMainButton() {
    if (this.hasInitData) {
      this.api.MainButton.hide()
      if (this.mainButtonCallback) {
        this.api.MainButton.offClick(this.mainButtonCallback)
      }
    }
    return this
  }

  drawMainButton(text, background, foreground, callback) {
    if (this.hasInitData) {
      if (this.mainButtonCallback) {
        this.api.MainButton.offClick(this.mainButtonCallback)
      }
      this.api.MainButton.setText(text)
      this.mainButtonCallback = callback
      this.setMainButtonColor(background, foreground)
      this.api.MainButton.onClick(callback)
    }
    return this
  }

  setMainButtonColor(background, foreground) {
    if (this.hasInitData) {
      this.api.MainButton.color = background
      this.api.MainButton.textColor = foreground
    }
    return this
  }

  showMainButton() {
    if (this.hasInitData && !this.api.MainButton.isVisible) {
      this.api.MainButton.show()
    }
    return this
  }

  showScanQrPopup(text, callback) {
    if (this.hasInitData) {
      this.api.closeScanQrPopup()
      this.api.showScanQrPopup({text}, (uri) => {
        this.api.closeScanQrPopup()
        callback(uri)
      })
    }
    return this
  }

  closeScanQrPopup() {
    if (this.hasInitData) {
      this.api.closeScanQrPopup()
    }
    return this
  }

  showPopup(title, message, buttons = undefined, callback) {
    if (this.hasInitData) {
      this.api.showPopup({ title, message, buttons }, callback)
    }

    return this
  }

  /**
   * Confirms by touch that a card was picked up — on a phone the delay
   * before a drag starts is otherwise invisible.
   *
   * @param {'light'|'medium'|'heavy'|'rigid'|'soft'} style
   * @returns {WebAppHelper}
   */
  impactOccurred(style) {
    if (this.hasInitData) {
      this.api.HapticFeedback.impactOccurred(style)
    }
    return this
  }

  /**
   *
   * @param {'error'|'success'|'warning'} type
   * @returns {WebAppHelper}
   */
  notificationOccurred(type) {
    if (this.hasInitData) {
      this.api.HapticFeedback.notificationOccurred(type)
    }
    return this
  }
}
