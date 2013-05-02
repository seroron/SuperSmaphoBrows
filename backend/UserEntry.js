var underscore = require('underscore');
var async = require('async');

var ENTRYREQUEST_KEY = 'entryRequest';
var ENTRYREJECT_KEY    = 'entryReject';

var UserEntry = function(redisCli) {
    this.entryRequest = [];
    this.redisCli = redisCli;
};

UserEntry.prototype = {
    poll : function(callback) {
        var this_ = this;
        async.series([
            function(c) {
                this_.redisCli.hgetall(ENTRYREQUEST_KEY, 
                                       function(err, res) {
                                           this_.entryRequest = {};
                                           for(var i in res) {
                                               this_.entryRequest[i] = JSON.parse(res[i]);
                                           }
                                           c(err, this_.entryRequest);
                                       });
            },
            function(c) {
                this_.redisCli.del(ENTRYREQUEST_KEY, c);
            }/*,
            function(c) {
                this_.redisCli.
            }*/
        ], callback);
    },

    joinGame : function(userManager, mapInfo, collisionMap, callback) {
        var this_ = this;

        var rejectUsers = {};
        underscore.each(this_.entryRequest,
                        function(item) {
                            if(userManager.isExist(item.userName)) {
                                item.reason = "already exists"
                                rejectUsers[item.cid] = JSON.stringify(item);
                            } else {
                                console.log("new user:", item.userName);
                                userManager.append(item.userName, item.cid, item.type, mapInfo, collisionMap);
                            }
                        });
        
        if(!underscore.isEmpty(rejectUsers)) {
            this.redisCli.hmset(ENTRYREJECT_KEY, rejectUsers);
        }
        callback(null, null);
    },

    treatEntryRequest : function(userManager, mapInfo, collisionMap, callback) {
        var this_ = this;
        async.series([
            function(c) {
                this_.poll(c);
            },
            function(c) {
                this_.joinGame(userManager, mapInfo, collisionMap, c);
            }
        ], callback);
    }
};

module.exports = UserEntry;
