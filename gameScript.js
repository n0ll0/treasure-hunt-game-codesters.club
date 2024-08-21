"use strict";
const buttons = document.querySelectorAll("td.button");
const message = document.getElementById("message");
const scoreElement = document.getElementById("scoreElement");

var gameNumber = 0;

const layout = {
  yaxis: { range: [1, 9], title: "score" },
}

/** @type {{state?: Game}} */
const game = {};


const Scores = {
  /** @param {number} score */
  add: function (score) {
    const _scores = JSON.parse(localStorage.getItem("scores"));
    _scores.push(score);
    localStorage.setItem("scores", JSON.stringify(_scores));
  },
  /** @returns {number[]} */
  get: function () {
    return JSON.parse(localStorage.getItem("scores"));
  }
}

// Get previous game data from local storage
if (localStorage.getItem("gameNumber") && localStorage.getItem("currentScore")) {
  const currentScore = parseInt(localStorage.getItem("currentScore"));
  gameNumber = JSON.parse(localStorage.getItem("gameNumber"));
  scoreElement.textContent = `${currentScore} / ${gameNumber} = ${currentScore / gameNumber} average`;
}

if (localStorage.getItem("scores")) {
  Plotly.newPlot("stats", [
    {
      y: Scores.get(),
      type: "lines",
    },
  ], layout);
}

function calcAndStoreScores(attempts) {
  gameNumber++;
  const currentScore = parseInt(localStorage.getItem("currentScore"));
  const score = 10 - attempts;
  const calculatedScore = currentScore + score;
  scoreElement.textContent = `(+${score}) ${calculatedScore} / ${gameNumber} = ${calculatedScore / gameNumber} average`;
  Scores.add(score);

  // save to local storage
  localStorage.setItem("gameNumber", JSON.stringify(gameNumber));
  localStorage.setItem("currentScore", currentScore);

  Plotly.newPlot("stats", [
    {
      y: Scores.get(),
      type: "lines",
    },
  ], layout);
}

class Game {
  #treasure;
  #buttons;
  ended;
  constructor (btns) {
    this.attempts = 0;
    this.ended = false;
    this.#buttons = btns;
    this.#randomizeTreasure();
    this.#buttons.forEach(btn => { btn.onclick = this.#clickButton.bind(this); });
  }

  #randomizeTreasure() {
    this.#treasure = this.#buttons[Math.floor(Math.random() * this.#buttons.length)];
  }

  #clickButton(event) {
    const button = event.target;

    if (button.getAttribute("clicked")) return;

    this.attempts += 1;

    button.setAttribute("clicked", true);

    if (button === this.#treasure) return this.#endGame();
  }

  #endGame() {
    this.ended = true;
    message.textContent = "You've found the treasure!";
    this.#treasure.setAttribute("treasure", true);
    this.#buttons.forEach(btn => {
      btn.onclick = null;
    });
    calcAndStoreScores(this.attempts);
  }

  killGame() {
    this.#buttons.forEach(btn => {
      btn.removeAttribute("treasure");
      btn.removeAttribute("clicked");
    });
  }

}

/**
 * Handle the play again button click
 */
function startNewGame() {
  if (game.state) {
    game.state.killGame()
    delete game.state;
  };

  game.state = new Game(buttons);
  message.textContent = "";
}

function resetGameStats() {
  localStorage.clear();
  window.location.reload();
}

startNewGame();