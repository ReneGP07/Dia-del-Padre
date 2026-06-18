const views = document.querySelectorAll('.view');
const openButtons = document.querySelectorAll('[data-open]');
const backButtons = document.querySelectorAll('[data-back]');

function showView(id) {
  views.forEach(view => view.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

openButtons.forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.open));
});

backButtons.forEach(button => {
  button.addEventListener('click', () => showView('home'));
});

const difficulty = document.getElementById('difficulty');
const startButton = document.getElementById('startGame');
const target = document.getElementById('target');
const range = document.getElementById('range');
const scoreLabel = document.getElementById('score');
const timerLabel = document.getElementById('timer');
const levelLabel = document.getElementById('levelLabel');
const gameMessage = document.getElementById('gameMessage');

const settings = {
  facil: { label: 'Fácil', time: 35, size: 82, points: 5, moveDelay: 950 },
  media: { label: 'Media', time: 30, size: 68, points: 10, moveDelay: 700 },
  dificil: { label: 'Difícil', time: 25, size: 54, points: 15, moveDelay: 480 },
  pro: { label: 'Pro', time: 20, size: 42, points: 25, moveDelay: 300 }
};

let score = 0;
let timeLeft = 30;
let timerId = null;
let moveId = null;
let playing = false;

function selectedConfig() {
  return settings[difficulty.value];
}

function moveTarget() {
  const rect = range.getBoundingClientRect();
  const size = selectedConfig().size;
  const x = Math.max(0, Math.random() * (rect.width - size));
  const y = Math.max(0, Math.random() * (rect.height - size));

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
}

function stopGame(message) {
  playing = false;
  clearInterval(timerId);
  clearInterval(moveId);
  gameMessage.textContent = message;
}

function startGame() {
  const config = selectedConfig();
  score = 0;
  timeLeft = config.time;
  playing = true;

  scoreLabel.textContent = score;
  timerLabel.textContent = timeLeft;
  levelLabel.textContent = config.label;
  gameMessage.textContent = 'Dispara al blanco.';

  clearInterval(timerId);
  clearInterval(moveId);
  moveTarget();

  timerId = setInterval(() => {
    timeLeft -= 1;
    timerLabel.textContent = timeLeft;

    if (timeLeft <= 0) {
      stopGame(`Juego terminado. Puntuación final: ${score} puntos.`);
    }
  }, 1000);

  moveId = setInterval(moveTarget, config.moveDelay);
}

startButton.addEventListener('click', startGame);

target.addEventListener('click', () => {
  if (!playing) return;
  const config = selectedConfig();
  score += config.points;
  scoreLabel.textContent = score;
  gameMessage.textContent = `Buen tiro. +${config.points} puntos.`;
  moveTarget();
});

difficulty.addEventListener('change', () => {
  const config = selectedConfig();
  levelLabel.textContent = config.label;
  timerLabel.textContent = config.time;
  if (playing) startGame();
});
