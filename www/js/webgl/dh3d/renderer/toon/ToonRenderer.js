/*--------------------------------------------------------------------------------
 * DH3DLibrary ToonRenderer.js v0.2.0
 * Copyright (c) 2010-2012 DarkHorse
 *
 * DH3DLibrary is freely distributable under the terms of an MIT-style license.
 * For details, see the DH3DLibrary web site: http://darkhorse2.0spec.jp/dh3d/
 *
 *------------------------------------------------------------------------------*/
var ToonRenderer = Class.create(Renderer, {
  _vertexShaderName: 'ToonVertexShader',
  _fragmentShaderName: 'ToonFragmentShader',

  initialize: function($super, gl, camera) {
    $super(gl, camera);
  },
});
