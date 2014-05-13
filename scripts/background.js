
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
var ExtensionData = {
  dataVersion: 4,
  appStatus: "stop",
  commands: []
};

var second = 1000;
var recordingTime = 0;
var timeInterval;

  /////////////
 // STORGAE //
/////////////

function DB_load(callback) {
    chrome.storage.local.get(ExtensionDataName, function(r) {
        if (isEmpty(r[ExtensionDataName])) {
            DB_setValue(ExtensionDataName, ExtensionData, callback);
        } else if (r[ExtensionDataName].dataVersion != ExtensionData.dataVersion) {
            DB_setValue(ExtensionDataName, ExtensionData, callback);
        } else {
            ExtensionData = r[ExtensionDataName];
            callback();
        }
    });
}

function DB_clear(callback) {
    chrome.storage.local.remove(ExtensionDataName, function() {
        if(callback) callback();
    });
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function DB_setValue(name, value, callback) {
    var obj = {};
    obj[name] = value;
    //alert("Data Saved!");
    chrome.storage.local.set(obj, function() {
        if(callback) callback();
    });
}

function DB_save(callback) {
    DB_setValue(ExtensionDataName, ExtensionData, function() {
        if(callback) callback();
    });
}

function saveData(id, value)
{
  DB_load(function() {
    ExtensionData.commands.push({id: id, name: value, time: new Date().getMilliseconds()});
    DB_save();  
  });
}

  ////////////
 // EVENTS //
////////////

window.onload = function()
{
  DB_load(); 
}

// Listen to special keys commands (e.g ALT+S)
chrome.commands.onCommand.addListener(function(command) 
{
	if (command == "screenshot")
	{
   	chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, 
      { format: "jpeg" , quality: 10 }, function(dataUrl) 
	  {
		  saveData("screenshot", dataUrl);
		});
  }
  else if (command == "startRecording")
  {
    startRecording();
  }
  else if (command == "stopRecording")
  {
    stopRecording();
  }
});

// Listen to new tab opens
chrome.tabs.onCreated.addListener(function(tab) {
  saveData("newtab", "url: " + tab.url + " status: " + tab.status);
});

// //onUpdate tab state  - e.g: refresh, enter another address URL
// chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab) {
 

//   console.log(changeInfo.url.indexOf("chrome-extension://"));
//   console.log(changeInfo.url.indexOf("chrome://"));

//  // if((changeInfo.status == "complete") && !changeInfo.url.startWith("chrome-extension://") || !changeInfo.url.startWith("chrome://"))
//  //      saveData('refreshTab',"url: " + tab.url + " status: " + tab.status);

// });

// Listen for messages from content script
chrome.runtime.onConnect.addListener(function(port) {

  port.onMessage.addListener(function(msg) {

    if (msg.type == "load")
    {
      DB_load(function() { port.postMessage({type: "refreshData", data: ExtensionData}); });
    }
    else if (msg.type == "stopRecording")
    {
      stopRecording();
      // Tell client to reset data
      port.postMessage({type: "initClient"});
    }
    else if (msg.type == "pauseRecording")
    {
      changeRecordingStatus("pause");
    }
    else if (msg.type == "startRecording")
    {
      startRecording();
    }
    else if (msg.type == "clearData")
    {
      clearData();
    }

  });
  
});


function changeRecordingStatus(status)
{
  ExtensionData.appStatus = status;  

  if (status == "stop" || status == "pause")
    clearInterval(timeInterval);

  DB_save();
}

function startRecording()
{
  changeRecordingStatus("play");

  timeInterval = 
    setInterval(function() {
      chrome.browserAction.setBadgeText({ text: recordingTime.toString() });
      recordingTime++;
    }, second);

  chrome.tabs.getSelected(null, function(tab) {
    // Save the tab url
    saveData("url", tab.url);
    // Reload tab to make sure the content
    // script will be injected
    chrome.tabs.reload(tab.id);
  });
}

function stopRecording()
{
  changeRecordingStatus("stop");
  resetTimeCounter();
  generateScript();
}

function startSimulation(script, startingUrl)
{
  chrome.tabs.create({ url: startingUrl, active: false }, function(tab) 
  {    
    chrome.tabs.update(tab.id, { active: true });
    // Inject script to url
    chrome.tabs.executeScript( tab.id, {code: script} );
  }); 
}

function resetTimeCounter()
{
  chrome.browserAction.setBadgeText({text: ""});
  recordingTime = 0;
}

function clearData()
{
  DB_clear(function() 
  { 
    //port.postMessage({type: "initClient"});
    ExtensionData.commands = []; 
  });
}

// Generates a script from all saved commands
// and injects it to the new tab to start simulation
function generateScript()
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
    clearData();

    if (numOfCommands > 1)
        startSimulation(script, startingUrl);
}