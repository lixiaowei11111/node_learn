module.exports = {
	root: true, // 表示 ESLint 配置文件将在此目录下生效，不会继续往父级目录查找。
	parser: "@typescript-eslint/parser",
	settings: {
		react: {
			version: "detect", // 配置 React 相关的设置，使用 "detect" 自动检测项目中使用的 React 版本。s
		},
	},
	parserOptions: {
		//设置解析器选项，将代码解析为 ECMAScript 模块。
		sourceType: "module",
		ecmaVersion: 2021,
		ecmaFeatures: {
			jsx: true,
		},
		project: "./tsconfig.json", // 指定 TypeScript 配置文件路径
		requireConfigFile: false,
		babelOptions: {
			configFile: "./babelrc",
		},
	},
	env: {
		browser: true,
		node: true,
	},
	extends: [
		"eslint:recommended", //使用 ESLint 推荐的规则。
		"plugin:@typescript-eslint/recommended", //使用 TypeScript ESLint 推荐的规则。
		"plugin:react/recommended", // 使用 React ESLint 推荐的规则。
		"plugin:react-hooks/recommended",
		"prettier",
		"plugin:prettier/recommended", //使用 Prettier 推荐的规则。
		// 'prettier/@typescript-eslint',// 解决 Prettier 和 TypeScript ESLint 规则之间的冲突。其本身被融合到 'prettier'中
	],
	plugins: ["@typescript-eslint", "react", "prettier", "babel"],
	rules: {
		// ESLint Rules
		"no-console": 0, // 关闭对 console 使用的警告。
		"no-unused-vars": 0, // 关闭对未使用变量的警告。

		// TypeScript Rules
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-unused-vars": [0, { argsIgnorePattern: "^_" }],
		"@typescript-eslint/no-non-null-assertion": 0, // 非空断言
		// 启用 TypeScript 下的未使用变量规则，忽略以 _ 开头的变量。

		// React Rules
		"react/prop-types": 0, // 关闭对 PropTypes 的检查。
		"react/react-in-jsx-scope": 0, // react18 中 jsx语法不再需要引入react

		// Prettier Rules
		"prettier/prettier": 2, // 将 Prettier 错误视为 ESLint 错误。
	},
	overrides: [
		{
			files: ["*.tsx"],
			rules: {
				"react/prop-types": 0, // Disable prop-types in TypeScript files
			},
		},
	],
};
