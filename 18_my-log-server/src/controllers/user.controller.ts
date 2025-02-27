import fs from 'node:fs'

import { NextFunction, Request, Response } from "express";// 第三方自定义模块

import BaseController from "./base.controller";// 文件模块

class UserController extends BaseController {
   async login (req: Request, res: Response, _next: NextFunction): Promise<Response<string>> {
    console.log("requestTime", req.requestTime);// 获取请求时间戳

    return res.json("TOKEN")
  }

   async redirect (_req: Request, res: Response) {
    res.redirect(301, "http://10.219.16.59/#/crm/customer")
  }

   synchErrorHandle () {
    throw new Error("runtime Exception")// express 会自动捕获到同步异常 // 异步异常需要使用next(err)来传递
  }

   asynchErrorHnadle (_req: Request, res: Response, next: NextFunction) {
    // asynch exception must use next pass err
    fs.readFile("/file-doss-not-exist", (err, data) => {
      if (err) {
        next(err)
      } else {
        res.send(data)
      }
    })
  }

   promiseResolveHandle (_req: Request, _res: Response, next: NextFunction) {
    Promise.resolve().then(() => {
      throw new Error("Promsie then inside throw error ")
    }).catch((err) => { next(err) })
    // 如果不适用catch捕获,会导致程序中断,不使用next传递,会导致express 捕获不到该错误
  }

  getUserInfoById (req: Request, _res: Response, next: NextFunction) {
    console.log(req.params,'req.params',"router.params 的callback被调用");
    req.params.userId="123"
    next()
    
  }
  getUserInfo (req: Request, _res: Response,next:NextFunction) {
    console.log(req.params.userId,"req.params.userId" ,"");
    
    next()
  }
}

export default new UserController()