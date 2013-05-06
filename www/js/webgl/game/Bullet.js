var Bullet = Class.create(DH3DObject, {
  type: "",
  id: 0,
  attack: 0,

  _bx: 0.0,
  _by: 0.0,

  // received params
  _fromX: 0,
  _fromY: 0,
  _toX: 0,
  _toY: 0,
  _progressRate: 0,
  _progressSpeed: 0,

  _padY: 0.5,

  // FIXME
  _xaxis: new DHVector3(1, 0, 0),
  _yaxis: new DHVector3(0, 1, 0),

  initialize: function($super, modelNo) {
    $super();

    if(modelNo == undefined){
      modelNo = 0;
    }
    if(modelNo < 0 || Bullet.numModels <= modelNo){
      alert("Bullet: modelNo error: " + modelNo);
      return -1;
    }

    // initialize params
    this.setModel(Bullet.modelArray[modelNo]);
    //this.setMotion(standingMotion);
    //this.setAnimationTime(0);
    //this.setAnimator(animator);
    //this.setLoop(true);
    this.setAnimating(false);
    this.setRenderer(renderer);
    this.setRotateAxis(this._yaxis, 0);
    this.setAutoDirection(false);
    this.setPosition(0, 0, 0);

    // FIXME
    //this.setScale(100);
    this.setScale(2);

    this.addMoveCallback( function(obj, elapsedTime){
      obj.moveBullet(elapsedTime);
    });
  },

  setData: function(data) {
    this.id = data.id;

    var r     = data.progressRate; // 0-100
    var fx    = data.fromX;
    var fy    = data.fromY;
    var tx    = data.toX;
    var ty    = data.toY;
    var speed = data.progressSpeed;

    this.userName        = data.userName;
    this._fromX          = fx;
    this._fromY          = fy;
    this._toX            = tx;
    this._toY            = ty;
    this._progressRate   = r * 0.01; 
    this._progressSpeed  = speed * 0.01;  // rate/sec
    this.attack          = data.attack;

    this._bx = fx + (tx - fx) * r;
    this._by = fy + (ty - fy) * r;

    // FIXME
    switch(data.direction){
      case DIRECTION_UP:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI);
        break;
      case DIRECTION_DOWN:
      case DIRECTION_NONE:
        this._model.rootBone.rotate.createAxis(this._yaxis, 0);
        break;
      case DIRECTION_LEFT:
        this._model.rootBone.rotate.createAxis(this._yaxis, -Math.PI * 0.5);
        break;
      case DIRECTION_RIGHT:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI * 0.5);
        break;
    }
  },

  moveBullet: function(elapsedTime) {
    var r = this._progressRate + this._progressSpeed * elapsedTime;
    if(r > 0){
      this._bx = this._fromX + (this._toX - this._fromX) * r;
      this._by = this._fromY + (this._toY - this._fromY) * r;
      this._progressRate = r;
    }else{
      // nothing to do
    }

    this.setPosition((this._bx + 0.5) * blockSize, this._padY * blockSize, (this._by + 0.5) * blockSize); // FIXME: reference of blockSize
  },
});

Bullet.initialized = false;

Bullet.fileArray = $A([
  "model/sphere.x",
]);
Bullet.setupSub = function() {
  Bullet.modelArray = $A();
  Bullet.fileArray.each( function(fileName){
    Bullet.modelArray.push( ModelBank.getModel(fileName, renderer) );
  });
  Bullet.initialized = true;
};
Bullet.setup = function(){
  var modelArray = $A();
  Bullet.fileArray.each( function(fileName){
    modelArray.push( ModelBank.getModel(fileName) );
  });
  new ObjectLoadMonitor(modelArray, {
    onload: Bullet.setupSub
  });
};

