var redis = require('redis'),
    client = redis.createClient();
var us = require('underscore');

var mapsid = 0;

var acceptList = [];
var cid = 0;
var reqHash = {};

// android debug
var dSocket = null;

// initialize
client.del('entryReject');

// http
var handler = function(req, res) {
  var path = url.parse(req.url).pathname;
  if (path === '/input') {
    var postData = '';
    req.setEncoding('utf8');
    req.addListener('data', function(chunk) {
      postData += chunk;
    });
    req.addListener('end', function() {
      //console.log(postData);
      try {
        dSocket.emit('debugOutput', unescape(decodeURI(postData)));
      } catch (e) {
        console.log(e);
      }
      var dataStr = unescape(decodeURI(postData));
      dataStr = dataStr.replace(/data=/, '');
      dataStr = dataStr.replace(/'/g,'"');
      var data = JSON.parse(dataStr);
      var userName = data.userName;
      client.hset('userInput', userName, JSON.stringify(data), redis.print);
      res.writeHead(200, {'Content-Type':"text/plain"});
      res.write(postData);
      res.end();
    });
  } else {
    res.writeHead(200, {'Content-Type':"text/plain"});
    res.write('ok');
    res.end();
  }

};
//var app = require('http').createServer(handler);
var express = require('express');
var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/../www'));
var server = require('http').createServer(app);

// WebSocket
var    io = require('socket.io').listen(server);
server.listen(8800);
var url = require('url');
io.set('log level', 1);

io.sockets.on('connection', function(socket){
    //var local_cid = cid++;
    socket.on('entry', function(data) {
      client.hset('entryRequest', socket.id, JSON.stringify({'cid':socket.id, userName: data.userName, type: data.type}), redis.print);
      reqHash[socket.id] = {'userName':data.userName, 'socket':socket };
      //console.log(reqHash);
    });

    socket.on('input', function(data) {
	//console.log('from client:', data);
        var userName = data.userName;
        client.hset('userInput', userName, JSON.stringify(data), redis.print);
    });

    // android input
    socket.on('message', function(data) {
      console.log('message');
      dSocket.emit('debugOutput', data);
    });

    // android debug
    socket.on('android debug', function() {
      console.log('android');
      dSocket = socket;
    });

    socket.on('disconnect', function() {
    	client.hgetall('userObj', function(err, users){
    		if (err || !users) {
    			return;
    		};
    		var user = us.find(users, function(data){
    			data = JSON.parse(data);
    			//console.log(socket.id + ' ' + data[cid]);
    			//console.log(typeof data);
    			return socket.id === data.cid;
    		});
    		user = JSON.parse(user);
    		//console.log(user);
    		client.rpush('invalidUser', user.userName, redis.print);
    		//delete reqHash[socket.id];
    	});
    });
});

var acceptUserCheck = function(){
	// accept user check
    for(var u in reqHash) {
      //console.log('username: ' + reqHash[u].userName);
      client.hget('userObj', reqHash[u].userName, function(err, obj) {
        if(err || !obj) {
          console.log(err);
          return;
        }
          //console.log('obj;'+obj);
          obj = JSON.parse(obj);
          //console.log('user:'+reqHash[u].userName);
          
          if (u == obj.cid) {
            acceptList.push(reqHash[u].socket);
            var sock = reqHash[u].socket;
            client.hgetall('mapInfo', function(err, obj) {
              if(err) {
                console.log(err);
                return;
              }
              obj.data = JSON.parse(obj.data);
              //console.log(sock.on);
              sock.emit('accept', obj);
              delete reqHash[u];
            });
          }
      });
    }
};

var rejectUserCheck = function(){
	// reject user check
    client.hgetall('entryReject', function(err, obj) {
      if(err || !obj) {
        //console.log(err);
        return;
      }
      for(var o in obj) {
          obj[o] = JSON.parse(obj[o]);
          //console.log('reject:' + JSON.stringify(reqHash));
          var sock = reqHash[obj[o].cid].socket;
          sock.emit('reject', { message: obj[o].reason });
          client.hdel('entryReject', obj[o].cid);
          //delete reqHash[obj[o].cid];
      }
      //console.log(JSON.stringify(sock.emit));
      //if(sock.emit) {
      //}
    });
};

setInterval(function() {
	rejectUserCheck();
	acceptUserCheck();

    // send all userobj
    client.hgetall('userObj', function(err, obj) {
      if(err) console.log(err);
      for(var d in obj) {
        obj[d] = JSON.parse(obj[d]);
      }
      //console.log(obj);
      //io.sockets.emit('update user', obj);
      us.each(acceptList, function(socket) {
        socket.emit('update user', obj);
      });
    });

    // send all bulletobj
    client.hgetall('bulletObj', function(err, obj) {
      if(err) console.log(err);
      for(var d in obj) {
        obj[d] = JSON.parse(obj[d]);
      }
      //io.sockets.emit('update bullet', obj);
      us.each(acceptList, function(socket) {
        socket.emit('update bullet', obj);
      });
    });

    // send map
    client.hgetall('mapInfo', function(err, obj) {
      if(err) console.log(err);
      obj.data = JSON.parse(obj.data);
      //console.log(JSON.parse(obj.data));
      if (obj.sid > mapsid) {
        //io.sockets.emit('update map', obj);
        us.each(acceptList, function(socket) {
          socket.emit('update map', obj);
        });
        mapsid += 1;
      }
    });
}, 50);
