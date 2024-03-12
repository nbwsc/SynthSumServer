const controller = require('./controller');
const router = require('koa-router')();
const spiderController = require('./spider/controller')
const selectedController = require('./selectedcontroller')

router.get('/', controller.index);
router.post('/query', controller.query);
router.post('/upsert', controller.upsert);
router.post('/delete', controller.delete);

router.post('/selected/query', selectedController.query);
router.post('/selected/upsert', selectedController.upsert);
router.post('/selected/delete', selectedController.delete);

router.get('/exportExcel', controller.exportExcel)
router.get('/exportSelectedExcel', selectedController.exportExcel)
router.post('/exportExcel', controller.exportExcel)

router.post('/spider/login', spiderController.login)
router.post('/spider/detail', spiderController.detail)

module.exports = router.routes();

if (process.env.NODE_ENV === 'production-server') {
    // require('./translate.script')
    // require('./insertembedding')
}