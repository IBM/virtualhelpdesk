/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
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

const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var request = require('request');
var req = require('request');
var dateTime = require('node-datetime');

var vcapServices = require('vcap_services');
var conversationCredentials = vcapServices.getCredentials('conversation');
var watson = require('watson-developer-cloud'); // watson sdk

var app = express();
var description = '';

// for automatically deploying to IBM Cloud
const fs = require('fs'); // file system for loading JSON;
const WatsonDiscoverySetup = require('./lib/watson-discovery-setup');
const WatsonConversationSetup = require('./lib/watson-conversation-setup');
const DISCOVERY_ACTION = 'rnr'; // Replaced RnR w/ Discovery but Assistant action is still 'rnr'.
const DISCOVERY_DOCS = [
  './training/icd_001.json',
  './training/icd_002.json',
  './training/icd_003.json'
];
const DEFAULT_NAME_C = 'Conversation-ICD';
const DEFAULT_NAME_D = 'Discovery-ICD';

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

/*
// Create the Conversation service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-10-21',
  version: 'v1'
});
*/

// Create the Conversation service wrapper
const conversation = new AssistantV1({ version: '2018-02-16' });

// for automatically deploying to IBM Cloud
let workspaceID; // workspaceID will be set when the workspace is created or validated.
const conversationSetup = new WatsonConversationSetup(conversation);
const workspaceJson = JSON.parse(fs.readFileSync('./training/ITSM_workspace.json'));
const conversationSetupParams = { default_name: DEFAULT_NAME_C, workspace_json: workspaceJson };
conversationSetup.setupConversationWorkspace(conversationSetupParams, (err, data) => {
  if (err) {
    handleSetupError(err);
  } else {
    console.log('Watson Assistant is ready!');
    workspaceID = data;
  }
});

// Create the Discovery service wrapper
const discovery = new DiscoveryV1({ version: '2018-12-03' });

