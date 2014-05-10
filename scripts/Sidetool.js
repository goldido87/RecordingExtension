
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
var ExtensionData = {
  dataVersion: 4,
  isRecording: false,
  commands: []
};

var serverAddress = "67.231.242.50";

var playImage = "img/play.png";
var stopImage = "img/stop.png";

var port;

var portName = "applicationPort";

var refreshInterval = 700;


  ////////////
 // EVENTS //
////////////

$("document").ready(function() 
{
      ////////////////////
     // BUTTON EVENTS ///
    ////////////////////
    $( "#mybutton" ).click(function() {
          alert( "Handler for .click() called." );
        });

    $( "#clearBtn" ).click(function() {
        ExtensionData.isRecording = !ExtensionData.isRecording;
        port.postMessage({type: "isRecording_Changed"});
        clearCommands();
    });

    $( "#recordingBtn" ).click(function() {
        recordingButtonPressed();
    });

    port = chrome.runtime.connect({name: portName});

    port.onMessage.addListener(function(msg) {
        if (msg.type == "refreshData")
        {
            var loadedCommands = ExtensionData.commands.length;
            ExtensionData = msg.data;   
            // After getting the application data,
            // initialize the GUI, send the number of 
            // commands already loaded so we won't have to
            // iterate and add all commands all over again
            if (ExtensionData.isRecording)
                init(loadedCommands);
        }
        else if (msg.type == "initClient")
        {
            ExtensionData.commands = [];
            history.go(0);
        }
    });

    port.postMessage({type: "load"});

    // Refresh data every second
    setInterval(function()
    {
        if (ExtensionData.isRecording)
                port.postMessage({type: "load"});

    },refreshInterval);
    
});

function init(startingIndex)
{
    evaluateRecordingButtonState();

    if (ExtensionData.isRecording)
    {
        var list = document.getElementById('commandsList');

        // Append loaded commands to list
        for (var i = startingIndex; i < ExtensionData.commands.length; i++) 
        {
            var entry = document.createElement('li');

            var image = getImageElement(ExtensionData.commands[i].id);

            image.width = 40;
            image.height = 40;

            entry.appendChild(image);

            list.appendChild(entry);
        } 

        // Start counting time
        //CreateTimer("timer", 0);
    }
    else
    {
        // commands saved while not recording
        // have no importance
        if (ExtensionData.commands.length > 0)
        {
            clearCommands();
        }

        //Timer = document.getElementById("timer");
        //Timer.innerHTML = "00:00:00"; 
    }
  }

// Converts a given text to an html 
// bold text element 
function boldHTML(text) {
    var element = document.createElement("b");
    element.innerHTML = text;
    return element;
}

function recordingButtonPressed()
{
    ExtensionData.isRecording = !ExtensionData.isRecording;
    evaluateRecordingButtonState();

    port.postMessage({type: "isRecording_Changed"});
    
    if (!ExtensionData.isRecording)
    {
        //postCommandsToServer();
        //exportCommands();
        startSimulation();
    }       
    else
    {   
        // Recording started
        startRecording();
    }
    
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

// Switches recording button image according
// to application current recording state
function evaluateRecordingButtonState()
{
    if (ExtensionData.isRecording)
    {
        $("#recordingBtn").attr("src", stopImage);
    }
    else
    {
        $("#recordingBtn").attr("src", playImage);   
    }
}

// Generates a script from all saved commands
// and injects it to the new tab to start simulation
function startSimulation()
{
    var script = "";
    var action = "";

    var numOfCommands = ExtensionData.commands.length;

    // The url when user started his recording
    var startingUrl = ExtensionData.commands[0].name;

    script += "alert('Executing Script');\n";
    //script += "document.body.style.backgroundColor = 'pink';" + "\n";

    // Start from 1, first command is reserved for the page url
    for (var i = 1; i < numOfCommands; i++) 
    {
        var command = ExtensionData.commands[i]; 

        switch(command.id)
        {
            case "click":
                action = "document.getElementById('" + command.name + "').click();";
                break;

            case "scroll":
                var coords = command.name.split(",");
                action = "window.scrollTo(" + coords[0] + "," + coords[1] + ");";
                break;

            case "keyboard":
                action = "alert('Key pressed: " + command.name + "');";
                break;
        }

        // Set timeout for each command
        script += "window.setTimeout(function(){" + action +"}, 3000);";
        script += "\n";
    }

    // Clear all commands data after prepering 
    // the script, before actual execution
    clearCommands();

    if (numOfCommands > 1)
    {
        // Send a message to background.js to open
        // the url and inject the script to start simulation
        port.postMessage({type: "startSimulation", detail: script , url: startingUrl});
    }
}
 
// Used for debugging, export all commands
// and write to console log
function exportCommands()
{
    var message = "Actions Summary:\n------------------\n\n";

    for (var i = 0; i < ExtensionData.commands.length; i++) 
    {
        message += ("#" + (i + 1) + " ");
        message += ("Type: " + ExtensionData.commands[i].id + "\n");
        message += ("Data: " + ExtensionData.commands[i].name + "\n");
        message += ("Time: " + new Date(ExtensionData.commands[i].time).getUTCFullYear() + "\n\n");
    }

    console.log(message);
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