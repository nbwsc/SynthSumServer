const mongoose = require('mongoose');
const { readExcelToObjectArray } = require('../../utils/excel')

const Paper = mongoose.model(
    'Paper',
    mongoose.Schema({
        // Inject Fields

        searchKeyword: String,
        platform: String,

        rawtitle: { type: String, index: true },
        title: String,
        authors: [String],
        rawabstract: String,
        abstract: String,
        paperKeywords: [String],
        url: String,
        pubDate: Date,
        refNumber: Number,
        "journalname": String,
        "journalvolume": String,

        DOI: String,//externalIds.DOI
        "paperId": String,
        "year": Number,
        "referenceCount": Number,
        "openAccessPdf": String,

        deleted: Boolean,
        embedded: Boolean,

    })
);

const RawPaper = mongoose.model('RawPaper', {
    // 批次要素: 关键词	操作人员	检索日期	编码	语料分类	平台	列表/详情
    'keyword': String,//
    'operator': String,//
    uploadedAt: String,
    'code': String,//
    'category': String,//
    'platform': String,
    'datatype': String,//

    // 标的名称要素: 文献标题	文献详情页网页链接
    "Article Title": String,
    'cnTitle': String,// 'Article Title',
    'Detail Link': String, // sd

    // 标的编码要素: DOI	入藏号	IDS号 
    "DOI": { type: String, unique: true },
    "UT (Unique WOS ID)": String,
    "IDS Number": String,

    // 标的分类要素：文献类型	类别/分类-研究方向	类别/分类-引文主题	类别/分类-可持续发展目标	WOS类别
    "Document Type": String,
    "Research Areas": String,
    "Citation Topics": String,// wos detail
    "Sustainable Development Goals": String,// wos detail
    "WoS Categories": String,

    // 标的详情要素: 文献文字摘要	文献图例摘要	作者关键词	拓展关键词	引用的参考文献数	被引频次	
    "Abstract": String,
    'cnAbstract': String,
    "Image Abstract": String,//
    "Author Keywords": String,
    'cn Author Keywords': String,
    "Keywords Plus": String,
    'cn Keywords Plus': String,
    "Cited Reference Count": String,
    // "Times Cited, All Databases": String,
    "Times Cited, WoS Core": String,

    //快照： 大纲/章节要句提取	正文图例	正文表格	正文结论部分	参考文献	被引文献
    "Outline": String,//
    "Image": String,//
    "Table": String,//
    "Conclusion": String,//
    cnConclusion: String,
    "References": [String],//
    "Cited References": [String],//

    // 作者：   文献作者	Web of Science ResearcherID	ORCID 号	作者所属机构	作者信息	
    "Authors": String,
    "Researcher Ids": String,
    "ORCIDs": String,
    "Author Org": String,
    "Author Information": String,

    // 来源：   文献源	出版时间	语种
    "Source Title": String,
    "Publication Time": String,

    "Language": String,

    // 源头权利方要素 期刊名称	ISSN	eISSN	影响因子	期刊引文指标	基金资助机构
    "Publisher": String,
    "ISSN": String,
    "eISSN": String,
    "Impact Factor": String,
    "Journal Citation Indicator": String,
    "Funding Orgs": String,

    "WOSIDs": String,
    "Publication Type": String,
    "Book Authors": String,
    "Book Editors": String,
    "Book Group Authors": String,
    "Author Full Names": String,
    "Book Author Full Names": String,
    "Group Authors": String,
    "Book Series Title": String,
    "Book Series Subtitle": String,
    "Cited References": String,
    "Conference Title": String,
    "Conference Date": String,
    "Conference Location": String,
    "Conference Sponsor": String,
    "Conference Host": String,
    "Abstract": String,
    "Addresses": String,
    "Affiliations": String,
    "Reprint Addresses": String,
    "Email Addresses": String,
    "Funding Name Preferred": String,
    "Funding Text": String,
    // "Times Cited, WoS Core": String,
    "Times Cited, All Databases": String,

    "180 Day Usage Count": String,
    "Since 2013 Usage Count": String,
    "Publisher City": String,
    "Publisher Address": String,

    "ISBN": String,
    "Journal Abbreviation": String,
    "Journal ISO Abbreviation": String,
    "Volume": String,
    "Issue": String,
    "Part Number": String,
    "Supplement": String,
    "Special Issue": String,
    "Meeting Abstract": String,
    "Start Page": String,
    "End Page": String,
    "Article Number": String,
    "DOI Link": String,
    "Book DOI": String,
    "Early Access Date": String,
    "Number of Pages": String,
    "Web of Science Index": String,
    "Pubmed Id": String,
    "Open Access Designations": String,
    "Highly Cited Status": String,
    "Hot Paper Status": String,
    "Date of Export": String,
    "Web of Science Record": String,
    "Publication Year": String,
    "Publication Date": String,
    // cnTitle: String,
    // cnAbstract: String,
    deleted: Boolean,
})


