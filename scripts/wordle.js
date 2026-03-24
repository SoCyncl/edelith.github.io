/**
 * ═══════════════════════════════════════════════════════════════
 *  wordle.js  ·  Solstitheo Archives
 *  Daily character-guessing game
 * ═══════════════════════════════════════════════════════════════
 */

const WORDLE_DATA_URL = '/data/wordle-characters.json';
const STORAGE_KEY     = 'edelith-wordle-v1';

let characters    = [];
let answer        = null;
let guesses       = [];          // array of character ids
let gameState     = 'playing';   // 'playing' | 'won'
let startTime     = null;
let timerInterval = null;
let selectedId    = null;        // currently selected from autocomplete

// ── Init ────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(WORDLE_DATA_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    characters = await res.json();
  } catch (e) {
    console.error('[Wordle] Failed to load characters:', e);
    document.getElementById('wordleError').style.display = 'block';
    return;
  }

  answer = characters[getDailyIndex()];

  // Restore saved session for today
  const saved = loadState();
  if (saved && saved.date === getTodayString()) {
    guesses    = saved.guesses    || [];
    gameState  = saved.gameState  || 'playing';
    startTime  = saved.startTime  || null;

    guesses.forEach(id => {
      const c = characters.find(c => c.id === id);
      if (c) renderGuessRow(c, false);
    });

    if (gameState === 'won') {
      stopTimer();
      updateTimerDisplay(saved.elapsed || 0);
      setTimeout(() => showEndScreen(true, saved.elapsed || 0), 400);
    } else if (guesses.length > 0) {
      startTimer();
    }
  }

  updateGuessCount();
  updateInputPlaceholder();
  buildAutocomplete();
}

// ── Date Seeding ────────────────────────────────────────────────
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getDailyIndex() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % characters.length;
}

// ── 🛠 Debug Panel (trigger: type "Biblio") ──────────────────────
(function initDebugger() {
  const style = document.createElement('style');
  style.textContent = `
    #debugPanel {
      display: none;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: #1a1a2e;
      border: 1px solid #c9a84c;
      border-radius: 10px;
      padding: 18px 22px;
      min-width: 280px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      font-family: inherit;
      color: #f0e6c8;
    }
    #debugPanel.open { display: block; }
    #debugPanel h4 {
      margin: 0 0 14px;
      font-size: 0.85rem;
      letter-spacing: 0.12em;
      color: #c9a84c;
      text-transform: uppercase;
    }
    #debugPanel label {
      display: block;
      font-size: 0.75rem;
      margin-bottom: 4px;
      opacity: 0.7;
    }
    #debugSeedInput, #debugCharSelect {
      width: 100%;
      background: #0d0d1a;
      border: 1px solid #444;
      border-radius: 6px;
      color: #f0e6c8;
      padding: 6px 10px;
      font-size: 0.9rem;
      margin-bottom: 10px;
      box-sizing: border-box;
    }
    #debugPanel .dbg-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    #debugPanel button {
      flex: 1;
      padding: 7px 0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    #dbgApplyBtn    { background: #c9a84c; color: #1a1a2e; }
    #dbgRandomBtn   { background: #5a4a8a; color: #f0e6c8; }
    #dbgCloseBtn    { background: #333;    color: #f0e6c8; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'debugPanel';
  panel.innerHTML = `
    <h4>🛠 Debug · Seed Override</h4>

    <label>Seed index (0 – n)</label>
    <input id="debugSeedInput" type="number" min="0" placeholder="e.g. 42">

    <label>Or pick a character</label>
    <select id="debugCharSelect">
      <option value="">— select —</option>
    </select>

    <div class="dbg-row">
      <button id="dbgRandomBtn">🎲 Random</button>
    </div>
    <div class="dbg-row" style="margin-top:8px;">
      <button id="dbgApplyBtn">Apply &amp; Reset</button>
      <button id="dbgCloseBtn">Close</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Populate character dropdown once characters are loaded
  const populate = setInterval(() => {
    if (!characters.length) return;
    clearInterval(populate);

    const sel = document.getElementById('debugCharSelect');
    characters.forEach((c, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      // No name shown — just index so the answer stays hidden
      opt.textContent = `[${i}]`;
      sel.appendChild(opt);
    });
  }, 200);

  // Trigger by typing "Biblio" in the game input
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('wordleInput');
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.value.trim() === 'Biblio') {
        panel.classList.add('open');
        input.value = '';
        closeAutocomplete();
      }
    });
  });

  // Sync seed input ↔ char select
  document.getElementById('debugSeedInput').addEventListener('input', function () {
    document.getElementById('debugCharSelect').value = '';
  });
  document.getElementById('debugCharSelect').addEventListener('change', function () {
    document.getElementById('debugSeedInput').value = this.value;
  });

  // Randomize button
  document.getElementById('dbgRandomBtn').addEventListener('click', () => {
    if (!characters.length) return;
    const idx = Math.floor(Math.random() * characters.length);
    document.getElementById('debugSeedInput').value = idx;
    document.getElementById('debugCharSelect').value = idx;
  });

  // Apply button
  document.getElementById('dbgApplyBtn').addEventListener('click', () => {
    const raw = document.getElementById('debugSeedInput').value;
    const idx = parseInt(raw, 10);

    if (isNaN(idx) || idx < 0 || idx >= characters.length) {
      alert(`Invalid index. Must be 0 – ${characters.length - 1}.`);
      return;
    }

    answer    = characters[idx];
    guesses   = [];
    gameState = 'playing';
    startTime = null;
    stopTimer();
    updateTimerDisplay(0);

    const grid = document.getElementById('guessGrid');
    if (grid) grid.innerHTML = '';

    localStorage.removeItem(STORAGE_KEY);
    updateGuessCount();
    clearInput();

    // Reset Quilliam so he re-appears correctly for the new answer
    if (typeof window.quilliamReset === 'function') {
      window.quilliamReset(answer);
    }

    document.getElementById('endOverlay')?.classList.remove('visible');
    panel.classList.remove('open');
    showToast('🛠 Debug: answer overridden.');
  });

  document.getElementById('dbgCloseBtn').addEventListener('click', () => {
    panel.classList.remove('open');
  });
})();

