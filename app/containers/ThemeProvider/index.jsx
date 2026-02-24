import WebAppHelper from '@helper/WebAppHelper'
import { dispatchStore } from '@store'
import { connect } from 'react-redux'
import { THEMES } from '@lib/theme'
import PropTypes from 'prop-types'
import css from './style.pcss'
import React from 'react'

class ThemeProvider extends React.Component {
  constructor(props) {
    super(props)

    this.ref = React.createRef()
    this.webApp = new WebAppHelper()
  }

  static propTypes = {
    theme: PropTypes.string,
    children: PropTypes.node,
  }

  componentDidMount() {
    document.body.classList.add(css['theme'])
    document.body.classList.add(css[`theme--${this.props.theme}`])

    const func = () => {
      this.changeTheme(this.webApp.getTheme())
      dispatchStore('theme', this.webApp.getTheme())
    }
    this.webApp.onEvent('themeChanged', func)
  }

  changeTheme(currentTheme) {
    for (let theme of THEMES) {
      if (theme === currentTheme) {
        document.body.classList.add(css[`theme--${currentTheme}`])

        const className = css[`theme--${currentTheme}`]
        if (currentTheme === theme && !document.body.classList.contains(className)) {
          document.body.classList.add(className)
        }
        continue
      }

      document.body.classList.remove(css[`theme--${theme}`])
    }
  }

  render() {
    return this.props.children
  }
}

const mapStateProps = (state) => {
  return {
    theme: state.theme,
  }
}

export default connect(mapStateProps)(ThemeProvider)
