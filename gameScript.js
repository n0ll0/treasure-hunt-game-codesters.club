'use strict';

let attempts = 0;
let gameNumber = 0;
let currentScore = 0;

// Get previous game data from local storage
if (localStorage.getItem("gameNumber") &&window.localStorage.getItem("currentScore")) {
  gameNumber = JSON.parse(localStorage.getItem("gameNumber"));
  currentScore = JSON.parse(localStorage.getItem("currentScore"));

  scoreElement.textContent = `${currentScore} / ${gameNumber} = ${currentScore / gameNumber} average`;
}

const buttons = document.querySelectorAll(".button");
let treasureButton;

/**
 * Select the treasure button at random
 */
function randomizeTreasure() {
  treasureButton = buttons[Math.round(Math.random() * 9)];
}

/**
 * Handle the button click
 * @param {EventListenerOrEventListenerObject} event
 */
function buttonClick(event) {
  const button = event.target;
  
  if (button === treasureButton) {
    if (button.style.backgroundColor === "green") return;

    attempts++;
    gameNumber++;

    message.textContent = "You found the treasure!";
    event.target.style.backgroundColor = "green";
    playAgain.style.display = "block";

    let calculatedScore = currentScore + 10 - attempts;
    scoreElement.textContent = `(+${10-attempts}) ${calculatedScore} / ${gameNumber} = ${calculatedScore / gameNumber} average`;

    currentScore = calculatedScore;
    
    buttons.forEach((BUTTON) => {
      if (BUTTON !== treasureButton) {
        BUTTON.style.backgroundColor = "red";
      }
    });

    // save to local storage
   window.localStorage.setItem("gameNumber", JSON.stringify(gameNumber));
   window.localStorage.setItem("currentScore", JSON.stringify(currentScore));

  } else if (button.style.backgroundColor !== "red") {
    attempts++;

    message.textContent = "Try again!";
    event.target.style.backgroundColor = "red";
  }
}

/**
 * Handle the play again button click
 */
function playAgainClick() {
  buttons.forEach((e) => (e.style.backgroundColor = "#eee"));
  attempts = 0;

  randomizeTreasure();

  message.textContent = "";
  playAgain.style.display = "none";
}

function resetGameStats() {
  window.localStorage.clear();
  window.location.reload();
}

buttons.forEach((button) => button.addEventListener("click", buttonClick));

playAgain.addEventListener("click", playAgainClick);

randomizeTreasure();
