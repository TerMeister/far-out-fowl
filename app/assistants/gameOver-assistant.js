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


function GameOverAssistant() { };


/**
 * Set up the scene.
 */
GameOverAssistant.prototype.setup = function() {

  game.mainAssistant.controller.setupWidget("gameOver_btnNewGame", { },
    { label : "New Game", buttonClass : "palm-button affirmative" }
  );
  Mojo.Event.listen(game.mainAssistant.controller.get(
    "gameOver_btnNewGame"),
    Mojo.Event.tap, function() {
      game.dialog.mojo.close();
      game.startNewGame();
    }
  );

  game.mainAssistant.controller.setupWidget("gameOver_btnExit", { },
    { label : "Exit App", buttonClass : "palm-button negative" }
  );
  Mojo.Event.listen(game.mainAssistant.controller.get(
    "gameOver_btnExit"),
    Mojo.Event.tap, function() {
      window.close();
    }
  );

}; // End setup().


/**
 * Activate the scene.
 */
GameOverAssistant.prototype.activate = function() {

  $("gameOver_spanFinalScore").innerHTML = game.score;
  var highScoreCookie = new Mojo.Model.Cookie("Etherient_FarOutFowl_HighScore");
  var highScore = highScoreCookie.get();
  if (!highScore || game.score > highScore) {
    highScoreCookie.put(game.score);
    $("gameOver_divNewHighScore").show();
  }

}; // End setup().
