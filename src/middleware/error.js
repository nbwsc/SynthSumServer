module.exports = {
    basicAuthError: (ctx) => {
        ctx.status = 401;
        ctx.body = {
            code: 401,
            msg: 'login required',
        };
    },

    internalError: (ctx, error = {}) => {
        ctx.status = 500;
        ctx.body = {
            code: 500,
            msg: `internal error, ${error.toString()}`,
        };
    },

    mailError: (ctx, error = {}) => {
        ctx.body = {
            code: 504,
            msg: 'mail error,' + error.toString(),
        };
    },

    dbError: (ctx, error = {}) => {
        ctx.body = {
            code: 501,
            msg: error,
        };
    },

    paramError: (ctx, params = 'unknow') => {
        ctx.status = 502;
        ctx.body = {
            code: 502,
            msg: `params error, ${params} required`,
        };
    },

    notFoundError: (ctx, itemName = 'unkonw item') => {
        ctx.status = 503;
        ctx.body = {
            code: 503,
            msg: `${itemName} not found `,
        };
    },
    existError: (ctx, itemName = '') => {
        ctx.body = {
            code: 505,
            msg: `${itemName} 已存在`,
        };
    },
    authError: (ctx, msg) => {
        ctx.status = 506;
        ctx.body = {
            code: 506,
            msg,
        };
    },
    success: (ctx, data) => {
        ctx.status = 200;
        ctx.body = {
            code: 0,
            msg: 'success',
            data,
        };
    },

    freqLimitError: (ctx, msg) => {
        ctx.status = 508;
        ctx.body = {
            code: 508,
            msg: msg || '访问频率过高',
        };
    },
};
