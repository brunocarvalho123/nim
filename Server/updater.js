var queue = [];
var crypto = require('crypto');
var fs = require('fs');

function newGame(t_hash, t_size){
  var game = {
    hash: t_hash,
    turn: 1,
    p1: undefined,
    p1_r: undefined,
    p2: undefined,
    p2_r: undefined,
    rack: [],
    timeout: undefined
  };
  for(var i=0; i<t_size; i++){
    game.rack[i]=i+1;
  }
  return game;
}

function updateRank(win, lose, size){
  fs.readFile("ranking.json",function(err,data) {
    if(!err) {
      var dados = JSON.parse(data.toString());
      var obj = dados['s'+size];
      if(obj!=undefined){
        var v_win=0;
        var v_lose=0;
        for(var i=0; i<obj.ranking.length; i++){
          if(obj.ranking[i].nick==win){
            obj.ranking[i].victories++;
            obj.ranking[i].games++;
            v_win=1;
          }
          else if(obj.ranking[i].nick==lose){
            obj.ranking[i].games++;
            v_lose=1;
          }
        }
        if(v_win==0){
          obj.ranking.push({nick:win,victories:1,games:1});
        }
        if(v_lose==0){
          obj.ranking.push({nick:lose,victories:0,games:1});
        }
        dados['s'+size]=obj;
      }
      else{
        var obj2 ={
      		ranking: [
      					{nick:win,victories:1,games:1},
      					{nick:lose,victories:0,games:1}
      					]
      	}
        dados['s'+size]=obj2
      }
      fs.writeFile("ranking.json",JSON.stringify(dados),function(err){
        if(err) throw err;
      });
    } else console.log(err);
  });
}

module.exports.remember = function(response, nick, game_hash) {
  var flag=0;
  for(var i=0; i<queue.length; i++){
    if(game_hash==queue[i].hash){
      if(queue[i].p1==undefined){
        queue[i].p1=nick;
        queue[i].p1_r=response;
        flag=1;
        break;
      }
      else{
        queue[i].p2=nick;
        queue[i].p2_r=response;
        queue[i].timeout= setTimeout(function() {
                            leave_game(queue[i].hash, queue[i].p1);
                          }, 120000);
        queue[i].p1_r.write("data: "+
          JSON.stringify({"rack": queue[i].rack, "turn": queue[i].p1})+"\n\n");
        queue[i].p2_r.write("data: "+
          JSON.stringify({"rack": queue[i].rack, "turn": queue[i].p1})+"\n\n");
        flag=1;
        break;
      }
    }
  }
  if(flag==0){
    response.write("data: "+JSON.stringify({"error": "Invalid game reference"})+"\n\n");
    response.end();
  }
}

module.exports.forget = function(response) {
  for(var i=0; i<queue.length; i++){
    if(queue[i].p1_r == response || queue[i].p2_r == response){
      clearTimeout(queue[i].timeout);
      queue.splice(i,1);
      break;
    }
  }
}

module.exports.play = function(response, nick, game_hash, stack, pieces) {
  var flag=0;
  for(var i=0; i<queue.length; i++){
    if(game_hash==queue[i].hash){
      var turn;
      var turn2;
      if(queue[i].turn == 1){
        turn = queue[i].p1;
        turn2 = queue[i].p2;
        queue[i].turn=2;
      }
      else{
        turn = queue[i].p2;
        turn2 = queue[i].p1;
        queue[i].turn=1;
      }
      if(turn==nick){
        if(pieces>-1 && stack>-1){
          queue[i].rack[stack]=pieces;
          var nowin=0;
          for(var ii=0; ii<queue[i].rack.length; ii++){
            if(queue[i].rack[ii]>0){
              nowin=1;
              break;
            }
          }
          if(nowin==1){
            clearTimeout(queue[i].timeout);
            queue[i].p1_r.write("data: "+
              JSON.stringify({"rack": queue[i].rack, "turn": turn2,
                "stack": stack, "pieces": pieces})+"\n\n");
            queue[i].p2_r.write("data: "+
              JSON.stringify({"rack": queue[i].rack, "turn": turn2,
                "stack": stack, "pieces": pieces})+"\n\n");
                queue[i].timeout= setTimeout(function() {
                                    leave_game(queue[i].hash, turn2);
                                  }, 120000);
          }else{
            clearTimeout(queue[i].timeout);
            updateRank(turn, turn2, queue[i].rack.length);
            queue[i].p1_r.write("data: "+
              JSON.stringify({"winner": turn, "rack": queue[i].rack,
                "stack" : stack, "pieces": pieces})+"\n\n");
            queue[i].p2_r.write("data: "+
              JSON.stringify({"winner": turn, "rack": queue[i].rack,
                "stack" : stack, "pieces": pieces})+"\n\n");
          }
        }
        else{
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Stack cannot have a negative number of pieces"}));
        }
      }
      else{
        response.writeHead(400, {'Content-Type': "application/json"});
        response.end(JSON.stringify({"error": "Not your turn to play!"}));
      }
      flag=1;
      break;
    }
  }
  if(flag==0){
    response.writeHead(400, {'Content-Type': "application/json"});
    response.end(JSON.stringify({"error": "Invalid game reference"}));
  }
}

module.exports.queue = function(response, group, size){
  var d = new Date();
  var value = "" + group + size + d.getTime().toString()[7];
  var game_hash = crypto.createHash('md5').update(value).digest('hex');
  response.writeHead(200, {'Content-Type': "application/json"});
  response.write(JSON.stringify({"game": game_hash}));
  response.end();
  var flag=0;
  for(var i=0; i<queue.length; i++){
    if(game_hash==queue[i].hash){
      flag=1;
      break;
    }
  }
  if(flag==0) queue.push(newGame(game_hash, size));
}

function leave_game(game, nick){
  for(var i=0; i<queue.length; i++){
    if(queue[i].hash == game){
      if(queue[i].p1 == nick && queue[i].p2 == undefined){
          queue[i].p1_r.write("data: "+ JSON.stringify({"winner": null})+"\n\n");
          break;
      }
      else if(queue[i].p1 == nick){
        updateRank(queue[i].p2, queue[i].p1, queue[i].rack.length);
        queue[i].p1_r.write("data: "+ JSON.stringify({"winner": queue[i].p2})+"\n\n");
        queue[i].p2_r.write("data: "+ JSON.stringify({"winner": queue[i].p2})+"\n\n");
        break;
      }
      else{
        updateRank(queue[i].p1, queue[i].p2, queue[i].rack.length);
        queue[i].p1_r.write("data: "+ JSON.stringify({"winner": queue[i].p1})+"\n\n");
        queue[i].p2_r.write("data: "+ JSON.stringify({"winner": queue[i].p1})+"\n\n");
        break;
      }
    }
  }
}

module.exports.leave = function(game, nick){
  leave_game(game,nick);
}
