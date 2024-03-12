/**
 * Koa config
 */

const fs = require('fs');
const morgan = require('koa-morgan');

const accessLogStream = fs.createWriteStream(`${__dirname}/access.log`, {
  flags: 'a',
});
const cors = require('kcors');
const config = require('./environment');
const koaBody = require('koa-body');
const auth = require('../middleware/auth');

module.exports = function (app) {
  app.use(cors());

  app.use(async (ctx, next) => {
    let url = ctx.req.url;
    if (ctx.req.method == 'POST' && url.includes('/callback')) {
      let that = ctx;
      ctx.req.rawBody = '';

      ctx.req.on('data', function (chunk) {
        that.req.rawBody += chunk;
      });
    }

    await next();
  });

  app.use(
    koaBody({
      multipart: true,
      formLimit: '20mb',
      jsonLimit: '20mb',
      textLimit: '20mb',
      enableTypes: ['json', 'form', 'text'],
    })
  );

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        msg: 'service panic,' + error,
      };
    }
  });
  auth(app);

  // Logger
  // app.use(morgan.middleware(config.logType));
  app.use(morgan(config.logType, { stream: accessLogStream }));
};
