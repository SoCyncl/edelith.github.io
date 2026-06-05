/* ═══════════════════════════════════════════════════════
   RANDOMIZER — Slot Machine Edition
   - Fixed 269px viewport window (overflow: hidden)
   - Images scroll behind the window like a slot drum
   - Name stays fixed below, updates on landing
   - Sound effects: sequential per roll, scalable
═══════════════════════════════════════════════════════ */

const charList = [
  { name: "Liorah",             url: "/characters/liorah/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/l-doodle.png" },
  { name: "Avao Rosa",          url: "/characters/avao/index.html",    img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/avao-doodle.png" },
  { name: "Mousse B. Bonic",    url: "/characters/mousse/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/mousse-doodle.png" },
  { name: "Blobert Goopington", url: "/characters/blobert/index.html", img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/blob-doodle.png" },
  { name: "Mathew",             url: "/characters/mathew/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/mathew-doodle.png" },
  { name: "Eight Nanako",       url: "/characters/eight/index.html",   img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/eight-doodle.png" },
  { name: "Baxter Kokayin",     url: "/characters/baxter/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/baxter-doodle.png" },
  { name: "Peggle Krastov",     url: "/characters/peggle/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/peggle-doodle.png" },
  { name: "Herb Passerine",     url: "/characters/herb/index.html",    img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/herb-doodle.png" },
  { name: "Pizzaz",             url: "/characters/pizzaz/index.html",  img: "https://file.garden/aE4BmvQeoiKwc59V/character%20cards/icons/pizzaz-doodle.png" },
];

/* ── SOUND EFFECTS ─────────────────────────────────────
   Add or remove URLs freely. Script cycles in order per roll.
   Replace placeholder strings with real file paths/URLs.
──────────────────────────────────────────────────────── */
const SLOT_SOUNDS = [
  "..................3",   // roll 1 spin sound
  "..................."
];

const LAND_SOUNDS = [
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward1.ogg",        
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward2.ogg",        
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward3.ogg",     
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward4.ogg",
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward5.ogg",
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward6.ogg",
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward7.ogg",
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/random%20character/reward8.ogg",
  "https://file.garden/aE4BmvQeoiKwc59V/sound%20effects/yay.mp3"
];

/* ── CONSTANTS ─────────────────────────────────────────── */
const WINDOW_H    = 269;   // px — the visible viewport height, matches .randomavi
const SPIN_COUNT  = 28;    // decoy frames before the winner
const DURATION_MS = 1200;  // total spin duration in ms

/* ── STATE ─────────────────────────────────────────────── */
let rollCount  = 0;
let isSpinning = false;

/* ── INJECT STYLES ─────────────────────────────────────── */
(function injectStyles() {
  const s = document.createElement("style");
  s.textContent = `
    /* The fixed-size window — nothing leaks out */
    #slot-window {
      width: 100%;
      height: ${WINDOW_H}px;
      overflow: hidden;
      position: relative;
    }

    /* Top/bottom fade edges so images "enter" and "exit" smoothly */
    #slot-window::before,
    #slot-window::after {
      content: "";
      position: absolute;
      left: 0; right: 0;
      height: 48px;
      z-index: 4;
      pointer-events: none;
    }
    #slot-window::before {
      top: 0;
      background: linear-gradient(to bottom, var(--ink-light, #2f353b), transparent);
    }
    #slot-window::after {
      bottom: 0;
      background: linear-gradient(to top, var(--ink-light, #2f353b), transparent);
    }

    /* The scrolling drum */
    #slot-strip {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0; left: 0; right: 0;
    }

    /* Each frame in the drum */
    .slot-frame {
      flex-shrink: 0;
      width: 100%;
      height: ${WINDOW_H}px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }

    /* Name label below the window */
    #slot-name {
      text-align: center;
      margin-top: 6px;
    }
    #slot-name h2 {
      margin: 0;
      font-family: var(--f-head, serif);
      font-size: 1rem;
    }

    /* ── Celebration ── */
    @keyframes rand-shake {
      0%,100% { transform: translateX(0);   }
      15%     { transform: translateX(-7px); }
      30%     { transform: translateX(7px);  }
      45%     { transform: translateX(-5px); }
      60%     { transform: translateX(5px);  }
      75%     { transform: translateX(-3px); }
      90%     { transform: translateX(3px);  }
    }

    .rand-shake { animation: rand-shake 0.5s ease-in-out; }


    /* Dice states */
    #dice.dice--locked  { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
    #dice.dice--spinning { animation: rand-shake 0.3s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
})();

/* ── HELPERS ───────────────────────────────────────────── */
function playSound(arr, index) {
  if (!arr.length) return;
  const url = arr[index % arr.length];
  /* Skip obvious placeholder filenames */
  if (!url || /PLACEHOLDER/i.test(url)) return;
  try {
    const a = new Audio(url);
    a.volume = 0.55;
    a.play().catch(() => {});
  } catch (e) {}
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ── BUILD INITIAL (no-animation) STATE ────────────────── */
function buildStatic(char) {
  const win = document.getElementById("slot-window");
  const nameEl = document.getElementById("slot-name");
  if (!win) return;

  win.innerHTML = `<div class="slot-frame" style="background-image:url('${char.img}');"></div>`;
  if (nameEl) nameEl.innerHTML = `<h2><a href="${char.url}">${char.name}</a></h2>`;
}

/* ── MAIN ROLL FUNCTION (called by dice button) ─────────── */
function randomCharacter() {
  if (isSpinning) return;

  const win    = document.getElementById("slot-window");
  const nameEl = document.getElementById("slot-name");
  const dice   = document.getElementById("dice");
  if (!win || !dice) return;

  /* Pick the winner up front */
  const finalChar = charList[Math.floor(Math.random() * charList.length)];

  /* Lock dice */
  isSpinning = true;
  dice.classList.add("dice--locked", "dice--spinning");

  /* Blank the name while spinning */
  if (nameEl) nameEl.innerHTML = `<h2 style="opacity:0.3;letter-spacing:4px;">— — —</h2>`;

  /* Play spin sound */
  playSound(SLOT_SOUNDS, rollCount);

  /* Build the drum strip: SPIN_COUNT random frames + winner at bottom */
  const strip = document.createElement("div");
  strip.id = "slot-strip";

  for (let i = 0; i < SPIN_COUNT; i++) {
    const c   = charList[Math.floor(Math.random() * charList.length)];
    const div = document.createElement("div");
    div.className = "slot-frame";
    div.style.backgroundImage = `url('${c.img}')`;
    strip.appendChild(div);
  }

  /* Winner frame */
  const winnerFrame = document.createElement("div");
  winnerFrame.className = "slot-frame";
  winnerFrame.style.backgroundImage = `url('${finalChar.img}')`;
  strip.appendChild(winnerFrame);

  /* Swap window content */
  win.innerHTML = "";
  win.appendChild(strip);

  /* Animate: scroll strip from top so winner (last frame) ends up visible.
     Target translateY = -(SPIN_COUNT * WINDOW_H) so last frame is at y=0 */
  const targetY   = -(SPIN_COUNT * WINDOW_H);
  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1);
    const eased    = easeOutCubic(progress);
    strip.style.transform = `translateY(${targetY * eased}px)`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      strip.style.transform = `translateY(${targetY}px)`;
      onLanded(finalChar, winnerFrame, nameEl, dice);
    }
  }

  requestAnimationFrame(tick);
}

/* ── LANDING ───────────────────────────────────────────── */
function onLanded(char, frame, nameEl, dice) {
  playSound(LAND_SOUNDS, rollCount);
  rollCount++;

  const win = document.getElementById("slot-window");
  if (!win) { unlock(dice); return; }

  win.classList.add("rand-shake");
  win.addEventListener("animationend", function onShake(e) {
    if (e.animationName !== "rand-shake") return;
    win.removeEventListener("animationend", onShake);
    win.classList.remove("rand-shake");

    /* Reveal name */
    if (nameEl) {
      nameEl.innerHTML = `<h2><a href="${char.url}">${char.name}</a></h2>`;
    }

    unlock(dice);
  });
}

function unlock(dice) {
  isSpinning = false;
  dice.classList.remove("dice--locked", "dice--spinning");
}

/* ── INIT ──────────────────────────────────────────────── */
window.addEventListener("load", () => {
  /* Replace the #randomizer contents with window + name label */
  const container = document.getElementById("randomizer");
  if (!container) return;

  container.innerHTML = `
    <div id="slot-window"></div>
    <div id="slot-name"></div>
  `;

  /* Show a random character on load, no animation */
  const c = charList[Math.floor(Math.random() * charList.length)];
  buildStatic(c);
});
