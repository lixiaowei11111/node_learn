module.exports = {
	presets: [
		"@babel/preset-env",
		"@babel/preset-typescript",
		[
			"@babel/preset-react",
			{
				runtime: "automatic",
			},
		],
	],
	// presets 属性告诉 Babel 要转换的源码使用了哪些新的语法特性，
	// 一个 Presets 对一组新语法特性提供支持，多个 Presets 可以叠加。
	//  Presets 其实是一组 Plugins 的集合，每一个 Plugin 完成一个新语法的转换工作。
	plugins: [
		//如果你使用的是新的装饰器语法（即 TypeScript 3.2 及以上版本中引入的装饰器语法），则应该将 decoratorsBeforeExport 选项设置为 true
		// 注意，在使用装饰器语法时，还需要安装 @babel/plugin-proposal-decorators 插件和 @babel/plugin-proposal-class-properties 插件，以支持装饰器和类属性
		// @babel/plugin-proposal-decorators 必须放在 @babel/plugin-proposal-class-properties" 的前面
		["@babel/plugin-proposal-decorators", { version: "legacy" }],
		["@babel/plugin-proposal-class-properties", { loose: true }],

		// plugins 属性告诉 Babel 要使用哪些插件，插件可以控制如何转换代码。
		[
			"@babel/plugin-transform-runtime",
			/* babel-plugin-transform-runtime 是 Babel 官方提供的一个插件，
			作用是减少冗余代码。 
			babel-plugin-transform-runtime 和 babel-runtime 需要配套使用，
			使用了 babel-plugin-transform-runtime 后一定需要 babel-runtime。 */
			{
				absoluteRuntime: false,
				corejs: false,
				helpers: true,
				regenerator: true,
				version: "7.0.0-beta.0",
			},
		],
	],
};

// babel-plugin-lodash 它可以根据你的代码中使用的 Lodash 函数，自动按需引入 Lodash 的相关模块，从而减小打包后的文件体积
