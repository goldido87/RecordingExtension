// Listen to mouse clicks and save 
// it in our local storage.
// Loads storage handling functions

// Events currently saved: 
// ----------------------
// * mouse clicks 
// * keyboard types
// * scrolling
// * Alt + S takes a photo
// * new tab opens
// ----------------------

  /////////////
 // STORAGE //
/////////////

var eventCount = 0;
var eventProperty = [];

var ExtensionDataName = "persistentData";

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
        if (ExtensionData.isRecording)
        {
            ExtensionData.commands.push({id: id, name: value, time: new Date().getMilliseconds()});
            DB_save();
        }  
    });
}

  ////////////
 // EVENTS //
////////////

DB_load(function() 
{ 
    var TrackMouse = function (mouseEvent)
    {
        eventProperty[eventCount++] = {
            id: mouseEvent.toElement.id,
            type: 'mouse',
            ts: Date.now(),
            x: mouseEvent.x,
            y: mouseEvent.y
        };

        // This condition let us catch only click events
        // that were made on actual page elements
        if (eventProperty[eventCount - 1].id.length > 0)
        {
            var message = eventProperty[eventCount - 1].id;

            saveData("click", message);
        }
    }

    // Listen to keyboard events
    document.onkeyup = keyPressed;
    // Listen to mouse click events
    document.addEventListener('click', TrackMouse); //left click
    document.addEventListener('contextmenu',rightClickEvent);   //right click
    //Listen to scroll document 
    window.addEventListener('scroll',scrollFunction);

});

function scrollFunction(mouseEvent) {
    //alert(mouseEvent);
    saveData("scroll", window.pageXOffset + "," + window.pageYOffset);
}


function rightClickEvent(mouseEvent) 
{
    saveData("rightclick","X: " + mouseEvent.x + ", Y: " + mouseEvent.y);
    console.log("right click" +  "X: " + mouseEvent.x + ", Y: " + mouseEvent.y);
}

function keyPressed(e)
{
    var key = ( window.event ) ? event.keyCode : e.keyCode;
     
    /*switch( key )
    {
      case 16:
        //alert( "Shift Key!" );
    }*/

    saveData("keyboard", key);
}
