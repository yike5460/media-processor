const AWS = require("aws-sdk");
const logger=require("./logger");

const region = process.env.AWS_REGION || "cn-northwest-1";
const s3 = new AWS.S3({ region:region });

var functions = {};
functions.putObject = (params) => {
  //  console.log("s3.putObject");
 // console.log(JSON.stringify(params, null, 2));
  return s3.putObject(params, function (copyErr, copyData) {
    if (copyErr) {
     // console.log(copyErr);
    }
    else {
      logger.log('Copied: ', params.Key);
    }
  }).promise();
};

module.exports = functions;
