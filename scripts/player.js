
// Temp data for testing
var event1 = { id: "click", name: "value1", time: new Date().getMilliseconds() };
var event2 = { id: "click", name: "value2", time: new Date().getMilliseconds() };
var event3 = { id: "click", name: "value3", time: new Date().getMilliseconds() };
var event4 = { id: "keyboard", name: "value3", time: new Date().getMilliseconds() };
var event5 = { id: "keyboard", name: "value4", time: new Date().getMilliseconds() };
var event6 = { id: "screenshot", name: "value3", time: new Date().getMilliseconds() };
var event7 = { id: "screenshot", name: "value5", time: new Date().getMilliseconds() };

var mouseEvents = [ event1, event2, event3, event4, event5, event6, event7 ];


$("document").ready(function() 
{
	// Sort the commands cy thier creation time.
	// Check if redundant because commands are saved
	// in he order they are created ?
	mouseEvents.sort(function(a, b) { return a.time - b.time});
	
	initTimeline(mouseEvents); 
});

function initTimeline(sourceList)
{										 
    // Append loaded commands to list
    for (var i = 0; i < sourceList.length; i++) 
    {
    	var commandType = sourceList[i].id;
    	var list = document.getElementById(getListNameByEvent(commandType));
        var entry = document.createElement('li');

        var image = getImageElement(commandType);

		image.width = 20;
        image.height = 20;

        entry.appendChild(image);

        list.appendChild(entry);

        //list.appendChild(document.createElement('hr'));
    } 
}

