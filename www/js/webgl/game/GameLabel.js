var GameLabel = Class.create(DH2DObject, {
  _state: "",

  // color
  _white: "rgba(255,255,255,1.0)",
  _black: "rgba(0,0,0,1.0)",

  initialize: function($super) {
    $super();
  },

  showLoadingMessage: function() {
    var message    = $A([
      "読み込み中...",
    ]);
    this.showSimpleMessage(message);
  },

  showWelcomeMessage: function() {
    var message    = $A([
      "右記フォームにユーザ名を入力、",
      "キャラクタを選択して、",
      "「ゲームへ参加」ボタンを押してください"
    ]);
    this.showSimpleMessage(message);
  },

  showRequestJoinMessage: function() {
    var message    = $A([
      "参加申請中...",
    ]);
    this.showSimpleMessage(message);
  },

  showSimpleMessage: function(message) {
    var c = canvas.get2DContext();

    var padding    = 30;
    var messageX   = padding;
    var messageY   = padding * 2;

    c.fillStyle    = this._black;
    c.textAlign    = "left";
    c.testBaseline = "top";
    c.font         = "20px bold sans-serif";

    c.clearRect(0, 0, 10000, 10000); // FIXME
    for(var i=0; i<message.length; i++){
      c.fillText(message[i], messageX, messageY);
      messageY += padding;
    }
  },

  render: function() {
    var c = canvas.get2DContext();

    c.textAlign    = "center";
    c.testBaseline = "top";
    c.shadowBlur   = 0;

    c.lineCap      = "butt";
    c.lineJoin     = "miter";
    c.lineWidth    = 3;

    c.font         = "20px bold sans-serif";
    c.fillStyle    = this._white;
    c.strokeStyle  = this._black;

    // draw userName
    {
      var padding    = 30;
      var message    = "Name: " + myUserName;
      var messageX   = padding;
      var messageY   = padding * 2;
      c.fillStyle    = this._white;
      c.strokeStyle  = this._black;
      c.textAlign    = "left";
      c.testBaseline = "top";
      c.font         = "18px bold sans-serif";
      c.strokeText(message, messageX, messageY);
      c.fillText(message, messageX, messageY);
    }

    // draw life
    {
      var padding    = 30;
      var message    = "Life:";
      var messageX   = padding;
      var messageY   = padding * 3;
      c.fillStyle    = this._white;
      c.strokeStyle  = this._black;
      c.textAlign    = "left";
      c.testBaseline = "top";
      c.font         = "18px bold sans-serif";
      c.strokeText(message, messageX, messageY);
      c.fillText(message, messageX, messageY);
 
      var dstX = 60;
      var imgW = 64;
      var imgH = 36;
      var dstY = messageY - imgH * 0.6 + 10;
      var imgPadding = -20;

      var numLifeMax = 5;
      var lifeMax = 5;
      var lifeStep = lifeMax / numLifeMax;

      var life = player.life;
      var v = 0;
      for(var i=0; i<numLifeMax; i++){
        if(life < v){
          break;
        }else if(life >= v + lifeStep){
          c.drawImage(GameLabel.lifeImage, dstX, dstY);
        }else{
          var dstW = Math.floor(imgW * (life - v) / lifeStep);
          c.drawImage(GameLabel.lifeImage, dstX, dstY, dstW, imgH);
        }
        dstX += imgW + imgPadding;
        v += lifeStep;
      }
    }

    // draw kill count
    {
      var padding    = 30;
      var message    = "Kill: " + player._killCnt;
      var messageX   = padding;
      var messageY   = padding * 4;
      c.fillStyle    = this._white;
      c.strokeStyle  = this._black;
      c.textAlign    = "left";
      c.testBaseline = "top";
      c.font         = "18px bold sans-serif";
      c.strokeText(message, messageX, messageY);
      c.fillText(message, messageX, messageY);
    }

    // draw dead count
    {
      var padding    = 30;
      var message    = "Dead: " + player._deadCnt;
      var messageX   = padding;
      var messageY   = padding * 5;
      c.fillStyle    = this._white;
      c.strokeStyle  = this._black;
      c.textAlign    = "left";
      c.testBaseline = "top";
      c.font         = "18px bold sans-serif";
      c.strokeText(message, messageX, messageY);
      c.fillText(message, messageX, messageY);
    }

    // draw remain time
    {
      var padding    = 30;
      var message    = "Time:";
      var messageX   = padding;
      var messageY   = canvasHeight - padding * 2;
      c.fillStyle    = this._white;
      c.strokeStyle  = this._black;
      c.textAlign    = "left";
      c.testBaseline = "top";
      c.font         = "18px bold sans-serif";
      c.strokeText(message, messageX, messageY);
      c.fillText(message, messageX, messageY);
 
      // c.textAlign    = "right";
      // c.strokeText(remainTime, messageX + 100, messageY);
      // c.fillText  (remainTime, messageX + 100, messageY);

      // draw bar
      var rate        = remainTime / gameMaxTime;
      if(rate > 1.0)
        rate = 1.0;

      var rectX       = 100;
      var maxBarWidth = canvasWidth - rectX - padding;
      var barWidth    = Math.floor(maxBarWidth * rate);
      var barHeight   = 20;
      var rectY       = messageY - barHeight + 18;

      /*
      var r = Math.floor(255.0 * rate);
      var g = Math.floor(255.0 * (1.0 - rate));
      var b = 0;
      c.fillStyle = "rgba(" + r + "," + g + "," + b + ",1.0)";
      */
      c.fillStyle = "rgba(255, 0, 0, 1.0)";
      c.fillRect(rectX, rectY, barWidth, barHeight);
      c.strokeRect(rectX, rectY, maxBarWidth, barHeight);
    }
  },
});

GameLabel.lifeImage = new Image();
GameLabel.lifeImage.src = "./img/nc68861_s.png";

