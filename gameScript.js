"use strict";
const layout = {
  yaxis: {range: [1, 9], title: "score"},
}

let scores = [];

let attempts = 0;
let gameNumber = 0;
let currentScore = 0;
const message = document.getElementById("message");
const playAgain = document.getElementById("playAgain");

// Get previous game data from local storage
if (localStorage.getItem("gameNumber") && localStorage.getItem("currentScore")) {
  gameNumber = JSON.parse(localStorage.getItem("gameNumber"));
  currentScore = JSON.parse(localStorage.getItem("currentScore"));

  scoreElement.textContent = `${currentScore} / ${gameNumber} = ${currentScore / gameNumber} average`;
}
if (localStorage.getItem("scores")) {
  scores = JSON.parse(localStorage.getItem("scores"));
  Plotly.newPlot("stats", [
    {
      y: scores,
      type: "lines",
    },
  ],layout);
}



const buttons = document.querySelectorAll("td.button");

/**
 * Select the treasure button at random
 * @returns {Element}
 */
function randomizeTreasure(btns) {
  return btns[Math.floor(Math.random()*btns.length)];
}

class Game {
  #treasure;
  #buttons;
  ended;
  constructor(btns){
    this.attempts = 0;
    this.ended = false;
    this.#buttons = btns;
    this.#randomizeTreasure();
    this.#buttons.forEach(btn => {btn.onclick = this.#clickButton.bind(this);});
  }

  #randomizeTreasure() {
    this.#treasure = this.#buttons[Math.floor(Math.random()*this.#buttons.length)];
  }

  #clickButton(event) {
    const button = event.target;
    
    if (button.getAttribute("clicked")) return;
    
    this.attempts += 1;
    
    button.setAttribute("clicked",true);
    
    if (button === this.#treasure) return this.#endGame();

  }

  #endGame() {
    this.ended = true;
    this.#treasure.setAttribute("treasure", true);
    this.#buttons.forEach(btn=>{
      btn.onclick = null;
    });

    let calculatedScore = currentScore + 10 - this.attempts;
    gameNumber++;
    scoreElement.textContent = `(+${10 - this.attempts}) ${calculatedScore} / ${gameNumber} = ${
      calculatedScore / gameNumber
    } average`;

    currentScore = calculatedScore;
    // save to local storage
    localStorage.setItem("gameNumber", JSON.stringify(gameNumber));
    localStorage.setItem("currentScore", JSON.stringify(currentScore));
    localStorage.setItem("scores", JSON.stringify(scores));
  }

  killGame() {
    this.#treasure.removeAttribute("treasure");
    this.#buttons.forEach(btn=>{
      btn.removeAttribute("treasure")
      btn.removeAttribute("clicked")
    });
  }

}


// /**
//  * Handle the button click
//  * @param {EventListener | EventListenerObject} event
//  */
// function buttonClick(event) {
//   const button = event.target;

//   if (button === treasureButton) {
//     if (button.style.backgroundColor === "green") return;

//     attempts++;
//     // gameNumber++;

//     message.textContent = "You found the treasure!";
//     event.target.style.backgroundColor = "green";
//     playAgain.style.display = "block";

//     scores.push(10 - attempts);

//     let calculatedScore = currentScore + 10 - attempts;
//     scoreElement.textContent = `(+${10 - attempts}) ${calculatedScore} / ${gameNumber} = ${
//       calculatedScore / gameNumber
//     } average`;

//     currentScore = calculatedScore;

//     buttons.forEach((BUTTON) => {
//       if (BUTTON !== treasureButton) {
//         BUTTON.style.backgroundColor = "red";
//       }
//     });

//     // save to local storage
//     localStorage.setItem("gameNumber", JSON.stringify(gameNumber));
//     localStorage.setItem("currentScore", JSON.stringify(currentScore));
//     localStorage.setItem("scores", JSON.stringify(scores));
//   } else if (button.style.backgroundColor !== "red") {
//     attempts++;

//     message.textContent = "Try again!";
//     event.target.style.backgroundColor = "red";
//   }
// }

// /**
//  * Handle the play again button click
//  */
// function playAgainClick() {
//   buttons.forEach((e) => (e.style.backgroundColor = "#eee"));
//   attempts = 0;

//   randomizeTreasure();

//   message.textContent = "";
//   playAgain.style.display = "none";
//   Plotly.newPlot("stats", [
//     {
//       y: scores,
//       type: "lines",
//     },
//   ],layout);
// }
var game;
/**
 * Handle the play again button click
 */
function startNewGame() {
  if (game) {
    game.killGame()
  };

  game = new Game(buttons);

  message.textContent = "";
  Plotly.newPlot("stats", [
    {
      y: scores,
      type: "lines",
    },
  ],layout);
}

function resetGameStats() {
  localStorage.clear();
  window.location.reload();
}

// buttons.forEach((button) => button.addEventListener("click", buttonClick));
message.textContent = "";
playAgain.style.display = "none";

// randomizeTreasure();

// new Game(buttons);

startNewGame();