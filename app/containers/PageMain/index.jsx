import { formatLabel, ensureURIs, parseURI } from '@lib/totp'
import ViewCards from '@containers/PageMain/ViewCards'
import ViewEmpty from '@containers/PageMain/ViewEmpty'
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
import { v4 } from 'uuid'

class PageMain extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      uris: [],
      process: true,
      editItem: null,
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
      .getStorageItem('uris', (error, uris) => {
        if (this.mounted) {
          this.setState({ process: false, uris: Array.isArray(uris) ? uris : [] })
        }
      })
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
        {this.view === 'empty' &&
          <ViewEmpty
            onMounted={() => this.addAccountButton()}
          />
        }

        {this.view === 'cards' &&
          <ViewCards
            uris={this.state.uris}
            onMounted={() => this.addAccountButton()}
            onCopy={(code) => {
              copyToClipboard(`${code}`, {
                format: 'text/plain',
                onCopy: () => {
                  this.notify('Code copied to clipboard')
                }
              })
            }}
            onEdit={({ uuid, totp }) => {
              this.setState({ editItem: { uuid, label: totp.label, issuer: totp.issuer }, notificatorText: null }, () => {
                this.webApp.drawBackButton(() => {

                  const uris = this.state.uris.map((item) => {
                    if (item.uuid === uuid) {
                      const totp = parseURI(item.uri)
                      totp.label = this.state.editItem.label || totp.issuer
                      return { ...item, uri: URI.stringify(totp) }
                    }
                    return { ...item }
                  })

                  this.setState({ uris, editItem: null }, () => {
                    this.webApp.removeBackButton()
                    this.webApp.setStorageItem('uris', uris)
                  })
                })
              })
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
                  if (buttonId !== '2') {
                    return
                  }

                  const uris = [...this.state.uris].filter(({ uuid }) => {
                    return uuid !== this.state.editItem.uuid
                  })

                  this.setState({ uris, editItem: null }, () => {
                    this.webApp.removeBackButton()
                    this.webApp.setStorageItem('uris', uris)
                    this.notify('Account has been successfully removed')
                  })
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
    if (this.state.uris.length > 0) {
      return this.state.editItem ? 'edit' : 'cards'
    }
    return 'empty'
  }

  addAccountButton() {
    const background = getColor(this.props.theme, 'foreground')
    const foreground = getColor(this.props.theme, 'background')
    this.webApp
      .drawMainButton('Add account', background, foreground, () => {
        this.webApp.showScanQrPopup('Google Authenticator import is also supported.', (uri) => {
          let uris = ensureURIs(uri)
          if (uris.length === 0) {
            this.webApp.notificationOccurred('error')
            this.webApp.showPopup('', 'Unable to recognize this QR code.')
            return
          }

          uris = uris.map((uri) => {
            return { uuid: v4(), uri }
          })

          this.setState({ uris: [...this.state.uris, ...uris ] }, () => {
            this.webApp.setStorageItem('uris', [...this.state.uris])

            if (uris.length === 1) {
              this.notify('Account successfully added')
            } else {
              this.notify(`${uris.length} accounts successfully added`)
            }
          })
        })
      })
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