// ── Compare Logic ───────────────────────────────────────────────
function compareArrayField(guessArr, answerArr) {
  const g = new Set(guessArr);
  const a = new Set(answerArr);
  if (g.size === a.size && [...g].every(v => a.has(v))) return 'green';
  if ([...g].some(v => a.has(v))) return 'yellow';
  return 'red';
}

function compareGuess(guess) {
  return {
    gender:        guess.gender  === answer.gender  ? 'green' : 'red',
    race:        guess.race  === answer.race  ? 'green' : 'red',
    region:      compareArrayField(guess.region,      answer.region),
    affiliation: compareArrayField(guess.affiliation, answer.affiliation),
    arc:         compareArrayField(guess.arc,         answer.arc),
    correct:     guess.id === answer.id,
  };
}

// ── Render Guess Row ────────────────────────────────────────────
function renderGuessRow(char, animate = true) {
  const result = compareGuess(char);
  const grid   = document.getElementById('guessGrid');

  const row = document.createElement('div');
  row.className = 'guess-row' + (result.correct ? ' guess-row--correct' : '');
  if (animate) row.classList.add('guess-row--new');

  const nameCell = char.link
    ? `<a href="${char.link}" class="guess-char-link">${char.name}</a>`
    : `<span>${char.name}</span>`;

  row.innerHTML = `
    <div class="guess-cell guess-cell--name">
      <div class="guess-portrait">
        <img src="${char.img}" alt="${char.name}"
          onerror="this.src='/assets/img/placeholderavi.png'">
      </div>
      <div class="guess-name">${nameCell}</div>
    </div>
    ${buildAttrCell('gender',        char.gender,                          result.gender,        animate, 1)}
    ${buildAttrCell('Race',        char.race,                          result.race,        animate, 2)}
    ${buildAttrCell('Region',      char.region.join('<br>'),           result.region,      animate, 3)}
    ${buildAttrCell('Affiliation', char.affiliation.join('<br>'),      result.affiliation, animate, 4)}
    ${buildAttrCell('Arc',         char.arc.join('<br>'),              result.arc,         animate, 5)}
  `;

  grid.appendChild(row);

  // Scroll to the new row
  if (animate) {
    setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}

function buildAttrCell(label, value, result, animate, delay) {
  const animStyle = animate ? `style="animation-delay: ${delay * 90}ms"` : '';
  return `
    <div class="guess-cell guess-cell--attr ${result}${animate ? ' cell-flip' : ''}" ${animStyle}>
      <span class="attr-label">${label}</span>
      <span class="attr-value">${value}</span>
    </div>
  `;
}

// ── Submit Guess ────────────────────────────────────────────────
function submitGuess() {
  if (gameState !== 'playing') return;
  if (!selectedId) {
    showToast('Select a character from the list first.');
    return;
  }
  if (guesses.includes(selectedId)) {
    showToast('Already guessed this character!');
    clearInput();
    return;
  }

  const char = characters.find(c => c.id === selectedId);
  if (!char) return;

  if (guesses.length === 0) startTimer();

  guesses.push(selectedId);
  renderGuessRow(char, true);
  updateGuessCount();

  if (char.id === answer.id) {
    gameState = 'won';
    stopTimer();
    saveState();
    // ── Quilliam: win ──────────────────────────────────────────
    document.dispatchEvent(new CustomEvent('wordle:win'));
    setTimeout(() => showEndScreen(true, getElapsed()), 1000);
  } else {
    // ── Quilliam: wrong guess ──────────────────────────────────
    // wrongCount = total guesses that weren't correct (all of them so far)
    const wrongCount = guesses.length;
    document.dispatchEvent(new CustomEvent('wordle:guess', {
      detail: { count: wrongCount, correct: false, answerChar: answer }
    }));
    saveState();
  }

  clearInput();
}

// ── Autocomplete ────────────────────────────────────────────────
function buildAutocomplete() {
  const input = document.getElementById('wordleInput');
  const btn   = document.getElementById('guessBtn');

  input.addEventListener('input',   e => updateAutocomplete(e.target.value));
  input.addEventListener('keydown', handleInputKeydown);
  input.addEventListener('focus',   () => { if (input.value.trim()) updateAutocomplete(input.value); });
  btn.addEventListener('click',     submitGuess);

  document.addEventListener('click', e => {
    if (!e.target.closest('.wordle-input-wrap')) closeAutocomplete();
  });
}

let acIndex = -1;

function updateAutocomplete(query) {
  selectedId = null;
  document.getElementById('guessBtn').disabled = true;

  const list = document.getElementById('autocompleteList');
  const q    = query.toLowerCase().trim();

  const available = characters.filter(c => !guesses.includes(c.id));
  const matches   = q
    ? available.filter(c => c.name.toLowerCase().includes(q))
    : [];

  if (!q || matches.length === 0) {
    list.innerHTML = q && !matches.length
      ? '<li class="ac-empty">No characters found</li>'
      : '';
    list.classList.toggle('open', q && !matches.length);
    return;
  }

  list.innerHTML = '';
  list.classList.add('open');
  acIndex = -1;

  matches.slice(0, 12).forEach(char => {
    const li  = document.createElement('li');
    li.dataset.id = char.id;
    li.innerHTML = `
      <img src="${char.img}" alt="" onerror="this.src='/assets/img/placeholderavi.png'">
      <span class="ac-name">${char.name}</span>
      <span class="ac-gender">${char.gender}</span>
    `;
    li.addEventListener('mousedown', e => {
      e.preventDefault(); // keep focus on input
      selectCharacter(char);
    });
    list.appendChild(li);
  });
}

function selectCharacter(char) {
  selectedId = char.id;
  document.getElementById('wordleInput').value = char.name;
  document.getElementById('guessBtn').disabled = false;
  closeAutocomplete();
}

function handleInputKeydown(e) {
  const list  = document.getElementById('autocompleteList');
  const items = [...list.querySelectorAll('li:not(.ac-empty)')];

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    acIndex = Math.min(acIndex + 1, items.length - 1);
    highlightAcItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    acIndex = Math.max(acIndex - 1, 0);
    highlightAcItem(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (acIndex >= 0 && items[acIndex]) {
      const id   = items[acIndex].dataset.id;
      const char = characters.find(c => c.id === id);
      if (char) { selectCharacter(char); submitGuess(); }
    } else {
      submitGuess();
    }
  } else if (e.key === 'Escape') {
    closeAutocomplete();
  }
}

function highlightAcItem(items) {
  items.forEach((li, i) => li.classList.toggle('selected', i === acIndex));
  if (items[acIndex]) items[acIndex].scrollIntoView({ block: 'nearest' });
}

function closeAutocomplete() {
  document.getElementById('autocompleteList').classList.remove('open');
  acIndex = -1;
}

function clearInput() {
  document.getElementById('wordleInput').value = '';
  selectedId = null;
  document.getElementById('guessBtn').disabled = true;
  closeAutocomplete();
  updateInputPlaceholder();
}

function updateInputPlaceholder() {
  const remaining = characters.filter(c => !guesses.includes(c.id)).length;
  const el = document.getElementById('wordleInput');
  if (el) el.placeholder = `${remaining} character${remaining !== 1 ? 's' : ''} remaining…`;
}

// ── Timer ───────────────────────────────────────────────────────
function startTimer() {
  if (!startTime) startTime = Date.now();
  timerInterval = setInterval(() => updateTimerDisplay(getElapsed()), 1000);
  updateTimerDisplay(0);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function getElapsed() {
  return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerDisplay(secs) {
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = formatTime(secs !== undefined ? secs : getElapsed());
}
// ── Next-puzzle countdown ────────────────────────────────────────
function startNextPuzzleCountdown() {
  const el = document.getElementById('nextPuzzleCountdown');
  if (!el) return;

  function tick() {
    const now  = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);                 // midnight tonight
    const diff = Math.max(0, Math.floor((next - now) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    el.textContent =
      `Next Edelithle in ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  tick();
  setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  startNextPuzzleCountdown();
});

// ── End Screen ──────────────────────────────────────────────────
function showEndScreen(won, elapsed) {
  const el = document.getElementById('endOverlay');

  document.getElementById('endTitle').textContent    = won
    ? '✦ Identified ✦'
    : '✦ Not Quite ✦';
  document.getElementById('endTitle').className      = 'end-title ' + (won ? 'end-won' : 'end-lost');
  document.getElementById('endSubtext').textContent  = won
    ? `You correctly identified ${answer.name} in ${guesses.length} guess${guesses.length !== 1 ? 'es' : ''}.`
    : `The character was ${answer.name}. Try again tomorrow.`;

  const portrait = document.getElementById('endPortrait');
  portrait.src   = answer.img;
  portrait.onerror = () => { portrait.src = '/assets/img/placeholderavi.png'; };
  document.getElementById('endAnswerName').textContent = answer.name;
  document.getElementById('endAnswergender').textContent = answer.gender + ' · ' + answer.race;

  document.getElementById('endGuessCount').textContent = guesses.length;
  document.getElementById('endTime').textContent       = formatTime(elapsed !== undefined ? elapsed : getElapsed());

  el.classList.add('visible');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('endCloseBtn')?.addEventListener('click', () => {
    document.getElementById('endOverlay').classList.remove('visible');
  });
  document.getElementById('endOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('endOverlay')) {
      document.getElementById('endOverlay').classList.remove('visible');
    }
  });
});

// ── Persistence ─────────────────────────────────────────────────
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date:      getTodayString(),
    guesses,
    gameState,
    startTime,
    elapsed:   getElapsed(),
  }));
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

// ── Toast ────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('gameToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2200);
}

// ── Guess count display ──────────────────────────────────────────
function updateGuessCount() {
  const el = document.getElementById('guessCount');
  if (el) el.textContent = guesses.length;
  updateInputPlaceholder();
}

// ── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
