module.exports = {
  trailingComma: "all",
  tabWidth: 2, // 缩进字节数
  semi: true, // 结尾不用分号(true有，false没有)
  singleQuote: false, // 使用单引号(true单双引号，false双引号)
  jsxSingleQuote: false,
  printWidth: 80, // 超过最大值换行
  arrowParens: "avoid", //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号 ,always：不省略括号
  endOfLine: "auto",
  eslintIntegration: true, // 于与 ESLint 进行集成。当将 "eslintIntegration" 设置为 true 时，Prettier 会根据 ESLint 的规则来格式化代码。这意味着 Prettier 将尽量遵循 ESLint 的规则来进行代码格式化，以确保代码风格的一致性。
};
