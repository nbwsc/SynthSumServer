const moment = require('moment');
const request = require('axios');
const os = require('os');
const _ = require('lodash');
const parseString = require('xml2js').parseString;

async function isTodayWorkday() {
    const now = moment().format('YYYY-MM-DD');
    try {
        const res = await request(`http://timor.tech/api/holiday/info/${now}`);
        return res && res.data && res.data.type && res.data.type.type === 0;
    } catch (error) {
        return true;
    }
}

function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null;
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
    let date;
    if (typeof time === 'object') {
        date = time;
    } else {
        if (('' + time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time);
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay(),
    };
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
            return ['日', '一', '二', '三', '四', '五', '六'][value];
        }
        if (result.length > 0 && value < 10) {
            value = '0' + value;
        }
        return value || 0;
    });
    return time_str;
}

function parseXML(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

const affix = ['资本', '基金', '中国'];

function trimName(name) {
    if (!name) {
        return '';
    }
    for (const a of affix) {
        name = name.replace(a, '');
    }
    return name;
}

function diffObject(object, base) {
    function changes(object, base) {
        return _.transform(object, function (result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = value;
            }
        });
    }
    return changes(object, base);
}

function getDataPath() {
    return `${process.env.NODE_ENV === 'local' ? os.homedir() : ''}/data`;
}
module.exports = {
    isTodayWorkday,
    parseTime,
    parseXML,
    trimName,
    affix,
    diffObject,
    getDataPath,
};

// a = { a: 1, b: { aa: 1 } };
// b = { a: 1, b: { aa: 2 }, c: 1 };
// console.log(diffObject(b, a));
