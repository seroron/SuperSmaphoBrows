var underscore = require('underscore');

var BulletObj = function(bi, collisionMap) {
    bi.dx = 0;
    bi.dy = 0;
    switch(bi.direction) {
    case 'U':
        bi.dy = -1;
        break;
    case 'D':
        bi.dy = +1;
        break;
    case 'L':
        bi.dx = -1;
        break;
    case 'R':
        bi.dx = +1;
    }
    bi.toX = bi.fromX + bi.dx;
    bi.toY = bi.fromY + bi.dy;

    this.bulletInfo = bi;
};

BulletObj.prototype = {

    move : function(userManager, mapInfo, collisionMap) {
        var bi = this.bulletInfo;

        if(bi.life <= 0) {
            return false;
        }
        
	// progress
        bi.progressRate += bi.progressSpeed / 30;
	if(bi.progressRate >= 100) {
            collisionMap.removeBulletObj(bi.fromX, bi.fromY, bi.id);

	    bi.progressRate -= 100;
	    bi.fromX = bi.toX;
	    bi.fromY = bi.toY;
            bi.toX = bi.fromX + bi.dx;
            bi.toY = bi.fromY + bi.dy;                    
	}
        
        // collisionMap
        if(bi.progressRate < 50) {
            collisionMap.addBulletObj(bi.fromX, bi.fromY, bi.id);
        } else {
            collisionMap.removeBulletObj(bi.fromX, bi.fromY, bi.id);
            collisionMap.addBulletObj(bi.toX, bi.toY, bi.id);
        }
        
        if(!mapInfo.canEnter(bi.toX, bi.toY)) {
            return false;
        }

        return true;
    },

    damage : function(attack) {
        this.bulletInfo.life -= attack;
        return this;
    },

    getAttack : function() {
        return this.bulletInfo.attack;
    },

    getOwnerName : function() {
        return this.bulletInfo.ownerName;
    },

    stringify : function() {
        return JSON.stringify(this.bulletInfo);
    }
};

module.exports = BulletObj;
