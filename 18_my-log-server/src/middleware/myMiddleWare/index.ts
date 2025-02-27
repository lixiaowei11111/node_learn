import { NextFunction, Request, Response } from "express";

/* 中间件 */
export const myLogger = (_req: Request, _res: Response, next: NextFunction) => {
  console.log("logger middleware is execute !");
  next()
}

/* 给req或者res对象挂载 自定义属性 */
export const requestTime = (req: Request, _res: Response, next: NextFunction) => {
  req.requestTime = Date.now()
  /* 中间件在req上挂在的自定义属性需要使用.d.ts文件中声明,且需要在ts.config.json中配置ts-node的files选项 */
  next()
}

/* 使用回调函数进行传参 */
interface optionType {
  foo?: string,
  bar?: number
}
export const cbMiddleware = (options: optionType) => {
  return function (_req: Request, _res: Response, next: NextFunction) {
    console.log("callback middleware pass parameter", options);
    if (options.foo) {
      next("/api/user/login")
    }
    next()
  }
}

/* 错误中间件 */
export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err.stack);
  res.status(500).send("Something broke") // 捕获到express使用next传递的错误并设置返回
}