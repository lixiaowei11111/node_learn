import Koa from 'koa';
import router from './router';
import parseRequestBody from './lib/bodyParser';
import port from './config/port';
const app = new Koa();

app.use(async (ctx, next) => {
  ctx.request.body = await parseRequestBody(ctx.req);
  await next();
})

app.use(router.routes()).use(router.allowedMethods());

app.listen(port);