import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

export default class Block extends React.Component {
  constructor(props) {
    super(props)

    this.ref = React.createRef()
  }

  static propTypes = {
    tag: PropTypes.string,
    title: PropTypes.string,
    className: PropTypes.string,
    color: PropTypes.oneOf([
      'fixed-white-100', 'fixed-white-075', 'fixed-white-050', 'fixed-white-010', 'fixed-white-005', 'fixed-white-003',
      'fixed-black-100', 'fixed-black-075', 'fixed-black-050', 'fixed-black-010', 'fixed-black-005', 'fixed-black-003',
      'background-100', 'background-075', 'background-050', 'background-010', 'background-005', 'background-003',
      'foreground-100', 'foreground-075', 'foreground-050', 'foreground-010', 'foreground-005', 'foreground-003',
      'primary-100', 'primary-075', 'primary-050', 'primary-010', 'primary-005', 'primary-003',
      'warning-100', 'warning-075', 'warning-050', 'warning-010', 'warning-005', 'warning-003',
    ]),
    background: PropTypes.oneOf([
      'fixed-white-100', 'fixed-white-075', 'fixed-white-050', 'fixed-white-010', 'fixed-white-005', 'fixed-white-003',
      'fixed-black-100', 'fixed-black-075', 'fixed-black-050', 'fixed-black-010', 'fixed-black-005', 'fixed-black-003',
      'background-100', 'background-075', 'background-050', 'background-010', 'background-005', 'background-003',
      'foreground-100', 'foreground-075', 'foreground-050', 'foreground-010', 'foreground-005', 'foreground-003',
      'primary-100', 'primary-075', 'primary-050', 'primary-010', 'primary-005', 'primary-003',
      'warning-100', 'warning-075', 'warning-050', 'warning-010', 'warning-005', 'warning-003',
    ]),
    alignX: PropTypes.oneOf(['start', 'center', 'end']),
    alignY: PropTypes.oneOf(['start', 'center', 'end']),
    display: PropTypes.oneOf(['inline', 'inline-flex', 'flex', 'grid']),
    stretch: PropTypes.oneOf(['between', 'around', 'evenly']),
    direction: PropTypes.oneOf(['row', 'col']),
    font: PropTypes.oneOf(['default']),
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func,
    onMounted: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
    onDoubleClick: PropTypes.func,
    /** 8 min value, 48 max value, step 2 */
    size: PropTypes.number,
    /** 8 min value, 48 max value, step 1 */
    height: PropTypes.number,
    /** 100 min value, 900 max value, step 100 */
    weight: PropTypes.number,
    italic: PropTypes.bool,
    uppercase: PropTypes.bool,
    lowercase: PropTypes.bool,
    through: PropTypes.bool,
    line: PropTypes.bool,
    fillX: PropTypes.bool,
    fillY: PropTypes.bool,
    box: PropTypes.bool,
    attr: PropTypes.object,
    gap: PropTypes.number,
    onDragEnter: PropTypes.func,
    onDragLeave: PropTypes.func
  }

  static defaultProps = {
    font: 'default',
    tag: 'div'
  }

  assignClass(obj, prefix, step) {
    if (step !== undefined) {
      const className = `${prefix}--${step}`
      if (className in css) {
        obj[css[className]] = true
      }
    }
    return this
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted(this.ref.current)
    }
  }

  render() {
    let htmlClass = {}
    this
      .assignClass(htmlClass, 'block_gap', this.props.gap)
      .assignClass(htmlClass, 'block_size', this.props.size)
      .assignClass(htmlClass, 'block_color', this.props.color)
      .assignClass(htmlClass, 'block_height', this.props.height)
      .assignClass(htmlClass, 'block_weight', this.props.weight)
      .assignClass(htmlClass, 'block_background', this.props.background)

    const BlockTag = this.props.tag

    return (
      <BlockTag
        ref={this.ref}
        {...this.props.attr}
        style={this.props.style}
        title={this.props.title}
        onClick={this.props.onClick}
        onMouseUp={this.props.onMouseUp}
        onMouseDown={this.props.onMouseDown}
        onContextMenu={this.props.onContextMenu}
        onDoubleClick={this.props.onDoubleClick}
        onDragEnter={this.props.onDragEnter}
        onDragLeave={this.props.onDragLeave}
        className={classNames(css['text'], {
          [this.props.className]: Boolean(this.props.className),
          [css['block_align--xc']]: this.props.alignX === 'center',
          [css['block_align--yc']]: this.props.alignY === 'center',
          [css['block_align--xs']]: this.props.alignX === 'start',
          [css['block_align--ys']]: this.props.alignY === 'start',
          [css['block_align--xe']]: this.props.alignX === 'end',
          [css['block_align--ye']]: this.props.alignY === 'end',
          [css['block_font--default']]: this.props.font === 'default',
          [css['block_style--italic']]: this.props.italic === true,
          [css['block_display--flex']]: this.props.display === 'flex',
          [css['block_display--grid']]: this.props.display === 'grid',
          [css['block_display--inline']]: this.props.display === 'inline',
          [css['block_display--inline-flex']]: this.props.display === 'inline-flex',
          [css['block_stretch--between']]: this.props.stretch === 'between',
          [css['block_stretch--around']]: this.props.stretch === 'around',
          [css['block_stretch--evenly']]: this.props.stretch === 'evenly',
          [css['block_transform--uppercase']]: this.props.uppercase === true,
          [css['block_transform--lowercase']]: this.props.lowercase === true,
          [css['block_direction--row']]: this.props.direction === 'row',
          [css['block_direction--col']]: this.props.direction === 'col',
          [css['block_through']]: this.props.through === true,
          [css['block_line']]: this.props.line === true,
          [css['block_fill--x']]: this.props.fillX === true,
          [css['block_fill--y']]: this.props.fillY === true,
          [css['block_box']]: this.props.box === true,
          ...htmlClass
        })}
      >
        {this.props.children}
      </BlockTag>
    )
  }
}
