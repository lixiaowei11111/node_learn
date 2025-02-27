import React, { Component } from 'react'
import Toolbar from '../Toolbar'
import { ThemeContext } from './context'

export class AppContext extends Component {
  render(): React.ReactNode {
    return (
      // 由于设置了 ThemeContext的displayName属性为themeBtn 在 react devtools 中展示为 themeBtn.Provider
      <ThemeContext.Provider value='link'>
        <Toolbar />
      </ThemeContext.Provider>
    )
  }
}
