
window.onload = randomCharacter;

var charList = [],
index = 0;
charList[0] = "<div class='randomavi' style='background: url(/blobert/goop1.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Blovert</a></h2>"; //Blobert upside down//
charList[1] = "<div class='randomavi' style='background: url(/blobert/goop2.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Huh</a></h2>"; //question_mark
charList[2] = "<div class='randomavi' style='background: url(/blobert/goop3.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Uhhh</a></h2>"; //question_mark 2
charList[3] = "<div class='randomavi' style='background: url(/blobert/goop4.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Sillyr</a></h2>"; //Retarted            
charList[4] = "<div class='randomavi' style='background: url(/blobert/goop5.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Ibuprofen?</a></h2>"; //smashed
charList[5] = "<div class='randomavi' style='background: url(/blobert/goop6.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Even his ahh wierded tf out</a></h2>"; //cup
charList[6] = "<div class='randomavi' style='background: url(/blobert/goop7.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>fuckass cat</a></h2>"; //fuckass cat
charList[7] = "<div class='randomavi' style='background: url(/blobert/goop8.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Dead</a></h2>"; //dead
charList[8] = "<div class='randomavi' style='background: url(/blobert/goop9.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>...Poetyr.</a></h2>"; //writing
charList[9] = "<div class='randomavi' style='background: url(/blobert/goop10.png) center/cover no-repeat;'></div><h2><a href='https://edelith.org/characters/blobert/'>Absolute Slinema</a></h2>"; //sliinema

function randomCharacter() {
     var randomNum = Math.floor(Math.random() * charList.length);
     document.getElementById("randomizer").innerHTML = charList[randomNum];
}
