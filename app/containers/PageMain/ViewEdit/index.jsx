import InputCode from '@components/InputCode'
import Block from '@components/Block'
import PropTypes from 'prop-types'
import React from 'react'

export default class ViewEdit extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    onMounted: PropTypes.func,
    issuer: PropTypes.string,
    label: PropTypes.string,
    onClear: PropTypes.func,
    onChange: PropTypes.func,
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted()
    }
  }

  render() {
    return (
      <Block
        box
        fillX
        fillY
        className={this.props.className}
        style={{ padding: '16px 24px', ...this.props.style }}
      >
        <Block
          gap={12}
          display="flex"
          direction="col"
        >
          <Block
            size={16}
            height={16}
            weight={400}
            color="foreground-100"
          >
            {this.props.issuer}
          </Block>

          <InputCode
            focus={true}
            label="Account name"
            placeholder="Type account name"
            value={this.props.label}
            onClear={this.props.onClear}
            onChange={this.props.onChange}
          />
        </Block>
      </Block>
    )
  }
}
