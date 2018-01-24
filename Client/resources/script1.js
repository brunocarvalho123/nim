var board;
var sizeT=7;	//min=4 max=10
var level=2;	//3=hard 2=medium 1=easy
var first=1;	//1=player 0=bot
var ai_active=1; //1=1v1 0=local mp
var online=0;
var turn=0;
var o_turn;
var pr=0;

function card() {
	var card = document.createElement("img");
	card.src="https://i.gyazo.com/e360fcbd27071dfcbf0e200cb5600c4b.png";
	card.alt="Erro";
	card.className ="match";
	card.height = "100%";

	card.onmouseover = function(event){
		var c = 1;
		card.src="https://i.gyazo.com/fc7ba57aaa6d5e09454762bfae3edbbd.png";
		var ce = card.parentElement.childElementCount;

		while( (card = card.nextSibling) != null ){
			card.src="https://i.gyazo.com/fc7ba57aaa6d5e09454762bfae3edbbd.png";
			c++;
		}
		card = document.getElementById('d1').children[ce-1].children[ce-c]
	}

	card.onmouseout = function(event){
		var c = 1;
		card.src="https://i.gyazo.com/e360fcbd27071dfcbf0e200cb5600c4b.png";
		var ce = card.parentElement.childElementCount;

		while( (card = card.nextSibling) != null ){
			card.src="https://i.gyazo.com/e360fcbd27071dfcbf0e200cb5600c4b.png";
			c++;
		}
		card = document.getElementById('d1').children[ce-1].children[ce-c]
	}

	card.onclick = function(event){
		if(o_turn==g_nick){
			var ce = card.parentElement.childElementCount;
			var c = 0;

			if(turn==0 && ai_active==0) turn = 1;
			else if(turn==1) turn = 0;

			if(!isHidden(card)){
				card.style.display = 'none';
				c++;
			}
			while( (card = card.nextSibling) != null ){
				if(!isHidden(card)){
					card.style.display = 'none';
					c++;
				}
			}
			card = document.getElementById('d1').children[ce-1].children[ce-c]
			var temp = board[ce-1];
			board[ce-1]=temp-c;
			var sum=0;
			for(var i=0; i<board.length; i++){
				sum=sum+board[i];
			}
			if(sum===0 && online ==0){
				var size=board.length;
				if(turn==0){
					alert(document.getElementById("user1").innerHTML + " Wins!");
					//update the score board
					var data  = JSON.parse(localStorage.getItem("data"));
					var num=data[0].player[size-4];
					num++;
					data[0].player[size-4]=num;
					localStorage.setItem("data",JSON.stringify(data));
					setup();
				}
				else if(turn==1){
					alert(document.getElementById("user2").innerHTML + " Wins!");
					//update the score board
					var data  = JSON.parse(localStorage.getItem("data"));
					var num=data[0].com[size-4];
					num++;
					data[0].com[size-4]=num;
					localStorage.setItem("data",JSON.stringify(data));
					setup();
				}
			}
			else {
				if(ai_active==1 && online==0)
					botP();
			}
			if(online==1){
				notify(ce-1,temp-c);
			}
		}
		else alert("Not your turn to play!");
	}
	return card;
}

//Checks if current board is balanced
function eQui(boardB){
	var size = boardB.length;
	var sumA = new Array(4).fill(0);
	var ii=0;
	var i=0;
	while(i != 4){
		while(ii != size){
			sumA[i]=parseInt(boardB[ii][i])+sumA[i];
			ii++;
		}
		ii=0;
		i++;
	}
	for (var i = 0; i < 4; i++){
		if(sumA[i]%2!=0 && sumA[i] != 0)
			return i;
	}
	return -1;
}

function updateRack(rack){
	board=rack;
}

function makePlay(diff, change){
	var t1=0;
	var t2=0;
	while(t1<change){
		if(!isHidden(document.getElementById('d1').children[diff].children[t2])){
			document.getElementById('d1').children[diff].children[t2].src="https://i.gyazo.com/fc7ba57aaa6d5e09454762bfae3edbbd.png";
			t1++;
		}
		t2++;
	}
	stateChange(-1);
	function stateChange(newState) {
		setTimeout(function(){
			var t1=0;
			var t2=0;
			while(t1<change){
				if(!isHidden(document.getElementById('d1').children[diff].children[t2])){
					document.getElementById('d1').children[diff].children[t2].style.display = 'none';
					t1++;
				}
				t2++;
			}
    	}, 600);
	}
}

//Tries to make a perfect play if it cant plays randomly
function perfPlay(){
	var size =  board.length;
	var boardB = dec2bin(board);
	var val = eQui(boardB);
	var diff;
	var y=1;

	if(val != -1){
		for (var i = 0; i < size; i++){
			if(boardB[i][val] == 1){
				var row = board[i]-1;
				while(row >= 0){
					var tempB = new Array(size);
					for (var ii = 0; ii < size; ii++){
						if(ii==i) tempB[ii]=row;
						else tempB[ii]= board[ii];
					}
					var tempBin = dec2bin(tempB);
					var tempVal = eQui(tempBin);
					if (tempVal != -1);
					else{
						for (var ii = 0; ii < size; ii++){
							boardB[ii]= tempBin[ii];
						}
						diff=i;
						row=-1;
						y=0;
						i=size+1;
					}
					row--;
				}
			}
		}
		if(y==0){
			var init = board[diff];
			bin2dec(boardB);
			var change = init-board[diff];
			console.log("Not Random Play");
			makePlay(diff, change);
		}
		else randPlay();
	}
	else {
		randPlay();
	}
}

