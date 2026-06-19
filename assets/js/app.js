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

  const editorModal = document.getElementById('editorModal');
  const closeEditor = document.getElementById('closeEditor');
  const editorTitle = document.getElementById('editorTitle');
  const editorHint = document.getElementById('editorHint');
  const passwordStep = document.getElementById('passwordStep');
  const composeStep = document.getElementById('composeStep');
  const letterPassword = document.getElementById('letterPassword');
  const unlockLetter = document.getElementById('unlockLetter');
  const passwordError = document.getElementById('passwordError');
  const letterText = document.getElementById('letterText');
  const saveLetter = document.getElementById('saveLetter');
  const cancelEdit = document.getElementById('cancelEdit');
  const autosaveStatus = document.getElementById('autosaveStatus');

  const settings = {
    facil: { label: 'Fácil', time: 35, size: 84, points: 5, moveDelay: 950 },
    media: { label: 'Media', time: 30, size: 70, points: 10, moveDelay: 700 },
    dificil: { label: 'Difícil', time: 25, size: 56, points: 15, moveDelay: 480 },
    pro: { label: 'Pro', time: 20, size: 46, points: 25, moveDelay: 320 }
  };

  const letters = {
    esposa: { title: 'Carta de tu esposa', password: 'esposa123', targetId: 'letter-esposa' },
    rene: { title: 'Carta René', password: 'rene123', targetId: 'letter-rene' },
    jesus: { title: 'Carta Jesús', password: 'jesus123', targetId: 'letter-jesus' },
    diego: { title: 'Carta Diego', password: 'diego123', targetId: 'letter-diego' },
    padre: { title: 'Carta a mi padre', password: 'padre123', targetId: 'letter-padre' }
  };

  let score = 0;
  let timeLeft = settings.facil.time;
  let timerId = null;
  let moveId = null;
  let playing = false;
  let currentView = 'home';
  let activeLetterKey = null;
  const initialLetterText = {};

  function collectInitialLetters() {
    Object.entries(letters).forEach(([key, info]) => {
      const targetEl = document.getElementById(info.targetId);
      if (!targetEl) return;

      const paragraphs = [...targetEl.querySelectorAll('p')].map(paragraph => {
        const withLineBreaks = paragraph.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        const plain = withLineBreaks.replace(/<[^>]*>/g, '');
        const textarea = document.createElement('textarea');
        textarea.innerHTML = plain;
        return textarea.value.trim();
      }).filter(Boolean);

      initialLetterText[key] = paragraphs.join('\n\n');
    });
  }


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

  function normalize(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function letterStorageKey(key) {
    return `papa-rene-letter-${key}`;
  }

  function defaultLetterText(key) {
    return initialLetterText[key] || '';
  }

  function getLetterText(key) {
    return localStorage.getItem(letterStorageKey(key)) || defaultLetterText(key);
  }

  function renderLetter(key) {
    const info = letters[key];
    const targetEl = info ? document.getElementById(info.targetId) : null;
    if (!targetEl) return;

    const text = getLetterText(key);
    const blocks = text
      .split(/\n\s*\n/g)
      .map(block => block.trim())
      .filter(Boolean);

    targetEl.innerHTML = '';

    blocks.forEach((block, index) => {
      const p = document.createElement('p');
      p.textContent = block;

      const isLast = index === blocks.length - 1;
      const looksLikeSignature = /^(con amor|con carino|con mucho amor|con amor y recuerdo|atentamente|tu esposa|rene|jesus|diego|tu hijo)/i.test(normalize(block));

      if (isLast && looksLikeSignature) {
        p.classList.add('signature');
      }

      targetEl.appendChild(p);
    });
  }

  function renderAllLetters() {
    Object.keys(letters).forEach(renderLetter);
  }

  function openEditor(key) {
    const info = letters[key];
    if (!info || !editorModal) return;

    activeLetterKey = key;
    editorTitle.textContent = info.title;
    editorHint.textContent = 'Escribe la contraseña para poder editar esta carta.';
    passwordError.textContent = '';
    letterPassword.value = '';
    letterText.value = '';
    passwordStep.hidden = false;
    composeStep.hidden = true;
    editorModal.classList.add('open');
    editorModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => letterPassword.focus(), 80);
  }

  function closeEditorModal() {
    if (!editorModal) return;
    editorModal.classList.remove('open');
    editorModal.setAttribute('aria-hidden', 'true');
    activeLetterKey = null;
  }

  function unlockActiveLetter() {
    const info = letters[activeLetterKey];
    if (!info) return;

    if (normalize(letterPassword.value) !== normalize(info.password)) {
      passwordError.textContent = 'Contraseña incorrecta. Revisa que sea el nombre seguido de 123.';
      letterPassword.select();
      return;
    }

    passwordError.textContent = '';
    passwordStep.hidden = true;
    composeStep.hidden = false;
    letterText.value = getLetterText(activeLetterKey);
    autosaveStatus.textContent = 'Escribe la carta y presiona enviar/guardar.';
    setTimeout(() => letterText.focus(), 80);
  }

  function saveActiveLetter() {
    if (!activeLetterKey) return;
    const text = letterText.value.trim();

    if (text.length < 10) {
      autosaveStatus.textContent = 'No se guardó: la carta está demasiado vacía.';
      letterText.focus();
      return;
    }

    localStorage.setItem(letterStorageKey(activeLetterKey), text);
    renderLetter(activeLetterKey);
    autosaveStatus.textContent = 'Carta guardada.';
    closeEditorModal();
  }

  document.querySelectorAll('[data-edit-letter]').forEach(button => {
    button.addEventListener('click', () => openEditor(button.dataset.editLetter));
  });

  if (unlockLetter) {
    unlockLetter.addEventListener('click', unlockActiveLetter);
  }

  if (letterPassword) {
    letterPassword.addEventListener('keydown', event => {
      if (event.key === 'Enter') unlockActiveLetter();
    });
  }

  if (saveLetter) {
    saveLetter.addEventListener('click', saveActiveLetter);
  }

  if (cancelEdit) {
    cancelEdit.addEventListener('click', closeEditorModal);
  }

  if (closeEditor) {
    closeEditor.addEventListener('click', closeEditorModal);
  }

  if (editorModal) {
    editorModal.addEventListener('pointerdown', event => {
      if (event.target === editorModal) closeEditorModal();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && editorModal?.classList.contains('open')) {
      closeEditorModal();
    }
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

  collectInitialLetters();
  renderAllLetters();
  updateBestScore();
})();
