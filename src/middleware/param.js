const error = require('./error');

module.exports = (...params) => {
    for (const param of params) {
        if (typeof param === 'undefined') {
            return Promise.reject();
        }
    }

    return Promise.resolve();
};
