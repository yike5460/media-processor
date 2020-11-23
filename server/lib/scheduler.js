var AWS = require('aws-sdk');
var logger=require('./logger');
const region = process.env.AWS_REGION || "cn-northwest-1";
const ECS = new AWS.ECS({ region:region });
const dynamo = new AWS.DynamoDB.DocumentClient({ region:region });
const TABLE_NAME = process.env.TABLE_NAME || "video-streaming";
var segmentTime = process.env.SEGMENT_TIME || "30";
var segmentFormat = process.env.SEMMENT_FORMAT || "video";
const bucketName = process.env.ASSETS_BUCKET || "video-streaming-assets-assetsbucket-1kf2tlxbhy4qz";
var logLevel = process.env.LOG_LEVEL || "info";


var transCoding = process.env.TRANSCODING || "copy";
var sizing = process.env.SIZING || "default";
//
var ecs_Type = process.env.ECS_TYPE || "fargate";
const clusterName = process.env.ECS_CLUSTER_NAME || 'video-streaming';
const taskName = process.env.ECS_TASK_NAME || 'video-streaming-processor:1'
const containerName = process.env.ECS_CONTAINER_NAME || 'video-streaming-processor';
var metaData;

const invokeTask = async(event,callback) => {
    return new Promise(async(resolve, reject) => {
        try {
           // logger.log("-----event----" + JSON.stringify(event));
            var deviceURL;
            var deviceUUID;
            if (event.eventName == "start") {
                deviceURL = event.url; //get media url
                deviceUUID = event.id;
                metaData =event.metaData;
               // logger.log(event.eventName);
                logger.log('Run task with deviceURL:' + deviceURL + "  DeviceUUID:" + deviceUUID);
                //run ecs task
                await ECS.runTask(getECSParam(deviceURL, deviceUUID)).promise().then(function(data) {
                    var item = new Object();
                    item.UUID = deviceUUID;
                    item.URL = deviceURL;
                    item.taskARN = data.tasks[0].taskArn;
                    //save task info into dynamodb
                    return saveItem(item).then(response => {
                        logger.log("saveItem into dynamodb success" + response);
                    }, (reject) => {
                        logger.log("saveItem into dynamodb error" +reject);
                    });
                }).catch(function(error) {
                    logger.log("starting task error:" +error);
                });
            }
            if (event.eventName == "stop") {
                deviceURL = event.url; //get media url 
                deviceUUID = event.id;
              //  logger.log(event.url);
                await getItem(deviceUUID, callback).then(function(item) {
                    if (typeof(item) != 'undefined') {
                        logger.log("stop task with:" + JSON.stringify(item));
                        var params = {
                            task: item.taskARN,
                            cluster: clusterName,
                            reason: 'stop recording'
                        };
                        return ECS.stopTask(params).promise();
                    }
                }).then(function(data) {
                    logger.log("delete db record success:" + deviceUUID);
                    return deleteItem(deviceUUID);
                }).catch(function(error, data) {
                    logger.log("delete task error:" + error);
                    return deleteItem(deviceUUID);
                });
            }

        }
        catch (error) {
        logger.log("execute error:" + error);
        }

    });
};

function getECSParam(deviceURL, deviceUUID) {
    if (ecs_Type == "fargate")
        return getFargateParams(deviceURL, deviceUUID);
    else
        return getEC2Params(deviceURL, deviceUUID);
}

