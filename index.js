const line = require('@line/bot-sdk');
const Koa = require('koa');
const Router = require('koa-router');
const c2k = require('koa-connect')

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

const router = new Router();
router.post(
  '/line-webhook',
  c2k(line.middleware(config)),
  async function (ctx, next) {
    const replies = await Promise.all(ctx.body.events.map(handleEvent))
    ctx.body = replies
})

const app = new Koa();
app.use(router.routes());
app.use(router.allowedMethods());

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const echo = { type: 'text', text: event.message.text };
  return client.replyMessage(event.replyToken, echo);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
