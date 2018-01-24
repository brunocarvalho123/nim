function Home() {
	document.getElementById("h").style.height= "190px";
	document.getElementById("menuoptions").style.display= "block";
	document.getElementById("authentification").style.display = "none";
	document.getElementById("d1").style.display = "none";
	document.getElementById("instructions").style.display = "none";
	document.getElementById("setting").style.display= "none";
	document.getElementById("scores").style.display= "none";
	document.getElementById("helpB").style.display = "none";
}

function BackFromBoard() {
	document.getElementById("h").style.height= "190px";
	document.getElementById("menuoptions").style.display= "block";
	document.getElementById("d1").style.display = "none";
	document.getElementById("helpB").style.display = "none";
	if(online==1){
		online=0;
		leave();
	}
	else decrScore();
}

function Authent() {
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("authentification").style.display = "block";
}

function Oneplayer(){
	document.getElementById("turn_mp").style.color=("rgba(0, 0, 0, 0)");
	document.getElementById("turn_mp").style.webkitTextStroke=("0px #fcff96");
	document.getElementById("turn_mp2").style.color=("rgba(0, 0, 0, 0)");
	document.getElementById("turn_mp2").style.webkitTextStroke=("0px #fcff96");
	document.getElementById("h").style.height= "100px";
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("d1").style.display = "block";
	document.getElementById("helpB").style.display = "block";
}

function Settings(){
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("setting").style.display = "block";
}

function Help(){
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("instructions").style.display = "block";
}

function Help2(){
	document.getElementById("instructions2").style.display = "block";
}

function TwoPlayers(){
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("multiplayer").style.display = "block";
}

function JoinG(){
	document.getElementById("authentification").style.display= "none";
	document.getElementById("joing").style.display = "block";
}

function Wait(){
	document.getElementById("joing").style.display= "none";
	document.getElementById("wait").style.display = "block";
}

function LeaveWait(){
	document.getElementById("wait").style.display= "none";
	leave();
}

function toGame(size){
	settings2(size);
	document.getElementById("h").style.height= "100px";
	document.getElementById("wait").style.display= "none";
	document.getElementById("d1").style.display = "block";
	document.getElementById("helpB").style.display = "block";
}

function BackFromAutentification(){
	document.getElementById("authentification").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function BackFromJoin(){
	document.getElementById("joing").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function BackFromMPRank(){
	var no_table = document.getElementById("table_mp");
	while (no_table.firstChild) {
    no_table.removeChild(no_table.firstChild);
	}
	document.getElementById("mpRank").style.display= "none";
	document.getElementById("authentification").style.display = "block";
}

function GoBack(){
	document.getElementById("instructions").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function GoBack2(){
	document.getElementById("instructions2").style.display= "none";
}

function Scores(){
	var data  = JSON.parse(localStorage.getItem("data"));
	for(var i=0; i<7; i++){
		var num = data[0].com[i];
		var j = i+4;
		document.getElementById("b"+j).innerHTML = num;
		var num2=data[0].player[i];
		document.getElementById("u"+j).innerHTML = num2;
	}
	document.getElementById("menuoptions").style.display= "none";
	document.getElementById("scores").style.display = "block";
}

function BackFromSettings(){
	document.getElementById("setting").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function BackFromScore(){
	document.getElementById("scores").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function updateTextInput1(val) {
    document.getElementById('textInput1').value=val;
 }
 function updateTextInputj(val) {
     document.getElementById('textInputj').value=val;
  }
function updateTextInput2(val) {
    document.getElementById('textInput2').value=val;
 }
