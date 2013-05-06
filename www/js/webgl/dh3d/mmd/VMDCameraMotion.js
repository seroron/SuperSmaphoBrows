/*--------------------------------------------------------------------------------
 * DH3DLibrary VMDCameraMotion.js v0.2.0
 * Copyright (c) 2010-2012 DarkHorse
 *
 * DH3DLibrary is freely distributable under the terms of an MIT-style license.
 * For details, see the DH3DLibrary web site: http://darkhorse2.0spec.jp/dh3d/
 *
 *------------------------------------------------------------------------------*/
var VMDCameraMotion = Class.create(CameraMotion, {
  // Header
  name: '',

  initialize: function($super) {
    $super();
    this.defaultFPS = 30;
  },
});
