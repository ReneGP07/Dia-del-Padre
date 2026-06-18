(() => {
  const views = [...document.querySelectorAll('.view')];
  const openButtons = [...document.querySelectorAll('[data-open]')];
  const backButtons = [...document.querySelectorAll('[data-back]')];

  const difficulty = document.getElementById('difficulty');
  const startButton = document.getElementById('startGame');
  const target = document.getElementById('target');
  const range = document.getElementById('range');
  const scoreLabel = document.getElementById('score');
  const timerLabel = document.getElementById('timer');
  const levelLabel = document.getElementById('levelLabel');
  const bestScoreLabel = document.getElementById('bestScore');
  const gameMessage = document.getElementById('gameMessage');

  const settings = {
    facil: { label: 'Fácil', time: 35, size: 84, points: 5, moveDelay: 950 },
    media: { label: 'Media', time: 30, size: 70, points: 10, moveDelay: 700 },
    dificil: { label: 'Difícil', time: 25, size: 56, points: 15, moveDelay: 480 },
    pro: { label: 'Pro', time: 20, size: 46, points: 25, moveDelay: 320 }
  };

  let score = 0;
  let timeLeft = settings.facil.time;
  let timerId = null;
  let moveId = null;
  let playing = false;
  let currentView = 'home';

  function showView(id) {
    const nextView = document.getElementById(id);
    if (!nextView) return;

    if (id !== 'juego') {
      stopGame('Listo para jugar.', false);
    }

    views.forEach(view => view.classList.remove('active'));
    nextView.classList.add('active');
    currentView = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openButtons.forEach(button => {
    button.addEventListener('click', () => showView(button.dataset.open));
  });

  backButtons.forEach(button => {
    button.addEventListener('click', () => showView('home'));
  });

  function selectedConfig() {
    return settings[difficulty?.value] || settings.facil;
  }

  function bestKey() {
    return `papa-rene-best-${difficulty?.value || 'facil'}`;
  }

  function getBestScore() {
    return Number(localStorage.getItem(bestKey()) || 0);
  }

  function updateBestScore() {
    if (!bestScoreLabel) return;
    bestScoreLabel.textContent = getBestScore();
  }

  function saveBestScore() {
    const best = getBestScore();
    if (score > best) {
      localStorage.setItem(bestKey(), String(score));
      updateBestScore();
      return true;
    }
    return false;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function moveTarget() {
    if (!range || !target) return;

    const rect = range.getBoundingClientRect();
    const config = selectedConfig();
    const size = Math.min(config.size, Math.max(42, rect.width * 0.22));
    const padding = 8;
    const x = clamp(Math.random() * (rect.width - size - padding * 2), padding, rect.width - size - padding);
    const y = clamp(Math.random() * (rect.height - size - padding * 2), padding, rect.height - size - padding);

    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.classList.add('visible');
  }

  function stopGame(message = 'Listo para jugar.', updateMessage = true) {
    playing = false;
    clearInterval(timerId);
    clearInterval(moveId);
    timerId = null;
    moveId = null;

    if (target) target.classList.remove('visible');
    if (gameMessage && updateMessage) gameMessage.textContent = message;
  }

  function finishGame() {
    const newRecord = saveBestScore();
    const message = newRecord
      ? `Juego terminado. Nuevo récord: ${score} puntos.`
      : `Juego terminado. Puntuación final: ${score} puntos.`;

    stopGame(message, true);
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
    updateBestScore();

    clearInterval(timerId);
    clearInterval(moveId);
    moveTarget();

    timerId = setInterval(() => {
      timeLeft -= 1;
      timerLabel.textContent = timeLeft;

      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);

    moveId = setInterval(moveTarget, config.moveDelay);
  }

  if (startButton) {
    startButton.addEventListener('click', startGame);
  }

  if (target) {
    target.addEventListener('pointerdown', event => {
      event.stopPropagation();
      event.preventDefault();

      if (!playing) return;

      const config = selectedConfig();
      score += config.points;
      scoreLabel.textContent = score;
      gameMessage.textContent = `Buen tiro. +${config.points} puntos.`;

      target.classList.remove('hit');
      void target.offsetWidth;
      target.classList.add('hit');

      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      moveTarget();
    });
  }

  if (range) {
    range.addEventListener('pointerdown', event => {
      if (!playing || event.target === target) return;
      gameMessage.textContent = 'Fallaste. Intenta de nuevo.';
    });
  }

  if (difficulty) {
    difficulty.addEventListener('change', () => {
      const config = selectedConfig();
      levelLabel.textContent = config.label;
      timerLabel.textContent = config.time;
      updateBestScore();
      if (playing) startGame();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) {
      stopGame('Juego pausado. Presiona iniciar para jugar otra vez.', true);
    }
  });

  window.addEventListener('resize', () => {
    if (playing && currentView === 'juego') moveTarget();
  });

  updateBestScore();
})();
