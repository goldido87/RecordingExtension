
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
var ExtensionData = {
  dataVersion: 4,
  isRecording: false,
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
        startRecording();
    });

    $( "#stopBtn" ).click(function() {
        changeButtonBackground("stopBtn");
        stopRecording();
        startSimulation();
    });

    $( "#pauseBtn" ).click(function() {
        changeButtonBackground("pauseBtn");
        stopRecording();
    });

    $( "#clearBtn" ).click(function() {
        changeButtonBackground("clearBtn");
        stopRecording();
        clearCommands();
    });

    port = chrome.runtime.connect({name: portName});

    // Listen to messages from background.js
    port.onMessage.addListener(function(msg) {
        if (msg.type == "refreshData")
        {
            var loadedCommands = ExtensionData.commands.length;
            ExtensionData = msg.data;   
            // Initialize the GUI and send the number of 
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

    // When the app is loaded, load all data
    port.postMessage({type: "load"});

    // Refresh data in interval
    setInterval(function()
    {
        if (ExtensionData.isRecording)
                port.postMessage({type: "load"});

    }, refreshInterval);
    
});

// Initialize the list in the GUI
// with available commands
function init(startingIndex)
{
    if (ExtensionData.isRecording)
    {
        // When recording highlight the play btn
        changeButtonBackground("playBtn");

        var list = document.getElementById('commandsList');

        // Append loaded commands to list
        for (var i = startingIndex; i < ExtensionData.commands.length; i++) 
        {
            // Ignore the focus out event
            if (ExtensionData.commands[i].id == "focusout")   
                continue;

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

function stopRecording(isPaused)
{
    ExtensionData.isRecording = false;

    if (isPaused)
        port.postMessage({type: "pauseRecording"});
    else
        port.postMessage({type: "stopRecording"});
}

function startRecording()
{
    ExtensionData.isRecording = true;
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

// Generates a script from all saved commands
// and injects it to the new tab to start simulation
function startSimulation()
{
    var script = "";
    var action = "";

    // The url when user started his recording
    var startingUrl = "";

    var numOfCommands = ExtensionData.commands.length;

    // For handling typing into text fields
    var InputData = {
      // Indicates that we are in a text box
      // to save upcoming keyboard commands
      isInInputField: false,
      // Holds the id or class of the 
      // text box that the user is typing into
      identification: "",
      // Saves the text entered
      text: ""
    };

    script += "$('document').ready(function() {" + "\n";

    for (var i = 0; i < numOfCommands; i++) 
    {
        var command = ExtensionData.commands[i]; 

        if (command.id == "url")
        {
            startingUrl = ExtensionData.commands[i].name;
            continue;
        }

        switch(command.id)
        {
            case "click":
            case "click_input_submit":
                action = "$('" + command.name + "').trigger('click');";
                break;

            case "click_a":    
                action = command.name;
                break;

            case "click_input_text":
                action = "$('" + command.name + "').focus();"; 
                InputData.isInInputField = true;
                InputData.identification = command.name;
                break;

            case "scroll":
                var coords = command.name.split(",");
                action = "window.scrollTo(" + coords[0] + "," + coords[1] + ");";
                break;

            case "keyboard":
                if (InputData.isInInputField == true)
                { 
                    InputData.text += command.name;
                    action = "$('" + InputData.identification + "').val('" + InputData.text + "');";
                }
                /*else
                {
                    action = "alert('Key pressed: " + command.name + "');";
                }*/
                break;

            case "focusout":
                InputData.isInInputField = false;
                InputData.text = "";
                break;

            case "screenshot":
                action = "window.open('" + command.name + "');";
                break;
        }

        script += action;
        // Set timeout for each command
        //script += "window.setTimeout(function(){" + action +"}, 3000);";
        script += "\n";
    }

    script += "});";

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