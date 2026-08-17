import Block from '@components/Block'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

/**
 * Hands the user a copy of their accounts to keep outside Telegram.
 *
 * Neither the secrets nor the account list are rendered: the user arrives
 * here from the list itself and the button states how many accounts are
 * copied. A screen enumerating every service someone holds 2FA for is worth
 * avoiding — that list is sensitive on its own, screenshot or shoulder.
 */
export default class ViewExport extends React.Component {

  static propTypes = {
    count: PropTypes.number.isRequired,
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    onMounted: PropTypes.func,
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted()
    }
  }

  render() {
    return (
      <Block
        box
        fillX
        fillY
        gap={12}
        direction="col"
        display="flex"
        style={this.props.style}
        className={css['export']}
      >
        <Block
          size={24}
          height={32}
          weight={600}
          color="foreground-100"
        >
          Back up your accounts
        </Block>

        <Block
          gap={12}
          direction="col"
          display="flex"
          size={16}
          height={24}
          weight={400}
          color="foreground-075"
        >
          <span>
            Your {this.props.count === 1 ? 'account lives' : 'accounts live'} only in Telegram’s cloud. A copy kept somewhere else is what saves you if you ever lose access to it.
          </span>
          <span>
            Copying puts them on the clipboard as setup links. Anyone holding those links can generate your codes — paste them straight into your password manager and keep them there.
          </span>
        </Block>
      </Block>
    )
  }
}
