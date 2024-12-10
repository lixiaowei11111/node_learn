import Router from '@koa/router';
import UserRouter from './user';
import GoodsRouter from './goods';

const router=new Router({
  prefix:'/api'
});

router.get('/',(ctx,_next)=>{
  console.log('[debug] koa ctx', ctx)
  ctx.body=ctx
})

router.use(UserRouter)
router.use(GoodsRouter)

export default router;