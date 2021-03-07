const redis = require('redis');
const { promisify } = require('util');
const logger = require('./logger');

const cache = redis.createClient({ host: process.env.CACHE_DOMAIN||"localhost" });
cache.on('error', (err) => {
  logger.error(err);
});
const set = promisify(cache.set).bind(cache);
const del = promisify(cache.del).bind(cache);
const get = promisify(cache.get).bind(cache);
const sadd =promisify(cache.sadd).bind(cache);
const srem =promisify(cache.srem).bind(cache);
const publish =promisify(cache.publish).bind(cache);

module.exports = {
  set,
  del,
  get,
  sadd,
  srem,
  publish
};

// async function test(){
//   await cache.sadd("OnlineServer","192.168.0.1")
//   await cache.sadd("OnlineServer","192.168.0.2")
//   console.log("add finished")
// }

// test();
  
