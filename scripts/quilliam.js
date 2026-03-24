/**
 * ═══════════════════════════════════════════════════════════════
 *  quilliam.js  ·  Solstitheo Archives
 *  Quilliam — the Wordle hint mascot
 *
 *  Listens for custom events dispatched by wordle.js:
 *    wordle:guess  →  { count, correct, answerChar }
 *    wordle:win    →  {}
 *
 *  Exposed globals:
 *    window.QUILLIAM_CFG   — tweak timings live (e.g. voiceMinGapMs)
 *    window.quilliamReset  — call after debug override to reset state
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     CONFIG  — tweak via window.QUILLIAM_CFG in the console
  ═══════════════════════════════════════════════════════════ */
  const CFG = {
    typingMs:        42,    // ms per typed character
    voiceMinGapMs:   115,   // ms minimum gap between voice sounds  ← tweak me
    popToHintMs:     3200,  // ms after appearing → hint 1 fires
    shakeWindowMs:   580,   // rolling window for shake detection (ms)
    shakeReversals:  5,     // direction-reversals needed to trigger shake
    shakeMinSpeed:   0.27,  // px/ms minimum speed to count a reversal
    shakeDebounceMs: 1300,  // ms cooldown between shake triggers
    initRight:       28,    // px from right edge of viewport
    initBottom:      140,   // px from bottom of viewport
    imgWidth:        90,    // Quilliam image width (px)
    bubbleWidth:     248,   // speech bubble width (px)
    bubbleGap:       10,    // gap between bubble and image (px)
    clickMoveThresh: 9,     // px — below = click, above = drag
  };
  window.QUILLIAM_CFG = CFG;  // expose for live tweaking

  /* ═══════════════════════════════════════════════════════════
     AUDIO URLS
  ═══════════════════════════════════════════════════════════ */
  const SFX = {
    pop: 'https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/quilliam-pop.mp3',

    voice: Array.from({ length: 11 }, (_, i) =>
      `https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/quilliam/voice${i + 1}.ogg`
    ),

    poke: [
      'https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/korok-hurt2.mp3',
      'https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/korok-hurt1.mp3',
      'https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/korok-yahaha.mp3',
      'https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/korok-question2.mp3',
    ],
  };

  /* ═══════════════════════════════════════════════════════════
     PHASE CONSTANTS
  ═══════════════════════════════════════════════════════════ */
  const PH = {
    IDLE:          'idle',
    APPEARED:      'appeared',      // popped in, hint 1 pending
    GIVING_HINT1:  'giving_hint1',  // speaking hint 1
    POST_HINT1:    'post_hint1',    // hint 1 done/interrupted; waiting for guess 10
    GIVING_HINT2:  'giving_hint2',  // speaking hint 2
    INSULTS:       'insults',       // hint 2 done or both interrupted
  };

  /* ═══════════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════════ */
  const S = {
    active:     false,
    gameWon:    false,
    phase:      PH.IDLE,
    h1Blocked:  false,
    h2Blocked:  false,

    texts:      null,
    answerChar: null,

    isTalking:  false,
    abortTalk:  false,
    talkTimer:  null,

    voiceAudio: null,
    voiceReady: 0,

    pos:        { x: 0, y: 0 },
    dragOff:    { x: 0, y: 0 },
    isDragging: false,
    dragMoved:  false,
    moveHist:   [],

    shakeFired: false,
  };

  /* ═══════════════════════════════════════════════════════════
     DOM REFERENCES
  ═══════════════════════════════════════════════════════════ */
  let elWrap, elImg, elBubble, elBubbleNormal, elBubbleHint;

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  async function boot() {
    await loadTexts();
    injectCSS();
    buildDOM();
    setInitialPos();
    bindDrag();
    listenWordleEvents();
  }

  async function loadTexts() {
    try {
      const r = await fetch('/data/quilliam-text.json');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      S.texts = await r.json();
    } catch (e) {
      console.error('[Quilliam] Could not load quilliam-text.json:', e);
      S.texts = {
        popIn: ['Hmm.'], clickIdle: ['Stop.'], shakeResponses: ['Put me down!'],
        win: ['You got it!'], clickAfterWin: ['Go away.'],
        hint1Prefix: ['Here is a clue:'], hint2Prefix: ['Final clue:'],
        noHintWarning: ['No hint for you.'], hint2Interrupted: ['Fine.'],
        insults: ['Still guessing?'],
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CSS
  ═══════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('quilliam-css')) return;
    const s = document.createElement('style');
    s.id = 'quilliam-css';
    s.textContent = `
#qWrap {
  position: fixed;
  z-index: 9900;
  user-select: none;
  touch-action: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity .35s ease;
  width: ${CFG.imgWidth}px;
}
#qWrap.q-on {
  opacity: 1;
  pointer-events: auto;
}

#qImg {
  width: ${CFG.imgWidth}px;
  height: auto;
  display: block;
  cursor: grab;
  filter: drop-shadow(0 4px 14px rgba(0,0,0,.7));
}
#qImg:active { cursor: grabbing; }

@keyframes qPopIn {
  0%   { transform: scale(0)   rotate(-18deg); opacity: 0; }
  62%  { transform: scale(1.2) rotate(5deg);   opacity: 1; }
  80%  { transform: scale(.93) rotate(-2deg); }
  100% { transform: scale(1)   rotate(0deg); }
}
#qImg.q-popping {
  animation: qPopIn .55s cubic-bezier(.34,1.56,.64,1) both;
}

@keyframes qSquish {
  0%,100% { transform: scaleX(1)    scaleY(1); }
  30%     { transform: scaleX(1.13) scaleY(.89); }
  65%     { transform: scaleX(.91)  scaleY(1.07); }
}
#qImg.q-talking {
  animation: qSquish .22s ease infinite;
}

/* ── Speech bubble ── */
#qBubble {
  position: absolute;
  width: ${CFG.bubbleWidth}px;
  background: var(--ink-light, #2f353b);
  border: 1px solid rgba(201,168,76,.42);
  padding: 10px 12px 12px;
  font-family: var(--f-body, Georgia, serif);
  font-size: .87rem;
  line-height: 1.58;
  color: var(--fog, #c5c8ca);
  box-shadow: 0 6px 28px rgba(0,0,0,.75);
  opacity: 0;
  transform: translateY(7px) scale(.95);
  transition: opacity .2s ease, transform .2s ease;
  pointer-events: none;
  word-break: break-word;
  white-space: pre-wrap;
}
#qBubble.q-show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Colored hint span */
#qBubbleHint {
  color: var(--gold, #c9a84c);
  font-style: italic;
}

/* Tail → DOWN (default, bubble above Quilliam) */
#qBubble::after, #qBubble::before {
  content: '';
  position: absolute;
  bottom: -9px; left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}
#qBubble::after  { border-top: 9px solid rgba(201,168,76,.42); }
#qBubble::before { border-top: 9px solid var(--ink-light,#2f353b); bottom: -8px; z-index:1; }

/* Tail → UP (bubble below Quilliam) */
#qBubble.q-below::after,
#qBubble.q-below::before { bottom: auto; }
#qBubble.q-below::after  { top: -9px; border-top: none; border-bottom: 9px solid rgba(201,168,76,.42); }
#qBubble.q-below::before { top: -8px; border-top: none; border-bottom: 9px solid var(--ink-light,#2f353b); z-index:1; }

/* Blinking cursor */
.q-cur {
  display: inline-block;
  width: 2px; height: .88em;
  background: var(--gold, #c9a84c);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: qBlink .68s step-end infinite;
}
@keyframes qBlink { 0%,100%{opacity:1} 50%{opacity:0} }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════
     DOM BUILD
  ═══════════════════════════════════════════════════════════ */
  function buildDOM() {
    elWrap = document.createElement('div');
    elWrap.id = 'qWrap';

    elBubble = document.createElement('div');
    elBubble.id = 'qBubble';

    // Two text spans: normal (fog) and hint (gold)
    elBubbleNormal = document.createElement('span');
    elBubbleNormal.id = 'qBubbleNormal';
    elBubbleHint   = document.createElement('span');
    elBubbleHint.id   = 'qBubbleHint';

    elBubble.appendChild(elBubbleNormal);
    elBubble.appendChild(elBubbleHint);
    elWrap.appendChild(elBubble);

    elImg = document.createElement('img');
    elImg.id  = 'qImg';
    elImg.src = '/favicon.png';
    elImg.alt = 'Quilliam';
    elImg.draggable = false;
    elWrap.appendChild(elImg);

    document.body.appendChild(elWrap);
  }

  /* ═══════════════════════════════════════════════════════════
     POSITION
  ═══════════════════════════════════════════════════════════ */
  function setInitialPos() {
    S.pos.x = window.innerWidth  - CFG.imgWidth - CFG.initRight;
    S.pos.y = window.innerHeight - 130          - CFG.initBottom;
    applyPos();
  }

  function applyPos() {
    S.pos.x = Math.max(0, Math.min(S.pos.x, window.innerWidth  - CFG.imgWidth));
    S.pos.y = Math.max(0, Math.min(S.pos.y, window.innerHeight - 100));
    elWrap.style.left = S.pos.x + 'px';
    elWrap.style.top  = S.pos.y + 'px';
    layoutBubble();
  }

  function layoutBubble() {
    const bw  = CFG.bubbleWidth;
    const iw  = CFG.imgWidth;
    const gap = CFG.bubbleGap;
    const bh  = elBubble.offsetHeight || 76;
    const ih  = elImg.offsetHeight    || 90;

    let bLeft = (iw / 2) - (bw / 2);
    const absL = S.pos.x + bLeft;
    if (absL < 8)                          bLeft = 8 - S.pos.x;
    if (absL + bw > window.innerWidth - 8) bLeft = window.innerWidth - 8 - bw - S.pos.x;

    const showBelow = S.pos.y < bh + gap + 32;
    elBubble.classList.toggle('q-below', showBelow);

    if (showBelow) {
      elBubble.style.top    = (ih + gap) + 'px';
      elBubble.style.bottom = 'auto';
    } else {
      elBubble.style.bottom = (ih + gap) + 'px';
      elBubble.style.top    = 'auto';
    }
    elBubble.style.left = bLeft + 'px';
  }

  /* ═══════════════════════════════════════════════════════════
     APPEAR
  ═══════════════════════════════════════════════════════════ */
  function appear(answerChar) {
    if (S.active) return;
    S.active     = true;
    S.answerChar = answerChar;
    S.phase      = PH.APPEARED;

    playOne(SFX.pop, 0.55);
    elWrap.classList.add('q-on');
    elImg.classList.add('q-popping');
    elImg.addEventListener('animationend', () => elImg.classList.remove('q-popping'), { once: true });

    setTimeout(() => speakSegments([{ text: pick(S.texts.popIn) }]), 500);

    setTimeout(() => {
      if (S.phase === PH.APPEARED) giveHint1();
    }, CFG.popToHintMs);
  }

  /* ═══════════════════════════════════════════════════════════
     HINTS
  ═══════════════════════════════════════════════════════════ */
  function giveHint1() {
    if (S.h1Blocked || !S.answerChar) return;
    S.phase = PH.GIVING_HINT1;
    speakSegments([
      { text: pick(S.texts.hint1Prefix) + ' ' },
      { text: S.answerChar.hint1 || '(no hint provided)', highlight: true },
    ], () => { S.phase = PH.POST_HINT1; });
  }

  function giveHint2() {
    if (S.h2Blocked || !S.answerChar) return;
    S.phase = PH.GIVING_HINT2;
    speakSegments([
      { text: pick(S.texts.hint2Prefix) + ' ' },
      { text: S.answerChar.hint2 || '(no hint provided)', highlight: true },
    ], () => { S.phase = PH.INSULTS; });
  }

  function giveInsult() {
    speakSegments([{ text: pick(S.texts.insults) }]);
  }

  /* ═══════════════════════════════════════════════════════════
     CLICK HANDLING
  ═══════════════════════════════════════════════════════════ */
  function handleClick() {
    if (!S.active) return;

    if (S.gameWon) {
      playPoke();
      abortSpeak();
      speakSegments([{ text: pick(S.texts.clickAfterWin) }]);
      return;
    }

    if (S.isTalking) {
      const ph = S.phase;
      abortSpeak();
      playPoke();

      if (ph === PH.GIVING_HINT1) {
        S.h1Blocked = true;
        S.phase     = PH.POST_HINT1;
        speakSegments([{ text: '...' }], () =>
          speakSegments([{ text: pick(S.texts.noHintWarning) }])
        );
        return;
      }

      if (ph === PH.GIVING_HINT2) {
        S.h2Blocked = true;
        S.phase     = PH.INSULTS;
        speakSegments([{ text: '...' }], () =>
          speakSegments([{ text: pick(S.texts.hint2Interrupted) }])
        );
        return;
      }

      speakSegments([{ text: pick(S.texts.clickIdle) }]);
      return;
    }

    playPoke();
    speakSegments([{ text: pick(S.texts.clickIdle) }]);
  }

  /* ═══════════════════════════════════════════════════════════
     SPEECH  — segment-aware typewriter
     segments: Array of { text: string, highlight?: boolean }
     highlight:true → typed into elBubbleHint (gold), else elBubbleNormal
  ═══════════════════════════════════════════════════════════ */
  function speakSegments(segments, onDone) {
    abortSpeak();

    S.isTalking = true;
    S.abortTalk = false;

    // Clear both spans
    elBubbleNormal.textContent = '';
    elBubbleHint.textContent   = '';
    elBubble.classList.add('q-show');

    // Append cursor to bubble (after the spans)
    const cur = document.createElement('span');
    cur.className = 'q-cur';
    elBubble.appendChild(cur);

    elImg.classList.add('q-talking');
    layoutBubble();

    // Flatten segments into an array of { char, highlight }
    const chars = [];
    for (const seg of segments) {
      for (const ch of [...seg.text]) {
        chars.push({ ch, highlight: !!seg.highlight });
      }
    }

    let i = 0;

    function next() {
      if (S.abortTalk) {
        cleanupSpeech();
        return;
      }
      if (i >= chars.length) {
        elImg.classList.remove('q-talking');
        cur.remove();
        S.isTalking = false;
        layoutBubble();
        if (onDone) onDone();
        return;
      }
      const { ch, highlight } = chars[i++];
      if (highlight) {
        elBubbleHint.textContent += ch;
      } else {
        elBubbleNormal.textContent += ch;
      }
      playVoice();
      layoutBubble();
      S.talkTimer = setTimeout(next, CFG.typingMs);
    }

    next();
  }

  // Convenience wrapper for plain (non-segmented) speech
  function speak(text, onDone) {
    speakSegments([{ text }], onDone);
  }

  function abortSpeak() {
    S.abortTalk = true;
    if (S.talkTimer) { clearTimeout(S.talkTimer); S.talkTimer = null; }
    cleanupSpeech();
  }

  function cleanupSpeech() {
    S.isTalking = false;
    elImg.classList.remove('q-talking');
    elBubble.querySelectorAll('.q-cur').forEach(c => c.remove());
  }

  /* ═══════════════════════════════════════════════════════════
     AUDIO
  ═══════════════════════════════════════════════════════════ */
  function playVoice() {
    const now = Date.now();
    if (now < S.voiceReady) return;
    if (S.voiceAudio && !S.voiceAudio.ended && !S.voiceAudio.paused) return;

    const a = new Audio(pick(SFX.voice));
    a.volume = 0.46;
    S.voiceAudio = a;
    S.voiceReady = now + CFG.voiceMinGapMs;  // ← driven by CFG, tweak anytime
    a.play().catch(() => {});
  }

  function playOne(url, vol) {
    const a = new Audio(url);
    a.volume = vol ?? 0.5;
    a.play().catch(() => {});
  }

  function playPoke() { playOne(pick(SFX.poke), 0.48); }

  /* ═══════════════════════════════════════════════════════════
     DRAG
  ═══════════════════════════════════════════════════════════ */
  function bindDrag() {
    elImg.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mousemove', e => {
      if (S.isDragging) moveDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', () => {
      if (S.isDragging) endDrag();
    });

    elImg.addEventListener('touchstart', e => {
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!S.isDragging) return;
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (S.isDragging) endDrag();
    });
  }

  function startDrag(cx, cy) {
    S.isDragging = true;
    S.dragMoved  = false;
    S.dragOff.x  = cx - S.pos.x;
    S.dragOff.y  = cy - S.pos.y;
    S.moveHist   = [{ x: cx, y: cy, t: Date.now() }];
    S.shakeFired = false;
    elImg.style.cursor = 'grabbing';
  }

  function moveDrag(cx, cy) {
    const dx = Math.abs(cx - (S.pos.x + S.dragOff.x));
    const dy = Math.abs(cy - (S.pos.y + S.dragOff.y));
    if (dx > CFG.clickMoveThresh || dy > CFG.clickMoveThresh) S.dragMoved = true;

    S.pos.x = cx - S.dragOff.x;
    S.pos.y = cy - S.dragOff.y;
    applyPos();

    const now = Date.now();
    S.moveHist.push({ x: cx, y: cy, t: now });
    S.moveHist = S.moveHist.filter(m => now - m.t <= CFG.shakeWindowMs);

    if (!S.shakeFired) checkShake();
  }

  function endDrag() {
    S.isDragging = false;
    elImg.style.cursor = 'grab';
    if (!S.dragMoved && S.active) handleClick();
  }

  /* ═══════════════════════════════════════════════════════════
     SHAKE DETECTION
  ═══════════════════════════════════════════════════════════ */
  function checkShake() {
    const h = S.moveHist;
    if (h.length < 5) return;

    let revs = 0;
    for (let i = 2; i < h.length; i++) {
      const pp = h[i - 2], p = h[i - 1], c = h[i];
      const dt    = Math.max(1, c.t - p.t);
      const speed = Math.sqrt((c.x - p.x) ** 2 + (c.y - p.y) ** 2) / dt;
      if (speed < CFG.shakeMinSpeed) continue;

      const vx1 = p.x - pp.x, vx2 = c.x - p.x;
      const vy1 = p.y - pp.y, vy2 = c.y - p.y;
      if (vx1 !== 0 && vx2 !== 0 && Math.sign(vx1) !== Math.sign(vx2)) revs++;
      if (vy1 !== 0 && vy2 !== 0 && Math.sign(vy1) !== Math.sign(vy2)) revs++;
    }

    if (revs >= CFG.shakeReversals) {
      S.shakeFired = true;
      abortSpeak();
      playPoke();
      speakSegments([{ text: pick(S.texts.shakeResponses) }]);
      setTimeout(() => { S.shakeFired = false; }, CFG.shakeDebounceMs);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     WORDLE EVENT LISTENERS
  ═══════════════════════════════════════════════════════════ */
  function listenWordleEvents() {
    document.addEventListener('wordle:guess', e => {
      const { count, correct, answerChar } = e.detail;
      if (correct) return;

      // Quilliam pops in after 5 wrong guesses
      if (count === 5) {
        appear(answerChar);
        return;
      }

      if (!S.active) return;

      // Update answerChar in case debug overrode the answer mid-game
      if (answerChar && answerChar !== S.answerChar) S.answerChar = answerChar;

      // Hint 2 fires on the 10th wrong guess
      if (count === 10) {
        if (!S.h2Blocked) {
          giveHint2();
        } else {
          S.phase = PH.INSULTS;
          giveInsult();
        }
        return;
      }

      // Insult on every guess after 10 (and between 6–9 if already in INSULTS phase)
      if (count > 10 || S.phase === PH.INSULTS) {
        S.phase = PH.INSULTS;
        giveInsult();
      }
    });

    document.addEventListener('wordle:win', () => {
      S.gameWon = true;
      if (!S.active) return;
      abortSpeak();
      speakSegments([{ text: pick(S.texts.win) }]);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC RESET API  — call from debug panel after override
     window.quilliamReset(newAnswerChar)
  ═══════════════════════════════════════════════════════════ */
  window.quilliamReset = function (newAnswerChar) {
    abortSpeak();

    S.active     = false;
    S.gameWon    = false;
    S.phase      = PH.IDLE;
    S.h1Blocked  = false;
    S.h2Blocked  = false;
    S.answerChar = newAnswerChar || null;
    S.isDragging = false;
    S.dragMoved  = false;
    S.moveHist   = [];
    S.shakeFired = false;

    // Hide Quilliam and clear bubble
    elWrap.classList.remove('q-on');
    elBubble.classList.remove('q-show');
    elBubbleNormal.textContent = '';
    elBubbleHint.textContent   = '';
  };

  /* ═══════════════════════════════════════════════════════════
     UTILITY
  ═══════════════════════════════════════════════════════════ */
  function pick(arr) {
    if (!arr?.length) return '...';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
