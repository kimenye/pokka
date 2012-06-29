$(function(){
var i = 0;
$("div.card").click(function(){
$(this)
.animate({left: 15+"%", marginTop: 2+"em"},500, "easeOutBack",function(){i--;$(this).css("z-index", i)})
.animate({left: 38+"%", marginTop: 0+"em"},500, "easeOutBack");
});
});
