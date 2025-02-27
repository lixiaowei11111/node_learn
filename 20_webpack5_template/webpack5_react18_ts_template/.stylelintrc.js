module.exports = {
  extends: [
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
    'stylelint-prettier/recommended',
  ],
  plugins: ['stylelint-prettier'],
  ignoreFiles: ['dist/**/*'],
  overrides: [
    {
      /** 支持校验html，sfc文件中的style内容 */
      files: ['*.html', '**/*.html', '*.vue', '**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    }
  ],
  rules: {},
}
