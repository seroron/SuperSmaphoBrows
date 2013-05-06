/*--------------------------------------------------------------------------------
 * DH3DLibrary CameraMotion.js v0.2.0
 * Copyright (c) 2010-2012 DarkHorse
 *
 * DH3DLibrary is freely distributable under the terms of an MIT-style license.
 * For details, see the DH3DLibrary web site: http://darkhorse2.0spec.jp/dh3d/
 *
 *------------------------------------------------------------------------------*/
var CameraMotion = Class.create({
  hashName: "",
  loaded: false,
  onload: null,

  // motion
  motionArray: null,

  frameLength: 0,
  defaultFPS: 0,
  loop: false,
  
  initialize: function() {
    this.motionArray = $A();
  },

  clone: function() {
    return this;
  },

  copy: function(motion) {
    this.motionArray = motion.motionArray;
    this.frameLength = motion.frameLength;
    this.defaultFPS  = motion.defaultFPS;
    this.loop        = motion.loop;
  },
});
