import { RouterContext } from "@koa/router";
import prisma from "../db";
import HttpStatus from "../model/http.model";

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
      ctx.status=HttpStatus.Unauthorized
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

export const updateUsername=async(ctx:RouterContext)=>{
  const body=await ctx.request.body;
  if(body.username){
    const name=body.username as string;
    if(!body.newName){
      ctx.body="newName is required"
      ctx.status=HttpStatus.BadRequest
      return
    }
    const user=await prisma.user.findFirst({
      where:{
        name,
      }
    })
    if(!user){
      ctx.body="user not found"
      ctx.status=HttpStatus.BadRequest
    }else{
      await prisma.user.update({
        where:{id:user.id},
        data:{name:body.newName}
      })
      ctx.body="update success"
    }

  }
}