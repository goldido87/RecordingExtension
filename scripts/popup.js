
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
var ExtensionData = {
  dataVersion: 4,
  appStatus: "stop",
  commands: []
};

// Port used to communicate with background.js
var port;
var portName = "applicationPort";

// Interval for refreshing application data
var refreshInterval = 1000;

var serverAddress = "67.231.242.50";


  ////////////
 // EVENTS //
////////////

$("document").ready(function() 
{
      ////////////////////
     // BUTTON EVENTS ///
    ////////////////////

    $( "#playBtn" ).click(function() {
        changeButtonBackground("playBtn");
        ExtensionData.appStatus = "play";
        startRecording();
    });

    $( "#stopBtn" ).click(function() {
        ExtensionData.appStatus = "stop";
        stopRecording();
    });

    $( "#pauseBtn" ).click(function() {
        changeButtonBackground("pauseBtn");
        ExtensionData.appStatus = "pause";
        stopRecording();
    });

    $( "#clearBtn" ).click(function() {
        changeButtonBackground("clearBtn");
        ExtensionData.appStatus = "stop";
        stopRecording();
        clearCommands();
    });

    port = chrome.runtime.connect({name: portName});

    // Listen to messages from background.js
    port.onMessage.addListener(function(msg) {
        if (msg.type == "refreshData")
        {
            ExtensionData = msg.data; 
            init();
        }
        else if (msg.type == "initClient")
        {
            ExtensionData.commands = [];
            history.go(0);
        }
    });

    // When the app is loaded, load all data
    port.postMessage({type: "load"});
});

function init()
{
    switch (ExtensionData.appStatus)
    {
        case "play":
            changeButtonBackground("playBtn");
            break;

        case "pause":
            changeButtonBackground("pauseBtn");
            break;

        case "stop":
            // commands saved while not recording
            // have no importance
            if (ExtensionData.commands.length > 0)
                clearCommands();
            break;
    }
}


function stopRecording()
{
    if (ExtensionData.appStatus == "pause")
        port.postMessage({type: "pauseRecording"});
    else
        port.postMessage({type: "stopRecording"});
}

function startRecording()
{
    // Inject to the current tab the script 
    // that listens to all extension events
    port.postMessage({type: "startRecording"});
}

// Clear all commands data
function clearCommands()
{
    // Clear persistent data
    port.postMessage({type: "clearData"});
}

function postCommandsToServer()
{
    for (var i = 0; i < ExtensionData.commands.length; i++) 
    {
        postCommand(ExtensionData.commands[i]);
    }
}

function postCommand(command)
{
    // Define the data packet that we are going to post to the
    // server. This will be "stringified" as a JSON value.
    var postData = {
        key_command: command.id,
        name: command.name,
        time: command.time
    };

    // Post the data to the server as the HTTP Request Body.
    // To do this, we have to stringify the postData value
    // and pass it in a string value (so that jQuery won't try
    // to process it as a query string).
    var ajaxResponse = $.ajax({
        type: "post",
        url: serverAddress,
        contentType: "application/json",
        data: JSON.stringify( postData )
    })

    // When the response comes back, output the HTML.
    ajaxResponse.then(
        function( apiResponse ){
            // Dump HTML to page for debugging.
            $( "#response" ).html( apiResponse );
        }
    );
}