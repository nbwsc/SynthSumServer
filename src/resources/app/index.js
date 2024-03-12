
const controller = require('./controller');
const router = require('koa-router')();

router.post('/getPages', controller.getPages)
router.get('/getScreenshot', controller.getScreenshot)
module.exports = router.routes();
