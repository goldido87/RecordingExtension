
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