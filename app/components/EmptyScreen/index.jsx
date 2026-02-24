import Block from '@components/Block'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'

export default class EmptyScreen extends React.Component {

  static propTypes = {
    title: PropTypes.node,
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    img: PropTypes.node.isRequired,
  }

  render() {
    return (
      <Block
        fillX
        gap={56}
        direction="col"
        display="flex"
        style={this.props.style}
        className={classNames('', {
          [this.props.className]: !!this.props.className,
        })}
      >
        <Block
          display="flex"
          alignY="center"
          alignX="center"
        >
          {this.props.img}
        </Block>

        <Block
          gap={16}
          direction="col"
          display="flex"
        >
          <Block
            size={24}
            height={32}
            weight={600}
            alignX="start"
            display="flex"
            color="foreground-100"
          >
            {this.props.title}
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
            {this.props.children}
          </Block>

        </Block>
      </Block>
    )
  }
}
