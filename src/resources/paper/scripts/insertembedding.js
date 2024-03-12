require('../../../config/dbconnect')
const { Paper } = require('../model');
const VDB = require('../../utils/vector');
const { sleep } = require('../../../utils');

async function insertVDB() {
    let startCount = await Paper.count({ embedded: true })
    while (true) {
        const testPapers = await Paper.find({
            abstract: { $exists: true },
            deleted: { $ne: true },
            embedded: { $ne: true }
        }).limit(5);
        if (testPapers.length === 0) {
            return console.log('end')
        }
        console.log(startCount)
        for (let index = 0; index < testPapers.length; index++) {
            const paper = testPapers[index];
            const item = {
                id: startCount++ + '',
                mongoId: paper._id.toString(),
                text: combineAndLimitTextLength(paper.title, paper.abstract),
                title: paper.title
            }
            console.log(paper.title)
            await VDB.upsert('cat', 'papers', [item])
            paper.embedded = true;
            await paper.save()
            await sleep(2500)
        }
    }
}

function combineAndLimitTextLength(title, abstract, limit = 512) {
    let text = title + '\n' + abstract
    const len = text.length
    if (len > limit) {
        console.log('text over length', len)
        // text = title + tail abstract to 512
        text = title + '\n' + abstract.slice(abstract.length - limit + title.length + 1)
    }
    return text
}

setTimeout(async () => {
    await insertVDB()
}, 1999);