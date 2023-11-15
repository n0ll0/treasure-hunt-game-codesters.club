'use strict';

let attempts = 0;
let gameNumber = 0;
let currentScore = 0;
const buttons = document.querySelectorAll(".button");
let treasureButton;

function randomizeTreasure() {
  const treasureRow = Math.floor(Math.random() * 3);
  const treasureCol = Math.floor(Math.random() * 3);
  treasureButton = buttons[treasureRow * 3 + treasureCol];
}

function buttonClick(event) {
  const button = event.target;

  if (button === treasureButton) {
    if (button.style.backgroundColor === "green") return;

    gameNumber++;
    message.textContent = "You found the treasure!";
    event.target.style.backgroundColor = "green";
    playAgain.style.display = "block";

    let calculatedScore = currentScore + 10 - attempts;
    scoreElement.textContent = calculatedScore + " / " + gameNumber + " = " + (calculatedScore / gameNumber);
    currentScore = calculatedScore;

    buttons.forEach((BUTTON) => {
      if (BUTTON !== treasureButton) {
        BUTTON.style.backgroundColor = "red";
      }
    });

  } else if (button.style.backgroundColor !== "red") {
    attempts++;

    message.textContent = "Try again!";
    event.target.style.backgroundColor = "red";
  }
}

function playAgainClick() {
  buttons.forEach((e) => (e.style.backgroundColor = "#eee"));
  attempts = 0;

  randomizeTreasure();

  message.textContent = "";
  playAgain.style.display = "none";
}

// HTMLElement.prototype.setStyles = function (styles) {
//   for (const style in styles) {
//     this.style[style] = styles[style];
//   }
// };

buttons.forEach((button) => button.addEventListener("click", buttonClick));

playAgain.addEventListener("click", playAgainClick);

randomizeTreasure();
