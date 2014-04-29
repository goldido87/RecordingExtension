var ExtensionDataName = "persistentData";

var ExtensionData = {
  dataVersion: 3, //if you want to set a new default data, you must update "dataVersion".
  commands: []
};

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

function saveData(value)
{
  ExtensionData.commands.push({id: "ScreenShot", name: value});
  DB_save();
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
		alert("got command");
   	chrome.tabs.captureVisibleTab(function(dataUrl) 
	  {
		  saveData(dataUrl); 
		});
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url != undefined)
  {
    //saveData(changeInfo.status + " URL: " + changeInfo.url);
  }
});

var context_id = -1;
      
chrome.input.ime.onFocus.addListener(function(context) {
  context_id = context.contextID;
});

chrome.input.ime.onKeyEvent.addListener(
  function(engineID, keyData) {
    if (keyData.type == "keydown" && keyData.key.match(/^[a-z]$/)) {
      chrome.input.ime.commitText({"contextID": context_id,
                                   "text": keyData.key.toUpperCase()});
      return true;
    } else {
      return false;
    }
  });

