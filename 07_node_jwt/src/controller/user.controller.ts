import { RouterContext } from "@koa/router";

export const login=async(ctx:RouterContext)=>{
  const body=await ctx.request.body;
  if(body.username&&body.password){
    ctx.body=`hello ${body.username}`
  }else{
    ctx.body="login fail!!!"
  }
}