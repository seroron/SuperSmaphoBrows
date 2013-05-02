var async = require('async');

var USERINPUT_KEY = 'userInput';

var InputManager = function(redisCli) {
    this.redisCli  = redisCli;
    this.userInput = {};
};

InputManager.prototype = {

    poll : function(callback) {
        // poll USERINPUT_KEY data

        var this_ = this;
        async.series([
            function(c) {
                this_.redisCli.hgetall(USERINPUT_KEY, 
                                 function(err, res) {
                                     this_.userInput = {};
                                     for(var i in res) {
                                         this_.userInput[i] = JSON.parse(res[i]);
                                     }
                                     c(err, this_.userInput);
                                 });
            },
            function(c) {
                this_.redisCli.del(USERINPUT_KEY, c);
            }
        ], callback);
    },
    
    getUserInput : function(userName) {
        return this.userInput[userName];
    }
};

module.exports = InputManager;

