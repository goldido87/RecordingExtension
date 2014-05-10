
// Storage data name
var ExtensionDataName = "persistentData";

// Holds the application commands
// Holds the application commands
var ExtensionData = {
  dataVersion: 4,
  isRecording: false,
  commands: []
};

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

document.addEventListener('click', function(event) {
  console.log("click " + event );
});

chrome.commands.onCommand.addListener(function(command) 
{
	if (command == "screenshot")
	{
   	chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, 
      { format: "jpeg" , quality: 8 }, function(dataUrl) 
	  {
		  saveData("screenshot", dataUrl);
      //console.log(dataUrl); 
		});
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  saveData("newtab", "url: " + tab.url + " status: " + tab.status);
});

window.onload = function()
{
  DB_load();
}

// Listen for messages from content script
chrome.runtime.onConnect.addListener(function(port) {

  port.onMessage.addListener(function(msg) {

    if (msg.type == "load")
    {
      DB_load(function() {
        port.postMessage({type: "refreshData", data: ExtensionData});
      });
    }
    else if (msg.type == "startSimulation")
    {
      var script = msg.detail;
      alert(script);

      chrome.tabs.create({ url: msg.url, active: false }, function(tab) 
      {    
        chrome.tabs.update(tab.id, { active:true });
        // Inject script to url
        chrome.tabs.executeScript( tab.id, {code: script} );
      });  

      port.postMessage({type: "initClient"});
    }
    else if (msg.type == "isRecording_Changed")
    {
      ExtensionData.isRecording = !ExtensionData.isRecording;
      DB_save();
    }
    else if (msg.type == "startRecording")
    {
      chrome.tabs.getSelected(null, function(tab) {
        //chrome.tabs.executeScript(tab.id, { file: "scripts/eventsListener.js" });
        // Reload tab to make sure the content
        // script will be injected
        chrome.tabs.reload(tab.id);
        // Save the tab url
        saveData("url", tab.url);
      });
    }
    else if (msg.type == "clearData")
    {
      DB_clear(function() 
      { 
        port.postMessage({type: "initClient"});
        ExtensionData.commands = []; 
      });
    }
  });
});
