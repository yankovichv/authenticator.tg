import { formatTitle, parseURI} from '@lib/totp'
import CardCode from '@components/CardCode'
import Block from '@components/Block'
import PropTypes from 'prop-types'
import React from 'react'
import Ref from '@lib/ref'

export default class ViewCards extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      uris: this.formatURIs(props.uris),
    }

    this.intervalId = null
    this.ref = new Ref()
  }

  static propTypes = {
    uris: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      uri: PropTypes.string.isRequired
    })),
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    onEdit: PropTypes.func,
    onCopy: PropTypes.func,
    onMounted: PropTypes.func
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted()
    }

    this.intervalId = setInterval(() => {
      for (const { uuid, totp } of this.state.uris) {
        const time = this.getTime(totp)
        this.ref.element(`time:${uuid}`).innerText = time

        if (time === totp.period) {
          this.ref.element(`code:${uuid}`).innerText = this.getCode(totp)
        }
      }
    }, 1000)
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.uris) !== JSON.stringify(this.props.uris)) {
      this.setState({ uris: this.formatURIs(this.props.uris) })
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  render() {
    return (
      <Block
        box
        fillY
        fillX
        style={this.props.style}
        className={this.props.className}
      >
        {this.state.uris.map(({ uuid, totp }, index) => {
          return (
            <CardCode
              bordered
              key={index}
              title={formatTitle(totp.label, totp.issuer)}
              time={(
                <span ref={this.ref.upsert(`time:${uuid}`)}>
                  {this.getTime(totp)}
                </span>
              )}
              code={(
                <span ref={this.ref.upsert(`code:${uuid}`)}>
                  {this.getCode(totp)}
                </span>
              )}
              onCopy={() => {
                if (this.props.onCopy) {
                  const code = totp.generate()
                  this.props.onCopy(code)
                }
              }}
              onClick={() => {
                if (this.props.onEdit) {
                  this.props.onEdit({ uuid, totp })
                }
              }}
            />
          )
        })}
      </Block>
    )
  }

  getTime(totp) {
    return totp.period - (Math.floor(Date.now() / 1000) % totp.period)
  }

  getCode(totp) {
    const formatted = totp.generate().toString().padStart(6, '0')
    return formatted.slice(0, 3) + ' ' + formatted.slice(3)
  }

  formatURIs(uris) {
    return uris.map(({ uuid, uri }) => {
      return { uuid, totp: parseURI(uri) }
    })
  }
}
