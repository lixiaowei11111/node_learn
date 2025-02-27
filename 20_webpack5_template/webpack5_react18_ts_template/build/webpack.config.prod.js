const webpackMerge = require('webpack-merge')

/**
 * @type {import('webpack').WebpackOptionsNormalized}
 */
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')// 打包 清单

const baseConfig = require('./webpack.config.base')

const prodConfig = {
	mode: process.env.NODE_ENV,
	plugins: [
		new WebpackManifestPlugin({
			fileName: 'asset-manifest.json',
			publicPath: '/',
			basePath: '/',
			filter(file) {
				const a = /static\/img\/emoji/
				if (a.test(file.name)) {
					return false
				}
				return true
			},
		}),
	],
}

module.exports = webpackMerge.merge(baseConfig, prodConfig)
