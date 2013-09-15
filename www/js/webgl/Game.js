DH3DLibrary.loadPackage("../game");

var canvas;
  var canvasWidth  = 768;
  var canvasHeight = 512;
var camera;
  var cameraNear = 10;
  var cameraFar  = 10000;
var renderer;
var animator;
var light;
var keyListener;
var label;

var readyForJoin = false;

// data I/O
var adapter = new WebSocketAdapter();
var receivePlayerDataQueue = $A();
var receiveBulletDataQueue = $A();
var receiveItemDataQueue = $A();
var receiveEffectDataQueue = $A();

// models
var skydomeModel;

// motions
var standingMotion;
var runningMotion;

// game objects
var player;
var skydome;
var playerHash = $H();
var bulletHash = $H();
var itemHash   = $H();
var effectHash = $H();

// map
var mapWidth;
var mapHeight;
var map;
var initialMapData = {
  sid: 0,
  sizeX: 6,
  sizeY: 6,
  data:[
    [100, 100, 100, 100, 100, 100],
    [100,   1,   1,   1,   1, 100],
    [100,   1, 100,   1,   1, 100],
    [100,   1, 100,   1, 100, 100],
    [100,   1,   1,   1,   1, 100],
    [100, 100, 100, 100, 100, 100]
  ]
};

// etc.
var yaxis = new DHVector3(0.0, 1.0, 0.0);

// parameters
var myUserName = "nobody_____";
var blockSize = 15;
var sendKeyInterval = 100; // msec
var stopFlag = false;

var gameMaxTime       = 1000;
var receiveRemainTime = gameMaxTime;
var remainTime        = gameMaxTime;
var remainSetTime     = new Date();

var keySetting = $H({
  up: "I",
  down: "K",
  left: "J",
  right: "L",
  shot1: "Z",
  shot2: "X",
  shot3: "C",
});
var shotArray = $A([
  "shot1", "shot2", "shot3"
]);

var KEY_DOWN_NONE   = "N";
var KEY_DOWN_SHORT  = "S";
var KEY_DOWN_LONG   = "L";

var DIRECTION_UP    = "U";
var DIRECTION_DOWN  = "D";
var DIRECTION_LEFT  = "L";
var DIRECTION_RIGHT = "R";
var DIRECTION_NONE  = "N";

function init() {
  // initialize WebGL objects
  canvas      = new CanvasField($('game'));
  camera      = new Camera();
  renderer    = new SimpleRenderer(canvas.getContext(), camera);
  animator    = new MMDAnimator();
  light       = new Light();
  keyListener = new KeyListener();

  // label
  label = new GameLabel();
  label.showLoadingMessage();

  // map
  MapObject.setup();

  // players
  GamePlayer.setup();

  // bullets
  Bullet.setup();

  // items
  GameItem.setup();

  // effects
  GameEffect.setup();

  // initialize models and motions
  //skydomeModel   = ModelBank.getModel("./model/skydome/青空.x");
  standingMotion = MotionBank.getMotion('./motion/standing.vmd');
  runningMotion  = MotionBank.getMotion('./motion/running.vmd');

  //new ObjectLoadMonitor($A([skydomeModel, standingMotion, runningMotion]), {
  new ObjectLoadMonitor($A([standingMotion, runningMotion]), {
    onload: start
  });
}

function checkObjLoaded() {
  if(!MapObject.initialized)
    return false;

  if(!GamePlayer.initialized)
    return false;

  if(!Bullet.initialized)
    return false;

  if(!GameItem.initialized)
    return false;

  if(!GameEffect.initialized)
    return false;

  return true;
}

