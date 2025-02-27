const webpackMerge = require("webpack-merge");
// plugins
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // css 压缩
const TerserPlugin = require("terser-webpack-plugin"); // 代码优化
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const baseConfig = require("./webpack.config.base");

const plugins = [
	new CleanWebpackPlugin(), // 清空构建文件夹
	new WebpackManifestPlugin({
		fileName: "asset-manifest.json",
		publicPath: "/",
		basePath: "/",
		filter(file) {
			const a = /static\/img\/emoji/;
			if (a.test(file.name)) {
				return false;
			}
			return true;
		},
	}), // 清单
];

// report 配置
if (process.env.npm_config_report === "true") {
	plugins.push(
		new BundleAnalyzerPlugin({ analyzerPort: 8080, generateStatsFile: false }),
	);
}

const prodConfig = {
	mode: process.env.NODE_ENV,
	plugins: plugins,
	optimization: {
		minimize: true,
		minimizer: [
			new CssMinimizerPlugin(), //压缩css代码
			new TerserPlugin({
				// https://github.com/webpack-contrib/terser-webpack-plugin#parallel
				// test: null,
				// includes: null,
				// exclude: null,
				// minify: {},
				parallel: true, // boolean |number 使用多线程并行来提高构建速度
				// terserOptions: {},
				extractComments: true, // 提取注释
			}), // 压缩js代码
		],
		runtimeChunk: {
			name: "runtime", // 提取Webpack的运行时代码到单独的chunk中
		},
		splitChunks: {
			name: false, // split chunk的名称。提供false将保持块的相同名称，因此它不会不必要地更改名称。这是生产构建的推荐值
			chunks: "all",
			minSize: 20000, // 生成chunk的最小大小 byte
			maxSize: 100000,
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: 10,
					name: "vendor",
					chunks: "all",
				},
				ant: {
					name: "chunk-ant-design",
					priority: 20,
					test: /[\\/]node_modules[\\/]ant-design[\\/]/,
				},
			},
		},
	},
};

module.exports = webpackMerge.merge(baseConfig, prodConfig);
