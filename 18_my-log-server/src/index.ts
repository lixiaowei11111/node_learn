import express, { type Express } from 'express'

/* middleware */
import { myLogger, requestTime, cbMiddleware, errorMiddleware } from './middleware/myMiddleWare'

import rootRoutes from './routes'

const app: Express = express()
const port = parseInt(process.env.PORT!, 10) || 5000

/* middleware的加载有顺序区别 */
app.use(requestTime)// 中间件 有 应用级中间件, 路由级中间件,错误处理中间件等
app.use("/api/", rootRoutes)
app.use(myLogger)
app.use(cbMiddleware({ foo: "xxxx" }))// 中间件使用回调函数的形式来携带参数
app.use(errorMiddleware)


const main = async (): Promise<void> => {
  try {
    app.listen(port, () => {
      console.log("Server running on the ", `http://localhost:${port}`);

    })
  } catch (error) {
    console.log(error)
  }
}
main()