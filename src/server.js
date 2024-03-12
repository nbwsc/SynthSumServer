/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Koa = require('koa');
const config = require('./config/environment');

// Bootstrap server

const app = new Koa();
require('./config/koa')(app);
require('./config/routes')(app);
require('./config/dbconnect.js');

// Start server
if (!module.parent) {
  app.listen(config.port, config.ip, () => {
    console.log('Koa server listening on %d, in %s mode', config.port, config.env);
  });
}

// Expose app
exports = module.exports = app;

