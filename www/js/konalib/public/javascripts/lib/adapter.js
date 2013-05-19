/**
 * @author 小長谷 秋雄
 */
/*
(function(define){
	define(['underscore', 'websocket'], function(_, io){
*/
		var WebSocketAdapter = function(url, options) {
			this.WS_URL = url || '/';
			this.options || (this.options = {});
			this.socket = io.connect(this.WS_URL);
			this.events = {};
			this.EVENT_NAMES = ['updateFrame', 'updateUser', 'updateBullet', 'updateMap'];
			this.cache = {};
			this.mapsid = 0;
			
			this.entrySuccess = null;
			this.entryDeny = null;
			
			var self = this;
			this.socket.on('accept', function(map) {
				self.trigger('updateMap', map);
				self.entrySuccess('success');
			});
			this.socket.on('reject', function(err) {
				self.entryDeny(err.message);
			});
			this.socket.on('update', function(gObj){
				//self.cache.push(gObj);
				//self.trigger('updateFrame'); //TODO
			});
			this.socket.on('update user', function(uObj) {
				self.trigger('updateUser', uObj);
                        });
			this.socket.on('update bullet', function(bObj) {
				self.trigger('updateBullet', bObj);
			});
			this.socket.on('update map', function(mObj) {
				//if (mObj.sid > self.mapsid) {
					self.trigger('updateMap', mObj);
					//self.mapsid += 1;
				//}
			});
		};
		
		_.extend(WebSocketAdapter.prototype, {
			on: function(evName, callback) {
				if (_.indexOf(this.EVENT_NAMES, evName) < 0) {
					return;
				}
				var eventCbList = this.events[evName] || (this.events[evName] = []);
				eventCbList.push(callback);
				return this;
			},
			off: function(evName, callback) {
				// TODO
			},
			trigger: function(evName, obj) {
				if (_.indexOf(this.EVENT_NAMES, evName) < 0) {
					return;
				}
				_.each(this.events[evName], function(cb){
					cb(obj);
				},this);
				//this.cache = [];
				return this;
			},
			connect: function(userName, type, succ, err) {
				this.entrySuccess = succ;
				this.entryDeny = err;
				this.socket.emit('entry', { 'userName': userName, 'type': type });
			},
			sendInput: function(inputObj) {
				this.socket.emit('input', inputObj);
			}
		});
		
/*
		return WebSocketAdapter;
	});
})(typeof define !== 'undefined' ?
	define:
	function(deps,factory){ this['WebSocketAdapter'] = factory();}
);
*/
