const request = require('axios')
const APIKEY = 'OLEzVyWfEy3QAtUlnNgIQ75uwg3QPjFi9wYYu9cT'
const { writeFileSync, readdirSync, readFileSync } = require('fs')
const { sleep } = require('../../../utils')
let token = 'PCOKWVSKJJGM4TWNJNI3EUSQJIWVNUSRKBFEYK2JFUBHFI4VBRGA2TGN2PJCYTATBVGEZTBMZUJA2LGMCPGUYDMMJQWY2DENFQGJETEMSNJ5FEWNSRRGWAOY2QJXG'
const { translate } = require('../../utils/tencentcloud');
const { Paper } = require('../model');
require('../../../config/dbconnect')

async function query(keyword) {
    const url = `https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=${keyword}&fields=externalIds,paperId,title,openAccessPdf,abstract,authors,journal,year,referenceCount&offset=0&limit=1000&year=2018-&token=${token}`
    const res = await request({
        url,
        method: 'GET',
        headers: {
            "'X-API-KEY'": APIKEY
        }
    })
    return res.data
}

async function getRecomanndPaper() {
    const url = `https://api.semanticscholar.org/recommendations/v1/papers/`
    const res = await request({
        url,
        method: 'POST',
        data: {
            "positivePaperIds": [
                "649def34f8be52c8b66281af98ae884c09aef38b"
            ],
            "negativePaperIds": [
                "ArXiv:1805.02262"
            ]
        },
        headers: {
            "'X-API-KEY'": APIKEY
        }
    })
    return res.data
}

function splitText(text) {
    const maxLen = 6000;
    let rest = text.slice();
    const result = []
    while (rest.length > maxLen) {
        const endIndex = rest.slice(0, maxLen).lastIndexOf('.')
        result.push(rest.slice(0, endIndex))
        rest = rest.slice(endIndex)
    }
    result.push(rest)
    return result
}

// algorithm_74.json
async function main() {
    const keyword = 'muscle'
    for (let index = 1; ; index++) {
        console.log(index)
        const res = await query(keyword)
        writeFileSync(`./semantic/${keyword}_${index}.json`, JSON.stringify(res))
        await savejson(res, keyword)
        if (!res.token || (res.total / 1000) < index) {
            break
        }
        await sleep(2000)
        token = res.token
    }
    console.log('done', keyword)
}

setTimeout(() => {
    // main()
    // getRecomanndPaper().then(console.log)
    // listjson('./semantic/', 'economy')
}, 2000);

async function listjson(path, keyword) {
    const files = readdirSync(path)
    let count = [0, 0]
    const lastjson = 'economy_13.json'
    const lastindex = files.indexOf(lastjson)
    for (const file of files.slice(lastindex)) {
        if (keyword && !file.match(keyword)) {
            continue
        }
        const searchKeyword = file.split('_')[0]
        console.log(file)
        const json = JSON.parse(readFileSync(path + file))
        await savejson(json, searchKeyword)
    }
}

async function savejson(json, searchKeyword) {
    for (const item of json.data) {
        const checkpaper = await Paper.findOne({ rawtitle: item.title })
        if (checkpaper) {
            console.log('exist paper')
            continue

            // checkpaper.DOI = item.externalIds.DOI
            // checkpaper.paperId = item.paperId
            // checkpaper.year = item.year
            // checkpaper.referenceCount = item.referenceCount
            // if (item.openAccessPdf) {
            //     checkpaper.openAccessPdf = item.openAccessPdf.url
            // }
            // await checkpaper.save()
        } else {
            console.log('new paper', item.title)
            const npaper = new Paper({
                searchKeyword,
                platform: 'semanticscholar',

                rawtitle: item.title,
                authors: item.authors.map(a => a.name),
                rawabstract: item.abstract,
                url: item.openAccessPdf?.url,
                "journalname": item.journal?.name,
                "journalvolume": item.journal?.volume,

                DOI: item.externalIds.DOI,
                "paperId": item.paperId,
                "year": item.year,
                "referenceCount": item.referenceCount,
                "openAccessPdf": item.openAccessPdf?.url,
            })
            // npaper.title = await translate(npaper.rawtitle)
            // const abstracts = splitText(npaper.rawabstract)
            // npaper.abstract = ''
            // for (let abstract of abstracts) {
            //     await sleep(200)
            //     npaper.abstract += await translate(abstract)
            // }
            // await sleep(500)
            await npaper.save()
        }
    }
}