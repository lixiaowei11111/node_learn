import { RouterContext } from "@koa/router";
import prisma from "../db";

export const login = async (ctx: RouterContext) => {
  const body = await ctx.request.body;
  if (body.username && body.password) {
    const name=body.username as string;
    const password=body.password as string;
    const user=await prisma.user.findFirst({
      where:{
        name,
        password
      }
    })
    if(user){
      ctx.body = `${user.name} login success`;
    }else{
      ctx.body="账号或者密码错误"
      ctx.status=401
    }
   
  } else {
    ctx.body = "login fail!!!"
  }
}

export const register = async (ctx: RouterContext) => {
  const body = await ctx.request.body;
  if (body.username && body.password) {
    const name = body.username;
    const password = body.password;
    await prisma.user.create({
      data: {
        name,
        email: `${name}@gmail.com`,
        password,
      }
    })
    ctx.body = "register success!!!"
  }
}