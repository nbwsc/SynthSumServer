// Production config
module.exports = {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 2222,
    logType: 'combined',
};
