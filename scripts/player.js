
var screenWidth = 1250;

// Temp data for testing
var event1 = { id: "click", name: "value1", time: 162 };
var event2 = { id: "click", name: "value2", time: 44200 };
var event3 = { id: "click", name: "value3", time: 88520 };
var event4 = { id: "keyboard", name: "value3", time: 122200 };
var event5 = { id: "keyboard", name: "value4", time: 132310 };
var event6 = { id: "screenshot", name: "value3", time: 222020 };
var event7 = { id: "screenshot", name: "value5", time: 232200 };
var event8 = { id: "click", name: "value5", time: 272200 };

var mouseEvents = [ event1, event2, event3, event4, event5, event6, event7, event8 ];


$("document").ready(function() 
{
	// Sort the commands cy thier creation time.
	// Check if redundant because commands are saved
	// in the order they are created ?
	//mouseEvents.sort(function(a, b) { return (a.time - b.time) });
	
	initTimeline(mouseEvents); 
});

function initTimeline(sourceList)
{									
	var endPoint = mouseEvents[mouseEvents.length - 1].time; 

    // Append loaded commands to list
    for (var i = 0; i < sourceList.length; i++) 
    {
    	var commandType = sourceList[i].id;
    	var list = document.getElementById(getListNameByEvent(commandType));
        var entry = document.createElement('li');

        // Calculate each item position on the timeline 
        // according to it's creation time 
        var timelineOffset = ((sourceList[i].time / endPoint) * screenWidth);
        
        // Set the offset
        entry.style.cssText = "margin-left:" + timelineOffset + "px; position:absolute";

        var image = getImageElement(commandType);

		image.width = 20;
        image.height = 20;

        entry.appendChild(image);

        list.appendChild(entry);

        //list.appendChild(document.createElement('hr'));
    } 
}

