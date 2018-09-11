[![Build Status](https://travis-ci.org/IBM/virtualhelpdesk.svg?branch=master)](https://travis-ci.org/IBM/virtualhelpdesk)

# Virtual HelpDesk using IBM Watson Assistant, Discovery service and Maximo/IBM Control Desk

This Node.js application demonstrates how to build a `Virtual HelpDesk`, and use the Watson Assistant (formerly Conversation) and Discovery services to interact with end users for simple Q/A. With proper training, Assistant service can cover most of common questions/requests. When it is not been trained to address end users' specific question, the virtual agent searches in the knowledge base through Watson Discovery service and presents relevant entries to the end user. If the end user is still not satisfied, a new ticket is created in a back-office ticketing system, such as Maximo/IBM Control Desk(ICD) system.

![Demo](doc/source/images/ticketbot.png)

## Flow
1. The knowledge base documents are added to the Discovery collection.
1. The user interacts with the virtual agent via the app UI. User input is processed by the virtual agent. 
1. When the virtual agent is trained to cover the discussion subject, it quickly provide feedback.
1. When the virtual agent is not trained to cover the discussion subject, it searches in the knowledge base for suggestion(s). If found, relevant suggestions are displayed via the app UI.
1. If no relevant information is found in the knowledge base or the relevant information from knowledge base does not satify end users, the Virtual HelpDesk opens a new ticket in back-office ticketing system.
1. Back-office ticketing system takes over the support task.

![Demo](doc/source/images/architecture.png)

## Included components

* [IBM Watson Assistant](https://www.ibm.com/watson/developercloud/conversation.html): Build, test and deploy a bot or virtual agent across mobile devices, messaging platforms, or even on a physical robot.
* [IBM Watson Discovery](https://www.ibm.com/watson/developercloud/discovery.html): A cognitive search and content analytics engine for applications to identify patterns, trends, and actionable insights.
* [Maximo/IBM Control Desk(ICD)](https://www-01.ibm.com/software/applications/control-desk/): Back-office ticketing system. Other ticketing system can be used alternatively. (Variation of this code pattern connecting to ServiceNow is available at https://github.com/lee-zhg/virtualhelpdesk-1)

![Demo](doc/source/images/VirtualHelpDeskComponents.png)

## Featured technologies
* [Cognitive](https://developer.ibm.com/watson/): Watson is a cognitive technology that can think like a human.
* [Node.js](https://nodejs.org/en/): An asynchronous event driven JavaScript runtime, designed to build scalable applications.

# Watch the Video

[![](http://img.youtube.com/vi/MjyX6vntejI/0.jpg)](https://www.youtube.com/watch?v=MjyX6vntejI)

# Steps

## Deploy to IBM Cloud

[![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM/virtualhelpdesk)

When you click the link above ("Deploy to IBM Cloud"), a Watson Assistant service and a Watson Discovery service are created for you without manual steps. It also deploys the Node.js application for quick verification. So, after you complete this section (if you choose to), you may skip the next two sections
* Setting up Assistant(Conversation) service
* Setting up Discovery service

And continue in section
* Setting up trial IBM Control Desk SaaS system

Node.js application must be redeployed after it is configured to connect to Maximo/ICD system. The instruction is provided in section
* Deploying to Bluemix


## Before you begin

* Create an IBM Cloud account -- [Sign up](https://console.bluemix.net/registration/) for IBM Cloud, or use an existing account. Your account must have available space for at least one app and two Watson services.

* Make sure that you have the following prerequisites installed:
    * The [Node.js](https://nodejs.org/#download) runtime, including the [NPM](https://www.npmjs.com) package manager.
    * The [Cloud Foundry](https://github.com/cloudfoundry/cli#downloads) CLI.

## Setting up Assistant service

The Watson Assistant service is used to provide underline infrastructure for the virtual agent in this code pattern.

### Creating an Assistant service

Watson Assistant service is to be setup to simulate help desk level 1 activities. For topics that the virtual agent has been trained, it can help end users interactively. For subjects that the virtual agent does not understand, it searches the knowledge base through Discovery service, collects information from end user and creates a new ticket in back-office ticketing system, for example Maximo/ICD, if necessary.

Slots are configured in the Assistant service to collect additional information from end users.

1. At the command line, go to the local project directory (`vaticketbot`).

1. Connect to IBM Cloud with the Cloud Foundry command-line tool. For more information, see the [IBM Cloud documentation](https://console.bluemix.net/docs/cli/reference/cfcommands/index.html).
    ```bash
    cf login
    ```

1. Create an instance of the Assistant service in IBM Cloud. For example:

    ```bash
    cf create-service conversation free my-conversation-service
    ```

### Importing the Assistant workspace

1. In your browser, navigate to the [IBM Cloud console](https://console.ng.bluemix.net/dashboard/services).

1. From the **All Items** tab, click the newly created Assistant service in the `Cloud Foundry Services` list.

    ![Screen capture of Services list](doc/source/images/conversation_service.png)

1. On the next page, click `Launch tool`.

1. In the Watson Assistant page, navigate to `Workspace` tab.

1. Click the `Import workspace` icon on the top of the Assistant workspaces. 

1. Specify the location of the workspace JSON file in your local copy of the app project:

    `<project_root>/training/ITSM_workspace.json`

1. Select `Everything (Intents, Entities, and Dialog)` option and then click `Import`. 

1. The sample ITSM workspace is created.

## Setting up Discovery service

The Watson Discovery service is used to provide underline infrastructure in this code pattern when searching in knowledge base.

### Creating a Discovery service

Watson Discovery service is to be setup to search in the knowledge base when the virtual agent is not trained to cover specific topics.

1. At the command line, go to the local project directory (`vaticketbot`).

1. Connect to IBM Cloud with the Cloud Foundry command-line tool. 
    ```bash
    cf login
    ```

1. Create an instance of the Discovery service in IBM Cloud. For example:

    ```bash
    cf create-service discovery lite my-discovery-service
    ```

1. Check the status of Discovery service instance in IBM Cloud, if necessary

    ```bash
    cf services
    ```

### Creating a collection and ingesting documents into Discovery service

1. Download and unzip the [`knowledgebase.zip`](training/knowledgebase.zip) in this repo to reveal a set of JSON documents

1. Navigate to your Discovery instance in your IBM Cloud dashboard

1. Click `Launch tool`

    ![](doc/source/images/discovery_tooling.png)

1. Create a new data collection, name it whatever you like, and select the default configuration.

    ![](doc/source/images/discovery_collection.png)

1. After you're done, a new private collection is displayed in the UI  

    ![](doc/source/images/myCollection.png)

1. Click `Drag and drop your documents here or browse from computer` section

    ![](doc/source/images/discovery_ingest.png)

1. Select three JSON files from local file system where you downloaded and unzipped `knowledgebase.zip` file. This may take a few seconds, you will see a notification when the process is finished

## Setting up trial IBM Control Desk SaaS system

If you don't have an available in-house Maximo/ICD system to integrate with Watson services in this code pattern, you may request a trial ICD SaaS system.

You may request a [trial ICD SaaS system](https://www.ibm.com/us-en/marketplace/it-service-management) at no cost. Click the `Free 30-day trial` link and follow the procedure. It may take a while for the system orchestration to complete.

![Screen capture of workspace tile menu](doc/source/images/ICD_trial.png)

After the trial ICD SaaS system is active, you should receive an email for your trial ICD system.

    Thank you for requesting IBM Control Desk on Cloud. Your trial is now ready for you to start using.

    The Products and Services page provides access to all of your trials and subscriptions, and includes additional information to help you get started,as well as information for product support. This would be a good link to bookmark!

    Your trial is valid through Sun, 22 Apr 2018 02:09 UTC. 
    
    Enjoy your trial to IBM Control Desk on Cloud!
 
    Sincerely,
    IBM Marketplace Team 

Click [Products and Services](https://myibm.ibm.com/products-services/) link in the email to navigate to your Products and service home page. One of trial offers is `IBM Control Desk on Cloud Trial`.

![Screen capture of workspace tile menu](doc/source/images/ICD_trial_active.png)

Click `Manage` button to review the Overview page of your trial ICD system. In the navigation pane on the left, select `Usage instructions`.

![Screen capture of workspace tile menu](doc/source/images/ICD_trial_info.png)

Default account information is displayed on `Usage instructions` page. Take a note of password for maxadmin account for further code pattern configuration.

    Your trial is predefined with demo data and several sign in IDs that you can use to see how IBM Control Desk is tailored for different types of users. When logging in to IBM Control Desk, use one of the following user IDs and use the password sNzuxX7S for all IDs.

        bob - End user (originates tickets, service requests, and catalog requests)
        scott - Service Desk Agent (handles service requests, incidents, and problems)
        franklin - Change Manager (works with changes, releases, and the configuration management database)
        jake - Asset Manager (handles hardware and software assets)
        maxadmin - Super user (has full administrative rights)    

click `Launch` button to bring up ICD login screen. Note down the login page URL for late configuration. For example, 
    
    https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/maximo_t4hj/webclient/login/login.jsp?welcome=true

Login to your trail ICD SaaS system and verify it's working.

## Installing locally

If you want to modify the app or use it as a basis for building your own app, install it locally. You can then deploy your modified version of the app to IBM Cloud.

### Getting the files

Use GitHub to clone the repository locally. In a terminal, run:

   ```bash
   git clone https://github.com/ibm/virtualhelpdesk
   ```

### Configuring the Watson Assistant service environment

1. Copy the `.env.example` file and create a new `.env` file.

1. In IBM Cloud with the Cloud Foundry command-line tool, create a service key for the Assistant service in the format `cf create-service-key <service_instance> <service_key>`. For example:

    ```bash
    cf create-service-key my-conversation-service myKey
    ```

1. Retrieve the credentials from the service key of the Assistant service using the command `cf service-key <service_instance> <service_key>`. For example:

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

    ```bash
    CONVERSATION_USERNAME=ca2905e6-7b5d-4408-9192-e4d54d83e604
    CONVERSATION_PASSWORD=87iT7aqpvU7l
    ```

1. In the IBM Cloud console, open the Assistant service instance where you imported the workspace.

1. Click the menu icon in the upper-right corner of the workspace tile, and then select **View details**.

    ![Screen capture of workspace tile menu](doc/source/images/workspace_details.png)

1. Click the ![Copy](doc/source/images/copy_icon.png) icon to copy the workspace ID to the clipboard.

1. On the local system, paste the workspace ID into the WORKSPACE_ID variable in the `.env` file. 

1. Save the file.

### Configuring the Discovery service environment

1. With the Cloud Foundry command-line tool, create a service key for the Discovery service in the format `cf create-service-key <service_instance> <service_key>`. For example:

    ```bash
    cf create-service-key my-discovery-service myKey
    ```

1. Retrieve the credentials from the service key of the Assistant service using the command `cf service-key <service_instance> <service_key>`. For example:

    ```bash
    cf service-key my-discovery-service myKey
    ```

   The output from this command is a JSON object, as in this example:

    ```JSON
    {
        "password": "E8CCHs37pUwj",
        "url": "https://gateway.watsonplatform.net/discovery/api",
        "username": "07629c30-a460-436d-ae54-97a3b6e71902"
    }
    ```

1. Copy and paste  the `password`, `username` and `username` values (without quotation marks) from the JSON into the `.env` file. For example:

    ```
    DISCOVERY_USERNAME=07629c30-a460-436d-ae54-97a3b6e71902
    DISCOVERY_PASSWORD=E8CCHs37pUwj
    DISCOVERY_URL=https://gateway.watsonplatform.net/discovery/api/v1
    ```

1. In the IBM Cloud console, open your Discovery service instance.

1. Open the Collection in your Discovery service.

1. Locate the `collection info` section, 

    ![Screen capture of workspace tile menu](doc/source/images/discovery_view_collection.png)

1. click `Use this collection in API` link to display the collection information.

    ![Screen capture of workspace tile menu](doc/source/images/discovery_collection_detail.png)

1. Copy and paste Collection ID and Environment ID to the corresponding variable in the `.env` file. 

1. Save the file.


### Configuring the Maximo/ICD environment

Default behavior of a Maximo/ICD system was changed slightly in one of v7.6.0.x releases. The way used originally in this code pattern to make REST API calls to Maximo/ICD system, is no longer available after out of box deployment. The new way is not available in old Maximo/ICD releases. For this reason, two ways to make REST API calls to Maximo.ICD system is discussed.

One way to identify if you have an old release of Maximo/ICD system or a new one, is to check if you have OSLC Resources application in your system. Navigation path is Go To Applications -> Integration -> OSLC Resources. If you recently requested a trial ICD system, you have the latest release.


#### Configuring Object Structures in Maximo/ICD system

This section is only required if you have a newer release of Maximo/ICD system(there is OSLC Resources application in your system).

To create new Object Structure MYSR,

1. Login to your Maximo/ICD system.

1. Navigate to `Go To Applications` -> `Integration` -> `Object Structures`.

1. Search and open the Object Structure `OSLCSR` (or `OSLCSRDETAIL`).

1. Select `More Actions` -> `Duplicate Object Structure`.

1. Define the new object structure,
    * Object Structure Name = “MYSR”
    * Description = “My Service Request Resource”
    * Consumed By = “OSLC”

1. Save the new Object Structure.

1. Still in the Object Structure MYSR record, navigate to `More Actions` (or `Select Action`) -> `Exclude/Include Fields`.

1. Locate attribute `AFFECTEDPERSON` and unselect the `Exclude?` checkbox.


#### Configuring OSLC Resources in Maximo/ICD system

This section is only required if you have a newer release of Maximo/ICD system(there is OSLC Resources application in your system).

To create new OSLC Resource MYSR,

1. Login to your Maximo/ICD system.

1. Navigate to `Go To Applications` -> `Integration` -> `OSLC Resources`.

1. Click the `NEW` icon.

1. Define the new OSLC resource,
    * OSLC Resource Name = “MYSR”
    * Description = “My Service Request Resource”
    * Object Structure = “MYSR”
    * Domain Name = “SmartCloudControlDesk” (“SmarterPhysicalInfrastructure” for a Maximo system)
    * Default Namespace URI = http://jazz.net/ns/ism/helpdesk/sccd# (http://jazz.net/ns/ism/asset/smarter_physical_infrastructure# for a Maximo system)

1. Save.


#### Configuring .env file connecting to a new release of Maximo/ICD system

Perform tasks in this section if you have a `newer` release of Maximo/ICD system(there is OSLC Resources application in your system).

1. Set `MAXIMO_AUTH` environment variable in file .env. This variable setting depends on how Maximo/ICD authentication is configured.

    * `Application Server Authentication (LDAP)` - In this case, the variable has two parts separated by a blank space. The first part is the value "Basic". The second part is `user:password` base64 encoded. You can get its value through any online base64 encoder based on your ICD/Maximo user:password.

    * `Native Maximo Authentication` - In this case, the variable has one part only. It is `user:password` base64 encoded. You can get its value through any online base64 encoder based on your ICD/Maximo user:password. Note, the trial ICD SaaS system has navive Maximo authentication.

1. Keep `application/json` as the value of `MAXIMO_CONTEXT_TYPE` environment variable.

1. Modify the hostname portion of `MAXIMO_REST_URL` environment variable to point to your ICD/Maximo system. If you are connecting to trial ICD system, you may have to modify its context root as well. For example, if the URL used to login to the trial ICD system is https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/maximo_t4hj, the URL in the .env file will be https://siwr35cdwsa-tsb.sccd.ibmserviceengage.com/maximo_t4hj/oslc/os/MYSR.

1. Set `MAXIMO_PERSONID` environment variable to a valid person ID in your ICD/Maximo system. For example, MAXADMIN. Note, the person ID is typically case sensitive.

1. Set `MAXIMO_UI_URL` environment variable in the similar way as you have done for MAXIMO_REST_URL environment variable. Change its hostname and context root.

1. Set `MAXIMO_CLASSSTRUCTUREID` environment variable to a valid classstructureid in your ICD/Maximo system. For example, 21 which is typically configured in a trial ICD system.

1. Set `MAXIMO_PREFIX` environment variable. For example, sccd in a ICD system, spi in a Maximo system.

    ```bash
    # For Application Server Authentication (LDAP)
    MAXIMO_AUTH=BASIC bWF4YWRtaW46S2h0TlBncGM=
    MAXIMO_CONTEXT_TYPE=application/json
    MAXIMO_REST_URL=https://siwr35cdwsa-tsb.sccd.ibmserviceengage.com/maximo_t4hj/oslc/os/MYSR
    MAXIMO_PERSONID=MAXADMIN
    MAXIMO_CLASSSTRUCTUREID=21
    MAXIMO_PREFIX=sccd
    MAXIMO_UI_URL=https://siwr35cdwsa-tsb.sccd.ibmserviceengage.com/maximo_t4hj/ui/?event=loadapp&value=sr&additionalevent=useqbe&forcereload=true/&additionaleventvalue=ticketid=
    ```

    ```bash
    # For Native Maximo Authentication
    MAXIMO_AUTH=bWF4YWRtaW46S2h0TlBncGM=
    MAXIMO_CONTEXT_TYPE=application/json
    MAXIMO_REST_URL=https://siwr35cdwsa-tsb.sccd.ibmserviceengage.com/maximo_t4hj/oslc/os/MYSR
    MAXIMO_PERSONID=MAXADMIN
    MAXIMO_CLASSSTRUCTUREID=21
    MAXIMO_PREFIX=sccd
    MAXIMO_UI_URL=https://siwr35cdwsa-tsb.sccd.ibmserviceengage.com/maximo_t4hj/ui/?event=loadapp&value=sr&additionalevent=useqbe&forcereload=true/&additionaleventvalue=ticketid=
    ```

1. Save the file.


#### Configuring .env file connecting to an old release of Maximo/ICD system

Perform tasks in this section if you have an `older` release of Maximo/ICD system(there is no OSLC Resources application in your system).

1. Set `MAXIMO_AUTH` environment variable in file .env. This variable setting depends on how Maximo/ICD authentication is configured.

    * `Application Server Authentication (LDAP)` - In this case, the variable has two parts separated by a blank space. The first part is the value "Basic". The second part is `user:password` base64 encoded. You can get its value through any online base64 encoder based on your ICD/Maximo user:password.

    * `Native Maximo Authentication` - In this case, the variable has one part only. It is `user:password` base64 encoded. You can get its value through any online base64 encoder based on your ICD/Maximo user:password. Note, the trial ICD SaaS system has navive Maximo authentication.

1. Keep `application/json` as the value of `MAXIMO_CONTEXT_TYPE` environment variable.

1. Modify the hostname portion of `MAXIMO_REST_URL` environment variable to point to your ICD/Maximo system. If you are connecting to trial ICD system, you may have to modify its context root as well. For example, if the URL used to login to the trial ICD system is https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/maximo_t4hj, the URL in the .env file will be https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/meaweb_t4hj/os/MXSR.

1. Set `MAXIMO_PERSONID` environment variable to a valid person ID in your ICD/Maximo system. For example, MAXADMIN. Note, the person ID is typically case sensitive.

1. Set `MAXIMO_UI_URL` environment variable in the similar way as you have done for MAXIMO_REST_URL environment variable. Change its hostname and context root.

    ```bash
    # For Application Server Authentication (LDAP)
    MAXIMO_AUTH=Basic bWF4YWRtaW46c056dXhYN1M=
    MAXIMO_CONTEXT_TYPE=application/json
    MAXIMO_REST_URL=https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/meaweb_t4hj/os/MXSR
    MAXIMO_PERSONID=MAXADMIN
    MAXIMO_UI_URL=https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/maximo_t4hj/ui/?event=loadapp&value=sr&additionalevent=useqbe&forcereload=true/&additionaleventvalue=ticketid=
    ```

    ```bash
    # For Native Maximo Authentication
    MAXIMO_AUTH=bWF4YWRtaW46c056dXhYN1M=
    MAXIMO_CONTEXT_TYPE=application/json
    MAXIMO_REST_URL=https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/meaweb_t4hj/os/MXSR
    MAXIMO_PERSONID=MAXADMIN
    MAXIMO_UI_URL=https://siwr35cdwsa-tr3.sccd.ibmserviceengage.com/maximo_t4hj/ui/?event=loadapp&value=sr&additionalevent=useqbe&forcereload=true/&additionaleventvalue=ticketid=
    ```

1. Save the file.


### Installing and starting the app

1. Navigate to the folder where your local ticketbot application locates.

1. Install required Node.js modules to the local runtime environment:

    ```bash
    npm install
    ```

1. Start the Virtual HelpDesk:

    ```bash
    npm start
    ```

1. Point your browser to http://localhost:3000 to try out the app.

## Running the use cases

When pointing your browser to http://localhost:3000, you are starting a Q/A session. 

### Watson Assistant delivers

You may type problem statements such as
* my pc is running slow
* wireless connection is bad

The virtual agent will do its best to address the issue, for example
* Please reboot your machine
* Please power off wireless router in the conference room, waiting one minute and power it on

    ![Screen capture of workspace tile menu](doc/source/images/conversation_deliver.png)

### Watson Discovery comes to rescue

When end users have any question/request that the virtual agent has not been trained to understand, it searches in the knowledge base through Watson Discovery service and presents relavant entries as suggestion(s) to the end users.

For example, when you enter 
* can't connect to DB2

in the Q/A session, the virtual agent may return suggestion(s) depending on information in your knowledge base.

![Screen capture of workspace tile menu](doc/source/images/discovery_rescue.png)

If the entries from the knowledge base does not provide sufficient information, end users have option to open ticket.

### Opening a ticket in Maximo/ICD system

As the last resort, the virtual agent can collect information and create a new ticket on your behalf. For example, if you ask

* How to program in Java

This is an area that the virtual agent has not been trained and it founds nothing in knowledge base. It then prompts you

    ```bash
    The Virtual Agent has not been trained to answer your question/request. 
    No relavant entry was found in Knowledge Base. 
    
    If the solutions from the Knowledge Base do not resolve your issue, a new ticket can be opened.
    Do you want to create a new ticket?
    ```
    
When you reply "Yes", the virtual agent will ask

* What severity (high, medium and low) do you want for your new ticket?

After you specify the ticket severity (high, medium and low), the virtual agent opens a new ticket in your backend ticketing system.

* Thank you for contacting IT help desk. A new ticket is opened. `TicketID=365392, Severity=1 for issue: "how to program in java"`.

![Screen capture of workspace tile menu](doc/source/images/straightTicket.png)

As the REST API is widely available, this app can be used to integrate Waston Assistant and Discovery service with most of back-office ticketing systems. Integrates with IBM Control Desk/Maximo is provided as an example in the code.

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

## Exploring the Watson Assistant service

Below is the sample response JSON object from Watson Assistant service. Values of its intents, entities, input, output and context can be gathered and/or manipulated in Node.js code.

At the end of the JSON object, context.newticket and context.severity are related to the slot configurations in the Assistant service.

```JSON
{
	"intents": [{
		"intent": "greetings",
		"confidence": 0.46840930583966855
	}],
	"entities": [{
			"entity": "severity",
			"location": [
				0,
				1
			],
			"value": "2",
			"confidence": 1
		},
		{
			"entity": "sys-number",
			"location": [
				0,
				1
			],
			"value": "2",
			"confidence": 1,
			"metadata": {
				"numeric_value": 2
			}
		}
	],
	"input": {
		"text": "2"
	},
	"output": {
		"text": [
			"Thank you for contacting IT helpdesk. A new ticket is opened."
		],
		"nodes_visited": [
			"slot_6_1516850647245",
			"node_1_1516850017677",
			"node_13_1516852865520"
		],
		"log_messages": [

		]
	},
	"context": {
		"conversation_id": "40a875f1-c8ef-4b63-9c69-661777bf3d71",
		"system": {
			"dialog_stack": [{
				"dialog_node": "node_13_1516852865520"
			}],
			"dialog_turn_counter": 17,
			"dialog_request_counter": 17,
			"_node_output_map": {
				"Welcome": [
					0
				],
				"node_3_1516832266395": [
					0
				],
				"node_6_1516832414895": [
					0
				],
				"node_5_1516850287208": [
					0
				],
				"node_18_1517000905140": [
					0
				],
				"node_13_1516852865520": [
					0
				],
				"node_4_1516832287824": [
					0
				]
			}
		},
		"newticket": true,
		"severity": 2
	}
}
```

## Modifying the app

After you have the app deployed and running, you can explore the source files and make changes. Try the following:

* Modify the .js files to change the app logic.
* Modify the .html file to change the appearance of the app page.
* Use the Assistant tool to train the service for new intents, or to modify the dialog flow. For more information, see the [Watson Assistant Documentation](https://console.bluemix.net/docs/services/conversation/getting-started.html#gettingstarted).

## Deploying to IBM Cloud

You can use Cloud Foundry to deploy your local version of the app to IBM Cloud.

1. In the project root directory, open the `manifest.yml` file:

  * In the `applications` section of the `manifest.yml` file, change the `name` value to a unique name for your version of the demo app.
  * In the `services` section, specify the name of the Assistant service instance and Discovery service instance that you created. If you do not remember the service name, use the `cf services` command to list all services you have created.

  The following example shows a modified `manifest.yml` file:

  ```yml
---
declared-services:
    my-conversation-service:
      label: conversation
      plan: free
    my-discovery-service:
      label: discovery
      plan: lite
applications:
- name: vaticketbot
    command: npm start
    path: .
    memory: 512M
    instances: 1
    services:
    - my-conversation-service
    - my-discovery-service
  env:
    NPM_CONFIG_PRODUCTION: false
  ```

When you are ready to deploy the app to an IBM Cloud environment,

1. With the Cloud Foundry command-line tool, make sure you are in the correct folder where you downloaded the code pattern.

1. Push the app to IBM Cloud:

  ```bash
  cf push
  ```
  Access your app on IBM Cloud at the URL specified in the command output.


## Deploying to a Container on IBM Cloud with Kubernetes

Run in a container on IBM Cloud, using [these instructions](doc/source/Container.md).


## Troubleshooting

If you encounter a problem, you can check the logs for more information. To see the logs, run the `cf logs` command:

```bash
cf logs <application-name> --recent
```

## License

This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## Links

* [Cloud_Foundry CLI](https://github.com/cloudfoundry/cli#downloads)
* [Live Demo_URL](http://maximobot.mybluemix.net/)
* [Watson Assistant Documentation](https://console.bluemix.net/docs/services/conversation/getting-started.html#gettingstarted)
* [Watson Discovery Documentation](https://console.bluemix.net/docs/services/discovery/getting-started.html#gettingstarted)
* [Node.JS](http://nodejs.org/)
* [NPM](https://www.npmjs.com/)
