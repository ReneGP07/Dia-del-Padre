const views = document.querySelectorAll('.hero, .page-view');
const navButtons = document.querySelectorAll('[data-view]');

function showView(viewId) {
  views.forEach(view => view.classList.remove('active-view'));
  const nextView = document.getElementById(viewId);
  if (nextView) {
    nextView.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

navButtons.forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

const difficultyButtons = document.querySelectorAll('.difficulty');
const gameArea = document.getElementById('gameArea');
const startButton = document.getElementById('startGame');
const resetButton = document.getElementById('resetGame');
const scoreEl = document.getElementById('score');
const missesEl = document.getElementById('misses');
const timeLeftEl = document.getElementById('timeLeft');
const gameMessage = document.getElementById('gameMessage');

const difficulties = {
  facil: { label: 'Fácil', targetSize: 86, spawnMs: 980, visibleMs: 1250, duration: 30, points: 10 },
  media: { label: 'Media', targetSize: 72, spawnMs: 760, visibleMs: 900, duration: 30, points: 15 },
  dificil: { label: 'Difícil', targetSize: 58, spawnMs: 600, visibleMs: 680, duration: 30, points: 20 },
  pro: { label: 'Pro', targetSize: 44, spawnMs: 450, visibleMs: 500, duration: 30, points: 30 }
};

let currentDifficulty = 'facil';
let score = 0;
let misses = 0;
let timeLeft = difficulties.facil.duration;
let gameRunning = false;
let spawnTimer = null;
let countdownTimer = null;

function updateScoreboard() {
  scoreEl.textContent = score;
  missesEl.textContent = misses;
  timeLeftEl.textContent = timeLeft;
}

function clearTargets() {
  gameArea.querySelectorAll('.target').forEach(target => target.remove());
}

function setDifficulty(difficulty) {
  if (gameRunning) return;
  currentDifficulty = difficulty;
  difficultyButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.difficulty === difficulty);
  });
  timeLeft = difficulties[difficulty].duration;
  updateScoreboard();
  gameMessage.textContent = `Dificultad seleccionada: ${difficulties[difficulty].label}.`;
}

difficultyButtons.forEach(button => {
  button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
});

function spawnTarget() {
  if (!gameRunning) return;

  const config = difficulties[currentDifficulty];
  const target = document.createElement('button');
  target.className = 'target';
  target.type = 'button';
  target.setAttribute('aria-label', 'Blanco');

  const areaRect = gameArea.getBoundingClientRect();
  const size = config.targetSize;
  const maxX = Math.max(0, areaRect.width - size - 18);
  const maxY = Math.max(80, areaRect.height - size - 18);

  const x = Math.floor(Math.random() * maxX) + 9;
  const y = Math.floor(Math.random() * (maxY - 76)) + 76;

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  let hit = false;

  target.addEventListener('click', event => {
    event.stopPropagation();
    if (!gameRunning || hit) return;
    hit = true;
    score += config.points;
    updateScoreboard();
    target.remove();
  });

  gameArea.appendChild(target);

  setTimeout(() => {
    if (!hit && target.isConnected && gameRunning) {
      misses += 1;
      updateScoreboard();
      target.remove();
    }
  }, config.visibleMs);
}

function startGame() {
  if (gameRunning) return;
  const config = difficulties[currentDifficulty];
  score = 0;
  misses = 0;
  timeLeft = config.duration;
  gameRunning = true;
  clearTargets();
  updateScoreboard();
  gameMessage.textContent = 'Juego iniciado. Toca los blancos.';

  spawnTarget();
  spawnTimer = setInterval(spawnTarget, config.spawnMs);
  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateScoreboard();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearTargets();

  let result = 'Buen intento.';
  if (score >= 420) result = 'Nivel vaquero legendario.';
  else if (score >= 260) result = 'Muy buen tiro.';
  else if (score >= 140) result = 'Buen pulso, sheriff.';

  gameMessage.textContent = `${result} Puntuación final: ${score}. Fallos: ${misses}.`;
}

function resetGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearTargets();
  score = 0;
  misses = 0;
  timeLeft = difficulties[currentDifficulty].duration;
  updateScoreboard();
  gameMessage.textContent = 'Juego reiniciado.';
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);

updateScoreboard();