function getEC2Params(deviceURL, deviceUUID) {
    return {
        cluster: clusterName,
        taskDefinition: taskName,
        overrides: {
            containerOverrides: [{
                name: containerName,
                environment: [
                    { name: "BUCKET_NAME", "value": bucketName },
                    { name: "CAMERA_NAME", "value": deviceUUID },
                    { name: "INPUT_URL", "value": deviceURL },
                    { name: "SEGMENT_FORMAT", "value": segmentFormat },
                    { name: "LOGLEVEL", "value": logLevel },
                    { name: "REGION", "value": region },
                    { name: "TRANSCODING", "value": transCoding },
                    { name: "SIZING", "value": sizing },
                    { name: "SEGMENT_TIME", "value": segmentTime },
                    { name: "CHANNEL", "value": metaData.channel },
                    { name: "IS_FLV", "value": metaData.isFlv },
                    { name: "IS_HLS", "value": metaData.isHls },
                    { name: "IS_VIDEO", "value": metaData.isVideo },
                    { name: "IS_IMAGE", "value": metaData.isImage },
                    { name: "IS_MOTION", "value": metaData.isMotion },
                    { name: "IS_ONDEMAND", "value": metaData.isOnDemand },
                    { name: "VIDEO_TIME", "value": metaData.video_time },
                    { name: "IMAGE_TIME", "value": metaData.image_time },
                    { name: "HLS_TIME", "value": metaData.hls_time },
                    { name: "HLS_LIST_SIZE", "value": metaData.hls_list_size }
                ]
            }]
        },
        count: 1,
        launchType: "EC2",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: [process.env.SUBNET_ID1 || 'subnet-0c501e7112e0d94f9',
                    process.env.SUBNET_ID2 || 'subnet-03799a358aa837963'
                ],
                assignPublicIp: "DISABLED",
                securityGroups: [
                    process.env.SECURITY_GROUP || 'sg-0012e02d07ded4562' ,//security group
                ]
            }
        },
    };
}


function getFargateParams(deviceURL, deviceUUID) {
    return {
        cluster: clusterName,
        taskDefinition: taskName,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: [process.env.SUBNET_ID1 || 'subnet-0c501e7112e0d94f9',
                    process.env.SUBNET_ID2 || 'subnet-03799a358aa837963'
                ],
                assignPublicIp: "ENABLED",
                securityGroups: [
                    process.env.SECURITY_GROUP || 'sg-0012e02d07ded4562' ,//security group
                ]
            }
        },
        overrides: {
            containerOverrides: [{
                name: containerName,
                environment: [
                    { name: "BUCKET_NAME", "value": bucketName },
                    { name: "CAMERA_NAME", "value": deviceUUID },
                    { name: "INPUT_URL", "value": deviceURL },
                    { name: "SEGMENT_FORMAT", "value": segmentFormat },
                    { name: "LOGLEVEL", "value": logLevel },
                    { name: "REGION", "value": region },
                    { name: "TRANSCODING", "value": transCoding },
                    { name: "SIZING", "value": sizing },
                    { name: "SEGMENT_TIME", "value": segmentTime },
                    { name: "CHANNEL", "value": metaData.channel },
                    { name: "IS_FLV", "value": metaData.isFlv },
                    { name: "IS_HLS", "value": metaData.isHls },
                    { name: "IS_VIDEO", "value": metaData.isVideo },
                    { name: "IS_IMAGE", "value": metaData.isImage },
                    { name: "IS_MOTION", "value": metaData.isMotion },
                    { name: "IS_ONDEMAND", "value": metaData.isOnDemand },
                    { name: "VIDEO_TIME", "value": metaData.video_time },
                    { name: "IMAGE_TIME", "value": metaData.image_time },
                    { name: "HLS_TIME", "value": metaData.hls_time },
                    { name: "HLS_LIST_SIZE", "value": metaData.hls_list_size }
                ]
            }]
        },
        count: 1,
        launchType: "FARGATE",
        platformVersion: '1.4.0'
    };
}


const getParam = param => {
    return new Promise((res, rej) => {
        parameterStore.getParameter({
            Name: param
        }, (err, data) => {
            if (err) {
                return rej(err);
            }
            return res(data);
        });
    });
};

function saveItem(item) {
    const params = {
        TableName: TABLE_NAME,
        Item: item
    };

    return dynamo
        .put(params)
        .promise()
        .then((result) => {
            return item;
        }, (error) => {
            return error;
        });
}

function getItem(itemId) {
    const params = {
        Key: {
            UUID: itemId
        },
        TableName: TABLE_NAME
    };

    return dynamo
        .get(params)
        .promise()
        .then((result) => {
            return result.Item;
        }, (error) => {
            return error;
        });
}

function deleteItem(itemId) {
    const params = {
        Key: {
            UUID: itemId
        },
        TableName: TABLE_NAME
    };
    return dynamo.delete(params).promise();
}

module.exports = {
    invokeTask
  };
