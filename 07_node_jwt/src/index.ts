import Koa from 'koa';
import router from './router';
import parseRequestBody from './lib/bodyParser';
import port from './config/port';
import client, { setup } from './db/redis';

const app = new Koa();

app.use(async (_ctx, next) => {
  await setup(client);
  await next();
});
app.use(async (ctx, next) => {
  ctx.request.body = await parseRequestBody(ctx.req);
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
