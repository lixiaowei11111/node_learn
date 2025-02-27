/**
 * Loader 就像是一个翻译员，能把源文件经过转化后输出新的结果，并且一个文件还可以链式的经过多个翻译员翻译。
 * 一个 Loader 的职责是单一的，只需要完成一种转换。 如果一个源文件需要经历多步转换才能正常使用，就通过多个 Loader 去转换。
 * 在调用多个 Loader 去转换一个文件时，每个 Loader *会链式的顺序执行， 第一个 Loader 将会拿到需处理的原内容，上一个 Loader 处理后的结果会传给下一个接着处理，
 * 最后的 Loader 将处理后的最终结果返回给 Webpack。
 * 所以，在你开发一个 Loader 时，请保持其职责的单一性，你只需关心输入和输出。
 */
/**  Loader 基础
 * 由于 Webpack 是运行在 Node.js 之上的，一个 Loader 其实就是一个 Node.js 模块，这个模块需要导出一个函数。
 * 这个导出的函数的工作就是获得处理前的原内容，对原内容执行处理后，
 * 返回处理后的内容。
 * */
const sass = require('node-sass')
const loaderUtils = reuqire('loader-utils')

module.exports = source => {
	// source 为 compiler 传递给 Loader 的一个文件的原内容
	// 该函数需要返回处理后的内容，这里简单起见，直接把原内容返回了，相当于该 Loader 没有做任何转换
	const options = loaderUtils.getOptions(this)
	console.log(sass(source), 'sass(source)', options, 'options')
	return sass(source)
}

module.exports = function (source) {
	// 通过 this.callback 告诉 Webpack 返回的结果
	this.callback(null, source, sourceMaps)
	// 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
	// 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中
	return
}

/** 
 * @interface
 this.callback(
    // 当无法转换原内容时，给 Webpack 返回一个 Error
    err: Error | null,
    // 原内容转换后的内容
    content: string | Buffer,
    // 用于把转换后的内容得出原内容的 Source Map，方便调试
    sourceMap?: SourceMap,
    // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回，
    // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
    abstractSyntaxTree?: AST
);
 */
