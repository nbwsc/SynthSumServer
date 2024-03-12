const controller = require('./root.controller');
const router = require('koa-router')();

router.get('/', controller.index);
router.post('/account/login', controller.login);
router.get('/info', controller.info);
router.post('/info', controller.info);

module.exports = router.routes();
