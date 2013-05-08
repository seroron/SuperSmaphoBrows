var underscore = require('underscore');

var WallObj = function(x, y, id) {
    this.x  = x;
    this.y  = y;
    this.id = id;
};

WallObj.prototype = {

    move : function(collisionMap) {
        return true;
    },

    getWallID : function() {
        return this.id;
    }

/*
    damage : function(attack) {
        return this;
    },

    getAttack : function() {
        return this.bulletInfo.attack;
    },

    stringify : function() {
        return JSON.stringify(this.bulletInfo);
    }
*/
};

module.exports = WallObj;
