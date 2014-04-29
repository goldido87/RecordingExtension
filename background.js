var ExtensionDataName = "persistentData";
var ExtensionData = {
  dataVersion: 3, //if you want to set a new default data, you must update "dataVersion".
  commands: []
};

function DB_setValue(name, value, callback) {
    var obj = {};
    obj[name] = value;
    alert("Data Saved!");
    chrome.storage.local.set(obj, function() {
        if(callback) callback();
    });
}

function DB_save(callback) {
    DB_setValue(ExtensionDataName, ExtensionData, function() {
        if(callback) callback();
    });
}


  ////////////
 // EVENTS //
////////////

chrome.commands.onCommand.addListener(function(command) {
		if (command == "screenshot")
		{
			alert("got command");
	   		chrome.tabs.captureVisibleTab(
		      function(dataUrl) 
		      {
			  	ExtensionData.commands.push({id: "ScreenShot", name: dataUrl});
    			DB_save();
			});
	   	}
});