const SelectedPaper = mongoose.model('SelectedPaper', {
    // 批次要素: 关键词	操作人员	检索日期	编码	语料分类	平台	列表/详情
    'keyword': String,//
    'operator': String,//
    uploadedAt: String,
    'code': String,//
    'category': String,//
    'platform': String,
    'datatype': String,//

    // 标的名称要素: 文献标题	文献详情页网页链接
    "Article Title": String,
    'cnTitle': String,// 'Article Title',
    'Detail Link': String, // sd

    // 标的编码要素: DOI	入藏号	IDS号 
    "DOI": { type: String, unique: true },
    "UT (Unique WOS ID)": String,
    "IDS Number": String,

    // 标的分类要素：文献类型	类别/分类-研究方向	类别/分类-引文主题	类别/分类-可持续发展目标	WOS类别
    "Document Type": String,
    "Research Areas": String,
    "Citation Topics": String,// wos detail
    "Sustainable Development Goals": String,// wos detail
    "WoS Categories": String,

    // 标的详情要素: 文献文字摘要	文献图例摘要	作者关键词	拓展关键词	引用的参考文献数	被引频次	
    "Abstract": String,
    'cnAbstract': String,
    "Image Abstract": String,//
    "Author Keywords": String,
    'cn Author Keywords': String,
    "Keywords Plus": String,
    'cn Keywords Plus': String,
    "Cited Reference Count": String,
    "Times Cited, All Databases": String,

    //快照： 大纲/章节要句提取	正文图例	正文表格	正文结论部分	参考文献	被引文献
    "Outline": String,//
    "Image": String,//
    "Table": String,//
    "Conclusion": String,//
    "References": [String],//
    "Cited References": [String],//

    // 作者：   文献作者	Web of Science ResearcherID	ORCID 号	作者所属机构	作者信息	
    "Authors": String,
    "WOSIDs": String,
    "ORCIDs": String,
    "Author Org": String,
    "Author Information": String,

    // 来源：   文献源	出版时间	语种
    'Publisher Source': String,
    'Publication Time': String,

    "Language": String,

    // 源头权利方要素 期刊名称	ISSN	eISSN	影响因子	期刊引文指标	基金资助机构
    "Publisher": String,
    "ISSN": String,
    "eISSN": String,
    "Impact Factor": String,
    "Journal Citation Indicator": String,
    "Funding Orgs": String,
    "Publication Year": String,
    "Publication Date": String,
    "Source Title": String,
    "Publication Type": String,
    "Book Authors": String,
    "Book Editors": String,
    "Book Group Authors": String,
    "Author Full Names": String,
    "Book Author Full Names": String,
    "Group Authors": String,
    "Book Series Title": String,
    "Book Series Subtitle": String,
    "Cited References": String,
    "Conference Title": String,
    "Conference Date": String,
    "Conference Location": String,
    "Conference Sponsor": String,
    "Conference Host": String,
    "Abstract": String,
    "Addresses": String,
    "Affiliations": String,
    "Reprint Addresses": String,
    "Email Addresses": String,
    "Researcher Ids": String,
    "Funding Name Preferred": String,
    "Funding Text": String,
    "Times Cited, WoS Core": String,
    "180 Day Usage Count": String,
    "Since 2013 Usage Count": String,
    "Publisher City": String,
    "Publisher Address": String,

    "ISBN": String,
    "Journal Abbreviation": String,
    "Journal ISO Abbreviation": String,
    "Volume": String,
    "Issue": String,
    "Part Number": String,
    "Supplement": String,
    "Special Issue": String,
    "Meeting Abstract": String,
    "Start Page": String,
    "End Page": String,
    "Article Number": String,
    "DOI Link": String,
    "Book DOI": String,
    "Early Access Date": String,
    "Number of Pages": String,
    "Web of Science Index": String,
    "Pubmed Id": String,
    "Open Access Designations": String,
    "Highly Cited Status": String,
    "Hot Paper Status": String,
    "Date of Export": String,
    "Web of Science Record": String,

    // cnTitle: String,
    // cnAbstract: String,
    deleted: Boolean,
    spideState: String,// wos\sd\wiley

    paperlink: String,
})

const Author = mongoose.model('Author', {
    name: String,
    WOSID: String,
    ORCID: String,
})


const FullText = mongoose.model('FullText', {
    doi: { type: String, unique: true },
    fulltext: String,
})

module.exports = { Paper, RawPaper, SelectedPaper, Author, generateCode, FullText };


// async function copytoselected() {
//     const excel = '/Users/wangshichao/Desktop/20231208.xlsx'
//     const arrs = await readExcelToObjectArray(excel)
//     for (const item of arrs) {
//         // console.log(item.DOI)
//         const rawpaper = await RawPaper.findOne({ DOI: item.DOI }).lean()
//         if (!rawpaper) {
//             continue
//         }
//         const selectedPaper = new SelectedPaper(rawpaper)
//         await selectedPaper.save()
//         console.log(rawpaper.DOI)
//     }
//     console.log('done')
// }
// copytoselected()


function generateCode(operatorCode) {
    // 获取当前时间
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    // 操作人员编码（假设已经有了）
    const operatorCodeStr = operatorCode.toString().padStart(2, '0');

    // 生成随机码（四位，由阿拉伯数字和英文字母组成）
    const randomCode = generateRandomCode(4);

    // 拼接编码
    const finalCode = `${year}${month}${day}${operatorCodeStr}${randomCode}`;

    return finalCode;
}

function generateRandomCode(length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters[randomIndex];
    }
    return randomCode;
}

