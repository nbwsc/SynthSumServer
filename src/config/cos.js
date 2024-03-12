const COS = require('cos-nodejs-sdk-v5');
const cos = new COS({
    SecretId: 'AKIDT8ez50R40lW22lvhQxz2rVu7hurQm76F',
    SecretKey: 'jEXfdLG7pRnunYeVu9H9mBa7RW1SBl7s',
});
const Bucket = 'xxxxpublic-1253739015';
const Region = 'ap-beijing';
module.exports = {
    cos,
    Bucket,
    Region,
    sliceUploadFile: async (filePath, key) => {
        return new Promise((resolve, reject) => {
            if (!filePath) {
                return reject('file path required');
            }
            cos.sliceUploadFile(
                {
                    Bucket,
                    Region,
                    Key: key,
                    FilePath: filePath,
                },
                function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                }
            );
        });
    },

    download: async (Key) => {
        return new Promise((resolve, reject) => {
            cos.getObject(
                {
                    Bucket,
                    Region,
                    Key,
                    Output: 'STRING_VALUE',
                },
                function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
    },
};