function start() {
  if(!checkObjLoaded()){
    setTimeout(start, 500);
    return;
  }

  // renderer
  renderer.setClearColor(1, 1, 1, 1);

  // light
  light.setPosition(30, 70, 100);
  light.setAmbient(0.6, 0.6, 0.6, 0.0);
  light.setDiffuse(0.7, 0.7, 0.7, 0.0);
  light.setSpecular(0.9, 0.9, 0.9, 0.0);
  renderer.setLight(light);

  // player
  var modelType = "magician";
  player = new GamePlayer(modelType);
  player.userName = myUserName; // FIXME
  playerHash.set(myUserName, player);

  // skydome
/*
  var skydome = new DH3DObject();
  skydome.setModel(skydomeModel);
  skydome.setRenderer(renderer);
  skydome.setRotateAxis(yaxis, 0);
  skydome.setPosition(0, 0, 0);
  skydome.setScale(10);
  canvas.addObject(skydome);
*/

  // camera
  camera.bind(player);
  camera.perspective(60.0, canvasWidth / canvasHeight, cameraNear, cameraFar);
  camera.distance = 150;
  camera.setBindOffset(0, blockSize * 0.5, 0.0);
  camera.bindXAngle = -0.30 * Math.PI;
  camera.bindYAngle = Math.PI;
  canvas.setCamera(camera);

  // map
  map = new MapObject();
  //map.createMap(initialMapData);
  map.setBlockSize(blockSize);

  // add objects to canvas
  canvas.addObject(player);
  //canvas.addObject(player._nameBaloon);
  canvas.addObject(label);

  readyForJoin = true;
  var options = "";
  GamePlayer.modelName.each( function(m){
    options += "<option value='" + m.key + "'>" + m.value + "</option>";
  });
  $('modelType').innerHTML = options;
  $('joinForm').setStyle("visibility: visible;");
  $('joinForm').setStyle("display: block;");

  label.showWelcomeMessage();
}

function requestJoin() {
  var modelType = $F("modelType");
  myUserName = $F("userName");

  // value check
  if(myUserName == ""){
    alert("ユーザ名を入力してください");
    return;
  }

  $('joinForm').setStyle("visibility: hidden;");
  $('joinForm').setStyle("display: none;");

  label.showRequestJoinMessage();
  adapter.on("updateMap", receiveMapData);
  adapter.on("updateUser", receivePlayerData);
  adapter.on("updateBullet", receiveBulletData);
  //adapter.on("updateGameData", receiveTimeAndRankingData);
  adapter.connect(myUserName, modelType, successJoin, failureJoin);
}

function successJoin() {
  waitUserData();
}

function waitUserData() {
  var userObj = playerHash.get(myUserName);
  if(!userObj){
    setTimeout(waitUserData, 500);
    return;
  }
  //camera.bind(userObj);
  //player = userObj;

  canvas.setFrameCallback(update);
  canvas.start();

  startSendData();

  if($('ranking')){
    $('ranking').setStyle("display: block;");
  }
}

function failureJoin(reason) {
  alert("ユーザ登録に失敗しました：" + reason);
  $('joinForm').setStyle("visibility: visible;");
  $('joinForm').setStyle("display: block;");
  label.showWelcomeMessage();
}

function update(elapsed) {
  var receivedData = null;

  // Player
  while(receivedData = receivePlayerDataQueue.shift()){
    receivePlayerData(receivedData);
  }

  // Bullet
  while(receivedData = receiveBulletDataQueue.shift()){
    receiveBulletData(receivedData);
  }

  // Item
  while(receivedData = receiveItemDataQueue.shift()){
    receiveItemData(receivedData);
  }

  // Effect
/*
  while(receivedData = receiveEffectDataQueue.shift()){
    receiveEffectData(receivedData);
  }
*/

  // remove old effect
  var oldEffectArray = $A();
  effectHash.values().each( function(effect){
    if(effect._progressRate >= 1.0){
      oldEffectArray.push(effect);
    }
  });
  oldEffectArray.each( function(effect){
    effectHash.unset(effect.id);
    canvas.removeObject(effect);
    delete effect;
  });
  //delete oldEffectArray;

  // calc remainTime
  remainTime = receiveRemainTime - Math.floor((new Date() - remainSetTime) * 0.001);
  if(remainTime < 0)
    remainTime = 0;

  if(stopFlag){
    canvas.pause();
  }
}

var debugMapData = null;
function receiveMapData(mapData) {
  debugMapData = mapData;
  map.createMap(mapData);
}

var debugPlayerData = null;
function receivePlayerData(receivedData) {
  var data = $H(receivedData);
  debugPlayerData = data;
  var newPlayerHash = $H();

  data.values().each( function(obj){
    var p = playerHash.get(obj.userName);
    if(!p){
      p = new GamePlayer(obj.type);

      // revive my character
      if(obj.userName == myUserName){
        camera.bind(p);
        player = p;
      }
      canvas.addObject(p);
      //canvas.addObject(p._nameBaloon);
    }else{
      playerHash.unset(obj.userName);
    }
    p.setData(obj);
    newPlayerHash.set(p.userName, p);
  });
  
  // remove old objects
  playerHash.values().each( function(p){
    canvas.removeObject(p._nameBaloon);
    canvas.removeObject(p);
    delete p._nameBaloon;
    delete p;
  });
  playerHash = newPlayerHash;
}

