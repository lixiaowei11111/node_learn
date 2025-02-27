// 0：关闭规则

// 1：开启规则，并将其视为警告（不影响代码的构建）

// 2：开启规则，并将其视为错误（可能导致代码构建失败）
module.exports = {
	root: true, // true 表示该配置文件是根目录下的配置文件。这样，在进行代码检查时，ESLint会使用该配置文件进行检查，而不会继续查找其他目录中的配置文件。
	parserOptions: {
		parser: 'babel-eslint',
		sourceType: 'module',
	},
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
	],
	globals: {
		BMap: 'readonly',
		BMAP_STATUS_SUCCESS: 'readonly',
		fullcalendar: 'readonly',
		WKConfig: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'babel'],

	// add your custom rules here
	// it is base on https://github.com/vuejs/eslint-config-vue
	rules: {
		'accessor-pairs': 2,
		'arrow-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'block-spacing': [2, 'always'],
		'brace-style': [
			2,
			'1tbs',
			{
				allowSingleLine: true,
			},
		],
		camelcase: [
			0,
			{
				properties: 'always',
			},
		],
		'comma-dangle': 0,
		'comma-spacing': [
			2,
			{
				before: false,
				after: true,
			},
		],
		'comma-style': [2, 'last'],
		'constructor-super': 2,
		curly: [2, 'multi-line'],
		'dot-location': [2, 'property'],
		'eol-last': 2,
		eqeqeq: [0, 'allow-null'],
		'generator-star-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'handle-callback-err': [2, '^(err|error)$'],
		indent: 'off',
		'jsx-quotes': [2, 'prefer-single'],
		'key-spacing': [
			2,
			{
				beforeColon: false,
				afterColon: true,
			},
		],
		'keyword-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'new-cap': [
			2,
			{
				newIsCap: true,
				capIsNew: false,
			},
		],
		'new-parens': 2,
		'no-array-constructor': 2,
		'no-var': 2, // 要求使用  let  或  const  而不是  var
		'no-caller': 2,
		'no-console': 'off',
		'no-class-assign': 2,
		'no-cond-assign': 2, // 禁止修改类声明的变量
		'no-const-assign': 2, // 禁止修改  const  声明的变量
		'no-control-regex': 2,
		'no-delete-var': 0,
		'no-dupe-args': 2,
		'no-dupe-class-members': 2, // 禁止类成员中出现重复的名称
		'no-dupe-keys': 2,
		'no-duplicate-case': 2,
		'no-empty-character-class': 2,
		'no-empty-pattern': 2, // 禁止使用空解构模式
		'no-global-assign': 2, // 禁止对原生对象或只读的全局对象进行赋值
		'no-eval': 2,
		'no-ex-assign': 2,
		'no-extend-native': 2,
		'no-extra-bind': 2,
		'no-extra-boolean-cast': 2,
		'no-extra-parens': [2, 'functions'],
		'no-fallthrough': 2, // 禁止  case  语句落空
		'no-floating-decimal': 2,
		'no-func-assign': 2,
		'no-implied-eval': 2,
		'no-inner-declarations': [2, 'functions'],
		'no-invalid-regexp': 2,
		'no-irregular-whitespace': 2,
		'no-iterator': 2,
		'no-label-var': 2,
		'no-labels': [
			2,
			{
				allowLoop: false,
				allowSwitch: false,
			},
		],
		'no-lone-blocks': 2,
		'no-mixed-spaces-and-tabs': 2, // 禁止空格和 tab 的混合缩进
		'no-multi-spaces': 2,
		'no-multi-str': 2,
		'no-multiple-empty-lines': [
			1,
			{
				max: 10,
			},
		],
		'no-native-reassign': 2,
		'no-negated-in-lhs': 2,
		'no-new-object': 2,
		'no-new-require': 2,
		'no-new-symbol': 2, // 禁止  Symbol  操作符和  new  一起使用
		'no-new-wrappers': 2,
		'no-obj-calls': 2,
		'no-octal': 2, // 禁用八进制字面量
		'no-octal-escape': 2,
		'no-path-concat': 2,
		'no-proto': 2,
		'no-redeclare': 0, // 禁止多次声明同一变量
		'no-regex-spaces': 2,
		'no-return-assign': [2, 'except-parens'],
		'no-self-assign': 2, // 禁止自我赋值
		'no-unused-labels': 2, // 禁用出现未使用过的标
		'no-self-compare': 2,
		'no-sequences': 2,
		'no-shadow-restricted-names': 2,
		'no-spaced-func': 2,
		'no-sparse-arrays': 2,
		'no-this-before-super': 2, // 禁止在构造函数中，在调用  super()  之前使用  this  或  super
		'no-throw-literal': 2,
		'no-trailing-spaces': 2,
		'no-undef': 2, // 禁用未声明的变量，
		'no-undef-init': 2,
		'no-unexpected-multiline': 2,
		'no-unmodified-loop-condition': 2,
		'no-unneeded-ternary': [
			2,
			{
				defaultAssignment: false,
			},
		],
		'no-unreachable': 2,
		'no-unsafe-finally': 2,
		'no-unused-vars': [
			1,
			{
				vars: 'all',
				args: 'none',
			},
		],
		'no-useless-call': 2,
		'no-useless-computed-key': 2,
		'no-useless-constructor': 2,
		'no-useless-escape': 0, // 禁用不必要的转义字符
		'no-whitespace-before-property': 2,
		'no-with': 2,
		'one-var': [
			2,
			{
				initialized: 'never',
			},
		],
		'operator-linebreak': [
			2,
			'after',
			{
				overrides: {
					'?': 'before',
					':': 'before',
				},
			},
		],
		'padded-blocks': [2, 'never'],
		quotes: [
			2,
			'single',
			{
				avoidEscape: true,
				allowTemplateLiterals: true,
			},
		],
		semi: [2, 'never'],
		'semi-spacing': [
			2,
			{
				before: false,
				after: true,
			},
		],
		'space-before-blocks': [2, 'always'],
		'space-before-function-paren': [2, 'never'],
		'space-in-parens': [2, 'never'],
		'space-infix-ops': 2,
		'space-unary-ops': [
			2,
			{
				words: true,
				nonwords: false,
			},
		],
		'spaced-comment': [
			2,
			'always',
			{
				markers: ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ','],
			},
		],
		'template-curly-spacing': [2, 'never'],
		'use-isnan': 2,
		'valid-typeof': 2,
		'wrap-iife': [2, 'any'],
		'yield-star-spacing': [2, 'both'],
		yoda: [2, 'never'],
		'prefer-const': 2,
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		// 'object-curly-spacing': [2, 'always', {
		//   objectsInObjects: false
		// }],
		'array-bracket-spacing': [2, 'never'],
		// react相关
		'react/display-name': 2, // 要求定义组件时需要有 displayName 属性
		'react/forbid-prop-types': 2, // 禁止使用模糊的 prop types
		'react/jsx-key': 2, // 检测是否缺失 key 属性
		'react/jsx-no-duplicate-props': 2, // 禁止定义重复的属性
		'react/jsx-no-undef': 2, // 禁止使用未声明的变量
		'react/jsx-pascal-case': 2, // 强制使用 PascalCase 风格定义组件名
		'react/jsx-uses-react': 2, //	当使用 JSX 时，阻止 React 被错误标记为未使用
		'react/jsx-uses-vars': 2, //	当在 JSX 内使用变量时，阻止该变量被错误标记为未使用
		'react/no-danger': 2, //	禁止使用危险的 JSX 属性，如 dangerouslySetInnerHTML
		'react/no-did-mount-set-state': 2, // 禁止在 componentDidMount 内使用 setState
		'react/no-did-update-set-state': 2, //	禁止在 componentDidUpdate 内使用 setState
		'react/no-direct-mutation-state': 2, //	禁止直接修改 this.state
		// 'react/no-multi-comp':2, //	禁止在单个文件内定义多个组件
		// 'react/no-unknown-property':2//	禁止使用未知的 DOM 属性
		'react/prefer-es6-class': 2, //	强制使用 ES5 create-react-class 或 ES6 class 风格定义组件
		'react/prop-types': 2, //	检测是否缺失 props 校验
		'react/react-in-jsx-scope': 2, //	检测使用 JSX 时是否缺失 React 依赖
		// 'react/self-closing-comp':2,//	当组件无 children 时，强制使用自关闭标签
		'react/sort-comp': 2, //	限制书写组件生命周期方法的顺序
		'react/jsx-wrap-multilines': 2, //	检测多行 JSX 代码内是否缺失圆括号
		'react/jsx-no-comment-textnodes': 2, //	检测是否有注释被当做文本节点插入 JSX 代码
		'react/jsx-no-target-blank': 2, //	检测是否没有配合 rel='noreferrer noopener' 单独使用不安全的 target='_blank'
		// 'react/no-children-prop':2	,//禁止把 children 当作属性传递
		// 'react/no-danger-with-children':2,//	禁止同时使用 children 和 dangerouslySetInnerHTML
		// 'react/no-deprecated':2,//禁止使用过时的方法
		'react/no-find-dom-node': 2, //	禁止使用 findDOMNode 方法，该方法未来会被废弃
		'react/no-is-mounted': 2, //	禁止使用 isMounted 方法，该方法未来会被废弃
		'react/no-render-return-value': 2, //	禁止使用 ReactDOM.render 的返回值
		'react/no-string-refs': 2, //	禁止给 ref 属性赋值为字符串
		'react/no-unescaped-entities': 2, //	禁止在字符串内使用未被转义的文档标记
		'react/require-render-return': 2, //	要求 render 函数有返回值

		// import相关
		// 'import/export': 2, //	报告导出时有重复的默认导出关键字或导出名称
		// 'import/no-named-as-default': 2, //	报告使用导出的名称作为默认导出的本地导入名称
		// 'import/no-named-as-default-member': 2, //	报告使用导出的名称作为默认导出的属性
		// 'import/no-duplicates': 2, //	报告重复导入已解析的路径
	},
}
