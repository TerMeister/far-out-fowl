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
 * The main scene for the application.
 */
function MainAssistant() { }


/**
 * Set up this scene.
 */
MainAssistant.prototype.setup = function() {

  // We're greedy, we want the whole screen!
  this.controller.enableFullScreenMode(true);

  // Give the game object a reference to this assistant for dialogs and such.
  game.mainAssistant = this;

}; /* End setup(). */


/**
 * Activate this scene.
 */
MainAssistant.prototype.activate = function() {

  // Initialize the game class.  Do this first so everything downstream that
  // depends on it is good to go.
  game.init();

  // Get a reference to the 2D context of the canvas.
  if (game.screenHeight == 400) {
    $("mainCanvas400").style.display = "block";
    game.ctx = $("mainCanvas400").getContext("2d");
  } else if (game.screenHeight == 480) {
    $("mainCanvas480").style.display = "block";
    game.ctx = $("mainCanvas480").getContext("2d");
  }

  // Set up key and tap event handlers.
  Mojo.Event.listen(this.controller.document, Mojo.Event.keydown,
    game.keyDownBind, true);
  Mojo.Event.listen(this.controller.document, Mojo.Event.keyup,
    game.keyUpBind, true);
  Mojo.Event.listen(this.controller.document, Mojo.Event.tap,
    game.tapHandlerBind, true);

  // Set up orientation change event handler.
  this.controller.listen(this.controller.document, "orientationchange",
    game.orientationChangeBind, true
  );

  // Handle stage activate and deactivate for pausing.
  this.controller.listen(this.controller.document, Mojo.Event.stageActivate,
    game.stageActivateBind, true
  );
  this.controller.listen(this.controller.document, Mojo.Event.stageDeactivate,
    game.stageDeactivateBind, true
  );

  // Show instructions dialog to really kick things off.
  game.dialog = game.mainAssistant.controller.showDialog({
    template : "instructions-dialog",
    assistant : new InstructionsAssistant(),
    preventCancel : true
  });

}; /* End activate(). */


