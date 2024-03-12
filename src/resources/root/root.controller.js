const response = require('../../middleware/error');
const { Account } = require('../../models/Account');
const redis = require('../../config/redis');

module.exports = {
  index: async (ctx) => {
    ctx.status = 403;
    ctx.body = {
      name: 'server',
      info: '',
    };
  },

  login: async (ctx) => {
    const { username, password } = ctx.request.body;
    const account = await Account.findOne({ username, password });
    if (!account) {
      return response.dbError(ctx, '用户名密码错误');
    }
    const token = `${account._id}-${new Date().getTime()}`;
    try {
      await redis.setEx(`FA:USER:${token}`, 172800, account._id);
    } catch (error) {
      console.error(error);
      return response.dbError(ctx, error);
    }
    ctx.cookies.set('token', token);

    response.success(ctx, { token });
  },

  info: async (ctx) => {
    const account = await Account.findById(ctx.currentUser._id, '-password');
    if (!account) {
      return response.notFoundError(ctx, 'account');
    }
    const alluser = await Account.find({}, 'name');
    response.success(ctx, { account, alluser });
  },
};
