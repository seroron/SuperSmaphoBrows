var MapObject = Class.create(DH3DObject, {
  sid: 0,
  height: 1,
  width: 1,

  _blockSize: 1,
  _mapData: $A(),
  //_blockArray: $A(),

  //_model: null,
  _yaxis: new DHVector3(0, 1, 0),
  _initialMapData: {
    sid: 0,
    sizeX: 1,
    sizeY: 1,
    data: [[1]],
  },

  initialize: function($super) {
    $super();

    this.createMap(this._initialMapData);
  },

  setBlockSize: function(size) {
    this._blockSize = size;

    this.setScale(size);
    this.setPosition(0, 0, 0);

    /*
    this._blockArray.each( function(block){
      block.setScale(size);
      block.setPosition(block.bx * size, 0, block.bz * size);
    });
    */
  },

  addObjects: function() {
    canvas.addObject(this);
    /*
    this._blockArray.each( function(block){
      canvas.addObject(block);
    });
    */
  },

  removeObjects: function() {
    canvas.removeObject(this);
    /*
    this._blockArray.each( function(block){
      canvas.removeObject(block);
    });
    this._blockArray.clear();
    */
  },

  createMap: function(data) {
    this.removeObjects();

    this.sid      = data.sid;
    this.width    = data.sizeX;
    this.height   = data.sizeY;
    this._mapData = $A(data.data);
    /*
    this.height = this._mapData.length;
    
    var maxWidth = 0;
    for(var z=0; z<this.height; z++){
      var w = this._mapData[z].length;
      if(w > maxWidth)
        maxWidth = w;
    }
    this.width = maxWidth;
    */

    var gl = canvas._gl;
    var m = new Model();
    this._model = m;
    m.renderer = renderer;
    m.hashName = "MapObject";

    var skinArray = $A();
    m.skinArray = skinArray;

    var indexArray = $A();
    m.indexArray = indexArray;

    var baseBone = new Bone();
    m.boneArray.push(baseBone);
    m.rootBone.addChild(baseBone);

    var mapWidth = this.width;
    var mapHeight = this.height;
    var mapData = this._mapData;

    var skinIndex = 0;
    MapObject.modelHash.each( function(model){
      var modelUsed = false;
      var modelNo = model.key;
      var orgModel = model.value;
      var orgNumSkins = orgModel.skinArray.length;

      // create skinArray
      for(var h=0; h<mapHeight; h++){
        var mapDataLine = mapData[h];
        for(var w=0; w<mapWidth; w++){
          if(mapDataLine[w] == modelNo){
            modelUsed = true;
            orgModel.skinArray.each( function(orgSkin){
              var s = new Skin();
              s.position   = new DHVector3(orgSkin.position.x + w, orgSkin.position.y, orgSkin.position.z + h);
              s.normal     = orgSkin.normal;
              s.textureUV  = orgSkin.textureUV;
              s.boneIndex  = orgSkin.boneIndex;
              s.skinWeight = orgSkin.skinWeight;
              skinArray.push(s);
            });
          }
        }
      }

      // create indexArray
      if(modelUsed){
        orgModel.renderGroupArray.each( function(orgGroup){
          var group = new RenderGroup();
          group.boneArray = $A();
          group.boneArray[0] = baseBone;
          group.material = orgGroup.material;
          m.materialArray.push(group.material);
          m.renderGroupArray.push(group);
      
          var arr = $A();
          var modelSkinIndex = skinIndex;
          for(var h=0; h<mapHeight; h++){
            var mapDataLine = mapData[h];
            for(var w=0; w<mapWidth; w++){
              if(mapDataLine[w] == modelNo){
                orgGroup.indices.each( function(orgIndex){
                  arr.push(orgIndex + modelSkinIndex);
                });
                modelSkinIndex += orgNumSkins;
              }
            }
          }
          group.indices = arr;
  
          // index buffer
          group.indexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.STATIC_DRAW);
        });
      }
      skinIndex = skinArray.length;
    });

    // vertex buffer
    m.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, renderer.getVertexData(m), gl.STATIC_DRAW);

    m.loaded = true;

    //this._createFloor();
    //this._createBlock();

    this.setBlockSize(this._blockSize);
    this.setAnimating(false);
    this.setRenderer(renderer);
    this.setRotateAxis(this._yaxis, 0);
    this.setPosition(0, 0, 0);

    this.addObjects();
  },

