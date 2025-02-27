import React, { useContext } from 'react'
import { Button } from 'antd'
import { ThemeContext, type ThemeContextType } from '../AppContext/context'

// 1.calss 组件的写法
export default class ThemeButton extends React.Component {
	static contextType?: React.Context<ThemeContextType> = ThemeContext
	render(): React.ReactNode {
		// 指定 contextType 读取当前的 theme context。
		// React 会往上找到最近的 theme Provider，然后使用它的值。
		return (
			<>
				<Button type={this.context as any}>这是一个按钮</Button>
				<ThemeBtnFunc></ThemeBtnFunc>
			</>
		)
	}
}

// 2. 函数式组件 consumer
// 函数式组件接受context 1. 使用ThemeContext.Consumer 2. 使用 useContext 相当于 ThemeContext.Consumer中的value参数
const ThemeBtnFunc: React.FC = () => {
	const theme = useContext(ThemeContext)
	return (
		// 由于设置了 ThemeContext的displayName属性为themeBtn 在 react devtools 中展示为 themeBtn.Consumer
		<ThemeContext.Consumer>
			{value => {
				return (
					<>
						<Button type={value}>func component consumer the context</Button>
						<Button type={theme}>func component consumer the context</Button>
					</>
				)
			}}
		</ThemeContext.Consumer>
	)
}

// 3. 函数式组件 使用 useContext
