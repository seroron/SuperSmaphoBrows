var async = require('async');

var MapInfo           = require('./MapInfo');
var UserManager       = require('./UserManager');
var InputManager      = require('./InputManager');
var BulletManager     = require('./BulletManager');
var CollisionMap      = require('./CollisionMap');
var CollisionManager  = require('./CollisionManager');
var UserEntry         = require('./UserEntry');

var GameManager = function(redisCli) {
    this.mapInfo           = new MapInfo(redisCli);
    this.userManager       = new UserManager(redisCli);
    this.inputManager      = new InputManager(redisCli);
    this.bulletManager     = new BulletManager(redisCli);
    this.collisionMap      = new CollisionMap(0, 0);
    this.collisionManager  = new CollisionManager();
    this.userEntry         = new UserEntry(redisCli);
};

GameManager.prototype = {
    initGame : function(callback) {

        var this_ = this;
        async.parallel([
            function(c) {
                this_.userManager.reset(c);
            },
            function(c) {
                this_.bulletManager.reset(c);
            },
            function(c) {
                this_.collisionMap.reset(20, 20);
                this_.mapInfo.reset(20, 20, this_.collisionMap, c);
            }
        ], callback);
    },

    move : function(callback) {

        var this_ = this;
        async.series([
            function(c) {
                this_.userEntry.treatEntryRequest(this_.userManager, this_.mapInfo, this_.collisionMap, c);
            },
            function(c) {
                this_.inputManager.poll(c);
            },
            function(c) {
                this_.userManager.move(this_.inputManager, this_.mapInfo, this_.bulletManager, this_.collisionMap, c);
            },
            function(c) {
                this_.bulletManager.move(this_.userManager, this_.mapInfo, this_.collisionMap, c);
            },
            function(c) {
                this_.collisionManager.collision(this_.userManager, this_.bulletManager, this_.collisionMap, c);
            },
            function(c) {
                this_.userManager.save(c);
            },
            function(c) {
                this_.bulletManager.save(c);
            }
        ], callback);
    }
};

module.exports = GameManager;
