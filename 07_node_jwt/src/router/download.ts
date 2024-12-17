import Router from "@koa/router";


const downloadRouter = new Router({
  prefix: '/download',
});

downloadRouter.post('/pdf/:id',(ctx)=>{
  ctx.body=`/api/goods/detail/:id ${ctx.params.id}`
})

export default downloadRouter.routes();