/* ============================================================
   MISWAK — app.js
   Loads angel.json / demon.json, builds the crossroads,
   the angel carousel, and the demon bingo grid.
   ============================================================ */

const DATA_PATHS = {
  angel: "/data/miswak/angel.json",
  demon: "/data/miswak/demon.json",
};

const state = {
  angel: null,
  demon: null,
  carouselIndex: 0,
  currentPlaylist: [],
  currentTrackIndex: 0,
  audioEl: null,
  decisionAudioEl: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- Data loading ---------------- */

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadAllData() {
  const [angel, demon] = await Promise.all([
    loadJSON(DATA_PATHS.angel),
    loadJSON(DATA_PATHS.demon),
  ]);
  state.angel = angel;
  state.demon = demon;
}

/* ---------------- Screen management ---------------- */

function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.remove("is-active"));
  $(`#${id}`).classList.add("is-active");
  window.scrollTo(0, 0);
}

/* ---------------- Crossroads ---------------- */

function buildCrossroads() {
  const angelFigure = $("#crossroads-angel-figure");
  angelFigure.style.setProperty("--gif", `url(${state.angel.gif})`);
  angelFigure.style.setProperty("--mask", `url(${state.angel.indexImage})`);

  const demonFigure = $("#crossroads-demon-figure");
  demonFigure.style.setProperty("--gif", `url(${state.demon.gif})`);
  demonFigure.style.setProperty("--mask", `url(${state.demon.indexImage})`);

  $("#choose-angel").addEventListener("click", () => chooseFilter("angel"));
  $("#choose-demon").addEventListener("click", () => chooseFilter("demon"));
}

function chooseFilter(kind) {
  const data = state[kind];

  // Play the decision sound effect immediately while transitioning.
  playDecisionSound(data.decisionSound);

  if (kind === "angel") {
    buildCarousel();
    showScreen("screen-angel");
  } else {
    buildBingo();
    showScreen("screen-demon");
  }

  startPlaylist(data.playlist, kind);
}

/* ---------------- Angel carousel ---------------- */

function buildCarousel() {
  const track = $("#carousel-track");
  track.innerHTML = "";
  state.carouselIndex = 0;

  state.angel.items.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "carousel-item";
    el.dataset.index = i;

    el.innerHTML = `
      <div class="carousel-item-title ${item.textStyle || "angelic-serif"}"
           style="--gif: url(${item.gif || state.angel.gif})">
        <span class="gif-text" style="--gif: url(${item.gif || state.angel.gif})">${escapeHTML(item.text)}</span>
      </div>
      <div class="carousel-figure-wrap">
        <div class="mask-figure" style="--gif: url(${item.gif || state.angel.gif}); --mask: url(${item.image})">
          <div class="mask-figure__gif"></div>
        </div>
      </div>
    `;

    el.addEventListener("click", () => {
      const distance = i - state.carouselIndex;
      if (distance !== 0) setCarouselIndex(i);
    });

    track.appendChild(el);
  });

  $("#carousel-prev").addEventListener("click", () => setCarouselIndex(state.carouselIndex - 1));
  $("#carousel-next").addEventListener("click", () => setCarouselIndex(state.carouselIndex + 1));

  renderCarousel();
}

function setCarouselIndex(newIndex) {
  const max = state.angel.items.length - 1;
  if (newIndex < 0 || newIndex > max) return; // never loops
  state.carouselIndex = newIndex;
  renderCarousel();
}

function renderCarousel() {
  const items = $$(".carousel-item");
  const itemWidth = items[0] ? items[0].getBoundingClientRect().width : 300;
  const gap = parseFloat(getComputedStyle($("#carousel-track")).gap) || 0;
  const step = itemWidth + gap;

  items.forEach((el) => {
    const i = Number(el.dataset.index);
    const distance = i - state.carouselIndex;
    const clamped = Math.max(-1, Math.min(1, distance));
    el.dataset.distance = distance === 0 ? "0" : clamped;
    el.dataset.hidden = Math.abs(distance) > 1 ? "true" : "false";
  });

  const offset = -state.carouselIndex * step;
  $("#carousel-track").style.transform = `translateX(${offset}px)`;

  $("#carousel-prev").disabled = state.carouselIndex === 0;
  $("#carousel-next").disabled = state.carouselIndex === state.angel.items.length - 1;
  $("#carousel-progress").textContent = `${state.carouselIndex + 1} / ${state.angel.items.length}`;
}

window.addEventListener("resize", () => {
  if ($("#screen-angel").classList.contains("is-active")) renderCarousel();
});

/* ---------------- Demon bingo grid ---------------- */

