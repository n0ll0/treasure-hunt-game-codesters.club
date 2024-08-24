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

class Scores {
  static gameNr = 0;
  static total = 0;
  /** @type {void}*/
  static add(score) {
    const _scores = this.get();
    _scores.push(score);
    localStorage.setItem("scores", JSON.stringify(_scores));
  }
  /** @type {number[]}*/
  static get() {
    /** @type {number[]}*/
    const _scores = JSON.parse(localStorage.getItem("scores"));
    if (!_scores) {
      localStorage.setItem("scores", '[]');
      return this.get();
    }
    this.gameNr = _scores.length;
    this.total = _scores.reduce((prev, score) => prev + score, 0);
    return _scores;
  }
}

/**
 * 
 * @param {number?} score
 */
function refreshScoreboard(score) {
  Plotly.newPlot("stats", [
    {
      y: Scores.get(),
      type: "lines",
    },
  ], layout);

  if (score !== null && score !== undefined) {
    scoreElement.querySelector('[table-total]').textContent = `(+${score}) ${Scores.total}`;
  } else {
    scoreElement.querySelector('[table-total]').textContent = Scores.total;
  }
  scoreElement.querySelector('[table-gameNr]').textContent = Scores.gameNr;
  scoreElement.querySelector('[table-avg]').textContent = Scores.total / Scores.gameNr;
}

function calcAndStoreScores(attempts) {
  const score = 10 - attempts;

  Scores.add(score);

  refreshScoreboard(score)
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
    document.querySelector('[start]').style.display = "inline-block";
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
  refreshScoreboard();

  document.querySelector('[start]').style.display = "none";
}

function resetGameStats() {
  localStorage.clear();
  window.location.reload();
}

startNewGame();