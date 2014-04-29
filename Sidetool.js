var ExtensionDataName = "persistentData";
var ExtensionData = {
  dataVersion: 3, //if you want to set a new default data, you must update "dataVersion".
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


  ////////////
 // EVENTS //
////////////

/*chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.screenshot == "hello"){
    var1 = request.var1;
    console.log(var1);
    
    //ExtensionData.commands.push({id: "ScreenShot", name: var1});
    //DB_save();

  }
  else{
    sendResponse({});    // Stop
  }
});*/

$("document").ready(function() 
{
    // Load data on page load
    DB_load(function() 
    {
        var list = document.getElementById('photosList');

        for (var i = 0; i < ExtensionData.commands.length; i++) 
        {
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(ExtensionData.commands[i].name));
            list.appendChild(entry);
        } 
  });
});

/*function clear()
{
    DB_clear();
    var list = document.getElementById('photosList');
    list.parentNode.removeChild(elem);
}*/



