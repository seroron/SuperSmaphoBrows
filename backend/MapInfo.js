var async = require('async');

var WALL = 100;
var MAPINFO_KEY = 'mapInfo';

var MapInfo = function(redisCli) {
    this.mapData = [];
    this.sizeX = 0;
    this.sizeY = 0;
    this.redisCli = redisCli;
};

MapInfo.prototype = {
    
    createMapData_ : function(sizeX, sizeY) {

        this.sizeX = sizeX;
        this.sizeY = sizeY;

        this.mapData = [];

        var wallLine = [];
        for(var x=0; x<sizeX; ++x) {
	    wallLine.push(WALL);
        }
        
        this.mapData.push(wallLine);
        for(var y=0; y<sizeY-2; ++y) {
	    var line = [WALL];
	    for(var x=0; x<sizeX-2; ++x) {
	        if(Math.floor(Math.random()*10) < 8) {
		    line.push(1); 
	        } else {
		    line.push(100); /// wall
	        }
	    }
	    line.push(WALL);
	    this.mapData.push(line);
        }
        this.mapData.push(wallLine);
    },

    reset : function(sizeX, sizeY, callback) {
        
        this.createMapData_(sizeX, sizeY);

        // update redis db data
        var this_ = this;
        async.series([
            function(c) {
                this_.redisCli.del(MAPINFO_KEY, c)
            },
            function(c) {
                this_.save(c);
            }], callback);
    },

    canEnter : function(x, y) {
        return this.mapData[y][x] < WALL;
    },

    // getMapData : function() {
    //     return this.mapData;
    // },

    save : function(callback) {
        this.redisCli.hmset(MAPINFO_KEY,
                            {'sid'   : 1,
                             'data'  : JSON.stringify(this.mapData),
                             'sizeX' : this.sizeX,
                             'sizeY' : this.sizeY},
                            callback);
    },
    
    getSizeX : function() {
        return this.sizeX;
    },

    getSizeY : function() {
        return this.sizeY;
    }
};

module.exports = MapInfo;
