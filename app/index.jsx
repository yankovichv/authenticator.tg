import ThemeProvider from '@containers/ThemeProvider'
import { createRoot } from 'react-dom/client'
import PageMain from '@containers/PageMain'
import { Provider } from 'react-redux'
import { createStore } from '@store'
import { isDev } from '@lib/env'
import eruda from 'eruda'

import './assets/fonts/SFProDisplay/stylesheet.css'
import './index.pcss'

const root = createRoot(document.getElementById('root'))

createStore().then((store) => {
  root.render(
    <Provider store={store}>
      <ThemeProvider>
        <PageMain/>
      </ThemeProvider>
    </Provider>
  )
})

if (isDev) {
  eruda.init()
}
