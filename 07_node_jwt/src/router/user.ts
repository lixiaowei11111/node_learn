import Router from "@koa/router";

import { login } from "../controller/user.controller";

const userRouter = new Router({
  prefix: '/user',
});

userRouter.post('/login',login)

export default userRouter.routes();