// for automatically deploying to IBM Cloud
let discoveryParams; // discoveryParams will be set after Discovery is validated and setup.
const discoverySetup = new WatsonDiscoverySetup(discovery);
const discoverySetupParams = { default_name: DEFAULT_NAME_D, documents: DISCOVERY_DOCS };
discoverySetup.setupDiscovery(discoverySetupParams, (err, data) => {
  if (err) {
    handleSetupError(err);
  } else {
    console.log('Discovery is ready!');
    discoveryParams = data;
  }
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

    // to save the last problem description before opening a ticket
    if (data.context.newticket === undefined & data.context.severity === undefined & data.output.text[0] == 'The Virtual Agent has not been trained to answer your question/request. Please review the suggestions from Knowledge Base.' & data.output.text[1] == 'If the solutions from the Knowledge Base do not resolve your issue, a new ticket can be opened.' & data.output.text[2] == 'Do you want to create a new ticket?') {
      description = data.input.text;
      //console.log('description=' + description + '\n');
    }

    var runDiscovery = false;

    // Call Discovery service REST API
    if (!(data.entities === undefined | Object.keys(data.entities).length === 0)) {
      if (!(data.entities[0].entity === 'Hardware' & data.entities[0].value === 'Computer') & !(data.entities[0].entity === 'Network' & data.entities[0].value === 'wireless')) {
        if (data.context.discovered === undefined | data.context.discovered === false) {
          if (data.context.newticket != 'no') {
            runDiscovery = true;
          }
        }
      }
    }

    //console.log("runDiscovery=" + runDiscovery);
    //console.log(data);

    // call Discovery REST API
    if (runDiscovery) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      callDiscovery(description).then(function (discovery_str) {

        // display search result of Discovery query through Conversation UI
        if (discovery_str == '') {
          data.output.text[0] = '<br><br>The Virtual Agent has not been trained to answer your question/request. <br><br>No relavant entry was found in Knowledge Base.  <br><br>';
        } else {
          data.output.text[0] = 'The Virtual Agent has not been trained to answer your question/request. <br><br>Knowledge Base has the following suggestions:  <br><br>';
          data.output.text[0] = data.output.text[0] + discovery_str + '<br><br>';
        }

        //console.log("=====================");
        //console.log(data);

        // set flag to not run Discovery next time
        data.context.discovered = true;

        return res.json(updateMessage(payload, data));

      }).catch((error) => {
        console.error(error);
        console.error("Failed when calling Watson Discovery service");
      });

    } else {

      // reset conversation service when end user selects to not open a new ticket
      if (data.context.newticket == 'no') {
        description = '';
        data.context.newticket = undefined;
        data.context.severity = undefined;
        data.context.discovered = false;
      }

      // call Maximo/ICD to create a new ticket
      if (data.context.newticket & !(data.context.severity === undefined)) {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        callMaximo(description, data.context.severity).then(function (body) {

          // For old ICD/Maximo release
          /*
          var ticketidindex2 = body.search('</TICKETID>');
          var ticketidindex1 = body.search('<TICKETID>');
          var ticketid = body.substring(ticketidindex2, ticketidindex1 + 10);
          */

          // For new ICD/Maximo release
          var obj = JSON.parse(body);
          var element = process.env.MAXIMO_PREFIX + ":ticketid";
          var ticketid = obj[element];
          
          console.log('##############################222\n');
          console.log("TICKETID=" + ticketid + "\n");
          console.log(body + '\n');
          console.log('##############################222\n');

          // set output string
          if (body.includes('500')) {
            data.output.text[0] = data.output.text[0] + ' But, it failed when opening the new ticket.<br><br><br>';
          }
          else {
            data.output.text[0] += ' TicketID=' + ticketid + ', Severity=' + data.context.severity + ' for issue: \"' + description + '\".' + '<br><br>';
            var sr_link = process.env.MAXIMO_UI_URL + ticketid;
            data.output.text[0] += '<html> <body> <a href=\"' + sr_link + '\" target=\"_blank\">To view the new ticket</a> </body> </html>' + '<br><br><br>';
            
          }

          // reset context
          description = '';
          data.context.severity = undefined;
          data.context.newticket = undefined;
          data.context.discovered = false;

          // send to Watson Assistant(Conversation_ service)
          return res.json(updateMessage(payload, data));

        }).catch((error) => {
          console.error(error);
          console.error("Failed when calling Maximo service");
        });

      }

      else {
        return res.json(updateMessage(payload, data));
      }

    }

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

/**
 * Call Watson Discovery service to search knowledge base
 * @param  string  query_str The query string to the Discovery service
 * @return string            The related document entries returned by the Discovery service
 */
function callDiscovery(query_str) {

  return new Promise((resolve, reject) => {

    var discovery_str = '';
    var discovery_query = '';

    // Setup Watson Discovery query
    discovery_query += process.env.DISCOVERY_URL;
    discovery_query += '/v1/environments/' + process.env.DISCOVERY_ENVIRONMENT_ID;
    discovery_query += '/collections/' + process.env.DISCOVERY_COLLECTION_ID;
    discovery_query += '/query?version=2018-12-03&deduplicate=false&highlight=true&passages=false&passages.count=5&natural_language_query=';
    discovery_query += query_str;
    //console.log("+++++++++++++++++++++++")
    //console.log(discovery_query)

    // call Watson Discovery service
    try {

      request({

        headers:
          { 'content-type': 'application/json' },
        //url: "https://gateway.watsonplatform.net/discovery/api/v1/environments/edb332ec-86b2-4611-9e0e-35692775a870/collections/ba7345fa-cd67-41c7-bfb0-245e6deb9cc8/query?version=2017-11-07&deduplicate=false&highlight=true&passages=false&passages.count=5&natural_language_query=mobile",
        url: discovery_query,
        method: "GET",
        auth: {
          user: 'apikey',
          pass: process.env.DISCOVERY_IAM_APIKEY
        }
      }, function (err, resp, body) {
        if (err) {
          resolve(err);
        } else {
          // process the search result of Discovery query
          var resp_obj = JSON.parse(resp.body);
          for (var i = 0; i < resp_obj.matching_results; i++) {
            discovery_str += "Suggestion " + (i + 1).toString() + ":     " + resp_obj.results[i].body.trim() + "\n\n";
            //console.log(resp_obj.results[i].body.trim());
          }

          //console.log("=====================");
          //console.log(discovery_str);

          resolve(discovery_str);
        }

      });

    } catch (error) {
      console.error(error);
      console.error("Failed when calling Watson Discovery service");
    }

  });

}

/**
 * Call Maximo/ICD system to create a ticket
 * @param  string  description Ticket description
 * @param  number  severity    Ticket severity
 * @return string              Returned messages from Maximo call
 */
function callMaximo(description, severity) {

  return new Promise((resolve, reject) => {

    var dt = dateTime.create();
    var formatted_now = dt.format('Y-m-dTH:M:S');

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

    // Calling ICD/Maximo REST API to open ticket (for old ICD/Maximo release)
    /*
    var maximo_rest_body = '<?xml version="1.0" encoding="UTF-8"?> \
        <max:CreateMXSR \
            xmlns:max="http://www.ibm.com/maximo" creationDateTime="' + formatted_now + '" > \
            <max:MXSRSet> \
                <max:SR action="Create" > \
                    <max:DESCRIPTION changed="true">' + description + '</max:DESCRIPTION> \
                    <max:AFFECTEDPERSON changed="true">' + process.env.MAXIMO_PERSONID + '</max:AFFECTEDPERSON> \
                    <max:STATUS maxvalue="string" changed="false">NEW</max:STATUS> \
                    <max:REPORTDATE changed="true">' + formatted_now + '</max:REPORTDATE> \
                    <max:REPORTEDBY changed="true">' + process.env.MAXIMO_PERSONID + '</max:REPORTEDBY> \
                    <max:CLASSSTRUCTUREID changed="true">21</max:CLASSSTRUCTUREID> \
                    <max:REPORTEDPRIORITY changed="true">' + severity + '</max:REPORTEDPRIORITY> \
                </max:SR> \
            </max:MXSRSet> \
        </max:CreateMXSR>'
    */

    // Calling ICD/Maximo REST API to open ticket (for new ICD/Maximo release)
    var maximo_rest_body = '{ \
      "' + process.env.MAXIMO_PREFIX + ':description":"' + description + '", \
      "' + process.env.MAXIMO_PREFIX + ':affectedperson":"' + process.env.MAXIMO_PERSONID + '", \
      "' + process.env.MAXIMO_PREFIX + ':status":"NEW"' + ', \
      "' + process.env.MAXIMO_PREFIX + ':reportedby":"' + process.env.MAXIMO_PERSONID + '", \
      "' + process.env.MAXIMO_PREFIX + ':classstructureid":"' + process.env.MAXIMO_CLASSSTRUCTUREID + '", \
      "' + process.env.MAXIMO_PREFIX + ':reportedpriority":' + severity + ' \
      }'

      console.log(maximo_rest_body);

    try {

      request({

        headers: {
          // For Application Server Authentication (LDAP)
          'Authorization': process.env.MAXIMO_AUTH,
          // For Native Maximo Authentication
          'MAXAUTH': process.env.MAXIMO_AUTH,
          'CONTENT-TYPE': process.env.MAXIMO_CONTEXT_TYPE,
          'PROPERTIES':'*'
        },

        url: process.env.MAXIMO_REST_URL,
        body: maximo_rest_body,
        method: 'POST'

      }, function (err, resp, body) {
        if (err) {
          resolve(err);
        } else {
          //console.log("=====================");
          //console.log(body);

          resolve(body);

        }

      });

    } catch (error) {
      console.error(error);
      console.error("Failed when calling Maximo service");
    }

  });

}



/**
 * Updates the response text using the intent confidence
 * @param  string  query_str The query string to the Discovery service
 * @return string            The related documents returned by the Discovery service
 */
/*
async function callDiscovery_no(query_str, req, res) {
  console.log("++++++++++++++++++");
  console.log(query_str);
  console.log("++++++++++++++++++");

  var discovery_str = await discovery.query(
    {
      environment_id: process.env.ENVIRONMENT_ID,
      collection_id: process.env.COLLECTION_ID,
      query: query_str
    },
    function (err, response) {
      if (err) {
        console.error(err);
      } else {
        var discovered_s = '';
        // process discovered content
        //console.log(JSON.stringify(response, null, 2));

        for (var i = 0; i < response.matching_results; i++) {
          discovered_s += "Suggestion " + (i + 1).toString() + ":     " + response.results[i].body.trim() + "\n\n";
          //console.log(response.results[i].body.trim());
        }

        return discovered_s;
      }
    }
  );

}
*/


module.exports = app;


