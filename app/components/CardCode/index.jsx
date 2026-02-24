import ButtonCode from '@components/ButtonCode'
import Ellipsis from '@components/Ellipsis'
import Block from '@components/Block'
import Icon from '@components/Icon'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

export default class CardCode extends React.Component {

  static propTypes = {
    code: PropTypes.node,
    time: PropTypes.node,
    title: PropTypes.string,
    style: PropTypes.object,
    onCopy: PropTypes.func,
    onClick: PropTypes.func,
    bordered: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
  }

  render() {
    return (
      <Block
        gap={8}
        direction="row"
        display="flex"
        alignY="center"
        stretch="between"
        style={this.props.style}
        onClick={this.props.onClick}
        className={classNames(css['card'], {
          [this.props.className]: !!this.props.className,
          [css['card--bordered']]: this.props.bordered
        })}
      >
        <Block
          gap={8}
          direction="col"
          display="flex"
        >
          <Block
            size={16}
            height={16}
            weight={400}
          >
            <Ellipsis>{this.props.title}</Ellipsis>
          </Block>

          <Block
            gap={18}
            display="flex"
            alignY="center"
          >
            <ButtonCode
              className={css['card_copy']}
              onClick={(e) => {
                e.stopPropagation()
                if (this.props.onCopy) {
                  this.props.onCopy(e)
                }
              }}
            >
              {this.props.code}
            </ButtonCode>

            <Block
              size={24}
              height={24}
              weight={400}
              color="primary-100"
              className={css['card_time']}
            >
              {this.props.time}
            </Block>
          </Block>
        </Block>

        <Icon
          name="vuesax"
          fill="foreground-050"
          style={{ height: '24px' }}
        />
      </Block>
    )
  }
}
