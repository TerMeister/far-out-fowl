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


function InstructionsAssistant() { };


/**
 * Which page of instructions is currently showing.
 */
InstructionsAssistant.prototype.instructionsPage = null;


/**
 * Models for the Prev and Next buttons (so we can enable/disabled them).
 */
InstructionsAssistant.prototype.btnPrevModel = {
  label : "<< Prev", buttonClass : "palm-button affirmative", disabled : true
};
InstructionsAssistant.prototype.btnNextModel = {
  label : "Next >>", buttonClass : "palm-button affirmative", disabled : false
};


/**
 * Set up the scene.
 */
InstructionsAssistant.prototype.setup = function() {

  this.instructionsPage = 1;

  // Set up Prev button.
  game.mainAssistant.controller.setupWidget("instructions_btnPrevious", { },
    this.btnPrevModel
  );
  Mojo.Event.listen(game.mainAssistant.controller.get(
    "instructions_btnPrevious"),
    Mojo.Event.tap, function() {
      // Move back a page.
      if (this.instructionsPage > 1) {
        this.instructionsPage = this.instructionsPage - 1;
      }
      this.doCommonButtonWork();
    }.bind(this)
  );

  // Set up Next button.
  game.mainAssistant.controller.setupWidget("instructions_btnNext", { },
    this.btnNextModel
  );
  Mojo.Event.listen(game.mainAssistant.controller.get(
    "instructions_btnNext"),
    Mojo.Event.tap, function() {
      // Move forward a page.
      if (this.instructionsPage < 4) {
        this.instructionsPage = this.instructionsPage + 1;
      }
      this.doCommonButtonWork();
    }.bind(this)
  );

  // Set up Start button.
  game.mainAssistant.controller.setupWidget("instructions_btnStart", { },
    { label : "Start", buttonClass : "palm-button negative" }
  );
  Mojo.Event.listen(game.mainAssistant.controller.get(
    "instructions_btnStart"),
    Mojo.Event.tap, function() {
      game.dialog.mojo.close();
      game.startNewGame();
    }.bind(this)
  );

}; // End setup().


/**
 * Activate the scene.
 */
InstructionsAssistant.prototype.activate = function() {

  // Show high score.
  var highScoreCookie = new Mojo.Model.Cookie("Etherient_FarOutFowl_HighScore");
  var highScore = highScoreCookie.get();
  if (highScore) {
    $("instructions_divHighScore").innerHTML = highScore;
  } else {
    $("instructions_divHighScore").innerHTML = "None yet";
  }

}; // End activate().


/**
 * Do work common to both nav buttons.
 */
InstructionsAssistant.prototype.doCommonButtonWork = function() {

  // By default, enable both nav buttons.
  this.btnPrevModel.disabled = false;
  this.btnNextModel.disabled = false;

  // Disable Prev if necessary.
  if (this.instructionsPage == 1) {
    this.btnPrevModel.disabled = true;
  }

  // Disable Next if necessary.
  if (this.instructionsPage == 4) {
    this.btnNextModel.disabled = true;
  }

  // Update button models.
  game.mainAssistant.controller.modelChanged(this.btnPrevModel);
  game.mainAssistant.controller.modelChanged(this.btnNextModel);

  // Hide all pages, then show the appropriate one.
  $("instructions_divPage1").style.display = "none";
  $("instructions_divPage2").style.display = "none";
  $("instructions_divPage3").style.display = "none";
  $("instructions_divPage4").style.display = "none";
  $("instructions_divPage" + this.instructionsPage).style.display = "";

};
