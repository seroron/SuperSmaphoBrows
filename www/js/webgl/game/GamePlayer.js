var GamePlayer = Class.create(DH3DObject, {
  type: "",
  userName: "",
  life: 3,
  _bx: 0.0,
  _by: 0.0,

  // received params
  _fromX: 0,
  _fromY: 0,
  _toX: 0,
  _toY: 0,
  _direction: "N",
  _progressRate: 0,
  _progressSpeed: 0,
  _deadCnt: 0,
  _killCnt: 0,

  _nameBaloon: null,
  _opened: false,

  // FIXME
  _yaxis: new DHVector3(0, 1, 0),
  _defaultModelType: "golem",

  initialize: function($super, modelType){
    $super();

    if(modelType == undefined){
      modelType = this._defaultModelType;
    }
    this.type = modelType;

    var modelPath = GamePlayer.modelHash.get(modelType);
    if(modelPath == null){
      alert("GamePlayer: modelType error: " + modelType);
      return -1;
    }
    
    // baloon
    var baloon = canvas.createMessageWindow();
    baloon.setMessage("...");
    baloon._bindedObject = this;
    baloon._bindedBone = "頭";
    baloon._bindedCamera = camera;
    baloon._offset = new DHVector3(0, 10.0, 0);
    this._nameBaloon = baloon;
    this._nameBaloon.open();

    // initialize params
    this.setModel(modelPath);
    this.setMotion(standingMotion);
    this.setAnimationTime(0);
    this.setAnimator(animator);
    this.setAnimating(true);
    this.setLoop(true);
    this.setRenderer(renderer);
    this.setRotateAxis(this._yaxis, 0);
    this.setAutoDirection(false);
    this.setPosition(0, 0, 0);

    this.addMoveCallback( function(obj, elapsedTime){
      obj.moveCharacter(elapsedTime);
    });
  },

  setData: function(data) {
    var r     = data.progressRate; // 0-100
    var fx    = data.fromX;
    var fy    = data.fromY;
    var tx    = data.toX;
    var ty    = data.toY;
    var speed = data.progressSpeed;

    this.userName        = data.userName;
    this._nameBaloon.setMessage(data.userName + "(" + data.life + ")");
/*
    if(this._opened){
      this._nameBaloon.setMessage(data.userName + "(" + data.life + ")");
      this._nameBaloon.open();
      this._opened = true;
    }
*/
    this._fromX          = fx;
    this._fromY          = fy;
    this._toX            = tx;
    this._toY            = ty;
    this._direction      = data.direction;
    this._progressRate   = r * 0.01; 
    this._progressSpeed  = speed * 0.01;  // rate/sec
    this.life            = data.life;
    this._deadCnt        = data.deadCnt;
    this._killCnt        = data.killCnt;

    this._bx = fx + (tx - fx) * r;
    this._by = fy + (ty - fy) * r;

    // FIXME
    switch(data.direction){
      case DIRECTION_UP:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI);
        break;
      case DIRECTION_DOWN:
        this._model.rootBone.rotate.createAxis(this._yaxis, 0);
        break;
      case DIRECTION_LEFT:
        this._model.rootBone.rotate.createAxis(this._yaxis, -Math.PI * 0.5);
        break;
      case DIRECTION_RIGHT:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI * 0.5);
        break;
    }

    // move character
    if(this._state != 'running'){
      this.setMotionWithBlending(runningMotion, 5); // FIXME: reference motion
      this.animationTime = 0;
      this._state = 'running';
    }
  },

  moveCharacter: function(elapsedTime) {
    var r = this._progressRate + this._progressSpeed * elapsedTime;
    if(r > 1){
      this._bx = this._toX;
      this._by = this._toY;

      // stop character
      this._progressRate = 0;
      this._progressSpeed = 0;
      if(this._state != 'standing'){
        this.setMotionWithBlending(standingMotion, 5); // FIXME: reference motion
        this.animationTime = 0;
        this._state = 'standing';
      }
    }else if(r > 0){
      this._bx = this._fromX + (this._toX - this._fromX) * r;
      this._by = this._fromY + (this._toY - this._fromY) * r;
      this._progressRate = r;
    }else if(this._progressSpeed == 0){
      // no move
      if(this._state != 'standing'){
        this.setMotionWithBlending(standingMotion, 5); // FIXME: reference motion
        this.animationTime = 0;
        this._state = 'standing';
      }
    }

    this.setPosition((this._bx + 0.5) * blockSize, 0, (this._by + 0.5) * blockSize); // FIXME: reference of blockSize
  }
});

GamePlayer.initialized = false;

// FIXME: model file
GamePlayer.fileHash = $H({
  golem:      "./model/etude/golem002/golem002.pmd",
  heavyArmor: "./model/etude/heavy_armor/heavy_armor.pmd",
  knight:     "./model/etude/knight/knight.pmd",
  magician:   "./model/etude/magician/magician.pmd",
  man:        "./model/etude/man007/man007_v002.pmd",
  pawn:       "./model/etude/pawn/pawn.pmd",
});
GamePlayer.modelName = $H({
  golem:      "ゴーレム",
  heavyArmor: "重装兵",
  knight:     "騎士",
  magician:   "魔法使い",
  man:        "男",
  pawn:       "歩兵",
});
GamePlayer.numModels = GamePlayer.fileHash.size();

GamePlayer.setupSub = function() {
  GamePlayer.modelHash = $H();
  GamePlayer.fileHash.each( function(file){
    GamePlayer.modelHash.set(file.key, ModelBank.getModel(file.value, renderer) );
  });
  GamePlayer.initialized = true;
};
GamePlayer.setup = function(){
  var modelHash = $H();
  GamePlayer.fileHash.each( function(file){
    modelHash.set(file.key, ModelBank.getModel(file.value) );
  });
  new ObjectLoadMonitor(modelHash.values(), {
    onload: GamePlayer.setupSub
  });
};

