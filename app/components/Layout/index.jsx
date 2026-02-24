import Block from '@components/Block'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

export default class Layout extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    alignX: PropTypes.oneOf(['start', 'center', 'end']),
    alignY: PropTypes.oneOf(['start', 'center', 'end']),
  }

  static defaultProps = {
    alignX: 'center',
    alignY: 'start',
  }

  render() {
    return (
      <Block
        display="flex"
        className={css['layout']}
        alignY={this.props.alignY}
        alignX={this.props.alignX}
      >
        <Block
          display="flex"
          alignX="start"
          alignY="start"
          direction="col"
          style={this.props.style}
          className={classNames(css['layout_wrap'], {
            [this.props.className]: !!this.props.className,
          })}
        >
          {this.props.children}
        </Block>
      </Block>
    )
  }
}
