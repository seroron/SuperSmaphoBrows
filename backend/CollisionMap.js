var underscore = require('underscore');

var TYPE_USER   = "user";
var TYPE_BULLET = "bullet";

var CollisionMap = function(sizeX, sizeY) {
    this.collisionMap = [];
    this.sizeX = 0;
    this.sizeY = 0;
    this.reset(sizeX, sizeY);
};

CollisionMap.prototype = {

    reset : function(sizeX, sizeY) {
	this.sizeX = sizeX;
        this.sizeY = sizeY;

	this.collisionMap = [];
	for(var y=0; y<sizeY; ++y) {
	    var xl = [];
	    for(var x=0; x<sizeX; ++x) {
	        xl.push([]);
	    }
	    this.collisionMap.push(xl);
	}
    },

    getSizeX : function() {
        return this.sizeX;
    },

    getSizeY : function() {
        return this.sizeY;
    },

    /////////////////
    addObject : function(x, y, type, val) {
        var obj = {"t" : type, "v" : val};

        var findret = underscore.find(this.collisionMap[y][x], 
                                      function(item) {
                                          return item.t==type && item.v==val
                                      });
        if(!findret) {
	    this.collisionMap[y][x].push(obj);
        }
	return this;
    },

    removeObject : function(x, y, type, val) {
	this.collisionMap[y][x] = this.collisionMap[y][x].filter(
            function(item){
                return item.t != type || item.v != val;
            });
    },

    getObject : function(x, y, type) {
	return this.collisionMap[y][x]
	    .filter(function(item) {
		return item.t == type;
	    })
	    .map(function(item) {
		return item.v;
	    });
    },

    isExistsObject : function(x, y) {
        return !underscore.isEmpty(this.collisionMap[y][x]);
    },

    /////////////////    
    addUserObj : function(x, y, name) {
	return this.addObject(x, y, TYPE_USER, name);
    },

    removeUserObj : function(x, y, name) {
	return this.removeObject(x, y, TYPE_USER, name);
    },

    getUserObj : function(x, y) {
	return this.getObject(x, y, TYPE_USER);
    },

    /////////////////    
    addBulletObj : function(x, y, name) {
	return this.addObject(x, y, TYPE_BULLET, name);
    },

    removeBulletObj : function(x, y, name) {
	return this.removeObject(x, y, TYPE_BULLET, name);
    },

    getBulletObj : function(x, y) {
	return this.getObject(x, y, TYPE_BULLET);
    }
};

module.exports = CollisionMap;

/*
var cm = new CollisionMap(3,3);
cm.addUserObj(0,1,"hoge");
cm.addUserObj(0,1,"foo");
cm.addUserObj(0,1,"foo");
cm.addBulletObj(0,1,"hoge");
cm.addUserObj(0,2,"hoge2");
console.log(cm.collisionMap);
console.log(cm.getUserObj(0,1));
cm.removeUserObj(0,1,"hoge");
console.log(cm.getUserObj(0,1));
console.log(cm.getBulletObj(0,1));
console.log(cm.getUserObj(0,2));
*/