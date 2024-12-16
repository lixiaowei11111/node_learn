import Router from "@koa/router";

import { login,register } from "../controller/user.controller";

const userRouter = new Router({
  prefix: '/user',
});

userRouter.post('/login',login)
userRouter.post('/register',register)

export default userRouter.routes();