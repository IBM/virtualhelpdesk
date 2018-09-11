# Running Virtual HelpDesk in a Container on IBM Cloud with Kubernetes

This instruction helps you to deploy the `Virtual HelpDesk` application into a container running on IBM Cloud, using Kubernetes.

The commands below use environment variables in order to define the specific details of the deployment. Substitute your names in the commands:
```
$ export CLUSTER_NAME=lzcluster
$ export CONFIG_MAP=virtualhelpdeskmap
$ export POD_NAME=virtualhelpdesk.yml
$ export KUBE_SERVICE=vhelpdeskservice
$ export CONVERSATION_SERVICE=Assistant-ICD
$ export CONTAINER_CONVERSATION_VARIABLE=conversationvariable
$ export DISCOVERY_SERVICE=Discovery-ICD
$ export CONTAINER_DISCOVERY_VARIABLE=conversationvariable
```

# Steps


## Login

Open a command window and navigate to the root folder of the code pattern project. You take all steps in this folder.

* Login to IBM Cloud if necessary.

```
$ ibmcloud login
```

* Set org and/or space in IBM Cloud if necessary,

```
$ ibmcloud target --cf
```

* Log in to the IBM Cloud Container Registry CLI. Note: Ensure that the [container-registry plug-in](https://console.bluemix.net/docs/services/Registry/index.html#registry_cli_install) is installed.

```
$ ibmcloud cr login
```


## Creating the Kubernetes cluster

You need the Kubernetes cluster to deploy your docker images

* Follow the instructions to [Create a Kubernetes Cluster](https://github.com/IBM/container-journey-template). If you already have a cluster, or choose a cluster name other than the one exported as $CLUSTER_NAME, re-export this new name:

```
$ export CLUSTER_NAME=<your_cluster_name>
```

* Before you continue to the next step, verify that the deployment of your worker node is complete.

```
ibmcloud ks workers <cluster_name_or_ID>
```

> When your worker node is finished provisioning, the status changes to Ready or Deployed, and you can start binding IBM Cloud services.

* Set the Kubernetes environment variable KUBECONFIG to work with your cluster:

```
ibmcloud cs cluster-config $CLUSTER_NAME
```

* The output of this command will contain a KUBECONFIG environment variable that must be exported in order to set the context. `Copy and paste the output in the terminal window to set the KUBECONFIG environment variable`. An example is:

```
export KUBECONFIG=/home/rak/.bluemix/plugins/container-service/clusters/Kate/kube-config-prod-dal10-<cluster_name>.yml
```


## Setting up your private registry

Set up your own private image repository in IBM Cloud Container Registry to securely store and share Docker images with all cluster users. A private image repository in IBM Cloud is identified by a namespace. The namespace is used to create a unique URL to your image repository that developers can use to access private Docker images.

```
$ ibmcloud cr namespace-add <namespace>
```

`<namespace>` can be any unqie name.


## Binding the Watson Asistant Service to your cluster

After binding the Watson Asistant Service to your cluster, the crediential of the Watson Asistant Service becomes available to the Kubernetes cluster. A Kubernetes secret is created.

* Retrieve available service instance:

```
$ ibmcloud service list
```

* Obtain the ID of your cluster:

```
$ ibmcloud cs clusters
```

* Bind the service instance to your cluster:

```
$ ibmcloud cs cluster-service-bind <cluster-ID> default $CONVERSATION_SERVICE
```


## Binding the Watson Discovery Service to your cluster

After binding the Watson Discovery Service to your cluster, the crediential of the Watson Discovery Service becomes available to the Kubernetes cluster. A Kubernetes secret is created.

* Retrieve available service instance:

```
$ ibmcloud service list
```

* Obtain the ID of your cluster:

```
$ ibmcloud cs clusters
```

* Bind the service instance to your cluster:

```
$ ibmcloud cs cluster-service-bind <cluster-ID> default $DISCOVERY_SERVICE
```


## File .env 

File .env in the root folder of the code pattern project should have been updated for your environment at this point. If you skipped file .env configuration, please revisit the instructon in the main [README](../../README.md) file.


## Creating a Kubernetes Configuration Map

Through Kubernetes Configuration Map, you can make additional environment variables available in the Kubernetes cluster. Entries in file .env becomes environment variables in the Kubernetes cluster after this section.

* Create a Kubernetes Configuration Map:

```
$ kubectl create configmap $CONFIG_MAP --from-env-file=.env
```

* Verify that the configuration is set:

```
$ kubectl get configmaps $CONFIG_MAP -o yaml
```


## Creating Docker image

* Build, tag, and push the app as an image to your namespace in IBM Cloud Container Registry. Don't forget the period (.) at the end of the command.

>Build a Docker image that includes app files in the root directory, and push the image to your IBM Cloud Container Registry namespace. Any time when you need to make a change to the app, repeat the steps to create another version of the image.

>Use lowercase alphanumeric characters or underscores (_) only in the image name. Don't forget the period (.) at the end of the command. The period tells Docker to look inside the current directory for the Dockerfile and build artifacts to build the image.

```
ibmcloud cr build -t registry.<region>.bluemix.net/<namespace>/virtualhelpdesk:1 .
```
>For example,

```
ibmcloud cr build -t registry.ng.bluemix.net/zhangllc/virtualhelpdesk:1 .
```

* Verify docker image

```
ibmcloud cr images
```

* If you need to delete docker image
```
ibmcloud cr image-rm registry.ng.bluemix.net/zhangllc/hello-world:5
```


## Modifying Kubernetes Pod Configuration File virtualhelpdesk.yml

* If you changed the following environment variable setting at the beginning, you should review and modify the Kubernetes pod configuration file accordingly. By default, it's in file virtualhelpdesk.yml.

```
$ export CONFIG_MAP=virtualhelpdeskmap
$ export POD_NAME=virtualhelpdesk.yml
$ export CONVERSATION_SERVICE=Assistant-ICD
$ export CONTAINER_CONVERSATION_VARIABLE=conversationvariable
$ export DISCOVERY_SERVICE=Discovery-ICD
$ export CONTAINER_DISCOVERY_VARIABLE=conversationvariable
```

* Below are the entries in the Kubernetes pod configuration file that you should review and modify.

```
        env:
          - name: WORKSPACE_ID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: WORKSPACE_ID
          - name: ENVIRONMENT_ID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: ENVIRONMENT_ID
          - name: COLLECTION_ID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: COLLECTION_ID
          - name: DISCOVERY_URL
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: DISCOVERY_URL
          - name: MAXIMO_AUTH
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_AUTH
          - name: MAXIMO_CONTEXT_TYPE
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_CONTEXT_TYPE
          - name: MAXIMO_REST_URL
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_REST_URL
          - name: MAXIMO_PERSONID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_PERSONID
          - name: MAXIMO_CLASSSTRUCTUREID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_CLASSSTRUCTUREID
          - name: MAXIMO_PREFIX
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_PREFIX
          - name: MAXIMO_UI_URL
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: MAXIMO_UI_URL
          - name: conversationvariable
            valueFrom:
              secretKeyRef:
                name: binding-assistant-icd
                key: binding
          - name: discoveryvariable
            valueFrom:
              secretKeyRef:
                name: binding-discovery-icd
                key: binding
```


## Deploying the Kubernetes Pod

* Deploy container:

```
$ kubectl create -f $POD_NAME
```

* Verify the deployment and service in Kubernetes dashboard

> 1. In IBM Cloud web UI, navigate to Containers and then Clusters.
> 1. Click your cluster entry.
> 1. Click the Kubernetes Dashboard at the top-right corner.
> 1. Navigate to the Overview tab.
> 1. Review Deployments, Services, Config Maps and Secrets sections.
> 1. In the Deployments section, select your deployment entry.
> 1. In the New Replica Set section, you may click the `Logs` icon to view the log files. This can be very handy if you encountered issues.

* Identify the **Public IP** address of your worker:

```
$ ibmcloud cs workers $CLUSTER_NAME
```

* Identify the external port your pod is listening on:

> Note: The Dockerfile determines the port that the container listens on using the `EXPOSE <port>` command. Kubernetes maps this to a publicly addressable port:

```
$ kubectl get services $KUBE_SERVICE
```
> Port 32032 is the external port in the sample output below,

```
NAME               TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
vhelpdeskservice   NodePort   172.21.254.210   <none>        3000:32032/TCP   1h
```

* Access the application using `http://<public IP Address>:<Port>`

## Looking Under the Hood

Now that you have created and bound a service instance to your Kubernetes cluster, let's take a deeper look at what is happening behind the scenes.


* Binding the conversation service to your cluster creates a Kubernetes secret named `binding-${CONVERSATION_SERVICE}` .

* The secret contains a key named binding with its data being a JSON string of the form:

```json
{
 "url":"https://gateway.watsonplatform.net/conversation/api",
 "username":"service-instance-user-uuid",
 "password":"service-instance-password"
}
```

* The secret is mapped into the container as an environment variable through the Kubernetes pod configuration(in file virtualhelpdesk.yml):

```yaml
          - name: $CONTAINER_CONVERSATION_VARIABLE
            valueFrom:
              secretKeyRef:
                name: binding-${CONVERSATION_SERVICE}
                key: binding
```

* For an application that expects the service credentials to be set in the environment variables `CONVERSATION_USERNAME` and `CONVERSATION_PASSWORD`, we set these in the container environment.

* Example usage is to have a script that is run when the container is started. We can then parse them from the  environment variable `$CONTAINER_CONVERSATION_VARIABLE` using jq:

```bash
$ export CONVERSATION_USERNAME=$(echo "${CONVERSATION_ENV_VARIABLE}" |
                                  jq -r '.username')
```

* Kubernetes Configuration Map $CONFIG_MAP makes all key/value pairs in .env file avilable in the container environment.

* The Kubernetes Configuration Map is mapped into the container as environment variables through the Kubernetes pod configuration(in file virtualhelpdesk.yml):

```
        env:
          - name: WORKSPACE_ID
            valueFrom:
              configMapKeyRef:
                name: virtualhelpdeskmap
                key: WORKSPACE_ID
```

You can see the defined secrets in the Kubernetes dashboard by running ``kubctl proxy`` and accessing [http://127.0.0.1:8001/ui](http://127.0.0.1:8001/ui).

## Troubleshooting

If a pod doesn't start examine the logs:

```bash
$ kubectl get pods
$ kubectl logs <pod name>
```

## Cleanup

To delete all your services and deployments, run:

```bash
$ kubectl delete deployment <deployment_name>
$ kubectl delete service $KUBE_SERVICE
```


## Acknowledgement

The instructions in this document were created mainly based on the information in the following resources.

* [Running watson-conversation-slots-intro in a Container on IBM Cloud with Kubernetes](https://github.com/IBM/watson-conversation-slots-intro/blob/master/doc/source/Container.md)

* [Tutorial: Creating Kubernetes clusters](https://console.bluemix.net/docs/containers/cs_tutorials.html#cs_cluster_tutorial)
