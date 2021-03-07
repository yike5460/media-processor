const redis = require('redis');
const { promisify } = require('util');
const NodeCache = require("node-cache");
const _ = require('lodash');
var async = require('async')
const { exec } = require('child_process');


// Configure server cache.
const subscriber = redis.createClient({ host: process.env.CACHE_DOMAIN || "localhost" });
const client = redis.createClient({ host: process.env.CACHE_DOMAIN || "localhost" });
const serverGet = promisify(client.get).bind(client);
const smembers = promisify(client.smembers).bind(client);

try {
  subscriber.subscribe("OnlineStatus", function (e) {
    console.log('subscribe channel: OnlineStatus');
  });
}
catch (e) {
  console.log(e);
}
subscriber.on('error', (err) => {
  console.error(err);
});

subscriber.on("message", function (channel, res) {
  try {
    console.log("---genterate nginx template")
    exec('/bin/bash /reload-nginx.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`generate nginx template error: ${error}`);
        return;
      }
      console.log(`${stdout}`);
      console.log(`${stderr}`);
    });
  }
  catch (e) {
    console.error(` generate nginx template error: ${e}`);
  }

});



// Configure local cache.
const localCache = new NodeCache();

//
// Read from local cache first.  Then try server cache and update local cache.
//
const get = async (key) => {
  let value = localCache.get(key);
  if (_.isNil(value)) {
    value = await smembers(key);
    if (!_.isNil(value)) {
      localCache.set(key, value, 1);
    }
  }
  return value;
};

const getServers = async () => {
  let value = await smembers("OnlineServer");
  if (!_.isNil(value)) {
    return value;
  }
  return [];
};





// async function test() {
//   console.log('begin test')
//   const value = await get("OnlineServer");
//   console.log(value);
// }

// test();

module.exports = {
  get,
  getServers
};
