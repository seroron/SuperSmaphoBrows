var underscore = require('underscore');
var async = require('async');

var BulletObj = require('./BulletObj');

var BULLETOBJ_KEY = 'bulletObj';    

function BulletManager(redisCli) {
    this.nextId = 0;
    this.bullets = {};
    this.redisCli = redisCli;
};

BulletManager.prototype = {

    reset : function(callback) {
        this.nextId = 0;
        this.bullets = {};

        // reset redis db data
        var this_ = this;
        async.series([
            function(c) {
                this_.redisCli.del(BULLETOBJ_KEY, c);
            },
            function(c) {
                this_.save(c);
            }
        ], callback);
    },

    append : function(bulletInfo, collisionMap) {
        // TODO check
        bulletInfo.id = this.nextId++;
        this.bullets[bulletInfo.id] = new BulletObj(bulletInfo, collisionMap);
    },

    move : function(userManager, mapInfo, collisionMap, callback) {

        for(var i in this.bullets) {
            ret = this.bullets[i].move(userManager, mapInfo, collisionMap);
            if(!ret) {
                this.redisCli.hdel(BULLETOBJ_KEY, this.bullets[i].bulletInfo.id);
                collisionMap.removeBulletObj(this.bullets[i].bulletInfo.fromX, this.bullets[i].bulletInfo.fromY, i);
                collisionMap.removeBulletObj(this.bullets[i].bulletInfo.toX, this.bullets[i].bulletInfo.toY, i);
                delete this.bullets[i];
            }
        }

        callback(null, this);
    },

    getBulletObj : function(id) {
        return this.bullets[id];
    },

    damage : function(id, attack) {
        this.bullets[id].damage(attack);
    },
    
    getAttack : function(id) {
        return this.bullets[id].getAttack();
    },
    
    save: function(callback) {
        if(underscore.isEmpty(this.bullets)) {
            callback(null, null);
            return;
        }

        var bmap = {};
        for(var i in this.bullets) {
            bmap[i] = this.bullets[i].stringify();
        }
        this.redisCli.hmset(BULLETOBJ_KEY, bmap, callback);
    }
};

module.exports = BulletManager;
