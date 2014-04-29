var ExtensionDataName = "persistentData";
var ExtensionData = {
  dataVersion: 3, //if you want to set a new default data, you must update "dataVersion".
  commands: []
};


//default data
/*ExtensionData.commands.push(
    {id: "1325848", name: "village1"},
    {id: "8744351", name: "village2"},
    {id: "8952187", name: "village3"}
);*/

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
    DB_load(function() {
        //YOUR MAIN CODE WILL BE HERE
        //alert(ExtensionData);
        /*console.log(ExtensionData.commands); //array of villages
        console.log(ExtensionData.commands[0]); //first village object
        console.log(ExtensionData.commands[0].id); //first village id
        console.log(ExtensionData.commands[0].name); //first village name*/
       

        //HOW TO ITERATE commands
        var list = document.getElementById('photosList');

        for (var i = 0; i < ExtensionData.commands.length; i++) 
        {
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(ExtensionData.commands[i].name));
            list.appendChild(entry);
        } 
  });
});



