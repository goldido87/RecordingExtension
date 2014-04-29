// Listen to mouse clicks and
// save it in our local storage

var eventCount = 0;
var eventProperty = [];

var ExtensionDataName = "persistentData";

var ExtensionData = {
  dataVersion: 3, //if you want to set a new default data, you must update "dataVersion".
  commands: []
};


DB_load(function() { 
    var TrackMouse = function (mouseEvent) {
        eventProperty[eventCount++] = {
            id: mouseEvent.toElement.id,
            type: 'mouse',
            ts: Date.now(),
            x: mouseEvent.x,
            y: mouseEvent.y
        };

        var message = "Element id: " + eventProperty[eventCount - 1].id + 
        ", X: " + mouseEvent.x + ", Y: " + mouseEvent.y + "\n"

        saveData("click", message);
    }

    document.addEventListener('click', TrackMouse);

});

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
  ExtensionData.commands.push({id: id, name: value});
  DB_save();
}

    