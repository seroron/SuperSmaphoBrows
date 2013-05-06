var GameItem = Class.create(DH3DObject, {
  type: "",
  id: 0,
  _bx: 0.0,
  _by: 0.0,

  _padY: 0.5,

  // received params
  _fromX: 0,
  _fromY: 0,
  _toX: 0,
  _toY: 0,
  _progressRate: 0,
  _progressSpeed: 0,

  // FIXME
  _yaxis: new DHVector3(0, 1, 0),

  initialize: function($super, modelNo) {
    $super();

    if(modelNo == undefined){
      modelNo = 0;
    }
    if(modelNo < 0 || GameItem.numModels <= modelNo){
      alert("GameItem: modelNo error: " + modelNo);
      return -1;
    }

    // initialize params
    this.setModel(GameItem.modelArray[modelNo]);
    this.setAnimating(false);
    //this.setMotion(null);
    //this.setAnimationTime(0);
    //this.setAnimator(animator);
    //this.setLoop(true);
    this.setRenderer(renderer);
    this.setRotateAxis(this._yaxis, 0);
    this.setAutoDirection(false);
    this.setPosition(0, 0, 0);

    // FIXME
    this.setScale(30);

    this._progressRate = 0;
    this._progressSpeed = 0.5;

    this.addMoveCallback( function(obj, elapsedTime){
      obj.moveItem(elapsedTime);
    });
  },

  setData: function(data) {
    this.id  = data.id;
    this._bx = data.fromX;
    this._by = data.fromY;
    this.setPosition((this._bx + 0.5) * blockSize, this._padY * blockSize, (this._by + 0.5) * blockSize);
  },

  moveItem: function(elapsedTime) {
    var r = this._progressRate + this._progressSpeed * elapsedTime;
    if(r > 1){
      r -= Math.floor(r);
    }
    this._progressRate = r;

    // FIXME
    this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI * 2.0 * r);
  },
});

GameItem.initialized = false;

// FIXME: model file
GameItem.fileArray = $A([
  "./model/key3.x",
]);
GameItem.numModels = GameItem.fileArray.length;

GameItem.setupSub = function() {
  GameItem.modelArray = $A();
  GameItem.fileArray.each( function(fileName){
    GameItem.modelArray.push( ModelBank.getModel(fileName, renderer) );
  });
  GameItem.initialized = true;
};
GameItem.setup = function(){
  var modelArray = $A();
  GameItem.fileArray.each( function(fileName){
    modelArray.push( ModelBank.getModel(fileName) );
  });
  new ObjectLoadMonitor(modelArray, {
    onload: GameItem.setupSub
  });
};
