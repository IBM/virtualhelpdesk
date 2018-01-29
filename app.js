/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var request = require('request');

var app = express();
var description = '';

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-10-21',
  version: 'v1'
});



// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
    // input: { text: input }
  };

  // Send the input to the conversation service
  conversation.message(payload, function (err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }

    /*
    console.log('##############################111\n');
    console.log(JSON.stringify(data) + '\n');
    console.log("data.input.text=" + data.input.text + '\n');
    console.log("data.output.text[0]=" + data.output.text[0] + '\n');
    console.log("data.output.text[1]=" + data.output.text[1] + '\n');
    console.log("data.output.text[2]=" + data.output.text[2] + '\n');
    console.log("data.context.newticket=" + data.context.newticket + '\n');
    console.log("data.context.severity=" + data.context.severity + '\n');
    console.log('desc=' + description + '\n');
    console.log('##############################111\n');
    */

    // to save the last problem description before opening a ticket
    if (data.context.newticket === undefined & data.context.severity === undefined & data.output.text[0] == '' & data.output.text[1] == 'No quick resolution is available.' & data.output.text[2] == 'Do you want to create a new ticket?') {
      description = data.input.text;
      console.log('description=' + description + '\n');
    }

    // reset conversation service when end user selects to not open a new ticket
    if (data.context.newticket == 'no') {
      description = '';
      data.context.newticket = undefined;
      data.context.severity = undefined;
    }

    // if(data.output.text[0].includes("Asset-") & !data.output.text[0].includes('format'))
    // if(false)
    if (data.context.newticket & !(data.context.severity === undefined)) {

      var assetNum = "1171AAG428C";
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      /*
      var maximo_rest_body = '<?xml version="1.0" encoding="UTF-8"?> \
      <max:CreateMXSR \
          xmlns:max="http://www.ibm.com/maximo" creationDateTime="2018-01-22T11:24:06" > \
          <max:MXSRSet> \
              <max:SR action="Create" > \
                  <max:ASSETNUM changed="true">' + assetNum + '</max:ASSETNUM> \
                  <max:ASSETORGID changed="true">IBM</max:ASSETORGID> \
                  <max:ASSETSITEID changed="true">IBMSYSTM</max:ASSETSITEID> \
                  <max:DESCRIPTION changed="true">' + description + '</max:DESCRIPTION> \
                  <max:AFFECTEDPERSON changed="true">7A2657897</max:AFFECTEDPERSON> \
                  <max:STATUS maxvalue="string" changed="false">NEW</max:STATUS> \
                  <max:REPORTDATE changed="true">2018-01-22T11:24:06</max:REPORTDATE> \
                  <max:REPORTEDBY changed="true">7A2657897</max:REPORTEDBY> \
                  <max:CLASSSTRUCTUREID changed="true">99</max:CLASSSTRUCTUREID> \
                  <max:REPORTEDPRIORITY changed="true">' + data.context.severity + '</max:REPORTEDPRIORITY> \
              </max:SR> \
          </max:MXSRSet> \
      </max:CreateMXSR>'
      */
  
      var maximo_rest_body = '<?xml version="1.0" encoding="UTF-8"?> \
      <max:CreateMXSR \
          xmlns:max="http://www.ibm.com/maximo" creationDateTime="2018-01-22T11:24:06" > \
          <max:MXSRSet> \
              <max:SR action="Create" > \
                  <max:DESCRIPTION changed="true">' + description + '</max:DESCRIPTION> \
                  <max:AFFECTEDPERSON changed="true">' + process.env.MAXIMO_PERSONID + '</max:AFFECTEDPERSON> \
                  <max:STATUS maxvalue="string" changed="false">NEW</max:STATUS> \
                  <max:REPORTDATE changed="true">2018-01-22T11:24:06</max:REPORTDATE> \
                  <max:REPORTEDBY changed="true">' + process.env.MAXIMO_PERSONID + '</max:REPORTEDBY> \
                  <max:CLASSSTRUCTUREID changed="true">99</max:CLASSSTRUCTUREID> \
                  <max:REPORTEDPRIORITY changed="true">' + data.context.severity + '</max:REPORTEDPRIORITY> \
              </max:SR> \
          </max:MXSRSet> \
      </max:CreateMXSR>'
  
          request({
      
        headers: {
          'Authorization': process.env.MAXIMO_AUTH,
          'Content-Type': process.env.MAXIMO_CONTEXT_TYPE,
        },

        url: process.env.MAXIMO_REST_URL,
        body: maximo_rest_body,
        method: 'POST'
      
      }, function (err, resp, body) {
        
        var ticketidindex2 = body.search('</TICKETID>');
        var ticketidindex1 = body.search('<TICKETID>');
        var ticketid = body.substring(ticketidindex2, ticketidindex1 + 10);

        console.log('##############################222\n');
        console.log("TICKETID=" + ticketid + "\n");
        console.log(body + '\n');
        console.log('##############################222\n');

        if (resp.body.includes('500')) {

          // set output string
          data.output.text[0] = data.output.text[0] + ' But, it failed when opening the new ticket.';

          // reset
          description = '';
          data.context.severity = undefined;
          data.context.newticket = undefined;

          return res.json(updateMessage(payload, data));

        }
        else {

          // set output string
          data.output.text[0] = data.output.text[0] + ' TicketID=' + ticketid + ', Severity=' + data.context.severity + ' for issue: \"' + description + '\".' + '\n\n';

          // reset
          description = '';
          data.context.severity = undefined;
          data.context.newticket = undefined;

          return res.json(updateMessage(payload, data));

        }

      });

    }

    else
      return res.json(updateMessage(payload, data));

  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }

  // abhishek enable maximo interatction here 

  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
