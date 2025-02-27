module.exports={
	plugins:{
		autoprefixer:{}, // 自动添加浏览器前缀
		tailwindcss:{}, 
		'postcss-calc':{},// css中更好的计算支持
		'postcss-url':{},// 用于处理CSS中的URL路径，例如处理背景图像路径等。
		'postcss-import':{},// 用于处理CSS中的@import规则，允许在CSS文件中引入其他CSS文件。
		'postcss-custom-properties':{
			preserve:false,
		}// 用于处理CSS中的自定义属性（CSS变量）。在这个配置中，preserve选项设置为false表示完全删除所有CSS变量，importFrom选项指定了一个或多个文件路径，用于从中导入新的CSS变量值。
	}
}
