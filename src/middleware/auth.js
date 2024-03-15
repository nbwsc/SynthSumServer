const redis = require('../config/redis');
const { Account } = require('../models/Account');
const error = require('../middleware/error');

module.exports = (app) => {
  app.use(async (ctx, next) => {
    if (process.env.NODE_ENV === 'local') {
      const user = await Account.findOne({});
      ctx.currentUser = user;
      await next();
      return;
    }

    const unAuthUrls = ['/account/login'];
    if (unAuthUrls.includes(ctx.request.url.split('?')[0])) {
      await next();
    } else {
      const token = ctx.cookies.get('token') || ctx.request.header['x-token'];
      const id = await redis.get(`SynthSum:USER:${token}`);
      if (!id) {
        return error.basicAuthError(ctx);
      }
      const user = await Account.findById(id);
      if (!user) {
        return error.basicAuthError(ctx);
      }
      user.token = token;
      ctx.currentUser = user;
      await next();
    }
  });
};
