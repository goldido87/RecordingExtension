
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

function saveRecording(script, startingUrl, captureUrl, recordingLength)
{
  DB_load(function() {

    ExtensionData.recordings.push({id: ExtensionData.recordingId++,
                                   startingUrl: startingUrl,
                                   capture: captureUrl,
                                   script: script,
                                   length: recordingLength,
                                   time: getCurrentDate()
                                 });

    DB_save();  
  });
}

  ////////////
 // EVENTS //
////////////

window.onload = function()
{
  ExtensionLoaded();
}

function ExtensionLoaded()
{
  DB_load(setExtensionIcon());
}

function setExtensionIcon()
{
  var iconImage;

  switch (ExtensionData.appStatus)
  {
    case "play":
      iconImage = "img/stop.png";
      break;

    default:
      iconImage = "img/record.png"
  }

  chrome.tabs.getSelected(null, function(tab) {
    // Change extension icon
    chrome.browserAction.setIcon({path: iconImage, tabId: tab.id});
  });
  
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
  else if (command == "startRecording") // ALT + R
  {
    startRecording();
  }
  else if (command == "stopRecording")  // ALT + S
  {
    // Load all data that has been 
    // saved during the recording
    DB_load(function() { stopRecording(); });
  }
  else if (command == "pauseRecording") // ALT + P
  {
    changeRecordingStatus("pause");
  }
});

// Listen to new tab opens
chrome.tabs.onCreated.addListener(function(tab) {
  saveData("newtab", "url: " + tab.url + " status: " + tab.status);
});

// //onUpdate tab state  - e.g: refresh, enter another address URL
 chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab) {

  // No change in the url means that it's a refresh
  if (changeInfo.url === undefined)
  {
    ExtensionLoaded();
  }
//   console.log(changeInfo.url.indexOf("chrome-extension://"));
//   console.log(changeInfo.url.indexOf("chrome://"));

//  // if((changeInfo.status == "complete") && !changeInfo.url.startWith("chrome-extension://") || !changeInfo.url.startWith("chrome://"))
//  //      saveData('refreshTab',"url: " + tab.url + " status: " + tab.status);

 });

// Listen for messages from content script
chrome.runtime.onConnect.addListener(function(port) {

  port.onMessage.addListener(function(msg) {

    if (msg.type == "load")
    {
      DB_load(function() { port.postMessage({type: "refreshData", data: ExtensionData}); });
    }
    else if (msg.type == "deleteRecording")
    {
      ExtensionData.recordings.splice(msg.index, 1);
      DB_save(function() { port.postMessage({type: "refreshData", data: ExtensionData}); }); 
    }
    else if (msg.type == "playRecording")
    {
      var recording = getRecordById(msg.index);
      startSimulation(recording.script, recording.startingUrl);
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
      port.postMessage({type: "initClient"}); 
    }
  });
});

function getRecordById(id)
{
  for (var i = 0; i < ExtensionData.recordings.length; i++)
  {
    var record = ExtensionData.recordings[i];

    if (record.id == id)
    {
      return record;
    }
  }
}

function changeRecordingStatus(status)
{
  ExtensionData.appStatus = status;  

  if (status == "stop" || status == "pause")
    clearInterval(timeInterval);

  DB_save();
}

function startRecording()
{
  // check that not already recording
  if (ExtensionData.appStatus == "play")
    return;

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
  setExtensionIcon();
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
    changeRecordingStatus("stop");
    resetTimeCounter();
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
                break;

            case "scroll":
                var coords = command.name.split(",");
                action = "window.scrollTo(" + coords[0] + "," + coords[1] + ");";
                break;

            case "keyboard":
                action = command.name;
                /*else
                {
                    action = "alert('Key pressed: " + command.name + "');";
                }*/
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
    // Close document.ready
    script += "});";

    var recordingLength = formatRecordingLength();
    // When the script is ready
    // we can clear all data
    clearData();

    if (numOfCommands > 1)
    {
      chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, 
        { format: "jpeg" , quality: 10 }, function(dataUrl) 
      {
        saveRecording(script ,startingUrl, dataUrl, recordingLength);
      });
      //startSimulation(script, startingUrl);
    }
}

function getCurrentDate()
{
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  return mm+'/'+dd+'/'+yyyy;
}

function formatRecordingLength()
{
  var minutes = Math.floor(recordingTime / 60);
  var seconds = recordingTime - (minutes * 60); 
  
  if(minutes<10) {
      minutes='0'+minutes
  } 

  if(seconds<10) {
      seconds='0'+seconds
  }

  return minutes + ":" + seconds;
}