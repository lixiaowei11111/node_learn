const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const app = new Koa()

const htmlBuff = fs.readFileSync('./dist/index.html')

// 静态资源
app.use(require('koa-static')(path.join(__dirname) + '/dist'))

app.use(async ctx => {
  ctx.type = 'html'
  ctx.body = htmlBuff
})

app.listen(9500, () => {
  console.log('启动成功')
})
