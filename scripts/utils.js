
function getImageElement(commantId)
{
    var img = document.createElement("img");
    

    switch(commantId)
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