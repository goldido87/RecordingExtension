
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
var ExtensionData = {
  dataVersion: 5,
  appStatus: "stop",
  commands: [],
  recordingId: 0,
  recordings: []
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
    port = chrome.runtime.connect({name: portName});

    // Listen to messages from background.js
    port.onMessage.addListener(function(msg) {
        if (msg.type == "refreshData")
        {
            // Clear recordings list
            $("#recordsList").empty();
            ExtensionData = msg.data; 
            init();
        }
    });

    $( '#recordBtn' ).click(function() {
        port.postMessage({type: "startRecording"});    
    });


    // Request data load
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

    
    var list = $('#recordsList');

    // Add available recordings to list
    for (var i = 0; i < ExtensionData.recordings.length; i++) 
    {
        var recording = ExtensionData.recordings[i];

        var li = "<li id=" + recording.id + "><div class='recordItem'>" +
                    "<input type='image' src='img/black-play.png' class='playBtn' />" + 
                    "<img class='extensionIcon' src='" + recording.capture + "'/>" +
                    "<div class='guideName'>GUIDE " + recording.id + "</div>" + 
                    "<div class='guideTime'>" + recording.length + " | " + recording.time + "</div>" +
                    "<input type='image' src='img/share.png' class='shareBtn' />" +
                    "<input type='image' src='img/edit.png' class='editBtn' />" +
                    "<input type='image' src='img/delete.png' class='deleteBtn'/></div></li>";

        list.append(li);
    }

    $( ".deleteBtn" ).click(function() {
        var recordingId = $(this).closest("li").attr("id");
        deleteRecording(recordingId);
    });

    $( ".playBtn" ).click(function() {
        var recordingId = $(this).closest("li").attr("id");
        port.postMessage({type: "playRecording", index: recordingId});
    });
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

function deleteRecording(recordingId)
{
    for (var i = 0; i < ExtensionData.recordings.length; i++) 
    {
        var recording = ExtensionData.recordings[i]; 
        
        if (recording.id == recordingId)
        {
            port.postMessage({type: "deleteRecording", index: i});
            location.reload();
            return;
        }
    }
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