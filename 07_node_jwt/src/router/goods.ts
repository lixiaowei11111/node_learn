import Router from "@koa/router";


const goodsRouter = new Router({
  prefix: '/goods',
});

goodsRouter.post('/detail/:id',(ctx)=>{
  ctx.body=`/api/goods/detail/:id ${ctx.params.id}`
})

export default goodsRouter.routes();