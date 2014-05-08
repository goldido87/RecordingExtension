
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
        clearCommands();
    });

    $( "#recordingBtn" ).click(function() {
        recordingButtonPressed();
    });

    // Init list after sotrage load callback
    DB_load(function() 
    {
        changeRecordingButtonImage();

        if (ExtensionData.isRecording)
        {
            var list = document.getElementById('photosList');

            // Append loaded commands to list
            for (var i = 0; i < ExtensionData.commands.length; i++) 
            {
                var entry = document.createElement('li');
                //var br = document.createElement('br');
                var image = getImageElement(ExtensionData.commands[i].id);
                image.width = 40;
                image.height = 40;

                entry.appendChild(image);
                /*entry.appendChild(br);
                entry.appendChild(boldHTML("Type: "));
                entry.appendChild(document.createTextNode(ExtensionData.commands[i].id + " "));
                br = document.createElement('br');
                entry.appendChild(br);
                entry.appendChild(boldHTML("Data: "));
                entry.appendChild(document.createTextNode(ExtensionData.commands[i].name));              
*/
                list.appendChild(entry);
            } 

            // Start counting time
            CreateTimer("timer", 0);
        }
        else
        {
            // commands saved while not recording
            // have no importance
            if (ExtensionData.commands.length > 0)
            {
                clearCommands();
            }

            Timer = document.getElementById("timer");
            Timer.innerHTML = "00:00:00"; 
        }
  });
});

function boldHTML(text) {
  var element = document.createElement("b");
  element.innerHTML = text;
  return element;
}

function clearCommands()
{
    // Clear persistent data
    DB_clear();
    // Clear cached array
    ExtensionData.commands = [];
    // Refresh page
    history.go(0);
}

function recordingButtonPressed()
{
    ExtensionData.isRecording = !ExtensionData.isRecording;
    changeRecordingButtonImage();

    DB_save(function() {
        if (!ExtensionData.isRecording)
        {
            //postCommandsToServer();
            exportCommands();
            clearCommands();
        }
    });
}

function changeRecordingButtonImage()
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

function exportCommands()
{
    var message = "Actions Summary:\n------------------\n\n";

    for (var i = 0; i < ExtensionData.commands.length; i++) 
    {
        message += ("#" + (i + 1) + " ");
        message += ("Type: " + ExtensionData.commands[i].id + "\n");
        message += ("Data: " + ExtensionData.commands[i].name + "\n");
        message += ("Time: " + new Date(ExtensionData.commands[i].time).toString() + "\n\n");
    }

    alert(message);
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

        
 
 
        
 
 
        