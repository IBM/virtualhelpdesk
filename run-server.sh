#!/bin/bash -x
export CONVERSATION_USERNAME=$(echo "$conversationvariable" | jq -r '.username')
export CONVERSATION_PASSWORD=$(echo "$conversationvariable" | jq -r '.password')
export DISCOVERY_USERNAME=$(echo "$discoveryvariable" | jq -r '.username')
export DISCOVERY_PASSWORD=$(echo "$discoveryvariable" | jq -r '.password')

echo ">>>>>>>>>>>>>>>>"
echo $DISCOVERY_USERNAME
echo $DISCOVERY_PASSWORD
echo $ENVIRONMENT_ID
echo $COLLECTION_ID
echo $DISCOVERY_URL

npm start
