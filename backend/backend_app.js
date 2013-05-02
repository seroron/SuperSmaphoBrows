var async = require('async');
var redis = require('redis');
var redisCli = redis.createClient();

var GameManager = require('./GameManager');

redisCli.on("error", function (err) {
    console.log("Error " + err);
});

inputMock = function() {
    redisCli.hset('userInput', "john", 
                  JSON.stringify({
                      up    : 'N',
                      down  : 'L',
                      left  : 'N',
                      right : 'N',
                      shot  : '1'
                  }));
    redisCli.hset('userInput', "bob", 
                  JSON.stringify({
                      up    : 'S',
                      down  : 'S',
                      left  : 'S',
                      right : 'S',
                      shot  : '1'
                  }));
}

var gameManager = new GameManager(redisCli);
gameManager.initGame();

async.series([
    function(c) {
        gameManager.initGame(c);     // gameManager.initGame, why NG?
    },
    function(c) {
        setInterval(function() {
            gameManager.move(function(){});
        }, 33);
        c(null, null);
    }
], function(err, ret) {
});

// setInterval(inputMock, 10);
