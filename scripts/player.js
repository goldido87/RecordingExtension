
// Temp data for testing
var event1 = { id: "click", name: "value1", time: new Date().getMilliseconds() };
var event2 = { id: "click", name: "value2", time: new Date().getMilliseconds() };
var event3 = { id: "click", name: "value3", time: new Date().getMilliseconds() };

var mouseEvents = [ event1, event2, event3 ];



$("document").ready(function() 
{
	initTimeline();
});

function initTimeline()
{										 
	 var list = document.getElementById('mouseEventsList');

    // Append loaded commands to list
    for (var i = 0; i < mouseEvents.length; i++) 
    {
        var entry = document.createElement('li');

        var image = getImageElement(mouseEvents[i].id);

		image.width = 20;
        image.height = 20;

        entry.appendChild(image);

        list.appendChild(entry);

        //list.appendChild(document.createElement('hr'));
    } 
}
