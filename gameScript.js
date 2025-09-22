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
  // Try to use Plotly, but fallback gracefully if it fails
  try {
    if (typeof Plotly !== 'undefined') {
      Plotly.newPlot("stats", [
        {
          y: Scores.get(),
          type: "scatter",
          mode: "lines+markers",
          line: { color: '#ffd700', width: 3 },
          marker: { color: '#ffd700', size: 8 }
        },
      ], {
        ...layout,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' }
      });
    } else {
      // Fallback: Create a simple CSS-based chart
      createFallbackChart(Scores.get());
    }
  } catch (error) {
    console.log('Plotly not available, using fallback chart');
    createFallbackChart(Scores.get());
  }

  if (score !== null && score !== undefined) {
    scoreElement.querySelector('[table-total]').textContent = `(+${score}) ${Scores.total}`;
  } else {
    scoreElement.querySelector('[table-total]').textContent = Scores.total;
  }
  scoreElement.querySelector('[table-gameNr]').textContent = Scores.gameNr;
  scoreElement.querySelector('[table-avg]').textContent = Math.round((Scores.total / Scores.gameNr) * 100) / 100 || 0;
}

function createFallbackChart(scores) {
  const statsDiv = document.getElementById('stats');
  const maxScore = Math.max(...scores, 10);
  
  let chartHTML = '<div class="fallback-chart"><h4>📈 Score History</h4>';
  
  scores.forEach((score, index) => {
    const height = (score / maxScore) * 100;
    chartHTML += `
      <div class="chart-bar" style="height: ${height}%; background: linear-gradient(to top, #ffd700, #ffed4e);">
        <span class="bar-value">${score}</span>
      </div>
    `;
  });
  
  chartHTML += '</div>';
  statsDiv.innerHTML = chartHTML;
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

    // Add click animation and sound effect
    button.style.transform = "scale(0.9)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);

    button.setAttribute("clicked", true);

    // Update message with encouragement
    this.#updateGameMessage();

    if (button === this.#treasure) return this.#endGame();
  }

  #updateGameMessage() {
    const messages = [
      "🏴‍☠️ Keep searching, matey!",
      "⚓ X marks the spot...",
      "🗺️ The treasure is near!",
      "🦜 Ahoy! Try another spot!",
      "⭐ Fortune favors the bold!"
    ];
    
    if (this.attempts <= messages.length) {
      message.textContent = messages[this.attempts - 1] || "🏴‍☠️ Keep digging!";
    } else {
      message.textContent = `🏴‍☠️ ${this.attempts} attempts so far...`;
    }
  }

  #endGame() {
    this.ended = true;
    
    // Celebration message with treasure emoji
    const celebrationMessages = [
      "🎉 Shiver me timbers! Treasure found! 🎉",
      "⚡ Yo ho ho! You struck gold! ⚡",
      "🌟 Arrr! The treasure be yours! 🌟",
      "💎 Treasure hunter supreme! 💎"
    ];
    
    message.textContent = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    
    // Add celebration effect
    this.#createCelebrationEffect();
    
    document.querySelector('[start]').style.display = "inline-block";
    this.#treasure.setAttribute("treasure", true);
    this.#buttons.forEach(btn => {
      btn.onclick = null;
    });
    calcAndStoreScores(this.attempts);
  }

  #createCelebrationEffect() {
    // Create floating particles effect
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.#createParticle();
      }, i * 100);
    }
  }

  #createParticle() {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    particle.innerHTML = ['⭐', '💰', '💎', '🏆', '✨'][Math.floor(Math.random() * 5)];
    particle.style.cssText = `
      position: fixed;
      font-size: 2em;
      pointer-events: none;
      z-index: 1000;
      left: ${Math.random() * window.innerWidth}px;
      top: ${window.innerHeight}px;
      animation: floatUp 3s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 3000);
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

  // Clear message and add starting message
  message.textContent = "🏴‍☠️ Ahoy! Click to find the hidden treasure! 🏴‍☠️";
  refreshScoreboard();

  document.querySelector('[start]').style.display = "none";
  
  // Add starting animation to buttons
  buttons.forEach((btn, index) => {
    btn.style.animation = `buttonAppear 0.5s ease-out ${index * 0.1}s both`;
  });
}

function resetGameStats() {
  localStorage.clear();
  window.location.reload();
}

function showInstructions() {
  document.getElementById('instructions').style.display = 'block';
}

function hideInstructions() {
  document.getElementById('instructions').style.display = 'none';
}

// Add difficulty levels and game modes
const GameModes = {
  CLASSIC: 'classic',
  TIMED: 'timed',
  MULTI_TREASURE: 'multi'
};

// Enhanced scoring system with combo bonuses
function calcAndStoreScores(attempts) {
  let score = Math.max(1, 10 - attempts);
  
  // Bonus for perfect games (finding in 1 try)
  if (attempts === 1) {
    score += 5;
    message.textContent += " 🎯 PERFECT SHOT BONUS! +5 points!";
  }
  
  // Bonus for quick games (finding in 2-3 tries)
  if (attempts <= 3) {
    score += 2;
    message.textContent += " ⚡ QUICK FIND BONUS! +2 points!";
  }

  Scores.add(score);
  refreshScoreboard(score);
}

startNewGame();