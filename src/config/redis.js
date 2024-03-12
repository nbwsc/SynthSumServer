const redis = require('redis');

const client = redis.createClient(6379, '127.0.0.1');
(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
})();
module.exports = client;
