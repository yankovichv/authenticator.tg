import css from './style.pcss'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props)
  }

  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.node,
    title: PropTypes.string,
    rows: PropTypes.number,
    maxWidth: PropTypes.string,
  }

  static defaultProps = {
    rows: 1
  }

  render() {
    return (
      <span
        title={this.props.title}
        style={{ maxWidth: this.props.maxWidth, WebkitLineClamp: String(this.props.rows), ...this.props.style}}
        className={classNames(css['ellipsis'], {
          [css['ellipsis--row']]: this.props.rows === 1,
          [css['ellipsis--rows']]: this.props.rows > 1,
          [this.props.className]: Boolean(this.props.className),
        })}
      >
        {this.props.children}
      </span>
    )
  }
}

