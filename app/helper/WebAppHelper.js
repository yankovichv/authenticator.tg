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

  getStorageItem(key, callback) {
    if (this.hasInitData) {
      this.api.CloudStorage.getItem(key, (error, data) => {
        if (!error && data) {
          callback(error, parseJSON(data))
        } else {
          callback(error, data)
        }
      })
    } else {
      callback(ERROR_MESSAGE)
    }
    return this
  }

  setStorageItem(key, value, callback) {
    if (this.hasInitData) {
      this.api.CloudStorage.setItem(key, JSON.stringify(value), () => {
        if (callback) {
          callback()
        }
      })
    } else {
      if (callback) {
        callback()
      }
    }
    return this
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
