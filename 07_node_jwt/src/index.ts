import Koa from 'koa';
import router from './router';
import parseRequestBody from './lib/bodyParser';
import port from './config/port';
const app = new Koa();
import client, { setup } from './db/redis';

app.use(async () => {
  await setup(client);
});
app.use(async (ctx, next) => {
  ctx.request.body = await parseRequestBody(ctx.req);
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port);
