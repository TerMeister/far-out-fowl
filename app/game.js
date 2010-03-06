/*
    Far Out Fowl
    Copyright (C) 2010 Frank W. Zammetti
    fzammetti@etherient.com

    Licensed under the terms of the MIT license as follows:

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.
*/


/**
 * The main game object, where all the action is!
 */
var game = {


  /**
   * A reference to the main scene assistant.
   */
  mainAssistant : null,


  /**
   * Flag set to true when a game is in progress (used for pausing).
   */
  gameInProgress : false,


  /**
   * The 2D context of the canvas.
   */
  ctx : null,


  /**
   * The height of the screen.  Used throughout to deal with 400 versus 480
   * screen heights.
   */
  screenHeight : null,


  /**
   * This is a reference to the main game loop bound to the context of the
   * game object.  This is necessary to provide the proper execution context
   * when the main game loop is executed form the interval.
   */
  mainLoopBind : null,


  /**
   * Binds for the key, screen, orientation change and stage event handlers.
   */
  keyDownBind : null,
  keyUpBind : null,
  tapHandlerBind : null,
  orientationChangeBind : null,
  stageActivateBind : null,
  stageDeactivateBind : null,


  /**
   * Reference to the interval that runs the main game loop.
   */
  mainLoopInterval : null,


  /**
   * X/Y values to adjust all coordinates so things are drawn in the playfield.
   */
  xAdj : 20,
  yAdj : 29,


  /**
   * The current score of the game and the score the last time the score
   * changed.
   */
  score : null,
  previousScore : null,
  scoreFlipAmount : null,


  /**
   * The game background image and its height.
   */
  background : null,
  backgroundHeight : null,


  /**
   * The chicken descriptor object.
   */
  chicken : {
    x : null, imgs : [ ], animationFrame : null,
    animationDelay : null, dropX : null, speed : null,
    width : 64, height : 60
  },


  /**
   * The catcher descriptor object.
   */
  catcher : {
    x : null, imgs : [ ], width : 59, height : 19, damage : 0,
    collisionBox : { x1 : null, y1 : null, x2 : null, y2 : null }
  },


  /**
   * The missile descriptor object.
   */
  missile : {
    x : null, y : null, imgs : [ ], animationFrame : null,
    animationDelay : null, inFlight : null, width : 12, height : 24
  },


  /**
   * The explosion descriptor object.
   */
  explosion : {
    x : null, y : null, imgs : [ ], animationFrame : null,
    animationDelay : null, exploding : null, width : 48, height : 48
  },


  /**
   * Object containing everything related to the falling eggs.
   */
  eggData : {
    egg : null, eggSplat : null, count : 0, eggs : [ 100 ],
    eggWidth : 9, eggHeight : 13, eggSplatWidth : 28, eggSplatHeight : 11
  },


  /**
   * An object to hold everything relating to the console and hands.
   */
  gameConsole : {
    frame : null, left : null, middle : null, right : null,
    frameHeight : null, consoleBottomHeight : 80,
    leftHand : [ ], rightHand : [ ],
    leftHandWidth : 105, rightHandWidth : 94,
    LEFT_HAND_NEUTRAL : 0, LEFT_HAND_LEFT : 1, LEFT_HAND_RIGHT : 2,
    RIGHT_HAND_UP : 0, RIGHT_HAND_DOWN : 1,
    leftHandLast : null, rightHandLast : null,
    leftHandCurrrentState : null, rightHandCurrentState : null,
    lightsDelay : null,
    lightsLeft : [
      { y400 : 28, y480 : 28, height : 27, img : null },
      { y400 : 86, y480 : 106, height : 29, img : null },
      { y400 : 144, y480 : 182, height : 29, img : null },
      { y400 : 200, y480 : 260, height : 29, img : null },
      { y400 : 258, y480 : 338, height : 28, img : null }
    ], lightsRight : [
      { y400 : 27, y480 : 27, height : 35, img : null },
      { y400 : 84, y480 : 104, height : 33, img : null },
      { y400 : 144, y480 : 182, height : 29, img : null },
      { y400 : 200, y480 : 260, height : 29, img : null },
      { y400 : 258, y480 : 338, height : 31, img : null }
    ]
  },


  /**
   * Reference to the currently opened dialog, if any.
   */
  dialog : null,


  /**
   * Initialize the game.  This is called once at application startup.
   */
  init : function() {

    var i = null;

    // Use screen height to calculate dimensions for various assets.
    this.screenHeight = Mojo.Environment.DeviceInfo.screenHeight;
    this.backgroundHeight = this.screenHeight - 134;
    this.gameConsole.frameHeight = this.screenHeight - 80;

    // Bind mainLoop() context.
    this.mainLoopBind = this.mainLoop.bind(this);

    // Bind keyUp(), keyDown() and tapHandler() context.
    this.keyUpBind = this.keyUp.bind(this);
    this.keyDownBind = this.keyDown.bind(this);
    this.tapHandlerBind = this.tapHandler.bind(this);

    // Bind method for listening for orientation change events and stage events.
    this.orientationChangeBind = this.orientationChange.bind(this);
    this.stageActivateBind = this.stageActivate.bind(this);
    this.stageDeactivateBind = this.stageDeactivate.bind(this);

    // Preload all images.
    this.background = new Image();
    this.background.src = "images/background-" + this.screenHeight + ".png";
    this.gameConsole.frame = new Image();
    this.gameConsole.frame.src = "images/console-frame-" +
      this.screenHeight + ".png";
    this.gameConsole.left = new Image();
    this.gameConsole.left.src = "images/console-left.png";
    this.gameConsole.middle = new Image();
    this.gameConsole.middle.src = "images/console-middle.png";
    this.gameConsole.right = new Image();
    this.gameConsole.right.src = "images/console-right.png";
    this.gameConsole.leftHand.push(new Image());
    this.gameConsole.leftHand[0].src = "images/left-hand-neutral.png";
    this.gameConsole.leftHand.push(new Image());
    this.gameConsole.leftHand[1].src = "images/left-hand-left.png";
    this.gameConsole.leftHand.push(new Image());
    this.gameConsole.leftHand[2].src = "images/left-hand-right.png";
    this.gameConsole.rightHand.push(new Image());
    this.gameConsole.rightHand[0].src = "images/right-hand-up.png";
    this.gameConsole.rightHand.push(new Image());
    this.gameConsole.rightHand[1].src = "images/right-hand-down.png";
    for (i = 0; i < 5; i++) {
      this.gameConsole.lightsLeft[i].img = new Image();
      this.gameConsole.lightsLeft[i].img.src =
        "images/frame-l-" + i + ".png";
      this.gameConsole.lightsRight[i].img = new Image();
      this.gameConsole.lightsRight[i].img.src =
        "images/frame-r-" + i + ".png";
    }
    for (i = 0; i < 4; i++) {
      this.catcher.imgs[i] = new Image();
      this.catcher.imgs[i].src = "images/catcher-" + i + ".png";
    }
    for (i = 0; i < 2; i++) {
      this.chicken.imgs.push(new Image());
      this.chicken.imgs[i].src = "images/chicken-" + i + ".png";
    }
    this.eggData.egg = new Image();
    this.eggData.egg.src = "images/egg.png";
    this.eggData.eggSplat = new Image();
    this.eggData.eggSplat.src = "images/egg-splat.png";
    for (i = 0; i < 2; i++) {
      this.missile.imgs.push(new Image());
      this.missile.imgs[i].src = "images/missile-" + i + ".png";
    }
    for (i = 0; i < 4; i++) {
      this.explosion.imgs.push(new Image());
      this.explosion.imgs[i].src = "images/explosion-" + i + ".png";
    }

  }, /* End init(). */


  /**
   * Start a new game.  Called any time the game is restarted.
   */
  startNewGame : function() {

    this.ctx.fillStyle = "rgb(255,255,255)";
    this.ctx.font = "normal normal bold 12pt arial";

    // Reset score variables.
    this.score = 0;
    this.previousScore = 0;
    this.scoreFlipAmount = 25;

    // Start chicken off in the middle and on the first frame of animation.
    this.chicken.x = 128;
    this.chicken.animationFrame = 0;
    this.chicken.animationDelay = 0;

    // Determine where the chicken will next drop an egg.
    this.chicken.dropX = Math.floor(Math.random() * (200 - this.xAdj)) + 28;
    this.chicken.speed = 3;

    // Start catcher in the middle and calculate initial collisionBox.
    this.catcher.damage = 0;
    this.catcher.x = 128;
    this.catcher.collisionBox.x1 = this.catcher.x - 5;
    this.catcher.collisionBox.y1 = this.screenHeight - 168;
    this.catcher.collisionBox.x2 = this.catcher.x + 64;
    this.catcher.collisionBox.y2 = this.screenHeight - 154;

    // Reset missile and explosion stuff.
    this.missile.inFlight = false;
    this.missile.animationFrame = 0;
    this.missile.animationDelay = 0;
    this.explosion.exploding = false;
    this.explosion.animationFrame = 0;
    this.explosion.animationDelay = 0;

    // Reset egg data.
    this.eggData.count = 0;
    this.eggData.eggs = [ 100 ];

    // Reset hands and lights.
    this.gameConsole.lightsDelay = 999;
    this.gameConsole.leftHandLast = null;
    this.gameConsole.rightHandLast = null;
    this.gameConsole.leftHandCurrentState = this.gameConsole.LEFT_HAND_NEUTRAL;
    this.gameConsole.rightHandCurrentState = this.gameConsole.RIGHT_HAND_UP;

    // Draw anything that never needs to be drawn again.
    this.ctx.drawImage(this.gameConsole.left, 0, this.screenHeight - 80,
      39, this.gameConsole.consoleBottomHeight);
    this.ctx.drawImage(this.gameConsole.middle, 144, this.screenHeight - 80,
      49, this.gameConsole.consoleBottomHeight);
    this.ctx.drawImage(this.gameConsole.right, 287, this.screenHeight - 80,
      33, this.gameConsole.consoleBottomHeight);

    // Draw the hands.
    this.drawHands();

    // Start the main game loop.
    this.gameInProgress = true;
    this.mainLoopInterval = setInterval(this.mainLoopBind, 33);

  }, /* End startNewGame(). */


  /**
   * The main game loop.  All of the good stuff happens here!
   */
  mainLoop : function() {

    var startTime = new Date().getTime();
    var i = 0;

    // Update lights and score three times a second.
    var propName = "y" + this.screenHeight;
    this.gameConsole.lightsDelay = this.gameConsole.lightsDelay + 1;
    if (this.gameConsole.lightsDelay > 11) {
      this.ctx.drawImage(this.gameConsole.frame, 0, 0, 320,
        this.gameConsole.frameHeight);
      // Center the score text and display it.
      var scoreText = "Score: " + this.score;
      var textMetrics = this.ctx.measureText(scoreText);
      this.ctx.fillText(scoreText, (320 - textMetrics.width) / 2,
        this.screenHeight - 84);
      this.gameConsole.lightsDelay = 0;
      // Randomly flash lights.
      for (i = 0; i < 5; i++) {
        var n = Math.floor(Math.random() * 2);
        if (n == 1) {
          this.ctx.drawImage(
            this.gameConsole.lightsLeft[i].img,
            0, this.gameConsole.lightsLeft[i][propName],
            27, this.gameConsole.lightsLeft[i].height
          );
        }
        n = Math.floor(Math.random() * 2);
        if (n == 1) {
          this.ctx.drawImage(
            this.gameConsole.lightsRight[i].img,
            293, this.gameConsole.lightsRight[i][propName],
            27, this.gameConsole.lightsRight[i].height
          );
        }
      }
    }

    // Draw background.  It's an efficient reset!
    this.ctx.drawImage(this.background, 27, 30, 266, this.backgroundHeight);

    // Draw the eggs, check for collision with catcher, clear egg if caught.
    for (i = 0; i < this.eggData.count; i++) {

      // Display splattered egg.
      if (this.eggData.eggs[i].y > 900) {
        this.ctx.drawImage(this.eggData.eggSplat,
          this.xAdj + this.eggData.eggs[i].x - 14,
          this.yAdj + (this.screenHeight - 150),
          this.eggData.eggSplatWidth, this.eggData.eggSplatHeight
        );
        // Show it for one second (30 frames).
        this.eggData.eggs[i].y--;
        if (this.eggData.eggs[i].y < 980) {
          this.eggData.eggs[i].x = 0;
          this.eggData.eggs[i].y = 0;
          // Increase damage on catcher, end game if destroyed.
          this.catcher.damage = this.catcher.damage + 1;
          if (this.catcher.damage > 3) {
            this.mainAssistant.controller.serviceRequest(
              "palm://com.palm.audio/systemsounds", {
                method : "playFeedback", parameters : { name : "card_02" }
              }
            );
            this.gameInProgress = false;
            clearInterval(this.mainLoopInterval);
            this.dialog = this.mainAssistant.controller.showDialog({
              template : "gameOver-dialog",
              assistant : new GameOverAssistant(),
              preventCancel : true
            });
            return;
          }
        }
      // Display non-splattered egg.
      } else {
        this.ctx.drawImage(this.eggData.egg, this.xAdj + this.eggData.eggs[i].x,
          this.yAdj + this.eggData.eggs[i].y,
          this.eggData.eggWidth, this.eggData.eggHeight
        );
      }

      // Check egg for collision with catcher.  If caught, increase score, and
      // speed if it's time.
      if (this.eggData.eggs[i].x >= this.catcher.collisionBox.x1 &&
        this.eggData.eggs[i].x <= this.catcher.collisionBox.x2 &&
        this.eggData.eggs[i].y >= this.catcher.collisionBox.y1 &&
        this.eggData.eggs[i].y <= this.catcher.collisionBox.y2) {
        this.score = this.score + 5;
        // Increase speed if it's time.
        if (this.score > (this.previousScore + this.scoreFlipAmount)) {
          this.chicken.speed = this.chicken.speed + 1;
          // Increment the speed flip counter so the speed increases slower
          // as we go.
          this.scoreFlipAmount = this.scoreFlipAmount + 50;
          this.previousScore = this.score;
        }
        this.eggData.eggs[i].x = 0;
        this.eggData.eggs[i].y = 0;
      }

      // If this egg isn't splattered then move it.
      if (!(this.eggData.eggs[i].x == 0 && this.eggData.eggs[i].y == 0) &&
        this.eggData.eggs[i].y < this.screenHeight) {
        this.eggData.eggs[i].y = this.eggData.eggs[i].y + this.chicken.speed;
        // If the egg reaches the bottom, set the coordinates to 1000 so we know
        // we have to display it splattered for a few frames before clearing it.
        // Note that 1000 is just an arbitrary number.
        if (this.eggData.eggs[i].y > (this.screenHeight - 150)) {
          this.score = this.score - 5;
          if (this.score < 0) {
            this.score = 0;
          }
          this.previousScore = this.score;
          this.eggData.eggs[i].y = 1000;
        }
      }

    }

    // Clean up the array of eggs to get rid of eggs that splattered.
    for (i = 0; i < this.eggData.eggs.length; i++) {
      if (this.eggData.eggs[i].x == 0 && this.eggData.eggs[i].y == 0) {
        this.eggData.eggs.splice(i, 1);
        this.eggData.count = this.eggData.count - 1;
      }
    }

    // Draw, animate and move the chicken.  Also drop an egg if it's time.
    this.ctx.drawImage(this.chicken.imgs[this.chicken.animationFrame],
      this.xAdj + this.chicken.x, this.yAdj + 2,
      this.chicken.width, this.chicken.height);
    this.chicken.animationDelay = this.chicken.animationDelay + 1;
    if (this.chicken.animationDelay > 2) {
      this.chicken.animationDelay = 0;
      this.chicken.animationFrame = this.chicken.animationFrame + 1;
      if (this.chicken.animationFrame > 1) {
        this.chicken.animationFrame = 0;
      }
    }
    if (!this.explosion.exploding) {
      var dropEgg = false;
      if (this.chicken.x < this.chicken.dropX) {
        // Chicken needs to move right to get to the next drop location.
        this.chicken.x = this.chicken.x + this.chicken.speed;
        // Time to drop an egg?
        if (this.chicken.x >= this.chicken.dropX) {
          // Drop an egg.
          dropEgg = true;
        }
      } else {
        // Chicken needs to move left to get to the next drop location.
        this.chicken.x = this.chicken.x - this.chicken.speed;
        // Time to drop an egg?
        if (this.chicken.x <= this.chicken.dropX) {
          // Drop an egg.
          dropEgg = true;
        }
      }
      if (dropEgg) {
        this.mainAssistant.controller.serviceRequest(
          "palm://com.palm.audio/systemsounds", {
            method : "playFeedback", parameters : { name : "down2" }
          }
        );
        // Add a new egg descriptor object to the array of eggs dropping.
        this.eggData.eggs[this.eggData.count] =
          { x : this.chicken.x + 32, y : 52 };
        this.eggData.count = this.eggData.count + 1;
        // Select new egg drop location.
        this.chicken.dropX = Math.floor(Math.random() *
          (200 - this.xAdj)) + 28;
      }
    }

    // Draw catcher and take care of player movements.
    this.ctx.drawImage(this.catcher.imgs[this.catcher.damage],
      this.xAdj + this.catcher.x, this.yAdj + (this.screenHeight - 156),
      this.catcher.width, this.catcher.height
    );
    // Moving left.
    if (this.gameConsole.leftHandCurrentState ==
      this.gameConsole.LEFT_HAND_LEFT) {
      this.catcher.x = this.catcher.x - 4;
      // Stop at edge of screen.
      if (this.catcher.x < 10) {
        this.catcher.x = 10;
      }
    // Moving right.
    } else if (this.gameConsole.leftHandCurrentState ==
      this.gameConsole.LEFT_HAND_RIGHT) {
      this.catcher.x = this.catcher.x + 4;
      // Stop at edge of screen.
      if (this.catcher.x > 212) {
        this.catcher.x = 212;
      }
    }
    // If catcher is moving, update the collisionBox coordinates.
    if (this.gameConsole.leftHandCurrentState > 0) {
      this.catcher.collisionBox.x1 = this.catcher.x - 5;
      this.catcher.collisionBox.y1 = this.screenHeight - 168;
      this.catcher.collisionBox.x2 = this.catcher.x + 64;
      this.catcher.collisionBox.y2 = this.screenHeight - 154;
    }

    // See if the hands need to be redrawn.
    if (this.gameConsole.leftHandLast !=
      this.gameConsole.leftHandCurrentState ||
      this.gameConsole.rightHandLast !=
      this.gameConsole.rightHandCurrentState) {
      this.drawHands();
    }
    // Record the hand positions for next time.
    this.gameConsole.leftHandLast = this.gameConsole.leftHandCurrentState;
    this.gameConsole.rightHandLast = this.gameConsole.rightHandCurrentState;

    // Deal with missile.
    if (this.missile.inFlight) {
      // Draw it.
      this.ctx.drawImage(this.missile.imgs[this.missile.animationFrame],
        this.xAdj + this.missile.x, this.yAdj + this.missile.y,
        this.missile.width, this.missile.height
      );
      // Animate it.
      this.missile.animationDelay = this.missile.animationDelay + 1;
      if (this.missile.animationDelay > 2) {
        this.missile.animationDelay = 0;
        this.missile.animationFrame = this.missile.animationFrame + 1;
        if (this.missile.animationFrame > 1) {
          this.missile.animationFrame = 0;
        }
      }
      // Check for collision with chicken.
      if (this.missile.y <= 60 && this.missile.y >= 20 &&
        this.missile.x >= (this.chicken.x + 10) &&
        this.missile.x <= (this.chicken.x + this.chicken.width - 10)) {
        this.mainAssistant.controller.serviceRequest(
          "palm://com.palm.audio/systemsounds", {
            method : "playFeedback", parameters : { name : "focusing" }
          }
        );
        this.explosion.x = this.missile.x;
        this.explosion.y = this.missile.y - 20;
        this.explosion.animationFrame = 0;
        this.explosion.animationDelay = 0;
        this.explosion.exploding = true;
        this.missile.inFlight = false;
        this.score = this.score + 50;
        this.catcher.damage = this.catcher.damage - 1;
        if (this.catcher.damage < 0) {
          this.catcher.damage = 0;
        }
      }
      // Move it.
      this.missile.y = this.missile.y - 6;
      if (this.missile.y <= 0) {
        this.missile.inFlight = false;
      }
    }

    // Deal with explosion.
    if (this.explosion.exploding) {
      // Deaw it.
      this.ctx.drawImage(this.explosion.imgs[this.explosion.animationFrame],
        this.xAdj + this.explosion.x, this.yAdj + this.explosion.y,
        this.explosion.width, this.explosion.height
      );
      // Animate it.
      this.explosion.animationDelay = this.explosion.animationDelay + 1;
      if (this.explosion.animationDelay > 3) {
        this.explosion.animationDelay = 0;
        this.explosion.animationFrame = this.explosion.animationFrame + 1;
        if (this.explosion.animationFrame > 3) {
          this.explosion.exploding = false
        }
      }
    }

    var endTime = new Date().getTime();
    Mojo.Log.info("#### Frame Time : " + (endTime - startTime));

  }, /* End mainLoop(). */


  /**
   * Draws the hands in their current position.
   */
  drawHands : function() {

    this.ctx.drawImage(
      this.gameConsole.leftHand[this.gameConsole.leftHandCurrentState],
      39, this.screenHeight - 80, this.gameConsole.leftHandWidth,
      this.gameConsole.consoleBottomHeight
    );
    this.ctx.drawImage(
      this.gameConsole.rightHand[this.gameConsole.rightHandCurrentState],
      193, this.screenHeight - 80, this.gameConsole.rightHandWidth,
      this.gameConsole.consoleBottomHeight
    );

  }, /* End drawHands(). */


  /**
   * Handle KeyDown events.
   *
   * @param inEvent The generated event object.
   */
  keyDown : function(inEvent) {

    if (this.gameInProgress) {

      switch (inEvent.originalEvent.keyCode) {

        // Move left.
        case Mojo.Char.q: case Mojo.Char.q + 32:
          this.gameConsole.leftHandCurrentState =
            this.gameConsole.LEFT_HAND_LEFT;
        break;

        // Move right.
        case Mojo.Char.p: case Mojo.Char.p + 32:
          this.gameConsole.leftHandCurrentState =
            this.gameConsole.LEFT_HAND_RIGHT;
        break;

        // Fire.
        case Mojo.Char.spaceBar:
          if (!this.missile.inFlight) {
            this.mainAssistant.controller.serviceRequest(
              "palm://com.palm.audio/systemsounds", {
                method : "playFeedback", parameters : { name : "back_01" }
              }
            );
            this.missile.inFlight = true;
            this.missile.y = this.yAdj + (this.screenHeight - 206)
            this.missile.x = this.catcher.x + 24;
            this.gameConsole.rightHandCurrentState =
              this.gameConsole.RIGHT_HAND_DOWN;
          }
        break;

      }

    }

  }, /* End keyDown(). */


  /**
   * Handle KeyUp events.
   */
  keyUp : function() {

    if (this.gameInProgress) {
      this.gameConsole.leftHandCurrentState =
        this.gameConsole.LEFT_HAND_NEUTRAL;
      this.gameConsole.rightHandCurrentState =
        this.gameConsole.RIGHT_HAND_UP;
    }

  }, /* End keyUp(). */


  /**
   * Handle screen tap events.
   *
   * @param inEvent The generated event object.
   */
  tapHandler : function(inEvent) {

    if (this.gameInProgress) {
      if (inEvent.down.x <= 160) {
        this.keyDown({ originalEvent : { keyCode : Mojo.Char.q } });
      } else {
        this.keyDown({ originalEvent : { keyCode : Mojo.Char.p } });
      }
    }

  }, /* End tapHandler(). */


  /**
   * Handles orientation change events.
   */
  orientationChange : function(inEvent) {

    if (this.gameInProgress) {
      if (inEvent.pitch > 0) {
        this.keyDown({ originalEvent : { keyCode : Mojo.Char.spaceBar } });
      }
      if (inEvent.roll < -5) {
        this.keyDown({ originalEvent : { keyCode : Mojo.Char.q } });
      }
      if (inEvent.roll > 5) {
        this.keyDown({ originalEvent : { keyCode : Mojo.Char.p } });
      }
    }

  }, /* End orientationChange(). */


  /**
   * Handles stage activation event.
   */
  stageActivate : function() {

    if (this.gameInProgress) {
      this.mainLoopInterval = setInterval(this.mainLoopBind, 33);
    }

  }, /* End stageActivate(). */


  /**
   * Handles stage deactivation event.
   */
  stageDeactivate : function() {

    clearInterval(this.mainLoopInterval);

  } /* End stageDeactivate(). */


}; /* End game object. */
