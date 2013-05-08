var underscore = require('underscore');

var TYPE_USER   = "user";
var TYPE_BULLET = "bullet";
var TYPE_WALL   = "wall";

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
    addObject : function(x, y, type, key, obj) {
        var findret = underscore.find(this.collisionMap[y][x], 
                                      function(item) {
                                          return item.t==type && item.k==key
                                      });
        if(!findret) {
	    this.collisionMap[y][x].push({"t" : type, "k" : key, "o" : obj});
        }
	return this;
    },

    removeObject : function(x, y, type, key) {
        this.collisionMap[y][x] = 
            this.collisionMap[y][x].filter(function(item){
                return item.t != type || item.k != key;
            });
        return this;
    },

    removeAllObject : function(type) {
        var cm = this.collisionMap;

        for(var y=0; y<this.sizeY; ++y) {
            for(var x=0; x<this.sizeX; ++x) {
                cm[y][x] = cm[y][x].filter(function(item){
                    return item.t != type;
                });
            }
        }

        return this;
    },

    getObject : function(x, y, type) {
	return this.collisionMap[y][x]
	    .filter(function(item) {
		return item.t == type;
	    })
	    .map(function(item) {
		return item.o;
	    });
    },

    isExistsObject : function(x, y) {
        return !underscore.isEmpty(this.collisionMap[y][x]);
    },

    getEmptyPoint : function() {
        // TODO: check full object
        var x;
        var y;
        do {
            x = underscore.random(this.sizeX-1);
            y = underscore.random(this.sizeY-1);
        } while(this.isExistsObject(x, y));
        
        return {'x' : x, 'y' : y};
    },

    /////////////////    
    addUserObj : function(x, y, name, obj) {
	return this.addObject(x, y, TYPE_USER, name, obj);
    },

    removeUserObj : function(x, y, name) {
	return this.removeObject(x, y, TYPE_USER, name);
    },

    getUserObj : function(x, y) {
	return this.getObject(x, y, TYPE_USER);
    },

    /////////////////    
    addBulletObj : function(x, y, id, obj) {
	return this.addObject(x, y, TYPE_BULLET, id, obj);
    },

    removeBulletObj : function(x, y, id) {
	return this.removeObject(x, y, TYPE_BULLET, id);
    },

    getBulletObj : function(x, y) {
	return this.getObject(x, y, TYPE_BULLET);
    },

    /////////////////    
    addWallObj : function(x, y, id, obj) {
	return this.addObject(x, y, TYPE_WALL, id, obj);
    },

    removeAllWallObj : function() {
        return this.removeAllObject(TYPE_WALL);
    },

    removeWallObj : function(x, y, id) {
	return this.removeObject(x, y, TYPE_WALL, id);
    },
    
    getWallObj : function(x, y) {
	return this.getObject(x, y, TYPE_WALL);
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