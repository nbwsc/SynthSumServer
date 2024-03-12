const response = require('../../middleware/error');
const { Paper, RawPaper } = require('./model');
const VDB = require('../../utils/vector')
const ExcelJS = require('exceljs');
const moment = require('moment')

module.exports = {
    index: async (ctx) => {
        ctx.status = 200;
        ctx.body = [];
    },

    query: async (ctx) => {
        const { page = 1, limit = 20, sort = '-_id', search, deleted /** query fields */ } = ctx.request.body;
        const filter = { deleted: { $ne: true } };
        if (search) {
            const exp = new RegExp(search, 'i')
            filter.$or = [
                { 'Article Title': exp },
                { 'cnTitle': exp },
                { 'Abstract': exp },
                { 'cnAbstract': exp },
            ]
        }
        if (deleted) {
            filter.deleted = deleted
        }
        /** query filter */
        /** qf && fileter.qf = new RegExp(qf) */
        const total = await RawPaper.count(filter);
        const list = await RawPaper
            .find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        response.success(ctx, { total, list });
    },

    upsert: async (ctx) => {
        const data = ctx.request.body;
        if (data._id) {
            const p = await RawPaper.findByIdAndUpdate(data._id, data);
            response.success(ctx, p);
        } else {
            const p = new RawPaper(data);
            await p.save();
            response.success(ctx, p);
        }
    },

    delete: async (ctx) => {
        const { _id } = ctx.request.body;
        // await Paper.findByIdAndRemove(_id);
        await RawPaper.findByIdAndUpdate(_id, { deleted: true });
        response.success(ctx);
    },


    exportExcel: async (ctx) => {
        const { ids, filter } = ctx.request.query
        let list
        if (ids) {
            const idArray = ids.split(',')
            list = await RawPaper.find({ _id: { $in: idArray } });
        } else if (filter) {
            const o = JSON.parse(filter)
            const f = { deleted: { $ne: true } };
            if (o.search) {
                const exp = new RegExp(search, 'i')
                f.$or = [
                    { 'Article Title': exp },
                    { 'cnTitle': exp },
                    { 'Abstract': exp },
                    { 'cnAbstract': exp },
                ]
            }
            if (o.deleted) {
                f.deleted = o.deleted
            }
            list = await RawPaper.find(f).limit(5);
        } else {
            return ctx.body = '参数错误:' + ctx.request.query
        }
        const workbook = new ExcelJS.Workbook();
        const columns = [
            'keyword',
            'operator',
            'uploadedAt',
            'code',
            'category',
            'platform',
            'datatype',
            'Article Title',
            'cnTitle',// 'Article Title',
            'Detail Link',
            'DOI',
            'UT (Unique WOS ID)',
            'IDS Number',
            'Document Type',
            'Research Areas',
            'Citation Topics',
            'Sustainable Development Goals',
            'WoS Categories',
            'Abstract',
            'cnAbstract',// 'Abstract',
            'Image Abstract',
            'Author Keywords',
            'cn Author Keywords',
            'Keywords Plus',
            'cn Keywords Plus',
            'Cited Reference Count',
            'Times Cited, All Databases',
            'Outline',
            'Image',
            'Table',
            'Conclusion',
            'References',
            'Cited References',
            'Authors',
            'ORCIDs',
            'Author Org',
            'Author Information',
            'Source Title',
            'Publication Year',
            'Publication Date',
            'Language',
            'Publisher',
            'ISSN',
            'eISSN',
            'Impact Factor',
            'Journal Citation Indicator',
            'Funding Orgs'
        ]
        const columnsMap =
            [
                "关键词",
                "操作人员",
                "检索日期",
                "编码",
                "语料分类",
                "平台",
                "列表/详情",
                "文献标题(英)",
                "文献标题(中)",
                "文献详情页网页链接",
                "DOI",
                "入藏号",
                "IDS 号",
                "文献类型",
                "类别/分类-研究方向",
                "类别/分类-引文主题",
                "类别/分类-可持续发展目标",
                "WOS类别",
                "文献文字摘要(英)",
                "文献文字摘要(中)",
                "文献图例摘要",
                "作者关键词(英)",
                "作者关键词(中)",
                "拓展关键词(英)",
                "拓展关键词(中)",
                "引用的参考文献数",
                "被引频次",
                "大纲/章节要句提取",
                "正文图例",
                "正文表格",
                "正文结论部分",
                "参考文献",
                "被引文献",
                "文献作者",
                "Web of Science ResearcherID",
                "ORCID 号",
                "作者所属机构",
                "作者信息",
                "文献源",
                "出版时间",
                "语种",
                "期刊名称",
                "ISSN",
                "eISSN",
                "影响因子",
                "期刊引文指标",
                "基金资助机构"
            ]
        const worksheet = workbook.addWorksheet('Sheet1');
        const excelcolumns = []
        columns.forEach((key, index) => {
            excelcolumns.push({ header: columnsMap[index], key: key, width: 10 })
        })
        worksheet.columns = excelcolumns
        worksheet.addRows(list);
        ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        ctx.set('Content-Disposition', `attachment; filename=papers_${moment().format('MM-DD')}.xlsx`);
        ctx.body = await workbook.xlsx.writeBuffer();
    }
};


async function insertVDB() {
    let startCount = await Paper.count({ embedded: true })
    const testPapers = await Paper.find({ embedded: { $ne: true } }).limit(10);
    if (testPapers.length === 0) {
        throw new Error('end')
    }
    console.log(startCount)
    for (let index = 0; index < testPapers.length; index++) {
        const paper = testPapers[index];
        const item = {
            id: startCount + index + '',
            mongoId: paper._id.toString(),
            text: paper.title + '\n' + paper.abstract,
            title: paper.title
        }
        console.log(item.title)
        await VDB.upsert('cat','papers',[item])
        paper.embedded = true;
        await paper.save()
    }
}


async function testSearch(text) {
    const res = await VDB.query('cat','papers',text)
}

// setTimeout(async () => {
//     insertVDB('维生素会导致过敏性皮炎吗')
// }, 1999);