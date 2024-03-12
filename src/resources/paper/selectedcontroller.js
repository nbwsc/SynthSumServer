const response = require('../../middleware/error');
const { Paper, SelectedPaper, FullText } = require('./model');
const VDB = require('../../utils/vector')
const ExcelJS = require('exceljs');
const moment = require('moment')

function getPublisherSource(item) {
    const keys = ['Source Title', 'Volume', 'Issue', 'Part Number', 'Supplement', 'Special Issue', 'Meeting Abstract', 'Start Page', 'End Page']
    let source = ''
    for (const key of keys) {
        if (item[key]) {
            source += key + ':' + item[key] + ';'
        }
    }
    return source
    // return [item['Source Title'], item['Volume'], item['Issue'], item['Part Number'], item.Supplement, item['Special Issue'], item['Meeting Abstract'], `${item['Start Page'] || ''}-${item['End Page'] || ''}`].filter(e => e).join(';')
}

module.exports = {
    index: async (ctx) => {
        ctx.status = 200;
        ctx.body = [];
    },

    query: async (ctx) => {
        const { page = 1, limit = 20, sort = '-_id', search, deleted, datatype /** query fields */ } = ctx.request.body;
        const filter = { deleted: { $ne: true } };
        if (search) {
            const exp = new RegExp(search, 'i')
            filter.$or = [
                { code: search },
                { 'Article Title': exp },
                { 'cnTitle': exp },
                { 'Abstract': exp },
                { 'cnAbstract': exp },
            ]
        }
        if (datatype) {
            filter.datatype = datatype
        }
        if (deleted) {
            filter.deleted = deleted
        }
        /** query filter */
        /** qf && fileter.qf = new RegExp(qf) */
        const total = await SelectedPaper.count(filter);
        const list = await SelectedPaper
            .find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        response.success(ctx, { total, list });
    },

    upsert: async (ctx) => {
        const data = ctx.request.body;
        if (data._id) {
            const p = await SelectedPaper.findByIdAndUpdate(data._id, data);
            response.success(ctx, p);
        } else {
            const p = new SelectedPaper(data);
            await p.save();
            response.success(ctx, p);
        }
    },

    delete: async (ctx) => {
        const { _id } = ctx.request.body;
        // await Paper.findByIdAndRemove(_id);
        await SelectedPaper.findByIdAndUpdate(_id, { deleted: true });
        response.success(ctx);
    },


    exportExcel: async (ctx) => {
        const { ids, filter, note,code } = ctx.request.query
        let list
        if (ids) {
            const idArray = ids.split(',')
            list = await SelectedPaper.find({ _id: { $in: idArray } }).lean();
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
            list = await SelectedPaper.find(f).limit(5000).lean();
        } else {
            return ctx.body = '参数错误:' + ctx.request.query
        }
        // get fulltexts
        // const fulltexts = await FullText.find({ doi: { $in: list.map(item => item.DOI) } }).lean()
        // format list
        list.forEach(async item => {
            // item['fulltext'] = fulltexts.find(f => f.doi === item.DOI)?.fulltext
            item['Publisher Source'] = item['Publisher Source'] || getPublisherSource(item)
            item['Publication Time'] = item['Publication Time'] || item['Publication Year'] + '-' + item['Publication Date']
            item['References'] = item['References'].join(';')
            item['Author Informations'] = item['Reprint Addresses'] + '; ' + item['Addresses'] + '; ' + item['Email Addresses']
        })
        const workbook = new ExcelJS.Workbook();
        const keymap = [
            { enKey: 'keyword', cnKey: 'F01 关键词' },
            { enKey: 'operator', cnKey: 'F02 操作人员' },
            { enKey: 'uploadedAt', cnKey: 'F03 检索日期' },
            { enKey: 'code', cnKey: 'F04 编码' },
            { enKey: 'category', cnKey: 'F05 语料分类' },
            { enKey: 'platform', cnKey: 'F06 平台' },
            { enKey: 'datatype', cnKey: 'F07 列表/详情' },
            { enKey: 'cnTitle', cnKey: 'F08 文献标题(中文)' },
            { enKey: 'Article Title', cnKey: 'F09 文献标题(英文)' },
            { enKey: 'Detail Link', cnKey: 'F10 文献详情页网页链接' },
            { enKey: 'DOI', cnKey: 'F11 DOI' },
            { enKey: 'UT (Unique WOS ID)', cnKey: 'F12 入藏号' },
            { enKey: 'IDS Number', cnKey: 'F13 IDS 号' },
            { enKey: 'Document Type', cnKey: 'F14 文献类型' },
            { enKey: 'Research Areas', cnKey: 'F15 类别/分类-研究方向' },
            { enKey: 'Citation Topics', cnKey: 'F16 类别/分类-引文主题' },
            {
                enKey: 'Sustainable Development Goals',
                cnKey: 'F17 类别/分类-可持续发展目标'
            },
            { enKey: 'WoS Categories', cnKey: 'F18 WOS类别' },
            { enKey: 'cnAbstract', cnKey: 'F19 文献文字摘要(中文)' },
            { enKey: 'Abstract', cnKey: 'F20 文献文字摘要(英文)' },
            { enKey: 'Image Abstract', cnKey: 'F21 文献图例摘要' },
            { enKey: 'cn Author Keywords', cnKey: 'F22 作者关键词(中文)' },
            { enKey: 'Author Keywords', cnKey: 'F23 作者关键词(英文)' },
            { enKey: 'cn Keywords Plus', cnKey: 'F24 拓展关键词(中文)' },
            { enKey: 'Keywords Plus', cnKey: 'F25 拓展关键词(英文)' },
            { enKey: 'Cited Reference Count', cnKey: 'F26 引用的参考文献数' },
            { enKey: 'Times Cited, WoS Core', cnKey: 'F27 被引频次' },
            { enKey: 'Outline', cnKey: 'F28 大纲/章节要句提取' },
            { enKey: 'Image', cnKey: 'F29 正文图例' },
            { enKey: 'Table', cnKey: 'F30 正文表格' },
            { enKey: 'cnConclusion', cnKey: 'F31 正文结论部分（中文）' },
            { enKey: 'Conclusion', cnKey: 'F32 正文结论部分（英文）' },
            { enKey: 'References', cnKey: 'F33 参考文献' },
            { enKey: 'Cited References2', cnKey: 'F34 被引文献' },// 
            { enKey: 'Authors', cnKey: 'F35 文献作者（简称）' },
            { enKey: 'Author Full Names', cnKey: 'F36 文献作者（全称）' },
            { enKey: 'Researcher Ids', cnKey: 'F37 Web of Science ResearcherID' },
            { enKey: 'ORCIDs', cnKey: 'F38 ORCID 号' },
            { enKey: 'Affiliations', cnKey: 'F39 作者所属机构' },
            { enKey: 'Author Informations', cnKey: 'F40 作者信息' },
            { enKey: 'Publisher Source', cnKey: 'F41 文献源' },
            { enKey: 'Publication Time', cnKey: 'F42 出版时间' },
            { enKey: 'Language', cnKey: 'F43 语种' },
            { enKey: 'Source Title', cnKey: 'F44 期刊名称' },
            { enKey: 'ISSN', cnKey: 'F45 ISSN' },
            { enKey: 'eISSN', cnKey: 'F46 eISSN' },
            { enKey: 'Impact Factor', cnKey: 'F47 影响因子' },
            { enKey: 'Journal Citation Indicator', cnKey: 'F48 期刊引文指标' },
            { enKey: 'Funding Orgs', cnKey: 'F49 基金资助机构' },
            { enKey: 'paperlink', cnKey: 'F50 全文跳转链接' }

        ]
        const columns = keymap.map(item => item.enKey)
        const columnsMap = keymap.map(item => item.cnKey)
        const worksheet = workbook.addWorksheet('Sheet1');
        const excelcolumns = []
        columns.forEach((key, index) => {
            excelcolumns.push({ header: columnsMap[index], key: key, width: 10 })
        })
        worksheet.columns = excelcolumns
        worksheet.addRows(list);
        const filename = `${moment().format('MM-DD')}-${list[0].keyword}-${list[0].platform}-${code}-${note || ''}`
        ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        ctx.set('Content-Disposition', `attachment; filename=${filename}.xlsx`);
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
        await VDB.upsert('cat', 'papers', [item])
        paper.embedded = true;
        await paper.save()
    }
}


async function testSearch(text) {
    const res = await VDB.query('cat', 'papers', text)
}

// setTimeout(async () => {
//     insertVDB('维生素会导致过敏性皮炎吗')
// }, 1999);