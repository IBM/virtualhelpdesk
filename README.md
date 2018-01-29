# Virtual Agent & TICKET bot using IBM Watson conversation api 

This Node.js app demenstrates how to use the Watson Conversation API to interact with end users for simple Q/A. When Watson virtual agent does not know how to address end users' question, a new ticket(SR) is created in a legacy backend ticketing system (IBM Control Desk/Maximo is used as an example in this case).

![Demo](readme_images/ticketbot.PNG)


## Before you begin

* Create a Bluemix account
    * [Sign up][sign_up] in Bluemix, or use an existing account. Your account must have available space for at least 1 app and 1 service.
* Make sure that you have the following prerequisites installed:
    * The [Node.js](https://nodejs.org/#download) runtime, including the [npm][npm_link] package manager
    * The [Cloud Foundry][cloud_foundry] command-line client

      Note: Ensure that you Cloud Foundry version is up to date


## Installing locally

If you want to modify the app or use it as a basis for building your own app, install it locally. You can then deploy your modified version of the app to the Bluemix cloud.


### Getting the files

Use GitHub to clone the repository locally, 


### Setting up the Conversation service

A conversation service is going to be setup to simulate help desk level 1 activities. For subjects that Watson virtual agent has knowledge, it helps end users interactively. For subjects that the virtual agent does not understand, it collects information from end user and creates a new ticket in legacy backend ticketing system, for example ICD Control Desk/Maximo.

Slots are configured in the conversation service to collect additional information with end users.

1. At the command line, go to the local project directory (`ticketbot`).

1. Connect to Bluemix with the Cloud Foundry command-line tool. For more information, see the Watson Developer Cloud [documentation][cf_docs].
    ```bash
    cf login
    ```

1. Create an instance of the Conversation service in Bluemix. For example:

    ```bash
    cf create-service conversation free my-conversation-service
    ```

### Importing the Conversation workspace

1. In your browser, navigate to [your Bluemix console] (https://console.ng.bluemix.net/dashboard/services).

1. From the **All Items** tab, click the newly created Conversation service in the **Services** list.

    ![Screen capture of Services list](readme_images/conversation_service.png)

1. On the Service Details page, click **Launch tool**.

1. Click the **Import workspace** icon in the Conversation service tool. Specify the location of the workspace JSON file in your local copy of the app project:

    `<project_root>/training/ITSM_workspace.json`

1. Select **Everything (Intents, Entities, and Dialog)** and then click **Import**. The car dashboard workspace is created.


### Configuring the app environment

1. Copy the `.env.example` file to create a new `.env` file.

1. Create a service key in the format `cf create-service-key <service_instance> <service_key>`. For example:

    ```bash
    cf create-service-key my-conversation-service myKey
    ```

1. Retrieve the credentials from the service key using the command `cf service-key <service_instance> <service_key>`. For example:

    ```bash
    cf service-key my-conversation-service myKey
    ```

   The output from this command is a JSON object, as in this example:

    ```JSON
    {
      "password": "87iT7aqpvU7l",
      "url": "https://gateway.watsonplatform.net/conversation/api",
      "username": "ca2905e6-7b5d-4408-9192-e4d54d83e604"
    }
    ```

1. Copy and paste  the `password` and `username` values (without quotation marks) from the JSON into the `CONVERSATION_PASSWORD` and `CONVERSATION_USERNAME` variables in the `.env` file. For example:

    ```
    CONVERSATION_USERNAME=ca2905e6-7b5d-4408-9192-e4d54d83e604
    CONVERSATION_PASSWORD=87iT7aqpvU7l
    ```

1. In your Bluemix console, open the Conversation service instance where you imported the workspace.

1. Click the menu icon in the upper-right corner of the workspace tile, and then select **View details**.

    ![Screen capture of workspace tile menu](readme_images/workspace_details.png)

1. Click the ![Copy](readme_images/copy_icon.png) icon to copy the workspace ID to the clipboard.

1. On the local system, paste the workspace ID into the WORKSPACE_ID variable in the `.env` file. Save the file.

1. Set MAXIMO_AUTH environment variable. This variable has two part. The value "Basic" of first part is to be determined by your ICD/Maximo system configuration. The second part is user:password base64 encoded. You can get its value through any online base64 encoder based on your ICD/Maximo user:password.

1. Keep "application/json" as the value of MAXIMO_CONTEXT_TYPE environment variable.

1. Modify the hostname portion of MAXIMO_REST_URL environment variable to point to your ICD/Maximo system.

1. Set MAXIMO_PERSONID environment variable to a valid person ID in your ICD/Maximo system.


### Installing and starting the app

1. Navigate to the folder where your local ticketbot application locates.

1. Install required Node.js modules to the local runtime environment:

    ```bash
    npm install
    ```

1. Start the app:

    ```bash
    npm start
    ```

1. Point your browser to http://localhost:3000 to try out the app.


## Testing the app

When pointing your browser to http://localhost:3000, you are prompted to start Q/A session. 

You may type in problem statements such as
* my pc is running slow
* wireless connection is bad

The Watson virtual agent will do it best to address the issue, for example
* Please reboot your machine
* Please power off wireless router in the conference room, waiting one minute and power it on

When you have any issue that virtual agent does not understand, it'll collect information and create a new ticket on your behalf. For example, if you ask

* I can't connect to DB2 database

This is an area that the virtual agent does not have knowledge. It'll prompt you

* No quick resolution is available. Do you want to create a new ticket?

When you reply "Yes", the virtual agent will ask

* What severity (high, medium and low) do you want for your new ticket?

After you specify the ticket severity (high, medium and low), the virtual agent opens a new ticket in your backend ticketing system.

* Thank you contacting IT help desk. Severity 1 ticket 383695 was opened for issue: "I can't connect to DB2 database".

As the REST API is widely available, this app can be used to integrate Waston conversation service with most of legacy backend ticketing systems. Integrates with IBM Control Desk/Maximo is provided as an example in the code.

The connection and authentication information for IBM Control Desk/Maximo system is left in app.js code for simplicity. These information should be modified to connect to your IBM Control Desk/Maximo system.

```bash
headers: {
            'Authorization': 'Basic bWF4aW1vOnJlbW90ZTE=',
            'Content-Type': 'application/json',
          },
          
          url: 'https://maximo-demo75.mro.com/meaweb/os/MXSR',
          body: '<?xml version="1.0" encoding="UTF-8"?><max:CreateMXSR xmlns:max="http://www.ibm.com/maximo" creationDateTime="2018-01-22T11:24:06" >  <max:MXSRSet>    <max:SR action="Create" > <max:DESCRIPTION changed="true">'+description+'</max:DESCRIPTION>  <max:AFFECTEDPERSON changed="true">maximo</max:AFFECTEDPERSON>  <max:STATUS maxvalue="string" changed="false">NEW</max:STATUS>   <max:REPORTDATE changed="true">2018-01-22T11:24:06</max:REPORTDATE>    <max:REPORTEDBY changed="true">maximo</max:REPORTEDBY>    <max:CLASSSTRUCTUREID changed="true">99</max:CLASSSTRUCTUREID> <max:REPORTEDPRIORITY changed="true">'+data.context.severity+'</max:REPORTEDPRIORITY> </max:SR>  </max:MXSRSet></max:CreateMXSR>',
          method: 'POST'
        }
```


## Exploring data of Conversation service

Below is the response JSON object from Watson Conversation service. Values of its intents, entities, input, output and context can be gathered and/or manipulated in Node.js code.

At the end of the JSON object, context.newticket and context.severity are related to the slot configurations in Conversation service.

```bash
{  
   "intents":[  
      {  
         "intent":"greetings",
         "confidence":0.46840930583966855
      }
   ],
   "entities":[  
      {  
         "entity":"severity",
         "location":[  
            0,
            1
         ],
         "value":"2",
         "confidence":1
      },
      {  
         "entity":"sys-number",
         "location":[  
            0,
            1
         ],
         "value":"2",
         "confidence":1,
         "metadata":{  
            "numeric_value":2
         }
      }
   ],
   "input":{  
      "text":"2"
   },
   "output":{  
      "text":[  
         "Thank you for contacting IT helpdesk. A new ticket is opened."
      ],
      "nodes_visited":[  
         "slot_6_1516850647245",
         "node_1_1516850017677",
         "node_13_1516852865520"
      ],
      "log_messages":[  

      ]
   },
   "context":{  
      "conversation_id":"40a875f1-c8ef-4b63-9c69-661777bf3d71",
      "system":{  
         "dialog_stack":[  
            {  
               "dialog_node":"node_13_1516852865520"
            }
         ],
         "dialog_turn_counter":17,
         "dialog_request_counter":17,
         "_node_output_map":{  
            "Welcome":[  
               0
            ],
            "node_3_1516832266395":[  
               0
            ],
            "node_6_1516832414895":[  
               0
            ],
            "node_5_1516850287208":[  
               0
            ],
            "node_18_1517000905140":[  
               0
            ],
            "node_13_1516852865520":[  
               0
            ],
            "node_4_1516832287824":[  
               0
            ]
         }
      },
      "newticket":true,
      "severity":2
   }
}
```


## Modifying the app

After you have the app deployed and running, you can explore the source files and make changes. Try the following:

* Modify the .js files to change the app logic.
* Modify the .html file to change the appearance of the app page.
* Use the Conversation tool to train the service for new intents, or to modify the dialog flow. For more information, see the [Conversation service documentation][docs_landing].


## Deploying to Bluemix

You can use Cloud Foundry to deploy your local version of the app to Bluemix.

1. In the project root directory, open the `manifest.yml` file:

  * In the `applications` section of the `manifest.yml` file, change the `name` value to a unique name for your version of the demo app.
  * In the `services` section, specify the name of the Conversation service instance you created for the demo app. If you do not remember the service name, use the `cf services` command to list all services you have created.

  The following example shows a modified `manifest.yml` file:

  ```yml
  ---
  declared-services:
   conversation-service:
     label: conversation
     plan: free
  applications:
  - name: conversation-simple-app-test1
   command: npm start
   path: .
   memory: 256M
   instances: 1
   services:
   - my-conversation-service
   env:
     NPM_CONFIG_PRODUCTION: false
  ```

1. Push the app to Bluemix:

  ```bash
  cf push
  ```
  Access your app on Bluemix at the URL specified in the command output.


## Troubleshooting

If you encounter a problem, you can check the logs for more information. To see the logs, run the `cf logs` command:

```none
cf logs <application-name> --recent
```


## License

This sample code is licensed under Apache 2.0.
Full license text is available in [LICENSE](LICENSE).


## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).


## Open Source @ IBM

Find more open source projects on the
[IBM Github Page](http://ibm.github.io/).


[cf_docs]: (https://www.ibm.com/watson/developercloud/doc/common/getting-started-cf.html)
[cloud_foundry]: https://github.com/cloudfoundry/cli#downloads
[demo_url]: http://maximobot.mybluemix.net/
[doc_intents]: (http://www.ibm.com/watson/developercloud/doc/conversation/intent_ovw.shtml)
[docs]: http://www.ibm.com/watson/developercloud/doc/conversation/overview.shtml
[docs_landing]: (http://www.ibm.com/watson/developercloud/doc/conversation/index.shtml)
[node_link]: (http://nodejs.org/)
[npm_link]: (https://www.npmjs.com/)
[sign_up]: bluemix.net/registration
