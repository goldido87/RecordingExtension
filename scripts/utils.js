
function getImageElement(commandId)
{
    var img = document.createElement("img");
    

    switch(commandId)
    {
        case "screenshot": 
            img.src = "img/screenshot.png";
            break;

        case "click":
            img.src = "img/click.png";
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