/*
  _createFloor: function() {
    var baseModel = MapBlock.model_n;
    var m = new Model();
    this._model = m;

    m.renderer = renderer;
    m.hashName = "MapFloor";

    var topNormal = new DHVector3(0, 1, 0);

    var uv00 = new TextureUV(0, 0);
    var uv01 = new TextureUV(0, 1);
    var uv10 = new TextureUV(1, 0);
    var uv11 = new TextureUV(1, 1);

    var skinArray = $A();
    var s;

    for(var z=0; z<this.height; z++){
      for(var x=0; x<this.width; x++){
        s = new Skin();
        s.position  = new DHVector3(x, 0, z);
        s.normal    = topNormal;
        s.textureUV = uv00;
        skinArray.push(s);

        s = new Skin();
        s.position  = new DHVector3(x, 0, z+1);
        s.normal    = topNormal;
        s.textureUV = uv01;
        skinArray.push(s);

        s = new Skin();
        s.position  = new DHVector3(x+1, 0, z);
        s.normal    = topNormal;
        s.textureUV = uv10;
        skinArray.push(s);

        s = new Skin();
        s.position  = new DHVector3(x+1, 0, z+1);
        s.normal    = topNormal;
        s.textureUV = uv11;
        skinArray.push(s);
      }
    }

    // set bone
    skinArray.each( function(skin){
      skin.boneIndex[0] = 0;
      skin.boneIndex[1] = -1;
      skin.boneIndex[2] = -1;
      skin.boneIndex[3] = -1;

      skin.skinWeight[0] = 1.0;
      skin.skinWeight[1] = 0.0;
      skin.skinWeight[2] = 0.0;
      skin.skinWeight[3] = 0.0;
    });

    m.skinArray = skinArray;

    var baseBone = new Bone();
    var group = new RenderGroup();
    group.boneArray = $A();
    group.boneArray[0] = baseBone;
    group.material = baseModel.renderGroupArray[0].material;
    m.materialArray[0] = group.material;

    m.renderGroupArray = $A([group]);
    m.boneArray.push(baseBone);
    m.rootBone.addChild(baseBone);

    var arr = $A();
    for(var index=0; index<skinArray.length; index+=4){
      arr.push(index + 0);
      arr.push(index + 1);
      arr.push(index + 2);
      arr.push(index + 1);
      arr.push(index + 2);
      arr.push(index + 3);
    }
    m.indexArray = arr;
    group.indices = arr;

    // vertex buffer
    var gl = canvas._gl;
    m.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, renderer.getVertexData(m), gl.DYNAMIC_DRAW);

    // index buffer
    group.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.DYNAMIC_DRAW);

    m.loaded = true;
  },

  _createBlock: function() {
    var line;
    var block;
    var blockType = 100;
    for(var z=0; z<this.height; z++){
      line = this._mapData[z];
      for(var x=0; x<this.width; x++){
        if(line[x] >= blockType){
          block = new MapBlock("forbidden"); // FIXME
          block.bx = x;
          block.bz = z;
          this._blockArray.push(block);
        }
      }
    }
  },
*/
});

MapObject.initialized = false;
MapObject.fileHash = $H({
    1: "model/plate_n.x",
  100: "model/cube_f.x",
});
MapObject.modelHash = $H();
MapObject.setupSub = function() {
  MapObject.fileHash.each( function(file){
    MapObject.modelHash.set(file.key, ModelBank.getModel(file.value, renderer));
  });
  MapObject.initialized = true;
};
MapObject.setup = function() {
  var arr = $A();
  MapObject.fileHash.values().each( function(fileName){
    var m = ModelBank.getModel(fileName);
    arr.push(m);
  });
  new ObjectLoadMonitor(arr, {
    onload: MapObject.setupSub
  });
};

