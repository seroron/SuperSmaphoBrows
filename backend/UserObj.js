var underscore = require('underscore');

var UserObj = function(userInfo) {
    this.userInfo = userInfo;
};

UserObj.prototype = {

    move : function(userInput, mapInfo, bulletManager, collisionMap) {
        var ui = this.userInfo;

	// progress
        ui.progressRate += ui.progressSpeed / 30;
	if(ui.progressRate >= 100) {
            collisionMap.removeUserObj(ui.fromX, ui.fromY, ui.userName);

	    ui.progressRate  = 0;
	    ui.progressSpeed = 0;
	    ui.fromX = ui.toX;
	    ui.fromY = ui.toY;
	}

        // collisionMap
        if(ui.progressRate < 50) {
            collisionMap.addUserObj(ui.fromX, ui.fromY, ui.userName, this);
        } else {
            collisionMap.removeUserObj(ui.fromX, ui.fromY, ui.userName);
            collisionMap.addUserObj(ui.toX, ui.toY, ui.userName, this);
        }

	// input
	if(userInput && ui.progressSpeed == 0) {
	    // up
            switch(userInput.up) {
            case 'S':
                ui.direction = 'U';
                break;
            case 'L':
                ui.direction = 'U';
                if(mapInfo.canEnter(ui.fromX, +ui.fromY - 1) &&
                   underscore.isEmpty(collisionMap.getUserObj(ui.fromX, +ui.fromY - 1))) {
	            ui.toY = +ui.fromY - 1;
                    ui.progressSpeed = ui.speed;
                }
                break;
            }
        }

        if(userInput && ui.progressSpeed == 0) {
            // down
            switch(userInput.down) {
            case 'S':
                ui.direction = 'D';
                break;
            case 'L':
                ui.direction = 'D';
                if(mapInfo.canEnter(ui.fromX, +ui.fromY + 1) &&
                   underscore.isEmpty(collisionMap.getUserObj(ui.fromX, +ui.fromY + 1))) {
	            ui.toY = +ui.fromY + 1;
                    ui.progressSpeed = ui.speed;
                }
                break;
            }
        }

	if(userInput && ui.progressSpeed == 0) {
            // left
            switch(userInput.left) {
            case 'S':
                ui.direction = 'L';
                break;
            case 'L':
                ui.direction = 'L';
                if(mapInfo.canEnter(+ui.fromX - 1, ui.fromY) &&
                   underscore.isEmpty(collisionMap.getUserObj(+ui.fromX - 1, ui.fromY))) {
	            ui.toX = +ui.fromX - 1;
                    ui.progressSpeed = ui.speed;
                }
                break;
            }
        }
        
	if(userInput && ui.progressSpeed == 0) {
            // right
            switch(userInput.right) {
            case 'S':
                ui.direction = 'R';
                break;
            case 'L':
                ui.direction = 'R';
                if(mapInfo.canEnter(+ui.fromX + 1, ui.fromY) &&
                   underscore.isEmpty(collisionMap.getUserObj(+ui.fromX + 1, +ui.fromY))) {
	            ui.toX = +ui.fromX + 1;
                    ui.progressSpeed = ui.speed;
                }
                break;
            }
        }
        
        // shot        
	if(userInput && ui.shotWait <= 0) {
            switch(userInput.shot) {
            case 1:
                ui.shotWait = 15;
                bulletManager.append(
                    {'ownerName' : ui.userName,
                     'fromX': ui.fromX,
                     'fromY': ui.fromY,
                     'direction': ui.direction,
                     'progressSpeed': 400,
                     'progressRate' : ui.progressRate,
                     'attack' : 1,
                     'life' : 1},
                    collisionMap);
                break;
            }
        }
        if(ui.shotWait > 0) {
            ui.shotWait--;
        }

//        console.log(ui);

        return true;
    },

    getUserName : function() {
        return this.userInfo.userName;
    },

    damage : function(attack) {        
        this.userInfo.life -= attack;
        return this;
    },

    getAttack : function() {
        return 1; //TODO
    },

    getLife : function() {
        return this.userInfo.life;
    },

    stringify : function() {
        return JSON.stringify(this.userInfo);
    }

};

module.exports = UserObj;
