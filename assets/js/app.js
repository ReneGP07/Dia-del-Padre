
const views = document.querySelectorAll('.view');
const openButtons = document.querySelectorAll('[data-open]');
const backButtons = document.querySelectorAll('[data-back]');
const editorModal = document.getElementById('editorModal');
const editorTitle = document.getElementById('editorTitle');
const letterPassword = document.getElementById('letterPassword');
const messageInput = document.getElementById('messageInput');
const passwordStep = document.getElementById('passwordStep');
const composeStep = document.getElementById('composeStep');
const closeEditor = document.getElementById('closeEditor');
const unlockLetter = document.getElementById('unlockLetter');
const cancelCompose = document.getElementById('cancelCompose');
const saveLetter = document.getElementById('saveLetter');
const lightbox = document.getElementById('lightbox');
const closeLightbox = document.getElementById('closeLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxNote = document.getElementById('lightboxNote');
const lightboxTag = document.getElementById('lightboxTag');
const memoryDeck = document.getElementById('memoryDeck');
const shuffleMemories = document.getElementById('shuffleMemories');

let currentLetterSection = null;
let currentLetterKey = null;

function showView(id){
  views.forEach(view => view.classList.toggle('active', view.id === id));
  window.scrollTo({top:0, behavior:'smooth'});
}
openButtons.forEach(btn => btn.addEventListener('click', ()=> showView(btn.dataset.open)));
backButtons.forEach(btn => btn.addEventListener('click', ()=> showView('home')));

function textToHTML(text){
  return text.trim().split(/\n\n+/).map(block => `<p>${block.replace(/\n/g,'<br />')}</p>`).join('');
}

function applySavedLetters(){
  document.querySelectorAll('[data-letter-id]').forEach(section => {
    const key = `letter_${section.dataset.letterId}`;
    const saved = localStorage.getItem(key);
    if(saved){
      const container = section.querySelector('[data-letter-content]');
      container.innerHTML = textToHTML(saved);
    }
  });
}
applySavedLetters();

document.querySelectorAll('[data-edit-letter]').forEach(btn => {
  btn.addEventListener('click', ()=>{
    currentLetterSection = btn.closest('[data-letter-id]');
    currentLetterKey = `letter_${currentLetterSection.dataset.letterId}`;
    editorTitle.textContent = currentLetterSection.querySelector('h2').textContent;
    letterPassword.value = '';
    const currentText = localStorage.getItem(currentLetterKey) || extractText(currentLetterSection.querySelector('[data-letter-content]'));
    messageInput.value = currentText.trim();
    passwordStep.classList.remove('hidden');
    composeStep.classList.add('hidden');
    if(typeof editorModal.showModal === 'function') editorModal.showModal();
  });
});

function extractText(node){
  return Array.from(node.querySelectorAll('p')).map(p => p.innerText).join('\n\n');
}

unlockLetter.addEventListener('click', ()=>{
  if(!currentLetterSection) return;
  const expected = currentLetterSection.dataset.password;
  if(letterPassword.value.trim() !== expected){
    alert('Contraseña incorrecta.');
    return;
  }
  passwordStep.classList.add('hidden');
  composeStep.classList.remove('hidden');
  messageInput.focus();
});

saveLetter.addEventListener('click', ()=>{
  if(!currentLetterSection || !currentLetterKey) return;
  const value = messageInput.value.trim();
  if(!value){
    alert('La carta no puede quedar vacía.');
    return;
  }
  localStorage.setItem(currentLetterKey, value);
  currentLetterSection.querySelector('[data-letter-content]').innerHTML = textToHTML(value);
  editorModal.close();
});

[closeEditor,cancelCompose].forEach(el => el.addEventListener('click', ()=> editorModal.close()));
editorModal.addEventListener('click', e => { if(e.target === editorModal) editorModal.close(); });

const photos = JSON.parse(document.getElementById('photos-data').textContent);
function rotationFor(index){
  const sequence = [-4,2,-2,5,-5,3,-3,4,1,-1];
  return sequence[index % sequence.length] + 'deg';
}
function renderMemories(list){
  memoryDeck.innerHTML = '';
  list.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'memory-card';
    card.style.setProperty('--rotation', rotationFor(index));
    card.innerHTML = `
      <span class="sticker">${item.label}</span>
      <img src="${item.thumb}" alt="${item.title}" loading="lazy" />
      <div class="memory-caption">
        <h3>${item.title}</h3>
        <p>${item.note}</p>
      </div>`;
    card.addEventListener('click', ()=> openLightbox(item));
    memoryDeck.appendChild(card);
  });
}
renderMemories(photos);

