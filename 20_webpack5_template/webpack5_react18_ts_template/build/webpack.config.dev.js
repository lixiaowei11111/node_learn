const webpackMerge = require('webpack-merge')
const path = require('path')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const baseConfig = require('./webpack.config.base')

/**
 * @type {import('webpack').WebpackOptionsNormalized}
 */
const devServer = {
	https: true,
	host: 'localhost', // 服务器
	// contentBase: path.join(__dirname, "../public"),
	// watchContentBase: true,
	// publicPath: "/",
	// webpack5 中 contentBase选项 被替换为 static选项
	static: {
		directory: path.join(__dirname, '../public'),
		publicPath: '/',
		watch: true,
	},
	compress: true, // gzip
	historyApiFallback: true, // history模式提供404页面
	hot: true, // 热更新
	// clientLogLevel: "error", // 浏览器中显示的错误级别 使用client{logging替代}
	client: {
		logging: 'error',
	},
	open: true, // 服务器启动后默认打开浏览器
	// watchOptions 被放在devServer 外面了
	watchFiles: {
		paths: ['src/**/*', 'public/**/*'],
		options: {
			usePolling: false,
		},
	},
	// inline: false, // webpack 4.0 命令行不识别 --inline ,且默认开启
	// proxy: {
	// 	'/api': {
	// 		target: '10.415.21.19', // 测试环境或者线上的host IP //一个前往请求/api/users现在会将请求代理到http://localhost:3000/api/users。
	// 		pathRewrite: { '^/api': '' }, //如果不想/api被传递，需要使用 pathRewrite重写路径
	// 		secure: false, // 默认为true时不接受非https的后端服务器,设置为false即可
	// 	},
	// },
}

const devConfig = {
	mode: process.env.NODE_ENV,
	devServer: devServer,
	watchOptions: {
		ignored: /node_modules/,
	},
	plugins: [new ReactRefreshWebpackPlugin()],
	// 只有在开启监听模式时，watchOptions 才有意义
	// 默认为 false，也就是不开启
	watch: true,
	// 监听模式运行时的参数
	// 在开启监听模式时，才有意义
	watchOptions: {
		// 不监听的文件或文件夹，支持正则匹配
		// 默认为空
		ignored: /node_modules/,
		// 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
		// 默认为 300ms
		aggregateTimeout: 300,
		// 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
		// 默认每隔1000毫秒询问一次
		poll: 1000,
	},
	optimization: {
		usedExports: true, // development env 下开启 tree shaking的方法, production env default open
		removeAvailableModules: false,
	},
}
// 本地开发服务的环境配置, 不会对 生成环境生效
module.exports = webpackMerge.merge(baseConfig, devConfig)
