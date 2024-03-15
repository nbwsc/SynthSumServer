const mongoose = require('mongoose');
const { readExcelToObjectArray } = require('../../utils/excel');

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
    journalname: String,
    journalvolume: String,

    DOI: String, //externalIds.DOI
    paperId: String,
    year: Number,
    referenceCount: Number,
    openAccessPdf: String,

    deleted: Boolean,
    embedded: Boolean,
    takeaway: String, // createdBy AI
  })
);

const FullText = mongoose.model('FullText', {
  doi: { type: String, unique: true },
  fulltext: String,
});

module.exports = { Paper, FullText };

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
