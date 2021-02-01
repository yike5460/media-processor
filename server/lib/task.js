var AWS = require('aws-sdk');
var logger = require('./logger');
const _ = require('lodash');
const sd = require('silly-datetime');

const region = process.env.AWS_REGION || "cn-northwest-1";
const ECS = new AWS.ECS({
    region: region
});
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: region
});
const TABLE_NAME = process.env.TABLE_NAME || "video-streaming";
var segmentTime = process.env.SEGMENT_TIME || "30";
var segmentFormat = process.env.SEMMENT_FORMAT || "video";
const bucketName = process.env.ASSETS_BUCKET || "video-streaming-assets-assetsbucket-1kf2tlxbhy4qz";
var logLevel = process.env.LOG_LEVEL || "warning";

var transCoding = process.env.TRANSCODING || "copy";
var sizing = process.env.SIZING || "default";
//
var ecs_Type = process.env.ECS_TYPE || "fargate";
const clusterName = process.env.ECS_CLUSTER_NAME || 'video-streaming';
const taskName = process.env.ECS_TASK_NAME || 'video-streaming-processor'
const containerName = process.env.ECS_CONTAINER_NAME || 'video-streaming-processor';
const taskNumber = 1;

const invokeTask = async (event, callback) => {
    // return new Promise(async (resolve, reject) => {

    if (event.eventName == "start") {
        await startTasks(event)
    }
    if (event.eventName == "stop") {
        await stopTasks(event);
    }
    // });
}

const startTasks = async (event) => {
    try {
        const inputUrl = event.url; //get media url
        const streamChannel = event.id;
        logger.log('Run task with stream URL:' + inputUrl + "  stream channel:" + streamChannel);
        //run ecs task
        const data = await ECS.runTask(getECSParam(event)).promise();
        const arns = _.map(data.tasks, (task) => {
            return task.taskArn;
        });
        // data.tasks.forEach(task => {
        //     arns.push(task.taskArn);
        // });
        const taskItem = await getItem(streamChannel);
        if (typeof (taskItem) != 'undefined') {
            logger.log("get task with:" + JSON.stringify(taskItem));
            await taskItem.taskARN.forEach(taskarn => {
                arns.push(taskarn);
            })   
        }
        var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
        var item = new Object();
        item.startTime = time;
        item.UUID = streamChannel;
        item.URL = inputUrl;
        item.Streamkey = event.metaData.key;
        item.Name = event.metaData.videoname;
        item.isFlv = event.metaData.isFlv || false;
        item.isHls = event.metaData.isHls || false;
        item.isCMAF = event.metaData.isCMAF || false;
        item.isImage = event.metaData.isImage || false;
        item.isOnDemand = event.metaData.isOnDemand || false;
        item.isVideo = event.metaData.isVideo || false;
        item.ServerAddress = event.address;
        item.isCluster = event.isCluster;
        item.taskARN = arns;
        await saveItem(item).then(response => {
            logger.log("saveItem into dynamodb success" + JSON.stringify(response));
        }, (reject) => {
            logger.log("saveItem into dynamodb error" + reject);
        });
    } catch (error) {
        logger.log("start task error:" + error);
    }
}

const stopTasks = async (event) => {
    try {
        const streamChannel = event.id;
        const item = await getItem(streamChannel);
        if (typeof (item) != 'undefined') {
            logger.log("stop task with:" + JSON.stringify(item));
            await item.taskARN.forEach(taskarn => {
                const params = {
                    task: taskarn,
                    cluster: clusterName,
                    reason: 'stop recording'
                };
                ECS.stopTask(params).promise();
            });
            await deleteItem(streamChannel);
            logger.log("delete db record success:" + streamChannel);
        }
    } catch (error) {
        logger.log("execute stop task error:" + error);
    }
}

function getECSParam(event) {

    if (ecs_Type == "fargate")
        return getFargateParams(event);
    else
        return getEC2Params(event);
}

function getEC2Params(event) {
    const metaData = event.metaData;
    const task_num =parseInt(metaData.clusterNumber || taskNumber);
    return {
        cluster: clusterName,
        taskDefinition: taskName,
        // placementConstraints: [
        //     {
        //       expression: 'STRING_VALUE',
        //       type: distinctInstance | memberOf
        //     },
        //     /* more items */
        //   ],
        placementStrategy: [
            {
                "type": "random"
            },
        ],
        overrides: {
            containerOverrides: [{
                name: containerName,
                environment: getEnv(event)
            }],
            cpu: (event.isMaster==='true')?String(metaData.cpu || "2048"):String(metaData.slave_cpu || "512"),
            memory: (event.isMaster==='true')?String(metaData.memory || "4GB"):String(metaData.slave_memory || "1024")
        },
        count: (event.isMaster==='true') ? 1 : task_num,
        launchType: "EC2",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: [process.env.SUBNET_ID1 || 'subnet-0c501e7112e0d94f9',
                process.env.SUBNET_ID2 || 'subnet-03799a358aa837963'
                ],
                assignPublicIp: "DISABLED",
                securityGroups: [
                    process.env.SECURITY_GROUP || 'sg-0012e02d07ded4562', //security group
                ]
            }
        },
    };
}


