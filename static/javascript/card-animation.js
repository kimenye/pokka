// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

var card_value = ['1C','2C','3C','4C','5C','6C','7C','8C','1H','2H','3H','4H','5H','6H','7H','8H'];

// set default positions
var card_left = [];
var card_top = [];

for(var i=0; i < 16; i++) {
    card_left[i] = 70 + 100 * (i%4);
    card_top[i] = 15 + 120 * Math.floor(i/4);
}

var started = false;
var cards_turned = 0;
var matches_found = 0;
var card1 = false;
var card2 = false;

function moveToPlace(id)
{
    var el = document.getElementById("card_" + id);
    el.style["zIndex"] = 1000;
    el.style["left"] = card_left[id] + "px";
    el.style["top"] = card_top[id] + "px";
    el.style["WebkitTransform"] = "rotate(180deg)";
    el.style["zIndex"] = 0;
}

function hideCard(id)
{
    var el = document.getElementById("card_" + id);
    el.firstChild.src = "/images/cards/back.png";
    el.style["WebkitTransform"] = "scale(1.0) rotate(180deg)";
    el.style["MozTransform"] = "scale(1.0)";
    el.style["OTransform"] = "scale(1.0)";
    el.style["msTransform"] = "scale(1.0)";
}

function moveToPack(id)
{
    hideCard(id);
    var el = document.getElementById("card_" + id);
    el.style["zIndex"] = 1000;
    el.style["left"] = "-140px";
    el.style["top"] = "100px";
    el.style["WebkitTransform"] = "rotate(0deg)";
    el.style["zIndex"] = 0;
}

// flip over card and check for match
function showCard(id)
{
    if(id === card1) return;
    var el = document.getElementById("card_" + id);
    el.firstChild.src = "/images/cards/" + card_value[id] + ".png";
    el.style["WebkitTransform"] = "scale(1.2) rotate(185deg)";
    el.style["MozTransform"] = "scale(1.2)";
    el.style["OTransform"] = "scale(1.2)";
    el.style["msTransform"] = "scale(1.2)";
    if(++cards_turned == 2) {
        card2 = id;
        // check whether both cards have the same value
        if(parseInt(card_value[card1]) == parseInt(card_value[card2])) {
            setTimeout("moveToPack(" + card1 + "); moveToPack(" + card2 + ");", 1000);
            if(++matches_found == 8) {
                // game over
                matches_found = 0;
                started = false;
            }
        } else {
            setTimeout("hideCard(" + card1 + "); hideCard(" + card2 + ");", 800);
        }
        card1 = card2 = false;
        cards_turned = 0;
    } else {
        card1 = id;
    }
}

function cardClick(id)
{
    if(started) {
        showCard(id);
    } else {
        // shuffle and deal cards
        card_value.sort(function() { return Math.round(Math.random()) - 0.5; });
        for(i=0; i < 16; i++) setTimeout("moveToPlace(" + i + ")", i * 100);
        started = true;
    }
}