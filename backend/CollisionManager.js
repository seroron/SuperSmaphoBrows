var underscore = require('underscore');

var CollisionManager = function() {
};

CollisionManager.prototype = {

    colBullet2Bullet : function(bulletObj, bulletManager) {

        if(underscore.isEmpty(bulletObj)) {
            return;
        }

        for(var i in bulletObj) {
            for(var j in bulletObj) {                
                var bi = bulletManager.getBulletObj(bulletObj[i]);
                var bj = bulletManager.getBulletObj(bulletObj[j]);
                if(bulletObj[i] != bulletObj[j] &&
                   bi.getOwnerName() != bj.getOwnerName()) {
                    bi.damage(bj.getAttack());
                }
            }
        }
    },

    colUser2Bullet : function(userObj, bulletObj, userManager, bulletManager) {

        if(underscore.isEmpty(userObj) || underscore.isEmpty(bulletObj)) {
            return;
        }

        for(var u in userObj) {
            for(var b in bulletObj) {
                var bo = bulletManager.getBulletObj(bulletObj[b]);
                if(userObj[u] != bo.getOwnerName()) {
                    userManager.damage(userObj[u], bo.getAttack());
                    if(userManager.getUserObj(userObj[u]).getLife() <= 0) {
                        userManager.getUserObj(bo.getOwnerName()).userInfo.killCnt++;
                    }
                    
                    bulletManager.damage(bulletObj[b], 10); // TODO
                }
            }
        }
    },

    collision : function(userManager, bulletManager, collisionMap, callback) {
        for(var y=0; y<collisionMap.getSizeY(); ++y) {
            for(var x=0; x<collisionMap.getSizeX(); ++x) {
                var userObj   = collisionMap.getUserObj(x, y);
                var bulletObj = collisionMap.getBulletObj(x, y);
                
                this.colBullet2Bullet(bulletObj, bulletManager);
                this.colUser2Bullet(userObj, bulletObj, userManager, bulletManager);
            }
        }
        callback(null, null);
    }
};

module.exports = CollisionManager;