function getFargateParams(event) {
    const metaData = event.metaData;
    const task_num = parseInt(metaData.clusterNumber || taskNumber);
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
                    process.env.SECURITY_GROUP || 'sg-0012e02d07ded4562', //security group
                ]
            }
        },
        overrides: {
            containerOverrides: [{
                name: containerName,
                environment: getEnv(event)
            }],
            cpu: (event.isMaster==='true')?String(metaData.cpu || "2048"):String(metaData.slave_cpu || "512"),
            memory: (event.isMaster==='true')?String(metaData.memory || "4GB"):String(metaData.slave_memory || "1024")
        },
        count: (event.isMaster==='true') ? 1 : task_num,
        launchType: "FARGATE",
        platformVersion: '1.4.0'
    };
}

function getEnv(event) {
    const metaData = event.metaData;
    return [
        { name: "INPUT_URL", "value": event.url },
        { name: "ADDRESS", "value": event.address },
        { name: "SEGMENT_FORMAT", "value": segmentFormat },
        { name: "LOG_LEVEL", "value": metaData.logLevel || 'warning' },
        { name: "REGION", "value": region },
        { name: "TRANSCODING", "value": transCoding },
        { name: "SIZING", "value": sizing },
        { name: "SEGMENT_TIME", "value": segmentTime },
        { name: "CHANNEL_NAME", "value": event.id },
        { name: "IS_MASTER", "value": String(event.isMaster || 'true') },
        { name: "IS_CLUSTER", "value": String(event.isCluster || 'false') },
        { name: "IS_FLV", "value": String(metaData.isFlv || 'false') },
        { name: "IS_HLS", "value": String(metaData.isHls || 'false') },
        { name: "IS_VIDEO", "value": String(metaData.isVideo || 'false') },
        { name: "IS_IMAGE", "value": String(metaData.isImage || 'false') },
        { name: "IS_MOTION", "value": String(metaData.isMotion || 'false') },
        { name: "IS_ONDEMAND", "value": String(metaData.isOnDemand || 'false') },
        { name: "IS_CMAF", "value": String(metaData.isCMAF || 'false') },
        { name: "VIDEO_TIME", "value": String(metaData.video_time || "30") },
        { name: "IMAGE_TIME", "value": String(metaData.image_time || "10") },
        { name: "HLS_TIME", "value": String(metaData.hls_time || "2") },
        { name: "HLS_LIST_SIZE", "value": String(metaData.hls_list_size || "6") },
        //motion detect
        { name: "MOTION_DURATION", "value": String(metaData.motion_duration || "5000") },
        { name: "MOTION_PERCENT", "value": String(metaData.motion_percent || "30") },
        { name: "MOTION_TIMEOUT", "value": String(metaData.motion_timeout || "60") },
        { name: "MOTION_DIFF", "value": String(metaData.motion_diff || "10") },
        //ondemand video
        { name: "ONDEMAND_LIST_SIZE", "value": String(metaData.ondemand_list_size || "1") },
        { name: "ONDEMAND_TIME", "value": String(metaData.ondemand_time || "60") },

        //water mark env
        { name: "IS_WATERMARK", "value": String(metaData.isWaterMark || "false") },
        { name: "WATERMARK_TEXT", "value": String(metaData.WaterMarkText || "test") },
        { name: "WATERMARK_FONT_SIZE", "value": String(metaData.WaterMarkFontSize || "test") },
        { name: "WATERMARK_FONT_COLOR", "value": String(metaData.WaterMarkFontColor || "red") },
        { name: "WATERMARK_FONT_TOP", "value": String(metaData.WaterMarkTop || "10") },
        { name: "WATERMARK_FONT_LEFT", "value": String(metaData.WaterMarkLeft || "10") },
        //relay  env
        { name: "IS_RELAY", "value": String(metaData.isRelay || "false") },
        { name: "RELAY_URL", "value": String(metaData.relayURL || "rtmp://localhost:1935") }
    ]
}

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