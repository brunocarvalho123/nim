 //regista utilizador associado a senha
var g_game;
var g_nick;
var g_pass;
var g_rack;

function register(){
  var nick=document.getElementById('mp_name').value;
  var pass=document.getElementById('mp_pass').value;
  var xhr = new XMLHttpRequest();
  xhr.open("POST","http://yourserver:8033/register",true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert("Success!")
        JoinG();
        var json = JSON.parse(xhr.responseText);
        console.log(json);
      } else {
        alert("Username already in use!")
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify({ "nick": nick, "pass": pass}));
}

function join(){
  var group = document.getElementById('mp_group').value;
  var nick=document.getElementById('mp_name2').value;
  var pass=document.getElementById('mp_pass2').value;
  var size = document.getElementById('mp_range').value;
  var xhr = new XMLHttpRequest();
  xhr.open("POST","http://yourserver:8033/join",true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        g_game=json.game;
        g_nick=nick;
        g_pass=pass;
        Wait();
        update(nick, json.game);
        console.log(json);
      } else {
        var json = JSON.parse(xhr.responseText);
        alert(json.error);
        console.log(json);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify({"group": group, "nick": nick, "pass": pass, "size": size}));
}

//desistir de jogo não terminado
function leave(){
  var xhr = new XMLHttpRequest();
  xhr.open("POST","http://yourserver:8033/leave",true);

  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        g_nick=undefined;
        g_game=undefined;
        g_pass=undefined;
        g_rack=undefined;
        o_turn=undefined;
        var json = JSON.parse(xhr.responseText);
        console.log(json);
      } else {
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify({"nick": g_nick, "pass": g_pass, "game": g_game}));
}

//notifica servidor duma jogada
function notify(stack, pieces){
  var xhr = new XMLHttpRequest();
  xhr.open("POST","http://yourserver:8033/notify",true);

  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json);
      } else {
        var json = JSON.parse(xhr.responseText);
        alert(json.error);
        console.log(json);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify({"nick": g_nick, "pass": g_pass, "game": g_game, "stack": stack, "pieces": pieces}));
}

function update(nick, game){
  var eventSource = new EventSource("http://yourserver:8033/update?nick="+nick+"&game="+game);
  eventSource.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if(!data.error){
        console.log(data);
        if(data.rack !== undefined && data.stack == undefined){
          o_turn=data.turn;
          g_rack=data.rack;
          document.getElementById("turn_mp").style.color=("rgba(0, 0, 0, 1)");
          document.getElementById("turn_mp").style.webkitTextStroke=("0.5px #fcff96");
          document.getElementById("turn_mp2").style.color=("rgba(0, 0, 0, 1)");
          document.getElementById("turn_mp2").style.webkitTextStroke=("0.5px #fcff96");
          document.getElementById("turn_mp").innerHTML=o_turn;
          toGame(data.rack.length);
        }
        if(data.rack !== undefined && data.stack !== undefined){
          o_turn=data.turn;
          document.getElementById("turn_mp").innerHTML=o_turn;
          var init = g_rack[data.stack];
          g_rack=data.rack;
    			var change = init-g_rack[data.stack];
          updateRack(g_rack);
    			makePlay(data.stack, change);
        }
        if(data.winner !== undefined){
          eventSource.close();
          alert("winner: "+data.winner);
          g_nick=undefined;
          g_game=undefined;
          g_pass=undefined;
          g_rack=undefined;
          o_turn=undefined;
          BackFromBoard();
        }
    }
    else{
        console.log(JSON.stringify(data));
    }
  }
}

//retorna tabela classificativa
function ranking(size){
  var xhr = new XMLHttpRequest();
  xhr.open("POST","http://yourserver:8033/ranking",true);

  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        var tabela = document.getElementById("table_mp");
        var tr_i = document.createElement("tr");
        var th_1 = document.createElement("th");
        var th_2 = document.createElement("th");
        var th_3 = document.createElement("th");
        var th_4 = document.createElement("th");
        th_1.innerHTML="Rank";
        th_2.innerHTML="Nick";
        th_3.innerHTML="Wins";
        th_4.innerHTML="Games";
        tr_i.appendChild(th_1);
        tr_i.appendChild(th_2);
        tr_i.appendChild(th_3);
        tr_i.appendChild(th_4);
        tabela.appendChild(tr_i);
        for(var i=0; i<json.ranking.length; i++){
          var j = i+1;
          var row = document.createElement("tr");
          var td_r = document.createElement("td");
          var td_n = document.createElement("td");
          var td_w = document.createElement("td");
          var td_g = document.createElement("td");
          td_r.innerHTML=j;
          td_n.innerHTML=json.ranking[i].nick;
          td_w.innerHTML=json.ranking[i].victories;
          td_g.innerHTML=json.ranking[i].games;
          row.appendChild(td_r);
          row.appendChild(td_n);
          row.appendChild(td_w);
          row.appendChild(td_g);
          tabela.appendChild(row);
        }
        console.log(json);
      } else {
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify({"size": size}));
}

function mp_rank(){
  var size = prompt("Size:");
  if(size>=3 && size<=10){
    document.getElementById("authentification").style.display= "none";
    document.getElementById("mpRank").style.display="block";
    ranking(size);
  }
  else alert("Error! invalid size!");
}

function clear(){
  var data = [{ "rows":[4,5,6,7,8,9,10], "player": [0,0,0,0,0,0,0], "com": [0,0,0,0,0,0,0] }];
  localStorage.setItem("data",JSON.stringify(data));
}
