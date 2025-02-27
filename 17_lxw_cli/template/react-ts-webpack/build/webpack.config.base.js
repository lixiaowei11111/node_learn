const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // css单独打包

const config = require("dotenv").config({
	path: path.resolve(__dirname, "../env/.env." + process.env.NODE_ENV),
	// 根据不同的NODE_ENV 加载不同的env文件
});

function resolve(dir) {
	return path.join(__dirname, "..", dir);
	// .. 相当于 ../上一级 path.join 相当于一个 路径计算器
}

const isDev = process.env.NODE_ENV !== "production";
const rootPath = process.env.ROOT_PATH;

console.log("rootPath=", rootPath, "res=", rootPath || "/");

const HtmlWebpackPluginList = ["index.html", "404.html"].map(fileName => {
	const item = {
		title: "REACT-ADMIN",
		inject: true,
		template: path.resolve(__dirname, "../public/index.html"),
		filename: fileName,
		publicPath: rootPath || "/",
	};

	return new HtmlWebpackPlugin(item);
});

const plugins = [
	new webpack.DefinePlugin({
		// 暴露在项目中的全局变量
		"process.env": JSON.stringify({
			...config.parsed,
			ROOT_PATH: rootPath || "",
		}),
		// 如果没有用单双引号分别包一层,则会导致 value做为一个未定义的变量暴露,
		// 加单双引号"'NODE_ENV:DEVELOPMENT'",或者使用JSON.strigfy(config)
	}),
	...HtmlWebpackPluginList,
	new ESLintPlugin({
		extensions: ["js", "jsx", "ts", "tsx"],
		exclude: ["node_modules", "dist"],
		// ESLint 配置选项可以在此处设置
	}),
	new MiniCssExtractPlugin({
		filename: "static/css/[name].[fullhash:8].css",
		chunkFilename: "static/css/[name].[fullhash:8].chunk.css",
	}), // 提取css
];

module.exports = {
	target: "web", // web为默认值, 还可以使用 electron-main electron-renderer electron-prelaod node
	context: path.resolve(__dirname, "../"),
	// entry: {
	// 	app: "./src/main.tsx",
	// 	// detail:"./activity/index.tsx" 多页面打包功能
	// },
	entry: "./src/main.tsx",
	output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "static/js/[name].[fullhash].js",
		clean: true, // 自动清空上次打包结果
		// publicPath: "/",
		// publicPath:
		//   process.env.NODE_ENV === 'production'
		//     \? '生产环境CDN异步静态资源URI'
		//     : '开发环境CDN异步静态资源URI',
	},
	resolve: {
		// 设置模块如何被解析。
		extensions: [".ts", ".tsx", ".js", ".jsx"],
		// 在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在,导入文件时,省略后缀名。
		alias: {
			// 通过别名来把原导入路径映射成一个新的导入路径
			"@": resolve("src"),
			"@API": resolve("src/api"),
			"@ASSETS": resolve("src/assets"),
			"@COMPONENTS": resolve("src/components"),
			"@CONSTANTS": resolve("src/constants"),
			"@LAYOUTS": resolve("src/layouts"),
			"@REDUX": resolve("src/redux"),
			"@ROUTES": resolve("src/routes"),
			"@STYLES": resolve("src/styles"),
			"@UTILS": resolve("src/utils"),
			"@VIEWS": resolve("src/views"),
		},
	},
	module: {
		rules: [
			/** rules中使用 OneOf函数可以减少loader的执行次数,只要检测到匹配的loader,就不再往下执行 */
			{
				test: /\.(js|mjs|jsx|ts|tsx)$/,
				exclude: /node_modules/,
				include: [path.resolve(__dirname, "../src")],
				use: [
					"thread-loader",
					{
						loader: require.resolve("babel-loader"),
						options: {
							cacheDirectory: true,
							cacheCompression: false,
							presets: [
								[
									"@babel/preset-env",
									{
										modules: false,
									},
								],
								"@babel/preset-typescript",
								[
									"@babel/preset-react",
									{
										runtime: "automatic",
									},
								],
							],
							plugins: isDev ? [require.resolve("react-refresh/babel")] : [],
						},
					},
				],
			},
			{
				test: /\.(css|less)$/,
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					"css-loader",
					"postcss-loader",
					"less-loader",
				], // less=>postcss=>css =>style 从尾部开始处理
			},
			{
				test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,
				type: "asset",
				parser: {
					dataUrlCondition: {
						maxSize: 20 * 1024, // 20KB
					},
				},
				generator: {
					filename: "static/img/[name].[hash][ext][query]",
				},
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				type: "asset/resource",
				parser: {
					dataUrlCondition: {
						maxSize: 20 * 1024, // 20KB
					},
				},
				generator: {
					filename: "static/media/[name].[hash][ext][query]",
				},
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				type: "asset/resource",
				parser: {
					dataUrlCondition: {
						maxSize: 20 * 1024, // 20KB
					},
				},
				generator: {
					filename: "static/fonts/[name].[hash][ext][query]",
				},
			},
		],
	},
	plugins,
	devtool: isDev ? "source-map" : "cheap-module-source-map", //生产环境不会有sourc map文件, 'source-map'值会导致生产环境有source-map文件
	// devtools 不同的值的 查阅
	cache: {
		type: "filesystem", // 为memory 时,不允许有其他配置
		// 可选配置
		buildDependencies: {
			config: [__filename], // 当构建依赖的config文件（通过 require 依赖）内容发生变化时，缓存失效
		},
		name: "development-cache",
	},
};
