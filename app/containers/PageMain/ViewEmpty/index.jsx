import EmptyScreen from '@components/EmptyScreen'
import animationData from './animation-data.json'
import Block from '@components/Block'
import PropTypes from 'prop-types'
import Lottie from 'lottie-react'
import React from 'react'

export default class ViewEmpty extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    onMounted: PropTypes.func,
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted()
    }
  }

  render() {
    return (
      <Block
        fillX
        fillY
        display="flex"
        alignY="center"
        alignX="center"
        style={this.props.style}
        className={this.props.className}
      >
        <EmptyScreen
          style={{ maxWidth: '320px' }}
          img={
            <Lottie
              loop={false}
              animationData={animationData}
              style={{ width: '240px', height: '240px' }}
            />
          }
          title={(<span>Secure Your Accounts <br/>with Authenticator</span>)}
        >
          <span>
            Add new accounts or import from Google Authenticator via “Add account” button.
          </span>
          <span>
            Your data is securely synced across all your Telegram clients and stored exclusively in Telegram’s encrypted cloud.
          </span>

        </EmptyScreen>
      </Block>
    )
  }
}
