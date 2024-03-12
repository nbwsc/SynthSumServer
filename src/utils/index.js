const moment = require('moment');
const request = require('axios');
const _ = require('lodash');
const parseString = require('xml2js').parseString;
const fs = require('fs/promises');
const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);

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


function extractNumber(str) {
    if (!str) {
        return '-'
    }
    let multiplier = 1;
    if (str.includes('千')) {
        multiplier = 1000;
    } else if (str.includes('万')) {
        multiplier = 10000;
    }

    // 使用正则表达式提取数字
    const match = str.match(/\d+(\.\d+)?/);
    if (!match) return 0;

    return parseFloat(match[0]) * multiplier;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function ensureDir(dirPath) {
    const options = { recursive: true, mode: 0o755 };
    if (process.platform === 'win32') {
        delete options.mode;
    }
    await fs.mkdir(dirPath, options);
};
/**
 * 执行命令方法
 * @method exeCommand （执行命令方法）
 * @param {string} command 命令语句
 * @param {object} para 参数
 */
async function exeCommand(command, para = null) {
    return new Promise((resolve, reject) => {
        console.log(`exeCommand: ${command}, param = ${para}`);
        exec(command, para, (err, stdout, stderr) => {
            // console.log(err,',',stdout,',',stderr);
            if (err) {
                console.error(`exeCommand Error:${err}`);
                if (stdout) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            } else {
                resolve(stdout);
            }
        });
    });
}
/**
 * 下载文件
 * @param {*} data {download:url,phaseDocuMent,md5}
 * @returns 
 */
async function downloadRequestPromise(data, task_id, id) {
    return new Promise(async (resolve, reject) => {
        try {

            // let baseName = path.basename(data.title.indexOf('.') > -1? data.title:data.href).trim();
            let baseName = path.basename(decodeURIComponent(data.href)).trim()
            // if(baseName.length > 50) {
            //     baseName = baseName.slice(-48)
            // }
            if (baseName.length > 15) {
                baseName = baseName.slice(-15)
            }
            // 目录结构 download/任务id/任务项id/文件名
            let dirname = path.join(__dirname, '..', '..', 'download', 'attachment', id);
            await ensureDir(dirname);
            let filename = path.join(dirname, baseName);
            // exeCommand(`curl --connect-timeout 60 --max-time 36000 --limit-rate 20m -o ${filename} "${data.href}"`)
            //  exeCommand(`curl -C - --connect-timeout 60 --max-time 36000 --limit-rate 20m -o ${filename} "${data.archive_path}"`)
            //  .then(async (r) => {
            //     resolve({...data, pathname: filename});
            //  })
            exeCommand(`curl -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36" --insecure --connect-timeout 60 --max-time 36000 --limit-rate 20m "${data.href}" -L -o ${filename}`).catch(() => {
            }).then(async (r) => {
                resolve({ ...data, pathname: filename });
            })

            // let readStream = createWriteStream(filename);
            // requestDefault(data.href, (error, response) => {
            //   if (error) reject(error);
            //   if(response && response.body) {
            //     try{
            //       let res = JSON.parse(response.body);
            //       if(res.code == 0) {
            //         reject(res.message);
            //       }
            //     } catch (e) {
            //     }
            //   } else {
            //     reject('data error');
            //   }
            // }).on('error', function(err) {
            //     console.error(err);
            //   reject(err);
            // }).pipe(readStream).on("close",function(err){
            //   if(err) {
            //     reject(err);
            //   }
            //   resolve({...data, pathname: filename});
            // })
        } catch (err) {
            console.error('download error :', err);
            reject(err);
        }

    });
}
module.exports = {
    isTodayWorkday,
    parseTime,
    parseXML,
    trimName,
    affix,
    diffObject,
    extractNumber,
    sleep,
    ensureDir,
    exeCommand,
    downloadRequestPromise
};

// a = { a: 1, b: { aa: 1 } };
// b = { a: 1, b: { aa: 2 }, c: 1 };
// console.log(diffObject(b, a));
