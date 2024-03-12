/**
 * Main application routes
 */

const mount = require('koa-mount');

module.exports = function (app) {
  // YEOMAN INJECT ROUTES BELOW
  app.use(mount('/', require('../resources/root')));
  app.use(mount('/app', require('../resources/app')));
  app.use(mount('/paper', require('../resources/paper')));
};