function randPlay(){
	console.log("Random Play");
	var size =  board.length;
	var rand = Math.floor((Math.random() * size) + 0);
	var lim = 20;
	while (board[rand] == 0 && lim > 0){
		rand = Math.floor((Math.random() * size) + 0);
		lim--;
	}
	var x1 = board[rand];
	var x2 = Math.floor((Math.random() * x1) + 1);
	board[rand] = board[rand] - x2;

	var t1=0;
	var t2=0;
	while(t1<x2){
		if(!isHidden(document.getElementById('d1').children[rand].children[t2])){
			document.getElementById('d1').children[rand].children[t2].src="https://i.gyazo.com/fc7ba57aaa6d5e09454762bfae3edbbd.png";
			t1++;
		}
		t2++;
	}
	stateChange(-1);
	function stateChange(newState) {
		setTimeout(function(){
			var t1=0;
			var t2=0;
			while(t1<x2){
				if(!isHidden(document.getElementById('d1').children[rand].children[t2])){
					document.getElementById('d1').children[rand].children[t2].style.display = 'none';
					t1++;
				}
				t2++;
			}
    	}, 600);
	}
}

function botP(){
	var size = board.length;
	if(level==1){
		randPlay();
	}
	else if (level==2){
		if(pr==0){
			randPlay();
			pr=1;
		}
		else{
			perfPlay();
			pr=0;
		}
	}
	else if(level==3){
		perfPlay();
	}
	var sum=0;
	for(var i=0; i<board.length; i++){
		sum=sum+board[i];
	}
	if(sum===0){
		stateChange(-1);
		function stateChange(newState) {
			setTimeout(function(){
				alert("You Lose!");
				setup();
			}, 700);
		}
		decrScore(); //update the score board
	}
}

function decrScore(){
	var size = board.length;
	var change= 0;
	for (var i=0; i<size; i++){
			if(board[i]!=i+1){
				change=1;
			}
	}
	if (change != 0){
		var data  = JSON.parse(localStorage.getItem("data"));
		var num=data[0].com[size-4];
		num++;
		data[0].com[size-4]=num;
		localStorage.setItem("data",JSON.stringify(data));
	}
}

//checks if object has its display property set to null
function isHidden(el) {
    return (el.offsetParent === null)
}

function div() {
	var div1 = document.createElement("div");
	div1.className ="r1";
	return div1;
}

function cleanBoard(size){
	var myNode = document.getElementById("d1");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	var mboard = new Array(size);
	for (var i = 0; i < size; i++)
	    mboard[i] = i+1;
	return mboard;
}

function makeBoard(size){
	var mboard = cleanBoard(size);
	for(var i=0; i<size; i++){
		var div1 = div();
		for (var j = 0; j < i+1; j++) {
		    var children = card();
		    div1.appendChild(children);
		};
		document.getElementById("d1").appendChild(div1);
	};
	if(size > 4){
		var divs = document.getElementsByClassName('r1');
		  for(var i=0; i<divs.length; i++) {
			  if(size==5){
				  divs[i].style.height = "20%";
			  }
			  else if(size>5 && size < 8){
				  divs[i].style.height = "14%";
			  }
			  else divs[i].style.height = "10%";
		  }
	}
	return mboard;
}

//decimal board to binary board
function dec2bin(board2){
	var size = board2.length;
	var bboard = new Array(size);
	for(var i=0; i<size; i++)
		bboard[i] = ("0000"+(board2[i] >>> 0).toString(2)).slice(-4);

	return bboard;
}

//binary board to decimal board
function bin2dec(bin){
	for(var i=0; i<board.length; i++){
		board[i] = parseInt(bin[i], 2);
	}
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

function settings(){
	online=0;
	level=document.getElementById('range2').value;
	if(document.getElementById('normalmode').checked){
		first=1;
	}
	else if(document.getElementById('insteadmode').checked){
		first=0;
	}
	if(document.getElementById('normalmode_ai').checked){
		ai_active=1;
 		document.getElementById("user1").innerHTML = "Player";
 		document.getElementById("user2").innerHTML = "Com";
	}
	else if(document.getElementById('insteadmode_ai').checked){
		ai_active=0;
 		document.getElementById("user1").innerHTML = "Player 1";
 		document.getElementById("user2").innerHTML = "Player 2";
	}
	sizeT = document.getElementById('range1').value;
	document.getElementById("setting").style.display= "none";
	document.getElementById("menuoptions").style.display = "block";
}

function settings2(size_temp){
	ai_active=0;
	online=1;
	sizeT = size_temp;
	setup();
}

function setup(){
	board = makeBoard(sizeT);
	if(ai_active==1)
		if(first==0) botP();
}

window.onload=function(){
	if(JSON.parse(localStorage.getItem("data"))==null)
		clear();
	setup();
}
