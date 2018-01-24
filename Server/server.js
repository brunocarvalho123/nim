var http = require('http');
var fs = require("fs");
var crypto = require('crypto');
var url = require('url');
var updater  = require('./updater.js');

function isInt(nn){
  var n = parseInt(nn);
  return Number(n) === n && n % 1 === 0;
}

var server = http.createServer(function (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');

  if(request.method == "POST" && request.url == "/register"){
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();}
    });
    request.on('end', function () {
      try { var query = JSON.parse(body);
        var good=0;
        fs.readFile("login_data.json",function(err,data) {
          if(! err) {
            if(query.nick == undefined){
              response.writeHead(400, {'Content-Type': "application/json"});
              response.end(JSON.stringify({"error": "Nick is undefined"}));
            }
            else if(query.pass == undefined){
              response.writeHead(400, {'Content-Type': "application/json"});
              response.end(JSON.stringify({"error": "Pass is undefined"}));
            }
            else{
              var u_nick = query.nick;
              var u_pass = crypto.createHash('sha256').update(query.pass).digest('base64');
              var dados = JSON.parse(data.toString());
              for(var i = 0; i<dados.users.length; i++){
                var user = dados.users[i];
                if(user.nick==u_nick){
                  if(user.pass!=u_pass) good=1;
                  else good=2;
                  break;
                }
              }
              if(good==0){
                var obj = JSON.parse(data);
                obj.users.push({nick: u_nick, pass:u_pass});
                fs.writeFile("login_data.json",JSON.stringify(obj),function(err){
                  if(err) throw err;
                });
              }
              if(good==0 || good==2){
                response.writeHead(200, {'Content-Type': "application/json"});
                response.end(JSON.stringify({}));
              }
              else{
                response.writeHead(400, {'Content-Type': "application/json"});
                response.end(JSON.stringify(
                  {"error": "User registered with a different password"}));
              }
            }
          }
          else console.log(err);
        });
      } catch(err) {  console.log(err.message); }
    });
    request.on('error', function (err) {
      console.log(err.message);
    });
  }

  else if(request.method == "POST" && request.url == "/ranking"){
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();}
    });
    request.on('end', function () {
      try { var query = JSON.parse(body);
        if(query.size == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined size"}));
        }
        else if(!isInt(query.size)){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Invalid size"}));
        }
        else{
          fs.readFile("ranking.json",function(err,data) {
            if(!err) {
              var dados = JSON.parse(data.toString());
              response.writeHead(200, {'Content-Type': "application/json"});
              var obj = dados['s'+query.size];
              if(obj==undefined) response.end(JSON.stringify({}));
              else{
                var temp = obj.ranking;
                var sorted = temp.sort(function(a, b){
                  return b.victories-a.victories;
                }).slice(0, 10);
                obj.ranking=sorted;
                response.end(JSON.stringify(obj));
              }
            } else console.log(err);
          });
        }
      }
      catch(err) { console.log(err.message); }
    });
    request.on('error', function (err) {
      console.log(err.message);
    });
  }

  else if(request.method == "POST" && request.url == "/join"){
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();}
    });
    request.on('end', function () {
      try { var query = JSON.parse(body);
        if(query.group == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined group"}));
        }
        else if(query.nick == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined nick"}));
        }
        else if(query.pass == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined pass"}));
        }
        else if(query.size == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined size"}));
        }
        else if(!isInt(query.group)){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Invalid group"}));
        }
        else if(!isInt(query.size)){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Invalid size"}));
        }
        else{
          fs.readFile("login_data.json",function(err,data) {
            var good = 0;
            var u_nick = query.nick;
            var u_pass = crypto.createHash('sha256').update(query.pass).digest('base64');
            var dados = JSON.parse(data.toString());
            for(var i = 0; i<dados.users.length; i++){
              var user = dados.users[i];
              if(user.nick==u_nick){
                if(user.pass==u_pass) good=1;
                else good=2;
                break;
              }
            }
            if(good==1){
              updater.queue(response, query.group, query.size);
            }
            else{
              response.writeHead(401, {'Content-Type': "application/json"});
              response.end(JSON.stringify(
                {"error": "User registered with a different password"}));
            }
          });
        }
      }
      catch(err) { console.log(err.message); }
    });
    request.on('error', function (err) {
      console.log(err.message);
    });
  }

  else if(request.method == "POST" && request.url == "/leave"){
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();}
    });
    request.on('end', function () {
      try { var query = JSON.parse(body);
        if(query.nick == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined nick"}));
        }
        else if(query.pass == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined pass"}));
        }
        else if(query.game == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined game"}));
        }
        else{
          fs.readFile("login_data.json",function(err,data) {
            var good = 0;
            var u_nick = query.nick;
            var u_pass = crypto.createHash('sha256').update(query.pass).digest('base64');
            var dados = JSON.parse(data.toString());
            for(var i = 0; i<dados.users.length; i++){
              var user = dados.users[i];
              if(user.nick==u_nick){
                if(user.pass==u_pass) good=1;
                else good=2;
                break;
              }
            }
            if(good==1){
              response.writeHead(200, {'Content-Type': "application/json"});
              response.end(JSON.stringify({}));
              updater.leave(query.game,query.nick);
            }
            else{
              response.writeHead(401, {'Content-Type': "application/json"});
              response.end(JSON.stringify(
                {"error": "User registered with a different password"}));
            }
          });
        }
      }
      catch(err) { console.log(err.message); }
    });
    request.on('error', function (err) {
      console.log(err.message);
    });
  }

  else if(request.method == "POST" && request.url == "/notify"){
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();}
    });
    request.on('end', function () {
      try { var query = JSON.parse(body);
        if(query.nick == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined nick"}));
        }
        else if(query.pass == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined pass"}));
        }
        else if(query.game == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined game"}));
        }
        else if(query.stack == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined stack"}));
        }
        else if(query.pieces == undefined){
          response.writeHead(400, {'Content-Type': "application/json"});
          response.end(JSON.stringify({"error": "Undefined pieces"}));
        }
        else{
          fs.readFile("login_data.json",function(err,data) {
            var good = 0;
            var u_nick = query.nick;
            var u_pass = crypto.createHash('sha256').update(query.pass).digest('base64');
            var dados = JSON.parse(data.toString());
            for(var i = 0; i<dados.users.length; i++){
              var user = dados.users[i];
              if(user.nick==u_nick){
                if(user.pass==u_pass) good=1;
                else good=2;
                break;
              }
            }
            if(good==1){
              response.writeHead(200, {'Content-Type': "application/json"});
              response.end(JSON.stringify({}));
              updater.play(response, query.nick, query.game, query.stack, query.pieces);
            }
            else{
              response.writeHead(401, {'Content-Type': "application/json"});
              response.end(JSON.stringify(
                {"error": "User registered with a different password"}));
            }
          });
        }
      }
      catch(err) { console.log(err.message); }
    });
    request.on('error', function (err) {
      console.log(err.message);
    });
  }

  else if(request.method == "GET"){
    var preq = url.parse(request.url,true);
    var pathname = preq.pathname;

    if(pathname=='/update'){
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      response.setHeader('Content-Type', 'text/event-stream');
      var query = url.parse(request.url,true).query;

      if(query.nick == undefined){
        response.writeHead(400, {'Content-Type': "application/json"});
        response.end(JSON.stringify({"error": "Undefined nick"}));
      }
      else if(query.game == undefined){
        response.writeHead(400, {'Content-Type': "application/json"});
        response.end(JSON.stringify({"error": "Undefined game"}));
      }
      else{
        response.writeHead(200);
        updater.remember(response, query.nick, query.game);
        request.on('close', () => updater.forget(response));
      }
    }

    else{
      response.writeHead(404, {"Content-Type": "application/json"});
      response.write(JSON.stringify({ "error": "Unknown GET request"}));
      response.end();
    }
  }

  else if(request.method == "POST"){
    response.writeHead(404, {"Content-Type": "application/json"});
    response.write(JSON.stringify({ "error": "Unknown POST request"}));
    response.end();
  }

  else{
    response.writeHead(404, {"Content-Type": "application/json"});
    response.write(JSON.stringify({ "error": "404 Page not found"}));
    response.end();
  }
});

server.listen(8033);

console.log("Server online");
