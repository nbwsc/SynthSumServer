const VDB = require('../../utils/vector');
require('../../../config/dbconnect');
const {
  checkRelation,
  answerWithInfo,
  summary,
  getPaperStudyInfo,
} = require('../../../utils/minimax');
const { RawPaper, Paper } = require('../model');

async function main() {
  const questions = `
紧凑型神经回路策略是什么？
深度强化学习网络切片是什么？
如何驯服你的预期算法？
最新化妆品原料的安全评估有哪些
穆斯林购买清真化妆品与宗教信仰有关吗？
益生菌是否有抗衰老作用？
迷迭香是否会致敏？

疫情情况下，人们更倾向于选择使用哪些化妆品？
Pickering乳液技术可以使用在哪些化妆品中？
宗教和清真问题对化妆品提出了哪些要求？
使用化妆品对孕妇或者婴幼儿的风险会更高吗？
在亚洲国家中，哪些化妆品产品更受重视和欢迎？
怎么解决香水不易储存的问题？
清真化妆品的消费者需求？
化妆品中使用三氯生的安全评估
有哪些原料在化妆品中起美白功效？
有哪些动物实验替代方法？
益生菌作为化妆品成分能起什么作用？
孕妇使用化妆品有没有风险，风险是哪些？
化妆品中的海洋成分相对于其他成分有什么独特性和优势？
化妆品配方中有哪些值得关注的新型天然成分？
防晒化妆品中常见的风险成分？
可用于防晒化妆品的天然成分？
海藻的护肤作用有哪些？
有关清真化妆品的购买意愿的研究
迷迭香在化妆品中的应用中的安全性如何？
`.split('\n');
  for (const question of questions.slice(1, 3)) {
    console.log('## 问题：', question);
    await processQuestion(question);
  }
}

async function processQuestion(question) {
  const results = await VDB.query('cat', 'papers', question, 20);
  let count = [0, 0, 0, 0]; // 低相关，是，否，不确定
  for (const vector of results) {
    console.log('\n===========《' + vector.title + '》==============');
    const relation = await checkRelation(vector.text, question);
    console.log('## 相关度：', relation);
    const p = await Paper.findById(vector.mongoId);
    if (!p) {
      continue;
    }
    const text = p.title + '\n' + p.abstract;
    console.log('## 论文DOI：', p.DOI);
    console.log('## 论文year：', p.year);
    console.log('## 论文引用次数：', p.referenceCount);
    console.log('## 期刊：', p.journalname);
    if (relation.includes('低')) {
      count[0]++;
      console.log('## 相关度： 低相关（舍弃）');
      console.log(vector.text);
      continue;
    }
    // const summarytxt = await summary(vector.text)
    // console.log('\n## key takeaway：', summarytxt)

    // const studyInfo = await getPaperStudyInfo(vector.text)
    // console.log('\n## 研究方法：', studyInfo)

    // const answer = await answerWithInfo(vector.text, question)
    // console.log('\n## 答案：', answer)
    const llmResults = await queryLLM(text, question);
    console.log('\n## key takeaway：', llmResults[0]);
    console.log('\n## 研究方法：', llmResults[1]);
    console.log('\n## 答案：', llmResults[2]);
    if (llmResults[2].includes('是')) {
      count[1]++;
    } else if (llmResults[2].includes('否')) {
      count[2]++;
    } else {
      count[3]++;
    }
  }
  const summary = `## 结果：\n总共${results.length}篇论文，其中低相关${count[0]}篇，"是"${count[1]}篇，"否"${count[2]}篇，"不确定"${count[3]}篇`;
  console.log(summary);
}

async function queryLLM(text, question) {
  const tasks = [summary(text), getPaperStudyInfo(text), answerWithInfo(text, question)];
  const results = await Promise.all(tasks);
  return results;
}

async function testQuery() {
  // const results = await VDB.query(['迷迭香', '过敏'], 20)
  // console.log(results)
}
const fs = require('fs');

async function exportCSV() {
  const limit = 100;
  for (let page = 0; ; page++) {
    console.log(page);
    const papers = await RawPaper.find({
      platform: 'sd',
      uploadedAt: '2023-11-30',
      cnAbstract: { $exists: true },
      deleted: { $ne: true },
    })
      .skip(page * limit)
      .limit(limit);
    for (const paper of papers) {
      if (paper.Abstract.startsWith('Abstract')) {
        paper.Abstract = paper.Abstract.slice(10);
        if (paper.cnAbstract.includes('摘要：')) {
          paper.cnAbstract = paper.cnAbstract.split('摘要：')[1];
        }
        await paper.save();
      }
      fs.appendFileSync(
        'sd.csv',
        `${paper.DOI},${fixCSVText(paper['Article Title'])},${fixCSVText(
          paper['cnTitle']
        )},${fixCSVText(paper.Abstract)},${fixCSVText(paper.cnAbstract)}\n`
      );
    }
    // fs.appendFileSync('sd.csv', papers.map(p => `${p.DOI},${fixCSVText(p['Article Title'])},${fixCSVText(p['cnTitle'])},${fixCSVText(p.Abstract)},${fixCSVText(p.cnAbstract)}`).join('\n'))
    if (papers.length < limit) {
      break;
    }
  }
  console.log('done');
}

function fixCSVText(txt) {
  return '"' + txt.replace(/[,\n\"]/g, '，') + '"';
}

setTimeout(async () => {
  // fs.writeFileSync('papers.csv', 'DOI,rawtitle,title,rawabstract,abstract\n')
  // exportCSV()
  main();
}, 2000);
