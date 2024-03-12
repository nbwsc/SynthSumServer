const ExcelJS = require('exceljs');

async function readExcelToArray(path) {
    var workbook = new ExcelJS.Workbook();
    return new Promise((resolve, reject) => {
        workbook.xlsx.readFile(path)
            .then(function () {
                var worksheet = workbook.getWorksheet(1);
                var rows = [];
                worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                    rows.push(row.values);
                });
                resolve(rows);
            }).catch(err => {
                reject(err)
            });
    })
}

async function readExcelToObjectArray(path) {
    var workbook = new ExcelJS.Workbook();
    return new Promise((resolve, reject) => {
        workbook.xlsx.readFile(path)
            .then(function () {
                var worksheet = workbook.getWorksheet(1);
                var rows = [];
                // row 0 is header
                const header = worksheet.getRow(1).values
                worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                    const values = {}
                    header.forEach((key, index) => {
                        values[key] = row.values[index]
                    })
                    rows.push(values);
                });
                resolve(rows);
            }).catch(err => {
                reject(err)
            });
    })
}


module.exports = {
    readExcelToArray,
    readExcelToObjectArray
}