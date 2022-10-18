# OBS-Controller

![Gestures example](https://github.com/roboflow-ai/OBS-Controller/blob/main/gestures.gif?raw=true)


## Step 1 - Downloading the Default Roboflow Controller

Download Roboflow OBS Controller Zip from GitHub: Download OBS Controller

## Step 2 - Unzip and Open roboflow.js

After unzipping, open “roboflow.js” because we need to change a few variables before running the code.

![Configuration](https://user-images.githubusercontent.com/113200203/195961968-c16dd970-970f-4417-a65e-f3b9d68cc779.jpg)

After opening we are going to focus on LINES 5 - 21. 

## Step 3 - Open OBS to Retrieve IP Address:Port

With main.js still open, we are going to open up OBS to get the first line of information we need from OBS which is the websocket IP and Port.

The most recent versions of OBS come with the OBS Websocket Settings installed.

![Open Websocket](https://user-images.githubusercontent.com/113200203/195961988-ce723069-20cb-415a-b8c8-dbc1dbba5b83.jpg)

After opening the OBS Websocket Settings we are going to be presented with a panel like below. Click “Enable WebSocket server” if it isn’t already enabled. This will allow us to use the websocket of OBS.

This panel also has a button called “Show Connection Info” which after clicking we can see the Server IP, Port Number and Password which is required for logging into this OBS instance. 

![Web Socket Settings](https://user-images.githubusercontent.com/113200203/195962025-3432ecce-4802-41a1-b1e6-3981466dcff3.jpg)

Set a password if you don’t already have one and copy those three variables to a notepad. We will be using them in the next step.

## Step 4 - Put IP Address, Port and Password into main.js

After successfully navigating the settings and enabling OBS websockets, you should have something like this:

IP: 192.168.1.2
PORT: 4455
PASSWORD: Roboflow

We are now going to construct the websocket address which will be used in our main.js on LINE 5.

Required config: "ws://IP:PORT"

Example config: "ws://192.168.1.2:4455”

![IP Configuration](https://user-images.githubusercontent.com/113200203/195962050-cb9504db-ae59-4c3d-a12a-d2b06385ca0c.png)

On LINE 5 -> Replace your IP and PORT number in the required config above to make something similar to the example config. If you have all the appropriate 

On LINE 6 -> Replace the PASSWORD with the password you set in the OBS-Websocket Settings.

## Step 5 - Create OBS Scenes and Sources

To run the current version of the Roboflow OBS Controller we will need to create two scenes inside of OBS. 

One named “WebcamScene” and another called “WebcamScene2” which we will use to switch between. We will also need to set up a source object called “Lenny” which will be controlled by the “Up”, “Down”, “Stop” and “Grab” gesture.

Here are the lines in main.js that control which scenes and sources that we will be controlling.

![Scenes and Sources](https://user-images.githubusercontent.com/113200203/195962083-ff1779e1-1327-4c5b-a1e3-fb18972d3599.png)

It is important to know that the scene names in the main.js, need to match the scene and source names that you create in OBS. Matching the scene and source names is how we are going to get Roboflow.js controlling your OBS environment. 

Here is Scene_1 set up in OBS, you will notice that the scene is named “WebcamScene” and we have two sources, one running our webcam and the other is called “Lenny” which is holding our “lenny.png” which is included in the .zip folder.

![Scene 1](https://user-images.githubusercontent.com/113200203/195962108-5d316d65-2ad7-45b4-a106-ba562edf047f.jpg)

This is Scene_2 set up in OBS, which is only set up to demo transitioning. If you have another webcam, you can set it as a source in “WebcamScene2”. Secondary webcam is not required to demo scene transitions.

![Scene 2](https://user-images.githubusercontent.com/113200203/195962131-a607434d-dd58-48d7-b3c5-cc01ea70539a.jpg)

## Step 6 - Configure roboflow.js with Publishable API Key

Go to Roboflow Workspace Settings to get Publishable Key: https://app.roboflow.com/settings/account

![Publishable Key](https://user-images.githubusercontent.com/113200203/195962232-b1e7c199-339f-4682-bc5e-e4f5486b9147.jpg)

Replace LINE 14 in roboflow.js with your own Publishable Key.

## Step 7 - Configure roboflow.js with Model and Version

![Model and Version](https://user-images.githubusercontent.com/113200203/195962344-cdeb87f2-8035-47db-bb61-4f6ea2ecd160.png)

Replace LINE 15 in roboflow.js with your project model ID which is the first string with the red arrow.

Replace LINE 16 in roboflow.js with your project Version ID which is the number at the end of your project URL.

## Step 8 - With OBS open Run “index.html” in Web Browser

TURN ON YOUR OBS VIRTUAL CAMERA AND FEED IT AS INPUT TO ROBOFLOW.JS

![Final Stage](https://user-images.githubusercontent.com/113200203/195962491-ef4cce44-39a0-4a06-b555-cec1f9f6daad.png)

If everything is configured correctly, you should be able to use the up and down gesture to switch scenes, and the grab and stop gesture to control Lenny.png