shuffleMemories?.addEventListener('click', ()=>{
  const shuffled = [...photos].sort(()=>Math.random()-0.5);
  renderMemories(shuffled);
});

function openLightbox(item){
  lightboxImage.src = item.src;
  lightboxImage.alt = item.title;
  lightboxTitle.textContent = item.title;
  lightboxNote.textContent = item.note;
  lightboxTag.textContent = item.label;
  if(typeof lightbox.showModal === 'function') lightbox.showModal();
}
closeLightbox?.addEventListener('click', ()=> lightbox.close());
lightbox?.addEventListener('click', e => { if(e.target === lightbox) lightbox.close(); });

// Game
const configs = {
  facil: {speed:1100, size:74, time:35, points:1, label:'Fácil'},
  media: {speed:850, size:68, time:30, points:2, label:'Media'},
  dificil: {speed:650, size:60, time:25, points:3, label:'Difícil'},
  pro: {speed:470, size:54, time:20, points:5, label:'Pro'},
};
const difficulty = document.getElementById('difficulty');
const startGame = document.getElementById('startGame');
const range = document.getElementById('range');
const target = document.getElementById('target');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const levelLabel = document.getElementById('levelLabel');
const bestScore = document.getElementById('bestScore');
const gameMessage = document.getElementById('gameMessage');
let gameScore = 0, timeLeft = 35, moveTimer = null, gameTimer = null, activeConfig = configs.facil;

function updateBest(){
  const key = `best_${difficulty.value}`;
  bestScore.textContent = localStorage.getItem(key) || '0';
}
function positionTarget(){
  const rect = range.getBoundingClientRect();
  const size = activeConfig.size;
  const x = Math.max(10, Math.random() * (rect.width - size - 20));
  const y = Math.max(10, Math.random() * (rect.height - size - 20));
  target.style.width = size + 'px';
  target.style.height = size + 'px';
  target.style.left = x + 'px';
  target.style.top = y + 'px';
}
function stopGame(finalMessage){
  clearInterval(moveTimer); clearInterval(gameTimer);
  moveTimer = null; gameTimer = null;
  gameMessage.textContent = finalMessage;
  const key = `best_${difficulty.value}`;
  const best = Number(localStorage.getItem(key) || 0);
  if(gameScore > best){
    localStorage.setItem(key, String(gameScore));
    updateBest();
    gameMessage.textContent += ' ¡Nuevo récord!';
  }
}
startGame?.addEventListener('click', ()=>{
  activeConfig = configs[difficulty.value];
  levelLabel.textContent = activeConfig.label;
  gameScore = 0; timeLeft = activeConfig.time;
  scoreEl.textContent = '0'; timerEl.textContent = String(timeLeft);
  gameMessage.textContent = '¡A jugar!';
  clearInterval(moveTimer); clearInterval(gameTimer);
  positionTarget();
  moveTimer = setInterval(positionTarget, activeConfig.speed);
  gameTimer = setInterval(()=>{
    timeLeft--; timerEl.textContent = String(timeLeft);
    if(timeLeft <= 0){ stopGame(`Tiempo terminado. Hiciste ${gameScore} punto(s).`); }
  }, 1000);
});
difficulty?.addEventListener('change', ()=>{ levelLabel.textContent = configs[difficulty.value].label; updateBest(); });
target?.addEventListener('click', ()=>{
  if(!moveTimer) return;
  gameScore += activeConfig.points;
  scoreEl.textContent = String(gameScore);
  gameMessage.textContent = '¡Buen tiro!';
  positionTarget();
});
updateBest();
