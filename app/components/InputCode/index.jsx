import Block from '@components/Block'
import classNames from 'classnames'
import Icon from '@components/Icon'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

export default class InputCode extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      focus: props.focus
    }

    this.preventBlur = false
  }

  static propTypes = {
    focus: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    spellcheck: PropTypes.bool,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
  }

  static defaultProps = {
    spellcheck: false
  }

  render() {
    return (
      <Block
        gap={4}
        direction="col"
        tag="label"
        display="flex"
        style={this.props.style}
        className={classNames(css['card_field'], {
          [this.props.className]: !!this.props.className,
          [css['card_field--focus']]: this.state.focus,
        })}
        onMouseDown={() => {
          this.preventBlur = true
        }}
        onMouseUp={() => {
          this.preventBlur = false
        }}
      >
        <Block
          size={12}
          height={12}
          weight={400}
          color="foreground-075"
        >
          {this.props.label}
        </Block>

        <Block
          gap={16}
          display="flex"
          alignY="center"
          stretch="between"
        >
          <input
            autoFocus={this.props.focus}
            className={css['card_input']}
            onChange={this.props.onChange}
            spellCheck={this.props.spellcheck}
            placeholder={this.props.placeholder}
            value={this.props.value || ''}
            onFocus={() => {
              if (!this.state.focus) {
                this.setState({ focus: true })
              }
            }}
            onBlur={() => {
              if (this.preventBlur || !this.state.focus) {
                return
              }

              this.setState({ focus: false })
            }}
          />

          {this.props.value &&
            <Icon
              size={20}
              name="close"
              fill="foreground-050"
              className={css['card_close']}
              onClick={this.props.onClear}
            />
          }
        </Block>
      </Block>
    )
  }
}
