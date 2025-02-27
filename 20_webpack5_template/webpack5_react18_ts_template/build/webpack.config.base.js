//  config/webpack.config.base.js
const webpack = require('webpack')
const path = require('path')

// plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin') //
/**
 * html-webpack-plugin 是一个用于生成 HTML 文件的 webpack 插件。它可以将打包后的资源自动插入到生成的 HTML 文件中，
 * 并且可以根据模板文件生成 HTML 文件。该插件的作用主要有以下几点：
 * 自动生成 HTML 文件：该插件可以自动创建 HTML 文件，并将打包后的资源自动插入到 HTML 文件中，无需手动创建 HTML 文件。
 * 自动添加打包后的资源：该插件可以将打包后的 CSS、JS 等资源自动添加到 HTML 文件中，无需手动引入。
 * 支持多页面应用：该插件可以根据多个入口文件自动生成对应的 HTML 文件，并将打包后的资源自动添加到对应的 HTML 文件中。
 * 支持模板文件：该插件可以根据模板文件生成 HTML 文件，可以自定义 HTML 文件的结构和内容。
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // css单独打包
const EslintWebpackPlugin = require('eslint-webpack-plugin') // eslint
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin') // typescript 运行时检查

// optimization
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // css 压缩
const TerserPlugin = require('terser-webpack-plugin') // js压缩
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin // webpack 可视化分析工具

const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
const { GenerateSW } = require('workbox-webpack-plugin')
const config = require('dotenv').config({
	path: path.resolve(__dirname, '../env/.env.' + process.env.NODE_ENV),
})
const utils = require('./utils')

// 使用 workbox 官方插件来实现离线缓存
/**
 * @type {import('webpack').Configuration}
 */

function resolve(dir) {
	return path.join(__dirname, '..', dir)
	// .. 相当于 ../上一级 path.join 相当于一个 路径计算器
}
const isDev = process.env.NODE_ENV !== 'production'

//
const plugins = [
	new webpack.DefinePlugin({
		'process.env': JSON.stringify(config), // 如果没有用单双引号分别包一层,则会导致 value做为一个未定义的变量暴露,// 加单双引号,或者使用JSON.strigfy(config)
	}),
	new HtmlWebpackPlugin({
		title: '管理后台',
		inject: true,
		template: path.resolve(__dirname, '../index.html'),
		filename: 'index.html',
	}),
	new CleanWebpackPlugin(),
	new MiniCssExtractPlugin({
		filename: 'static/css/[name].[fullhash:8].css',
		chunkFilename: 'static/css/[name].[fullhash:8].chunk.css',
	}),
	new GenerateSW({
		swDest: path.join(__dirname, '../dist/worker/index.js'),
		maximumFileSizeToCacheInBytes: 999999999, // 设置可缓存的文件大小
	}),
	new EslintWebpackPlugin({ extensions: ['js', 'jsx'], exclude: ['node_modules'] }), // 用于检测node环境的lint,不能用于Browser检测
	// new CssMinimizerPlugin(), // 压缩css代码
	new ForkTsCheckerWebpackPlugin(),
]
if (process.env.npm_config_report === 'true') {
	console.log(process.env.npm_config_report, 'npm_config_report')
	plugins.push(new BundleAnalyzerPlugin())
}

module.exports = {
	target: 'web', // web为默认值, 还可以使用 electron-main electron-renderer electron-prelaod node
	// 构建同构应用时, target可以为 node
	// 构建electron可以为以上对应模式
	context: path.resolve(__dirname, '../'),
	entry: {
		app: './src/index.tsx',
		// detail:"./activity/index.tsx" 多页面打包功能
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: 'static/js/[name].[fullhash].js',
		clean: true, // 自动清空上次打包结果
		// publicPath:
		//   process.env.NODE_ENV === 'production'
		//     \? '生产环境CDN异步静态资源URI'
		//     : '开发环境CDN异步静态资源URI',
	},
	resolve: {
		// resolve选项是Webpack中的一个配置选项，用于设置模块如何被解析。
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		// 在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在,导入文件时,省略后缀名。
		alias: {
			// 通过别名来把原导入路径映射成一个新的导入路径
			'@': resolve('src'),
		},
	},
	module: {
		rules: [
			/** rules中使用 OneOf函数可以减少loader的执行次数,只要检测到匹配的loader,就不再往下执行 */
			{
				test: /\.(js|mjs|jsx|ts|tsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							cacheDirectory: true,
							cacheCompression: false,
							presets: [
								[
									'@babel/preset-env',
									{
										modules: false,
									},
								],
								'@babel/preset-react',
							],
							plugins: isDev ? [require.resolve('react-refresh/babel')] : [],
						},
					},
				],
			},
			{ test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
			{
				test: /\.(css|scss)$/,
				exclude: /\.module\.scss$/,
				use: [
					isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader',
				], // scss=>postcss=>css =>style 从尾部开始处理
			},
			{
				test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				exclude: [resolve('src/icons')],
				options: {
					limit: 10000,
					name: utils.assetsPath('img/[name].[fullhash:7].[ext]'),
				},
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('media/[name].[fullhash:7].[ext]'),
				},
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('fonts/[name].[fullhash:7].[ext]'),
				},
			},
			{
				test: /\.(png|jpe?g|gif|svg|webp)$/,
				type: 'asset',
				parser: {
					dataUrlCondition: {
						// 小于20kb的图片转换化为base64
						// 优点：减少请求数量；缺点：体积会更大
						maxSize: 20 * 1024, // // 小于20kb的图片会被base64处理
					},
				},
			},
		],
	},
	optimization: {
		// optimization 优化
		minimizer: [
			// For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
			// `...`,
			new CssMinimizerPlugin(), //压缩css代码
			new TerserPlugin({
				// https://github.com/webpack-contrib/terser-webpack-plugin#parallel
				// test: null,
				// includes: null,
				// exclude: null,
				// minify: {},
				parallel: true, // boolean |number 使用多线程并行来提高构建速度
				// terserOptions: {},
				// extractComments: null, // 提取注释
			}), // 压缩js代码
		],
		minimize: true,
		runtimeChunk: true,
		splitChunks: {
			name: false, // split chunk的名称。提供false将保持块的相同名称，因此它不会不必要地更改名称。这是生产构建的推荐值
			chunks: 'all',
			minSize: 20000, // 生成chunk的最小大小 byte
			maxSize: 100000,
			cacheGroups: {
				vendors: {
					test: module => {
						return (
							module.resource &&
							/\.js$/.test(module.resource) &&
							module.resource.match('node_modules')
						)
					},
					priority: 10,
					name: 'vendor',
					chunks: 'all',
				},
				ant: {
					name: 'chunk-ant-design', // 单独将 elementUI 拆包
					priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
					test: /[\\/]node_modules[\\/]ant-design[\\/]/,
				},
			},
		},
	},
	plugins: plugins,
	devtool: isDev ? 'source-map' : 'cheap-module-source-map', //生产环境不会有sourc map文件, 'source-map'值会导致生产环境有source-map文件
	// devtools 不同的值的 查阅
	cache: {
		type: 'filesystem',
		// 可选配置
		buildDependencies: {
			config: [__filename], // 当构建依赖的config文件（通过 require 依赖）内容发生变化时，缓存失效
		},
		name: 'development-cache',
	},
}
