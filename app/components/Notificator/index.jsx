import Block from '@components/Block'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

export default class Notificator extends React.Component {

  constructor(props) {
    super(props)

    this.state = { show: false }

    this.removes = []
  }

  static propTypes = {
    onHide: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    livingTime: PropTypes.number,
  }

  static defaultProps = {
    livingTime: 2000
  }

  componentDidMount() {
    const timeoutId1 = setTimeout(() => {
      this.setState({ show: true })
    }, 100)

    this.removes.push(() => clearTimeout(timeoutId1))

    const timeoutId2 = setTimeout(() => {
      if (this.props.onHide) {
        this.props.onHide()
      }
    }, this.props.livingTime)

    this.removes.push(() => clearTimeout(timeoutId2))
  }

  componentWillUnmount() {
    for (let func of this.removes) {
      func()
    }
  }

  render() {
    return (
      <Block
        gap={8}
        direction="row"
        display="flex"
        alignY="center"
        style={this.props.style}
        className={classNames(css['block'], {
          [this.props.className]: !!this.props.className,
        })}
      >
       <Block
         size={16}
         height={24}
         weight={400}
         color="background-100"
         className={classNames(css['block_wrap'], {
           [css['block_wrap--show']]: this.state.show
         })}
       >
         {this.props.children}
       </Block>
      </Block>
    )
  }
}