function buildBingo() {
  $("#demon-title").textContent = state.demon.title;

  const gifLayer = $("#bingo-gif-layer");
  gifLayer.style.setProperty("--gif", `url(${state.demon.gif})`);

  const grid = $("#bingo-grid");
  grid.innerHTML = "";

  state.demon.boxes.forEach((box) => {
    const cell = document.createElement("div");
    cell.className = "bingo-box";
    cell.dataset.fulfilled = box.fulfilled ? "true" : "false";
    cell.innerHTML = `
      <div class="bingo-box-text">${escapeHTML(box.text)}</div>
      <div class="bingo-box-x">&#10005;</div>
    `;
    grid.appendChild(cell);
  });

  const toggle = $("#fulfilled-toggle");
  toggle.classList.remove("is-on");
  toggle.onclick = () => {
    const isOn = toggle.classList.toggle("is-on");
    $$(".bingo-box").forEach((cell) => {
      const shouldShow = isOn && cell.dataset.fulfilled === "true";
      cell.classList.toggle("is-fulfilled", shouldShow);
    });
    toggle.textContent = isOn ? "Fulfilled? — Yes" : "Fulfilled?";
  };
}

/* ---------------- Audio: decision sound + playlist ---------------- */

function playDecisionSound(url) {
  if (!url) return;
  if (!state.decisionAudioEl) {
    state.decisionAudioEl = new Audio();
  }
  state.decisionAudioEl.src = url;
  state.decisionAudioEl.volume = getVolume();
  state.decisionAudioEl.play().catch(() => {});
}

function startPlaylist(playlist, kind) {
  state.currentPlaylist = playlist || [];
  state.currentTrackIndex = 0;

  if (!state.audioEl) {
    state.audioEl = new Audio();
    state.audioEl.addEventListener("ended", () => {
      state.currentTrackIndex = (state.currentTrackIndex + 1) % state.currentPlaylist.length;
      playCurrentTrack();
    });
  }

  state.audioEl.volume = getVolume();
  applyStoredPauseState();
  playCurrentTrack();

  $("#audio-bar").classList.add("is-visible");
}

function playCurrentTrack() {
  if (!state.currentPlaylist.length) return;
  const url = state.currentPlaylist[state.currentTrackIndex];
  state.audioEl.src = url;
  updateTrackLabel();
  if (!isPaused()) {
    state.audioEl.play().catch(() => {});
  }
}

function updateTrackLabel() {
  const label = $("#audio-track-label");
  const n = state.currentTrackIndex + 1;
  const total = state.currentPlaylist.length;
  label.textContent = `Track ${n} / ${total}`;
}

/* ---------------- Persistent audio settings (localStorage) ---------------- */

function getVolume() {
  const v = localStorage.getItem("miswak_volume");
  return v === null ? 0.6 : parseFloat(v);
}

function setVolume(v) {
  localStorage.setItem("miswak_volume", String(v));
  if (state.audioEl) state.audioEl.volume = v;
  if (state.decisionAudioEl) state.decisionAudioEl.volume = v;
}

function isPaused() {
  return localStorage.getItem("miswak_paused") === "true";
}

function setPaused(paused) {
  localStorage.setItem("miswak_paused", String(paused));
  if (!state.audioEl) return;
  if (paused) {
    state.audioEl.pause();
  } else {
    state.audioEl.play().catch(() => {});
  }
  $("#audio-pause-btn").textContent = paused ? "▶" : "⏸";
}

function applyStoredPauseState() {
  $("#audio-pause-btn").textContent = isPaused() ? "▶" : "⏸";
}

function initAudioBar() {
  const volumeSlider = $("#audio-volume");
  volumeSlider.value = getVolume();
  volumeSlider.addEventListener("input", (e) => setVolume(parseFloat(e.target.value)));

  const pauseBtn = $("#audio-pause-btn");
  pauseBtn.textContent = isPaused() ? "▶" : "⏸";
  pauseBtn.addEventListener("click", () => setPaused(!isPaused()));
}

/* ---------------- Navigation back to crossroads ---------------- */

function initBackButtons() {
  $$(".screen-back").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.audioEl) state.audioEl.pause();
      showScreen("screen-crossroads");
    });
  });
}

/* ---------------- Utility ---------------- */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ---------------- Boot ---------------- */

async function init() {
  try {
    await loadAllData();
    buildCrossroads();
    initAudioBar();
    initBackButtons();
    showScreen("screen-crossroads");
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="color:#eee;font-family:sans-serif;padding:4rem;text-align:center;">
      Could not load angel.json / demon.json.<br>
      Check that <code>data/miswak/angel.json</code> and <code>data/miswak/demon.json</code> exist and are served over http(s), not file://.
    </div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
