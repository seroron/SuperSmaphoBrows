var underscore = require('underscore');

var CollisionManager = function() {
};

CollisionManager.prototype = {

    colBullet2Bullet : function(bulletObj) {
        if(underscore.isEmpty(bulletObj)) {
            return;
        }

        var len = bulletObj.length;
        for(var i=0; i<len-1; ++i) {
            for(var j=i+1; j<len; ++j) {
                if(bulletObj[i].getOwnerName() != bulletObj[j].getOwnerName()) {
                    bulletObj[i].damage(bulletObj[j].getAttack());
                    bulletObj[j].damage(bulletObj[i].getAttack());
                }
            }
        }
    },

    colUser2Bullet : function(userObj, bulletObj, userManager) {
        if(underscore.isEmpty(userObj) || underscore.isEmpty(bulletObj)) {
            return;
        }

        userObj.forEach(function(u) {
            bulletObj.forEach(function(b) {
                if(u.getUserName() != b.getOwnerName()) {
                    u.damage(b.getAttack());
                    b.damage(u.getAttack());
                    
                    if(userManager.getUserObj(u.getUserName()).getLife() <= 0) {
                        userManager.getUserObj(b.getOwnerName()).userInfo.killCnt++;
                    }
                }
            });
        });
    },

    collision : function(userManager, bulletManager, collisionMap, callback) {
        for(var y=0; y<collisionMap.getSizeY(); ++y) {
            for(var x=0; x<collisionMap.getSizeX(); ++x) {
                var userObj   = collisionMap.getUserObj(x, y);
                var bulletObj = collisionMap.getBulletObj(x, y);
                
                this.colBullet2Bullet(bulletObj, bulletManager);
                this.colUser2Bullet(userObj, bulletObj, userManager);
            }
        }
        callback(null, null);
    }
};

module.exports = CollisionManager;
