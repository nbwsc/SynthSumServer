const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const dbname = 'DataCollection';

const ip = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '159.75.225.142';

const port = '27027';

const username = 'wsc';

const pwd = 'wsc19920421';

(async () => {
    const options = {
        useMongoClient: true,
    };
    await mongoose.connect(
        `mongodb://${username}:${pwd}@${ip}:${port}/${dbname}?authSource=admin`,
        options
    );
    mongoose.connection.db.on('error', (error) => {
        console.log(`i catch you ! ${error}`);
    });
    mongoose.connection.db.on('reconnect', (ref) => {
        console.log('reconnect to mongo server.');
    });
})();

console.log('db connected');
