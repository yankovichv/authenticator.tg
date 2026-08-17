import { loadAccounts, addAccounts, updateAccount, removeAccount, planMove, saveAccounts, mirrorLegacy } from '@lib/storage'
import { formatLabel, ensureURIs, parseURI } from '@lib/totp'
import ViewExport from '@containers/PageMain/ViewExport'
import ViewCards from '@containers/PageMain/ViewCards'
import ViewEmpty from '@containers/PageMain/ViewEmpty'
import ViewError from '@containers/PageMain/ViewError'
import ViewEdit from '@containers/PageMain/ViewEdit'
import Notificator from '@components/Notificator'
import WebAppHelper from '@helper/WebAppHelper'
import copyToClipboard from 'copy-to-clipboard'
import Spinner from '@components/Spinner'
import Layout from '@components/Layout'
import { connect } from 'react-redux'
import Block from '@components/Block'
import { getColor } from '@lib/theme'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { URI } from 'otpauth'
import React from 'react'

class PageMain extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      accounts: [],
      process: true,
      error: null,
      editItem: null,
      exporting: false,
      notificatorText: null,
      notificatorKey: 0
    }

    this.mounted = false
    this.webApp = new WebAppHelper()
  }

  static propTypes = {
    theme: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
  }

  componentDidMount() {
    this.mounted = true
    this.webApp
      .expand()
      .disableVerticalSwipes()
      .setHeaderColor(getColor(this.props.theme, 'background'))

    this.load()
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.theme) {
      this.webApp.setHeaderColor(getColor(this.props.theme, 'background'))

      if (this.view === 'edit') {
        const foreground = getColor('fixed', 'white_100')
        const background = getColor(this.props.theme, 'warning_100')
        this.webApp.setMainButtonColor(background, foreground)
      } else {
        const background = getColor(this.props.theme, 'foreground')
        const foreground = getColor(this.props.theme, 'background')
        this.webApp.setMainButtonColor(background, foreground)
      }
    }
  }

  render() {
    return (
      <Layout
        style={this.props.style}
        className={classNames('', {
          [this.props.className]: !!this.props.className,
        })}
      >
        {this.view === 'process' &&
          <Block
            fillX
            fillY
            display="flex"
            alignX="center"
            alignY="center"
          >
            <Spinner
              size={32}
              fill="primary-050"
            />
          </Block>
        }

        {this.view === 'error' &&
          <ViewError
            message={this.state.error}
            onMounted={() => {
              this.webApp.removeSettingsButton()
              this.retryButton()
            }}
          />
        }

        {this.view === 'empty' &&
          <ViewEmpty
            onMounted={() => {
              this.webApp.removeSettingsButton()
              this.addAccountButton()
            }}
          />
        }

        {this.view === 'cards' &&
          <ViewCards
            accounts={this.state.accounts}
            onMounted={() => {
              this.addAccountButton()
              this.webApp.drawSettingsButton(() => {
                this.setState({ exporting: true, notificatorText: null })
              })
            }}
            onCopy={(code) => {
              copyToClipboard(`${code}`, {
                format: 'text/plain',
                onCopy: () => {
                  this.notify('Code copied to clipboard')
                }
              })
            }}
            onMove={(from, to) => this.reorder(from, to)}
            onGrab={() => this.webApp.impactOccurred('light')}
            onEdit={({ uuid, totp }) => {
              this.setState({ editItem: { uuid, label: totp.label, issuer: totp.issuer }, notificatorText: null }, () => {
                this.webApp.drawBackButton(() => this.saveLabel(uuid))
              })
            }}
          />
        }

        {this.view === 'export' &&
          <ViewExport
            count={this.state.accounts.length}
            onMounted={() => {
              this.webApp.removeSettingsButton()
              this.webApp.drawBackButton(() => {
                this.setState({ exporting: false }, () => this.webApp.removeBackButton())
              })

              const background = getColor(this.props.theme, 'foreground')
              const foreground = getColor(this.props.theme, 'background')
              const label = this.state.accounts.length === 1 ? 'Copy account' : `Copy ${this.state.accounts.length} accounts`

              this.webApp
                .drawMainButton(label, background, foreground, () => this.copyAll())
                .showMainButton()
            }}
          />
        }

        {this.view === 'edit' &&
          <ViewEdit
            issuer={this.state.editItem.issuer}
            label={formatLabel(this.state.editItem.label, this.state.editItem.issuer)}
            onClear={() => {
              this.setState({ editItem: { ...this.state.editItem, label: '' } })
            }}
            onChange={(e) => {
              this.setState({ editItem: { ...this.state.editItem, label: e.target.value } })
            }}
            onMounted={() => {
              this.webApp.removeSettingsButton()

              const foreground = getColor('fixed', 'white_100')
              const background = getColor(this.props.theme, 'warning_100')

              this.webApp.drawMainButton('Remove account', background, foreground, () => {
                this.webApp.notificationOccurred('warning')

                const title = `Remove ${this.state.editItem.issuer}?`
                const message = `When you remove this account from Authenticator, you won't get codes to help you sign in securely anymore.`
                const buttons = [
                  { id: '1', type: 'cancel' },
                  { id: '2', type: 'destructive', text: 'Remove' }
                ]

                this.webApp.showPopup(title, message, buttons, (buttonId) => {
                  if (buttonId === '2') {
                    this.remove(this.state.editItem.uuid)
                  }
                })
              })
            }}
          />
        }

        {this.state.notificatorText &&
          <Notificator
            key={this.state.notificatorKey}
            style={{ position: 'fixed' }}
            onHide={() => this.setState({ notificatorText: null })}
          >
            {this.state.notificatorText}
          </Notificator>
        }
      </Layout>
    )
  }

  get view() {
    if (this.state.process) {
      return 'process'
    }
    if (this.state.error) {
      return 'error'
    }
    if (this.state.accounts.length > 0) {
      if (this.state.editItem) {
        return 'edit'
      }
      return this.state.exporting ? 'export' : 'cards'
    }
    return 'empty'
  }

  async load() {
    this.setState({ process: true, error: null })

    try {
      const { accounts, unreadable } = await loadAccounts(this.webApp)
      if (!this.mounted) {
        return
      }

      this.setState({ process: false, accounts })
      mirrorLegacy(this.webApp, accounts)

      if (unreadable > 0) {
        // Could be a value this version does not understand or one that did
        // not come back from Telegram — either way it is still stored, and
        // saying anything more specific would be a guess.
        this.webApp.showPopup('', `${unreadable} ${unreadable === 1 ? 'account' : 'accounts'} could not be read. Nothing was deleted — try reopening the app.`)
      }
    } catch (e) {
      if (this.mounted) {
        this.setState({ process: false, error: e.message })
      }
    }
  }

  async saveLabel(uuid) {
    const account = this.state.accounts.find((item) => item.uuid === uuid)
    if (!account) {
      this.setState({ editItem: null }, () => this.webApp.removeBackButton())
      return
    }

    const totp = parseURI(account.uri)
    totp.label = this.state.editItem.label || totp.issuer

    const updated = { ...account, uri: URI.stringify(totp) }

    try {
      await updateAccount(this.webApp, updated)
      if (!this.mounted) {
        return
      }

      const accounts = this.state.accounts.map((item) => {
        return item.uuid === uuid ? updated : item
      })

      this.setState({ accounts, editItem: null }, () => {
        this.webApp.removeBackButton()
        mirrorLegacy(this.webApp, accounts)
      })
    } catch (e) {
      if (this.mounted) {
        this.setState({ editItem: null }, () => {
          this.webApp.removeBackButton()
          this.webApp.notificationOccurred('error')
          this.webApp.showPopup('', `The new name could not be saved. Your account itself is untouched.`)
        })
      }
    }
  }

  async reorder(from, to) {
    const previous = this.state.accounts
    const { accounts, dirty } = planMove(previous, from, to)

    // Applied in the same frame the card is dropped, and carrying the very
    // values that are about to be written. Waiting for Telegram to confirm
    // first would make the list snap back and reorder again; showing a list
    // whose positions are not yet computed would make the next drag save a
    // different order than the one on screen.
    this.setState({ accounts })

    try {
      await saveAccounts(this.webApp, dirty)
      if (!this.mounted) {
        return
      }

      mirrorLegacy(this.webApp, accounts)
    } catch (e) {
      if (!this.mounted) {
        return
      }

      this.setState({ accounts: previous }, () => {
        this.webApp.notificationOccurred('error')
        this.webApp.showPopup('', 'The new order could not be saved, so the list was left as it was.')
      })
    }
  }

  async remove(uuid) {
    try {
      await removeAccount(this.webApp, uuid)
      if (!this.mounted) {
        return
      }

      const accounts = this.state.accounts.filter((item) => item.uuid !== uuid)

      this.setState({ accounts, editItem: null }, () => {
        this.webApp.removeBackButton()
        mirrorLegacy(this.webApp, accounts)
        this.notify('Account has been successfully removed')
      })
    } catch (e) {
      if (this.mounted) {
        this.webApp.notificationOccurred('error')
        this.webApp.showPopup('', `This account could not be removed. It is still stored and still generates codes.`)
      }
    }
  }

  async add(uri) {
    const uris = ensureURIs(uri)
    if (uris.length === 0) {
      this.webApp.notificationOccurred('error')
      this.webApp.showPopup('', 'Unable to recognize this QR code.')
      return
    }

    const { added, failed } = await addAccounts(this.webApp, uris, this.state.accounts)
    if (!this.mounted) {
      return
    }

    const accounts = [...this.state.accounts, ...added]
    this.setState({ accounts }, () => {
      mirrorLegacy(this.webApp, accounts)
    })

    if (failed === 0) {
      this.notify(added.length === 1 ? 'Account successfully added' : `${added.length} accounts successfully added`)
      return
    }

    // Never report a save that Telegram refused as a success — the account
    // would disappear as soon as the app is reopened.
    this.webApp.notificationOccurred('error')
    this.webApp.showPopup('', added.length === 0
      ? `Telegram could not store this account, so it was not saved. Please try again.`
      : `Only ${added.length} of ${uris.length} accounts could be stored. The rest were not saved — please try adding them again.`)
  }

  addAccountButton() {
    const background = getColor(this.props.theme, 'foreground')
    const foreground = getColor(this.props.theme, 'background')
    this.webApp
      .drawMainButton('Add account', background, foreground, () => {
        this.webApp.showScanQrPopup('Google Authenticator import is also supported.', (uri) => {
          this.add(uri)
        })
      })
      .showMainButton()
  }

  /**
   * The secrets go to the clipboard and nowhere else — no file, no network,
   * no third party. That keeps the app's promise that data never leaves the
   * user's own devices.
   */
  copyAll() {
    const text = this.state.accounts.map(({ uri }) => uri).join('\n')

    copyToClipboard(text, {
      format: 'text/plain',
      onCopy: () => {
        this.notify(this.state.accounts.length === 1
          ? 'Account copied to clipboard'
          : `${this.state.accounts.length} accounts copied to clipboard`)
      }
    })
  }

  retryButton() {
    const background = getColor(this.props.theme, 'foreground')
    const foreground = getColor(this.props.theme, 'background')
    this.webApp
      .drawMainButton('Try again', background, foreground, () => this.load())
      .showMainButton()
  }

  notify(text) {
    this.setState({
      notificatorText: text,
      notificatorKey: this.state.notificatorKey + 1
    })
    this.webApp.notificationOccurred('success')
  }
}

const mapStateProps = (state) => {
  return {
    theme: state.theme,
  }
}

export default connect(mapStateProps)(PageMain)
