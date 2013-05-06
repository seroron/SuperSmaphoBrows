var MapBlock = Class.create(DH3DObject, {
  size: 1,
  state: "",
  type: "",
  yaxis: new DHVector3(0, 1, 0),
  bx: 0,
  bz: 0,

  initialize: function($super, type){
    $super();

    switch(type){
      case "forbidden":
        this.setType("forbidden");
        break;
      case "normal":
      default:
        this.setType("normal");
        break;
    }
    this.setAnimating(false);
    this.setRenderer(renderer);
    this.setRotateAxis(this.yaxis,0);
  },

  setType: function(type) {
    if(this.type == type){
      return 0;
    }

    switch(type){
      case "normal":
        this.setModel(MapBlock.model_n.clone());
        break;
      case "forbidden":
        this.setModel(MapBlock.model_f.clone());
        break;
      default:
        return -1;
    }
    this.type = type;
    this.setScale(this.size);

    return 0;
  },
});

MapBlock.initialized = false;
MapBlock.file_n = "model/cube_n.x";
MapBlock.file_f = "model/cube_f.x";
MapBlock.setupSub = function() {
  MapBlock.model_n = ModelBank.getModel(MapBlock.file_n, renderer);
  MapBlock.model_f = ModelBank.getModel(MapBlock.file_f, renderer);
  MapBlock.initialized = true;
};
MapBlock.setup = function() {
  var block_n = ModelBank.getModel(MapBlock.file_n);
  var block_f = ModelBank.getModel(MapBlock.file_f);
  new ObjectLoadMonitor($A([block_n, block_f]), {
    onload: MapBlock.setupSub
  });
};

