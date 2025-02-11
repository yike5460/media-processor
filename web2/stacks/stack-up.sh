#!/bin/bash

#PROFILE="--profile bluefin"

case $1 in
    ecr)
        aws cloudformation deploy \
        --template-file ecr.stack.yml \
        --stack-name video-streaming-web2-ecr \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides \
        RepositoryName=video-streaming-web \
        ${PROFILE}
        ;;
    service)
        aws cloudformation deploy \
        --template-file service.stack.yml \
        --stack-name video-streaming-web2 \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides \
        Version=1.0.9 \
        DesiredCount=1 \
        ${PROFILE}
        ;;
    service-cn)
        aws cloudformation deploy \
        --template-file service.stack-cn.yml \
        --stack-name video-streaming-web2 \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides \
        Version=1.0.9 \
        DesiredCount=1 \
        ${PROFILE}
        ;;
    service-ec2)
        aws cloudformation deploy \
        --template-file service-ec2.stack.yml \
        --stack-name video-streaming-web2 \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides \
        Version=1.0.9 \
        DesiredCount=1 \
        ${PROFILE}
        ;;
    *)
        echo $"Usage: $0 {ecr|service-}"
        exit 1
esac