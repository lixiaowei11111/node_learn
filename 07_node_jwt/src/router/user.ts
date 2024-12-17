import Router from "@koa/router";

import { login,register,updateUsername } from "../controller/user.controller";

const userRouter = new Router({
  prefix: '/user',
});

userRouter.post('/login',login)
userRouter.post('/register',register)
userRouter.post('/update_username',updateUsername)

export default userRouter.routes();