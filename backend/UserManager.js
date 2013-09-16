var async = require('async');
var underscore = require('underscore');

var UserObj = require('./UserObj');

var USEROBJ_KEY = 'userObj';    
var INVALIDUSER_KEY = "invalidUser";

var INITUSER_DATA = {'cid': -1,
                     'userName': '',
                     'type' : 0,
                     'fromX': 0,
                     'fromY': 0,
                     'toX' : 0,
                     'toY' : 0,                    
                     'direction': 'D',
                     'progressRate': 0,
                     'progressSpeed': 0,
                     'life': 5,
                     'deadCnt': 0,
                     'killCnt': 0,
                     'speed': 200,
                     'shotWait': 0};

function UserManager(redisCli) {
    this.users = {};
    this.redisCli = redisCli;
};

UserManager.prototype = {

    reset : function(callback) {
        this.users = {};

        // mock
        // this.append('john');
        // this.append('bob');

        // reset redis db data
        var this_ = this;
        async.series([
            function(c) {
                this_.redisCli.del(USEROBJ_KEY, c)
            },
            function(c) {
                this_.save(c);
            }
        ], callback);
    },

    append : function(userName, cid, type, mapInfo, collisionMap) {
        // TODO check
        
        var mpos = collisionMap.getEmptyPoint();

        var ui = underscore.clone(INITUSER_DATA); 
        ui.cid      = cid;
        ui.userName = userName;
        ui.type     = type;
        ui.fromX    = ui.toX = mpos.x;
        ui.fromY    = ui.toY = mpos.y;

        this.users[userName] = new UserObj(ui);
    },

    move : function(inputManager, mapInfo, bulletManager, collisionMap, callback) {
        
//        console.log("userlist:", this.users);
        
        var this_ = this;

        async.series([
            function(c) {
                this_.treatLogoutRequest_(collisionMap, c);
            },
            function(c) {
                this_.moveUsers_(inputManager, mapInfo, bulletManager, collisionMap, c);
            }], callback);
    },

    moveUsers_ : function(inputManager, mapInfo, bulletManager, collisionMap, callback) {
        for(var i in this.users) {
            this.users[i].move(inputManager.getUserInput(this.users[i].getUserName()), 
                                     mapInfo,
                                     bulletManager,
                                     collisionMap);
            
            var ui = this.users[i].userInfo;
            if(ui.life <= 0) {
                collisionMap.removeUserObj(ui.fromX, ui.fromY, ui.userName);
                collisionMap.removeUserObj(ui.toX,   ui.toY,   ui.userName);

                var mpos = collisionMap.getEmptyPoint();
                ui.toX = ui.fromX = mpos.x;
                ui.toY = ui.fromY = mpos.y;

                ui.life = 5; //TODO
                ui.progressRate = 0;
                ui.progressSpeed = 0;
                ui.shotWait = 0;
                ui.deadCnt++;
            }

            // if(!ret) {
            //     delete this.users[i];
            // }
        }
        callback(null, null);
    },

    save : function(callback) {
        if(underscore.isEmpty(this.users)) {
            callback(null, null);
            return;
        }

        var umap = {};
        for(var i in this.users) {
            umap[i] = this.users[i].stringify();
        }
        this.redisCli.hmset(USEROBJ_KEY, umap, callback);
    },

    isExist : function(userName) {
        return !!this.users[userName];
    },

    getUserObj : function(userName) {
        return this.users[userName];
    },

    damage : function(userName, attack) {
        this.users[userName].damage(attack);
    },

    each : function(callback) {
        for(var i in this.users) {
            callback(this.users[i]);
        }
    },

    treatLogoutRequest_ : function(collisionMap, callback) {
        var this_ = this;

        async.waterfall([
            function(c) {
                this_.redisCli.llen(INVALIDUSER_KEY, 
                                    function(err, res) {
                                        if(res > 0) {
                                            c(err, res);
                                        } else {
                                            c("nouser", 0);
                                        }
                                    });
            },
            
            function(len, c) {
                this_.redisCli.lrange(INVALIDUSER_KEY, 0, len-1,
                                      function(err, res) {
                                          res.forEach(function(userName) {
                                              console.log("logout user:", userName);
                                              var user = this_.users[userName];
                                              if(user) {
                                                  var ui = user.userInfo;
                                                  
                                                  collisionMap.removeUserObj(ui.fromX, ui.fromY, ui.userName);
                                                  collisionMap.removeUserObj(ui.toX,   ui.toY,   ui.userName);
                                                  this_.redisCli.hdel(USEROBJ_KEY, ui.userName);

                                                  delete this_.users[userName];
                                              }
                                          });
                                          c(err, len);
                                      });
            },
            
            function(len, c) {
                this_.redisCli.ltrim(INVALIDUSER_KEY, len, -1, 
                                    function(err, res) {
                                        c(err, res)
                                    });
            }
        ], function(err, res) {
            callback(null, null);
        });
    }
};

module.exports = UserManager;
