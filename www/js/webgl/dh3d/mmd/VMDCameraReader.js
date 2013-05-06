/*--------------------------------------------------------------------------------
 * DH3DLibrary VMDCameraReader.js v0.2.0
 * Copyright (c) 2010-2012 DarkHorse
 *
 * DH3DLibrary is freely distributable under the terms of an MIT-style license.
 * For details, see the DH3DLibrary web site: http://darkhorse2.0spec.jp/dh3d/
 *
 *------------------------------------------------------------------------------*/
var VMDCameraReader = Class.create(CameraMotionReader, {
  _binaryReader: null,
  _motion: null,
  _error: 0,

  initialize: function($super) {
    $super();
  },

  readMotion: function(url) {
    if(url.substr(-4) != ".vmd"){
      return false;
    }

    var obj = this;
    var onload = function(){ obj.readMotionProcess(url); };

    this._motion = new VMDCameraMotion();
    this._binaryReader = new BinaryReader(url, false, 'sjis', onload);

    return this._motion;
  },

  readMotionFromFile: function(file) {
    if(file.name.substr(-4) != ".vmd"){
      alert("filename_error: " + file.name);
      return false;
    }

    var obj = this;
    var onload = function(){ obj.readMotionProcess(file); };

    this._motion = new VMDMotion();
    this._binaryReader = new BinaryReader(file, false, 'sjis', onload);

    return this._motion;
  },

  readMotionProcess: function(url) {
    var result = this.readMotionSub(url);

    if(!result){
      if(this._motion.onerror){
        this._motion.onerror();
      }
    }else{
      this._motion.loaded = true;
      if(this._motion.onload){
        this._motion.onload();
      }
    }
    if(this._motion.onloadend){
      this._motion.onloadend();
    }
  },

  readMotionSub: function(url){
    this._motion.frameLength = 0;

    this.readHeader();
    this.readModelMotionFrames();
    this.readFrames();

    return this._motion;
  },

  readHeader: function() {
    var header = this._binaryReader.readString(30);
    if(header != "Vocaloid Motion Data 0002"){
      //myAlert("VMD Format Error");
    }
    // "カメラ・照明"
    this._motion.name = this._binaryReader.readString(20);
  },

  readModelMotionFrames: function() {
    var modelFrames = this._binaryReader.readUnsignedInt();
    // skip model motion
    var motionDataLength = modelFrames * 111;
    this._binaryReader.skipBytes(motionDataLength);

    var faceFrames = this._binaryReader.readUnsignedInt();
    // skip face motion
    var faceDataLength = faceFrames * 23;
    this._binaryReader.skipBytes(faceDataLength);
  },

  readFrames: function() {
    var frames = this._binaryReader.readUnsignedInt();
    //var motionArray = this._motion.motionArray;
    var motionArray = $A();

    for(var i=0; i<frames; i++){
      var frame = new CameraKeyFrame();

      frame.frameNo = this._binaryReader.readUnsignedInt();
      if(frame.frameNo > this._motion.frameLength)
        this._motion.frameLength = frame.frameNo;

      frame.distance = this._binaryReader.readFloat();

      frame.position = new DHVector3(
        this._binaryReader.readFloat(),
        this._binaryReader.readFloat(),
        this._binaryReader.readFloat()
      );

      frame.rotate = new DHVector3(
        this._binaryReader.readFloat(),
        this._binaryReader.readFloat(),
        this._binaryReader.readFloat()
      );

      frame.interpolation = $A();
      for(var j=0; j<24; j++){
        frame.interpolation[j] = this._binaryReader.readUnsignedByte();
      }

      var angleDegree = this._binaryReader.readInt();
      //frame.angle = Math.PI * angleDegree / 180.0;
      frame.angle = angleDegree;

      var perspective = this._binaryReader.readByte();
      frame.perspective = (perspective == 0);

      motionArray.push(frame);
    }

    this._motion.motionArray = motionArray.sortBy( function(frame){
      return frame.frameNo;
    });
  },
});

CameraMotionBank.addMotionReader(VMDCameraReader);

