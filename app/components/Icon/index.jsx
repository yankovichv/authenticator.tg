import * as collection from './collection'
import objectPath from 'object-path'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

const items = { ...collection }

export default class Icon extends React.Component {

  static propTypes = {
    name: PropTypes.oneOf(['copy', 'close', 'progress-circular', 'vuesax']),
    size: PropTypes.number,
    onClick: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    fill: PropTypes.oneOf([
      'fixed-white-100', 'fixed-white-075', 'fixed-white-050', 'fixed-white-010', 'fixed-white-005', 'fixed-white-003',
      'fixed-black-100', 'fixed-black-075', 'fixed-black-050', 'fixed-black-010', 'fixed-black-005', 'fixed-black-003',
      'background-100', 'background-075', 'background-050', 'background-010', 'background-005', 'background-003',
      'foreground-100', 'foreground-075', 'foreground-050', 'foreground-010', 'foreground-005', 'foreground-003',
      'primary-100', 'primary-075', 'primary-050', 'primary-010', 'primary-005', 'primary-003',
      'warning-100', 'warning-075', 'warning-050', 'warning-010', 'warning-005', 'warning-003',
    ])
  }

  render() {
    const htmlClass = {}
    if (this.props.size) {
      htmlClass[css[`icon_size--${this.props.size}`]] = true
    }
    if (this.props.fill) {
      htmlClass[css[`icon_fill--${this.props.fill}`]] = true
    }

    let path = Icon.getComponentPath(this.props.name)
    let IconComponent = objectPath.get(items, path)

    if (!IconComponent) {
      return
    }

    return (
      <React.Suspense
        fallback={
          <div
            style={this.props.style}
            className={classNames(css['icon'], {
              [this.props.className]: Boolean(this.props.className),
              ...htmlClass
            })}
          />
        }
      >
        <IconComponent
          {...this.filterProps()}
          style={this.props.style}
          onClick={this.props.onClick}
          className={classNames(css['icon'], {
            [this.props.className]: Boolean(this.props.className),
            ...htmlClass
          })}
        />
      </React.Suspense>
    )
  }

  filterProps() {
    const props = {}
    const exclude = ['className', 'skin', 'size']
    for (let property in this.props) {
      if (!(property in this.props) || exclude.includes(property)) {
        continue
      }
      props[property] = this.props[property]
    }
    return props
  }

  static getComponentPath(name) {
    const split = name.split('/')
    name = split[split.length - 1]
    let words = name.split('-').map((word) => {
      return String(word).charAt(0).toUpperCase() + String(word).slice(1)
    })
    const componentName = words.join('')

    let basePath = split.slice(0, split.length - 1)
    return [ ...basePath, componentName]
  }
}
