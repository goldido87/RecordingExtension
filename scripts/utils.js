
function getImageElement(commandId)
{
    var img = document.createElement("img");

    switch(commandId)
    {
    	case "url":
    		img.src = "img/play.png";
    		break;

        case "screenshot": 
            img.src = "img/screenshot.png";
            break;

        case "click":
        case "click_a":
        case "click_input_text":
        case "click_input_submit":
            img.src = "img/click.png";
            break;

        case "rightclick":
            img.src = "img/rightclick.png"
            break;

        case "keyboard":
            img.src = "img/keyboard.png";
            break;

        case "newtab":
            img.src = "img/newtab.png";
            break;

        case "scroll":
            img.src = "img/scroll.png";
            break;

        case "refreshTab":
            img.src = "img/refresh.png";
            break;

        case "newURLSearch":
            img.src = "img/NewURLSearch.png";
            break;

    }

    return img;
}

function getListNameByEvent(commandId)
{
    switch(commandId)
    {
        case "screenshot": 
            return "photosEventsList";

        case "click":
            return "mouseEventsList";

        case "keyboard":
            return "keyboardEventsList";

        case "newtab":
            return "mouseEventsList";

        case "scroll":
            return "mouseEventsList";
    }
}

function changeBackground(element)
{
    $("#playBtn").css('background-color', '#051D3F');
    $("#stopBtn").css('background-color', '#051D3F');
    $("#pauseBtn").css('background-color', '#051D3F');

    $("#" + element).css('background-color', '#0C4B90');
}

// Converts a given text to an html 
// bold text element 
function boldHTML(text) 
{
    var element = document.createElement("b");
    element.innerHTML = text;
    return element;
}

// Used for debugging, export all commands
// and write to console log
function exportCommands()
{
    var message = "Actions Summary:\n------------------\n\n";

    for (var i = 0; i < ExtensionData.commands.length; i++) 
    {
        message += ("#" + (i + 1) + " ");
        message += ("Type: " + ExtensionData.commands[i].id + "\n");
        message += ("Data: " + ExtensionData.commands[i].name + "\n");
        message += ("Time: " + new Date(ExtensionData.commands[i].time).getUTCFullYear() + "\n\n");
    }

    console.log(message);
}