function receiveBulletData(receivedData) {
  var data = $H(receivedData);
  var newBulletHash = $H();

  data.values().each( function(obj){
    var b = bulletHash.get(obj.id);
    if(!b){
      b = new Bullet();
      canvas.addObject(b);
    }else{
      bulletHash.unset(obj.id);
    }
    b.setData(obj);
    newBulletHash.set(b.id, b);
  });

  // remove old objects
  bulletHash.values().each( function(b){
    // create effect when bullet is removed
    var effectData = {
      id:            (new Date() - 0),
      type:          "explosion",
      fromX:         b._toX,
      fromY:         b._toY,
      toX:           b._toX,
      toY:           b._toY,
      direction:     DIRECTION_NONE,
      progressRate:  0,
      progressSpeed: 250,
    };
    addEffectData(effectData);
    
    canvas.removeObject(b);
    delete b;
  });
  bulletHash = newBulletHash;
}

function receiveItemData(receivedData) {
  var data = $H(receivedData);
  var newItemHash   = $H();

  data.values().each( function(obj){
    var item = itemHash.get(obj.id);
    if(!item){
      item = new GameItem();
      canvas.addObject(item);
    }else{
      itemHash.unset(item.id);
    }
    item.setData(obj);
    newItemHash.set(item.id, item);
  });

  // remove old objects
  itemHash.values().each( function(i){
    canvas.removeObject(i);
    delete i;
  });
  itemHash   = newItemHash;
}

function addEffectData(effectData) {
  var effect = new GameEffect();
  effect.setData(effectData);
  effectHash.set(effect.id, effect);
  canvas.addObject(effect, true);
}

/*
function receiveEffectData(receivedData) {
  var data = $H(receivedData);
  var newEffectHash = $H();

  data.values().each( function(obj){
    var e = effectHash.get(obj.id);
    if(!e){
      e = new GameEffect();
      canvas.addObject(e);
    }else{
      effectHash.unset(e.id);
    }
    e.setData(obj);
    newEffectHash.set(e.id, e);
  });

  // remove old objects
  effectHash.values().each( function(e){
    canvas.removeObject(e);
    delete e;
  });
  effectHash = newEffectHash;
}
*/

function receiveTimeAndRankingData(data) {
  // remain time
  receiveRemainTime = data.remainTime;
  remainTime    = receiveRemainTime;
  remainSetTime = new Date();

  // ranking
  var tableHTML = "<tr><th colspan='3'>Ranking</th></tr>";
  tableHTML += "<tr><th>Rank</th><th>Name</th><th>Point</th></tr>";

  var ranking = data.ranking;
  for(var i=0; i<ranking.length; i++){
    tableHTML += "<tr><td>" + (i+1) + "</td><td>" + ranking[i].userName + "</td><td>" + ranking[i].point + "</td></tr>";
  }

  $('ranking').innerHTML = tableHTML;
}

function getKeyData(keyData) {
  keySetting.each( function(key){
    if(keyListener.getKeyState(key.value)){
      keyData.set(key.key, KEY_DOWN_LONG);
    }else if(keyListener.getKeyNewState(key.value)){
      keyData.set(key.key, KEY_DOWN_SHORT);
    }else{
      keyData.set(key.key, KEY_DOWN_NONE);
    }
  });

  var shotValue = 0;
  var numShot = shotArray.length;
  var i;
  for(i=0; i<numShot; i++){
    var shotName = shotArray[i];
    var val = keyData.get(shotName);
    if(val != "N"){
      shotValue = i+1;
    }
    keyData.unset(shotName);
  }
  keyData.set("shot", shotValue);
  keyData.set("userName", myUserName);

  keyListener.resetKeyNewState();
}

var sendDataTimer = null;
var debugKeyData = null;
function sendData() {
  var data = $H();
  getKeyData(data);
  adapter.sendInput(data.toObject());

  debugKeyData = data;
}

function startSendData() {
  if(sendDataTimer){
    return;
  }
  sendDataTimer = setInterval(function(){ sendData(); }, sendKeyInterval);
}

function stopSendData() {
  if(sendDataTimer){
    clearInterval(sendDataTimer);
    sendDataTimer = null;
  }
}

document.observe('dom:loaded', init);

