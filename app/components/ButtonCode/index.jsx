import React from 'react'
import css from './style.pcss'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '@components/Icon'
import Block from '@components/Block'

export default class ButtonCode extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
  }

  render() {
    return (
      <Block
        tag="button"
        style={this.props.style}
        onClick={this.props.onClick}
        className={classNames(css['btn'], {
          [this.props.className]: !!this.props.className
        })}
      >
        <Block
          gap={16}
          size={32}
          height={38}
          weight={400}
          display="flex"
          alignY="center"
          alignX="center"
          color="primary-100"
          className={css['btn_wrap']}
        >
          {this.props.children}
          <Icon
            size={24}
            name="copy"
            fill="primary-050"
            className={css['btn_icon']}
          />
        </Block>
      </Block>
    )
  }
}
