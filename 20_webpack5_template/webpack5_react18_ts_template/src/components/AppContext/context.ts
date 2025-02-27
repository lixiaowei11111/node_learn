import React from 'react'

type ThemeContextType = 'primary' | 'link' | 'text' | 'ghost' | 'default' | 'dashed'
const ThemeContext = React.createContext<ThemeContextType>('primary')
ThemeContext.displayName = 'themeBtn' // react devtools 中展示为 themeBtn.Provider
export { type ThemeContextType, ThemeContext }
