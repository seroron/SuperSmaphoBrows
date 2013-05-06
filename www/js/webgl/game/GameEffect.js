var GameEffect = Class.create(DH3DObject, {
  type: "",
  id: 0,

  _bx: 0.0,
  _by: 0.0,
  _fromScale: 0.1,
  _toScale: 1.0,
  _padY: 0.5,

  // received params
  _progressRate: 0,
  _progressSpeed: 0,

  _yaxis: new DHVector3(0, 1, 0),

  initialize: function($super, modelNo) {
    $super();

    if(modelNo == undefined){
      modelNo = 0;
    }
    if(modelNo < 0 || GameEffect.numModels <= modelNo){
      alert("GameEffect: modelNo error: " + modelNo);
      return -1;
    }

    // initialize params
    this.setModel(GameEffect.modelArray[modelNo].clone());
    this.setAnimating(false);
    this.setRenderer(renderer);
    this.setRotateAxis(this._yaxis, 0);
    this.setAutoDirection(false);
    this.setPosition(0, 0, 0);

    // FIXME
    this.setScale(1);

    this.addMoveCallback( function(obj, elapsedTime){
      obj.moveEffect(elapsedTime);
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

    this._fromX          = fx;
    this._fromY          = fy;
    this._toX            = tx;
    this._toY            = ty;
    this._progressRate   = r * 0.01; 
    this._progressSpeed  = speed * 0.01;  // rate/sec

    this._bx = fx + (tx - fx) * r;
    this._by = fy + (ty - fy) * r;

    // FIXME
    switch(data.direction){
      case DIRECTION_UP:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI);
        break;
      case DIRECTION_LEFT:
        this._model.rootBone.rotate.createAxis(this._yaxis, -Math.PI * 0.5);
        break;
      case DIRECTION_RIGHT:
        this._model.rootBone.rotate.createAxis(this._yaxis, Math.PI * 0.5);
        break;
      case DIRECTION_DOWN:
      default:
        this._model.rootBone.rotate.createAxis(this._yaxis, 0);
        break;
    }
  },

  moveEffect: function(elapsedTime) {
    var r = this._progressRate + this._progressSpeed * elapsedTime;
    var s = 1;
    var textureNo = 0;
    if(r > 0){
      // position
      this._bx = this._fromX + (this._toX - this._fromX) * r;
      this._by = this._fromY + (this._toY - this._fromY) * r;

      // scale
      var sr = 1.0 - (1.0 - r) * (1.0 - r);
      s = this._fromScale + (this._toScale - this._fromScale) * sr;
  
      // color
      numTex = GameEffect.numTextures;
      if(r >= 1){
        this._dynamicTexture = GameEffect.transparentTexture;
      }else{
        textureNo = Math.floor(numTex * r);
        this._dynamicTexture = GameEffect.textures[textureNo];
      }

      this._progressRate = r;
    }else{
      // set transparent texture
      this._dynamicTexture = GameEffect.transparentTexture;
    }

    this.setScale(s * blockSize);
    this.setPosition((this._bx + 0.5) * blockSize, this._padY * blockSize, (this._by + 0.5) * blockSize); // FIXME: reference of blockSize
  },
});

GameEffect.initialized = false;

// texture
GameEffect.textures = $A();
GameEffect.transparentTexture = null;
GameEffect.numTextures = 20;

GameEffect.fileArray = $A([
  "model/effect_sphere.x",
]);
GameEffect.setupSub = function() {
  GameEffect.modelArray = $A();
  GameEffect.fileArray.each( function(fileName){
    GameEffect.modelArray.push( ModelBank.getModel(fileName, renderer) );
  });
  GameEffect.initialized = true;
};
GameEffect.setup = function(){
  // prepare texture
  var w = 4;
  var h = 4;

  var textures = $A();
  var num = GameEffect.numTextures;
  for(var i=0; i<num; i++){
    var texCanvas = document.createElement('canvas');
    texCanvas.width = w;
    texCanvas.height = h;

    var c = texCanvas.getContext('2d');
    var r = 255;
    var g = Math.floor(128.0 / num * (num - i - 1));
    var b = 0;
    var a = 1.0 - 1.0 / num * (i + 1);

    c.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    c.clearRect(0, 0, w, h);
    c.fillRect(0, 0, w, h);

    textures[i] = TextureBank.getTexture(texCanvas);
  }
  GameEffect.textures = textures;

  {
    var texCanvas = document.createElement('canvas');
    texCanvas.width = w;
    texCanvas.height = h;

    var c = texCanvas.getContext('2d');
    c.clearRect(0, 0, w, h);

    GameEffect.transparentTexture = TextureBank.getTexture(texCanvas);
  }

  var modelArray = $A();
  GameEffect.fileArray.each( function(fileName){
    modelArray.push( ModelBank.getModel(fileName) );
  });
  new ObjectLoadMonitor(modelArray, {
    onload: GameEffect.setupSub
  });
};

