import React from 'react'
import css from './style.pcss'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '@components/Icon'

export default class Spinner extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    icon: PropTypes.oneOf(['progress-circular']),
    fill: PropTypes.oneOf([
      'fixed-white-100', 'fixed-white-075', 'fixed-white-050', 'fixed-white-010', 'fixed-white-005', 'fixed-white-003',
      'fixed-black-100', 'fixed-black-075', 'fixed-black-050', 'fixed-black-010', 'fixed-black-005', 'fixed-black-003',
      'background-100', 'background-075', 'background-050', 'background-010', 'background-005', 'background-003',
      'foreground-100', 'foreground-075', 'foreground-050', 'foreground-010', 'foreground-005', 'foreground-003',
      'primary-100', 'primary-075', 'primary-050', 'primary-010', 'primary-005', 'primary-003',
      'warning-100', 'warning-075', 'warning-050', 'warning-010', 'warning-005', 'warning-003',
    ]),
    style: PropTypes.object,
    size: PropTypes.number,
    auto: PropTypes.bool
  }

  static defaultProps = {
    icon: 'progress-circular',
    auto: true
  }

  render() {
    return (
      <Icon
        size={this.props.size}
        name={this.props.icon}
        fill={this.props.fill}
        style={this.props.style}
        className={classNames(css['spin'], {
          [this.props.className]: Boolean(this.props.className),
          [css['spin--auto']]: this.props.auto
        })}
      />
    )
  }
}
