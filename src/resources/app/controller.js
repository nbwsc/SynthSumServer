const moment = require('moment')
const response = require('../../middleware/error');
const { getPages, getScreenshot } = require('../../utils/pptr')

module.exports = {
    getPages: async ctx => {
        const pages = await getPages()
        response.success(ctx, pages)
    },

    getScreenshot: async ctx => {
        const { pageIndex } = ctx.request.query;
        console.log(pageIndex)
        const filename = await getScreenshot(pageIndex);
        try {
            const data = await fs.readFile(`../../../screenshot/${filename}.png`);
            ctx.type = 'image/jpeg';
            ctx.body = data;
        } catch (err) {
            ctx.status = 404;
            ctx.body = 'File not found!';
        }
    }
}