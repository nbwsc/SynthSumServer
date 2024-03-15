const { Ollama } = require('ollama');
const ollama = new Ollama();

require('../../../config/dbconnect');
const { Paper } = require('../model');
const { sleep } = require('../../../utils');

async function chatWithOllama(prompt) {
  const response = await ollama.chat({
    model: 'qwen:14b',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.message.content;
}

async function summaryContent(abstract) {
  const res = await chatWithOllama(`用中文一句话总结以下文本:\n${abstract}`);
  return res;
}

function stripHtmlXmlTags(inputString) {
  const strippedString = inputString.replace(/<\/?[^>]+(>|$)/g, '');
  return strippedString;
}

async function summarypaper() {
  const filter = {
    deleted: { $ne: true },
    abstract: { $exists: true },
    takeaway: { $exists: false },
  };

  let papers = await Paper.find(filter).limit(10);
  while (papers.length) {
    // const restCount = await Paper.count(filter)
    // console.log(`rest ${restCount} papers`)
    for (let paper of papers) {
      console.log(paper.title);
      if (!paper.abstract) {
        paper.deleted = true;
        await paper.save();
        continue;
      }
      paper.takeaway = await summaryContent(paper.abstract);
      console.log(paper.takeaway);
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

summarypaper();

module.exports = {
  summaryContent,
};
