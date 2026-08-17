import Block from '@components/Block'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Shown when accounts could not be read from Telegram CloudStorage.
 *
 * A failed read must never look like an empty account list: the app would
 * then invite the user to add accounts on top of data it simply could not
 * see.
 */
export default class ViewError extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    message: PropTypes.string,
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
        fillX
        fillY
        display="flex"
        alignY="center"
        alignX="center"
        style={this.props.style}
        className={this.props.className}
      >
        <Block
          gap={16}
          direction="col"
          display="flex"
          style={{ maxWidth: '320px' }}
        >
          <Block
            size={24}
            height={32}
            weight={600}
            alignX="start"
            display="flex"
            color="foreground-100"
          >
            Couldn’t load your accounts
          </Block>

          <Block
            gap={8}
            size={16}
            height={24}
            weight={400}
            display="flex"
            alignX="start"
            direction="col"
            color="foreground-075"
          >
            <span>
              Your accounts are safe in Telegram’s cloud — the app just could not read them right now.
            </span>
            {this.props.message &&
              <span>{this.props.message}</span>
            }
          </Block>
        </Block>
      </Block>
    )
  }
}
