require('../../../config/dbconnect');
const { Paper, RawPaper } = require('../model');
const { translate } = require('../../../utils/tencentcloud');
const { sleep } = require('../../../utils');
const VDB = require('../../../utils/vector');

function stripHtmlXmlTags(inputString) {
  const strippedString = inputString.replace(/<\/?[^>]+(>|$)/g, '');
  return strippedString;
}

async function translatePaper() {
  const filter = {
    deleted: { $ne: true },
    title: { $exists: false },
    rawabstract: { $exists: true },
  };
  let papers = await Paper.find(filter).limit(10);
  while (papers.length) {
    // const restCount = await Paper.count(filter)
    // console.log(`rest ${restCount} papers`)
    for (let paper of papers) {
      console.log(paper.rawtitle);
      if (!paper.rawabstract) {
        paper.deleted = true;
        await paper.save();
        continue;
      }
      paper.title = await translate(paper.rawtitle);
      const strippedAbstract = stripHtmlXmlTags(paper.rawabstract);
      const abstracts = splitText(strippedAbstract);
      paper.abstract = '';
      for (let abstract of abstracts) {
        await sleep(500);
        paper.abstract += await translate(abstract);
      }
      await paper.save();
      await sleep(500);
    }
    papers = await Paper.find(filter).limit(10);
  }
}

function splitText(text) {
  text.replace(/<[^>]*>/g, '');
  const maxLen = 6000;
  let rest = text.slice();
  const result = [];
  while (rest.length > maxLen) {
    const endIndex = rest.slice(0, maxLen).lastIndexOf('.');
    result.push(rest.slice(0, endIndex));
    rest = rest.slice(endIndex);
  }
  result.push(rest);
  console.log(result.map((item) => item.length));
  return result;
}
translatePaper();

// translatePaperKeyword()

// const questions = ['维生素会导致过敏性皮炎吗?']

// async function testPaperCallback() {
//     const questions = `疫情情况下，人们更倾向于选择使用哪些化妆品？
// Pickering乳液技术可以使用在哪些化妆品中？
// 宗教和清真问题对化妆品提出了哪些要求？
// 使用化妆品对孕妇或者婴幼儿的风险会更高吗？
// 在亚洲国家中，哪些化妆品产品更受重视和欢迎？
// 怎么解决香水不易储存的问题？
// 清真化妆品的消费者需求？
// 化妆品中使用三氯生的安全评估
// 有哪些原料在化妆品中起美白功效？
// 有哪些动物实验替代方法？
// 益生菌是否有抗衰老作用？
// 益生菌作为化妆品成分能起什么作用？
// 孕妇使用化妆品有没有风险，风险是哪些？
// 化妆品中的海洋成分相对于其他成分有什么独特性和优势？
// 化妆品配方中有哪些值得关注的新型天然成分？
// 防晒化妆品中常见的风险成分？
// 可用于防晒化妆品的天然成分？
// 海藻的护肤作用有哪些？
// 穆斯林购买清真化妆品与宗教信仰有关吗？
// 有关清真化妆品的购买意愿的研究
// 迷迭香在化妆品中的应用中的安全性如何？
// 迷迭香是否会致敏？`.split('\n')
//     let txt = ''
//     for (const question of questions.slice()) {
//         txt += '问题：' + question + '\n找到的论文：\n'
//         const res = await VDB.query(question)
//         for (const r of res[0]) {
//             txt += '得分:' + r.score
//             txt += '\n'
//             txt += '文本：' + r.text
//             txt += '\n\n'

//         }
//         txt += '\n---------------------------------------------\n'

//     }
//     fs.writeFileSync('./QuestionCallBack.txt', txt)
// }

// testPaperCallback()
