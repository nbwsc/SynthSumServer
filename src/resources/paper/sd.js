const fs = require('fs')
const { sleep } = require('../../utils');
const { RawPaper } = require('./model')
require('../../config/dbconnect')
async function processTxt(path) {
    console.log(path)
    const data = fs.readFileSync(path, 'utf8');
    const items = data.split('\n\n')
    for (const itemtxt of items) {
        await txtToPaper(itemtxt)
    }
}

let existsCount = 0
let createCount = 0

async function txtToPaper(txt) {
    txt = txt.replace(/\r/g, '')
    const rows = txt.split('\n')
    const VolumeIndex = rows.findIndex(row => row.startsWith('Volume'))
    const IssnIndex = rows.findIndex(row => row.startsWith('ISSN'))
    const AbstractIndex = rows.findIndex(row => row.startsWith('Abstract'))
    const KeywordsIndex = rows.findIndex(row => row.startsWith('Keywords'))

    const rawdoiurl = rows[IssnIndex + 1]
    const doiurl = rawdoiurl.slice(0, -1)
    const DOI = doiurl.split('doi.org/')[1]
    const checkPaper = await RawPaper.findOne({ DOI })
    if (checkPaper) {
        console.log('paper exists', ++existsCount)
        return
    }
    const volume = VolumeIndex === -1 ? '' : rows[VolumeIndex].slice(0, -1)
    const year = rows[IssnIndex - 2].slice(0, -1)
    const pages = rows[IssnIndex - 1].slice(0, -1)
    const url = rows[IssnIndex + 2].slice(1, -1)

    const Abstract = AbstractIndex === -1 ? '' : rows.slice(AbstractIndex, KeywordsIndex).join(' ').replace('Abstract: ', '')
    const keywords = KeywordsIndex === -1 ? '' : rows[KeywordsIndex].replace('Keywords: ', '')

    const paper = new RawPaper({
        platform: "sd",
        Authors: rows[0],
        "Article Title": rows[1].slice(0, -1),
        "Source Title": rows[2].slice(0, -1),
        Volume: volume.split(',')[0]?.replace('Volume ', ''),
        Issue: volume.split(',')[1]?.replace('Issue ', ''),
        "Publication Year": year,
        'Start Page': pages,
        ISSN: rows[IssnIndex].split('ISSN ')[1].slice(0, -1),
        DOI,
        "DOI Link": doiurl,
        'Detail Link': url,
        Abstract,
        'Author Keywords': keywords,
    })
    await paper.save()
    console.log('create paper', ++createCount)
}


setTimeout(async () => {
    const txts = fs.readdirSync('./sd')
    for (const txt of txts) {
        await processTxt(`./sd/${txt}`)
    }
}, 5000);