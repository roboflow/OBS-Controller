/*jshint esversion:6*/
var obs = new OBSWebSocket();

// CHANGE THE IP:PORT AND PASSWORD (OPTIONAL)
var address = "ws://192.168.1.2:4455"
var password = "Roboflow"

// ESTABLISH OBS SCENES AND SOURCES
let Scene_1 = 'WebcamScene'
let Scene_2 = 'WebcamScene2'
let Source_1 = 'Lenny'

// SET UP ROBOFLOW.JS AUTH VARIABLES
let publishable_key = "API_KEY";
let model = "MODEL_ID";
let version = 1;

// TUNE ROBOFLOW.JS DETECTION VARIABLES (HIGHER THRESHOLD MEANS MORE ACCURATE)
let threshold = 0.5;
let overlap = 0.5;
let max_objects = 20;

// ESTABLISHES WEB SOCKET CONNECTION AND SETS SCENE TO 'WebcamScene'
obs.connect(address, password);
obs.call('SetCurrentProgramScene', {'sceneName': Scene_1});

// FUNCTION FOR SWITCHING TO SCENE 2
function webcam_scene() {
    obs.call('SetCurrentProgramScene', {'sceneName': Scene_1});
}

function webcam_scene_2() {
    obs.call('SetCurrentProgramScene', {'sceneName': Scene_2});
}

async function move_lenny(x ,y) {
    let ret = await obs.call('GetSceneItemId', {'sceneName': Scene_1, 'sourceName': Source_1})
    Source_1_ID = ret.sceneItemId;
    obs.call('SetSceneItemTransform', {'sceneName': Scene_1, 'sceneItemId': Source_1_ID, 'sceneItemTransform': {'positionX': x, 'positionY': y}});
}

$(function () {
    const video = $("video")[0];

    var cameraMode = "environment"; // or "user"

    const startVideoStreamPromise = navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: cameraMode
            }
        })
        .then(function (stream) {

            // SWITCHES TO WEBCAM BEFORE STREAM INITILIZATION
            webcam_scene()

            return new Promise(function (resolve) {
                video.srcObject = stream;
                video.onloadeddata = function () {
                    video.play();
                    resolve();
                };
            });
        });
    
    console.log(publishable_key)
    console.log(model)
    console.log(version)
    
    var toLoad = {
        model: model,
        version: version
    };

    const loadModelPromise = new Promise(function (resolve, reject) {

        roboflow
            .auth({
                publishable_key: publishable_key
            })
            .load(toLoad)
            .then(function (m) {
                model = m;
                model.configure({
                    threshold: threshold,
                    overlap: overlap,
                    max_objects: max_objects
                });
                resolve();
            });
    });


    Promise.all([startVideoStreamPromise, loadModelPromise]).then(function () {
        $("body").removeClass("loading");
        resizeCanvas();
        detectFrame();
    });

    var canvas, ctx;
    const font = "16px sans-serif";

    function videoDimensions(video) {
        // Ratio of the video's intrisic dimensions
        var videoRatio = video.videoWidth / video.videoHeight;

        // The width and height of the video element
        var width = video.offsetWidth,
            height = video.offsetHeight;

        // The ratio of the element's width to its height
        var elementRatio = width / height;

        // If the video element is short and wide
        if (elementRatio > videoRatio) {
            width = height * videoRatio;
        } else {
            // It must be tall and thin, or exactly equal to the original ratio
            height = width / videoRatio;
        }

        return {
            width: width,
            height: height
        };
    }

    $(window).resize(function () {
        resizeCanvas();
    });

    const resizeCanvas = function () {
        $("canvas").remove();

        canvas = $("<canvas/>");

        ctx = canvas[0].getContext("2d");

        var dimensions = videoDimensions(video);

        console.log(
            video.videoWidth,
            video.videoHeight,
            video.offsetWidth,
            video.offsetHeight,
            dimensions
        );

        canvas[0].width = video.videoWidth;
        canvas[0].height = video.videoHeight;

        canvas.css({
            width: dimensions.width,
            height: dimensions.height,
            left: ($(window).width() - dimensions.width) / 2,
            top: ($(window).height() - dimensions.height) / 2
        });

        $("body").append(canvas);
    };

    const renderPredictions = function (predictions) {
        var dimensions = videoDimensions(video);

        var scale = 1;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the bounding box.
            ctx.strokeStyle = prediction.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                width / scale,
                height / scale
            );

            // Draw the label background.
            ctx.fillStyle = prediction.color;
            const textWidth = ctx.measureText(prediction.class).width;       

            const textHeight = parseInt(font, 10); // base 10
            ctx.fillRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                textWidth + 8,
                textHeight + 4
            );
        });

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the text last to ensure it's on top.
            ctx.font = font;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(
                prediction.class,
                (x - width / 2) / scale + 4,
                (y - height / 2) / scale + 1
            );
        });

        // FUNCTION FOR CONTROLLING OBS INTERACTIONS
        predictions.forEach(function (prediction) {
            
            if (prediction.class === "Stop") {
                move_lenny(-500, -500);
                console.log("HIDING OBJECTS!")
            }

            if (prediction.class === "Grab") {
                move_lenny(prediction.bbox.x, prediction.bbox.y);
                console.log("GRABBING OBJECT")
            }

            if (prediction.class === "Thumb Down") {
                webcam_scene_2();
                console.log("TURNING TO SCENE 2")
            }

            if (prediction.class === "Thumb Up") {
                webcam_scene();
                console.log("TURNING TO SCENE 1")
            }

            if (prediction.class === "Down") {
                console.log("MOVE LENNY DOWN!")
                move_lenny(dimensions.width/2, dimensions.height*0.75);
            }

            if (prediction.class === "Up") {
                console.log("MOVE LENNY UP!")
                move_lenny(dimensions.width/2, dimensions.height*0.25);
            }
        });
    };

    var prevTime;
    var pastFrameTimes = [];
    const detectFrame = function () {
        if (!model) return requestAnimationFrame(detectFrame);

        model
            .detect(video)
            .then(function (predictions) {
                requestAnimationFrame(detectFrame);
                renderPredictions(predictions);

                if (prevTime) {
                    pastFrameTimes.push(Date.now() - prevTime);
                    if (pastFrameTimes.length > 30) pastFrameTimes.shift();

                    var total = 0;
                    _.each(pastFrameTimes, function (t) {
                        total += t / 1000;
                    });

                    var fps = pastFrameTimes.length / total;
                    $("#fps").text(Math.round(fps));
                }
                prevTime = Date.now();
            })
            .catch(function (e) {
                console.log("CAUGHT", e);
                requestAnimationFrame(detectFrame);
            });
    };
});
