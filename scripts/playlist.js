class playlist extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
    }
  
    connectedCallback() {
      this.innerHTML = `
            <style>
          .ira {
            position: absolute;
            width: 340px;
            right: 25px;
            top: -160px;
            z-index: 100;
            max-width: 114%;
            cursor: var(--cursor-hover);
            transition: transform 0.3s ease, filter 0.3s ease;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
          }
          .ira:hover {
            transform: scale(1.04) rotate(1deg);
          }
          

          .musicbox {
            position: absolute;
            right: 25px;
            top: -0px;
            width: 290px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.35s ease, visibility 0.35s ease, transform 0.35s ease;
            transform: translateY(-6px);
          

            background: var(--ink-light);
            border: 1px solid var(--gold-dim);
            border-top: 2px solid var(--gold);
            padding: 10px;                /* inner padding handled by .music-player */
            z-index: 99;
            position: absolute;        /* keep absolute for the toggle behaviour */
          }
          

          .musicbox::after {
            content: ""; position: absolute; inset: 0;
            pointer-events: none; z-index: 1;
            background: var(--ink-mid);
          
          }
          
          .musicbox::before {
          content: "NOW PLAYING";
          font-family: var(--f-label);
          font-size: 0.5rem;
          letter-spacing: 4px;
          color: var(--gold);
          opacity: 0.6;
          display: block;
          margin-bottom: 6px;
          text-align: center;
         }

          
          .musicbox.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          
          /* ── Inner player container ── */
          .music-player {
            position: relative;
            z-index: 2;           /* above the ::after mask */
            padding: 14px 16px 12px;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }
          
          /* "NOW PLAYING" label */
          .music-player > h2 {
            font-family: var(--f-label);
            font-size: 0.55rem;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: var(--gold);
            opacity: 0.7;
            margin: 0 0 6px;
            background: none;
            border: none;
            padding: 7px    text-align: center;;
          }
          
          /* ── Track title — marquee strip ── */
          .music-title-wrap {
            overflow: hidden;
            border-bottom: 1px dashed rgba(201,168,76,0.25);
            border-top: 1px dashed rgba(201,168,76,0.25);
            padding: 6px 0;
            margin-bottom: 10px;
          }
          
          .music-title {
            display: inline-block;
            white-space: nowrap;
            animation: music-marquee 18s linear infinite;
            font-family: var(--f-head);          /* Cinzel */
            font-size: 0.78rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--frost);
            padding-right: 30px;
          }
          
          @keyframes music-marquee {
            0%   { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          
          /* ── Accordion playlist ── */
          .playlist-accordion {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-bottom: 10px;
            max-height: 170px;
            overflow-y: auto;
            padding-right: 2px;
            scrollbar-width: thin;
            scrollbar-color: var(--gold-dim) transparent;
          }
          .playlist-accordion::-webkit-scrollbar { width: 3px; }
          .playlist-accordion::-webkit-scrollbar-track { background: transparent; }
          .playlist-accordion::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }
          
          .pl-category { width: 100%; }
          
          /* Category header button */
          .pl-category-btn {
            width: 100%;
            text-align: left;
            padding: 6px 10px;
            background: var(--void);
            border: 1px solid rgba(201,168,76,0.2);
            border-left: 2px solid var(--gold-dim);
            color: var(--fog);
            font-family: var(--f-label);
            font-size: 0.65rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: var(--cursor-hover);
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: border-color 0.2s ease, color 0.2s ease;
          }
          .pl-category-btn:hover {
            border-left-color: var(--gold);
            color: var(--frost);
          }
          .pl-category-btn.open {
            border-left-color: var(--gold);
            color: var(--gold);
          }
          
          .pl-arrow {
            font-size: 0.5rem;
            color: var(--gold-dim);
            transition: transform 0.2s ease;
          }
          .pl-category-btn.open .pl-arrow {
            transform: rotate(90deg);
            color: var(--gold);
          }
          
          /* Song list */
          .pl-songs {
            display: none;
            flex-direction: column;
            gap: 1px;
            padding: 2px 0 2px 10px;
            border-left: 1px dashed rgba(201,168,76,0.2);
            margin-left: 2px;
          }
          .pl-songs.open { display: flex; }
          
          .pl-song-btn {
            width: 100%;
            text-align: left;
            padding: 4px 8px;
            background: transparent;
            border: none;
            color: var(--fog-dim);
            font-family: var(--f-body);
            font-size: 0.8rem;
            cursor: var(--cursor-hover);
            transition: color 0.15s ease, padding-left 0.15s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .pl-song-btn:hover {
            color: var(--fog);
            padding-left: 12px;
          }
          .pl-song-btn.playing {
            color: var(--gold);
            font-style: italic;
          }
          .pl-song-btn.playing::before {
            content: "◆ ";
            font-size: 0.45rem;
            vertical-align: middle;
            color: var(--gold);
          }
          
          /* ── Transport controls ── */
          .music-controls {
            display: flex;
            gap: 6px;
            margin: 10px 0 8px;
            align-items: center;
          }
          
          .music-controls button {
            flex: 1;
            padding: 7px 0;
            background: none;
            border: 1px solid var(--gold-dim);
            color: var(--gold-dim);
            font-size: 0.75rem;
            cursor: var(--cursor-hover);
            transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
            font-family: var(--f-label);
          }
          .music-controls button:hover {
            border-color: var(--gold);
            color: var(--gold);
            background: var(--gold-pale);
          }
          
          /* ── Volume ── */
          .volume-control {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .volume-control i {
            color: var(--gold-dim);
            font-size: 0.75rem;
            flex-shrink: 0;
          }
          .volume-control input[type="range"] {
            flex: 1;
            height: 3px;
            background: rgba(201,168,76,0.2);
            border-radius: 2px;
            -webkit-appearance: none;
            outline: none;
          }
          .volume-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: var(--gold);
            cursor: var(--cursor-hover);
            border: 1px solid var(--gold-dim);
            transition: background 0.2s ease;
          }
          .volume-control input[type="range"]::-webkit-slider-thumb:hover {
            background: var(--frost);
          }
          .volume-control input[type="range"]::-moz-range-thumb {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: var(--gold);
            cursor: var(--cursor-hover);
            border: 1px solid var(--gold-dim);
          }
      </style>
      <img class="fade-block ira" src="/assets/img/homepage/ira.webp" id="iraImage" alt="Music">
      
      <div class="musicbox" id="musicBox">
        <div class="music-player fade-block">
      
          <h2>Now Playing</h2>
      
          <!-- Track title marquee strip -->
          <div class="music-title-wrap">
            <span id="music-title" class="music-title">Nothing Playing</span>
          </div>
      
          <!-- Accordion playlist -->
          <div class="playlist-accordion" id="playlistAccordion">
      
            <div class="pl-category">
              <button class="pl-category-btn" onclick="toggleCategory(this)">
                Elden Ring Nightreign <span class="pl-arrow">&#9654;</span>
              </button>
              <div class="pl-songs">
                <button class="pl-song-btn" onclick="playSongByIndex(3, this)">Adel, Baron Of Night</button>
                <button class="pl-song-btn" onclick="playSongByIndex(4, this)">Gladius, Beast Of Night</button>
                <button class="pl-song-btn" onclick="playSongByIndex(5, this)">Heolstor the Nightlord</button>
                <button class="pl-song-btn" onclick="playSongByIndex(6, this)">Caligo, Miasma Of Night</button>
                <button class="pl-song-btn" onclick="playSongByIndex(7, this)">Libra, Creature Of Night</button>
                <button class="pl-song-btn" onclick="playSongByIndex(8, this)">Fulghor, Champion Of Nightglow</button>
                <button class="pl-song-btn" onclick="playSongByIndex(9, this)">Maris, Fathom Of Night</button>
                <button class="pl-song-btn" onclick="playSongByIndex(10, this)">Gnoster, Wisdom Of Night</button>
              </div>
            </div>
      
            <div class="pl-category">
              <button class="pl-category-btn" onclick="toggleCategory(this)">
                Final Fantasy <span class="pl-arrow">&#9654;</span>
              </button>
              <div class="pl-songs">
                <button class="pl-song-btn" onclick="playSongByIndex(11, this)">Beyond the Darkness — FFX</button>
                <button class="pl-song-btn" onclick="playSongByIndex(12, this)">Full Fathom Five — FFXIV</button>
                <button class="pl-song-btn" onclick="playSongByIndex(18, this)">Starless Skyline — FFXIV</button>
                <button class="pl-song-btn" onclick="playSongByIndex(13, this)">Galdin Quay — FFXV</button>
                <button class="pl-song-btn" onclick="playSongByIndex(14, this)">Hammerhead — FFXV</button>
              </div>
            </div>
      
            <div class="pl-category">
              <button class="pl-category-btn" onclick="toggleCategory(this)">
                RPG Maker <span class="pl-arrow">&#9654;</span>
              </button>
              <div class="pl-songs">
                <button class="pl-song-btn" onclick="playSongByIndex(15, this)">Lost Haven / Shillings — Fear &amp; Hunger 2</button>
                <button class="pl-song-btn" onclick="playSongByIndex(16, this)">Every Schoolday — Fear &amp; Hunger</button>
                <button class="pl-song-btn" onclick="playSongByIndex(17, this)">A Stab of Happiness — OFF</button>
              </div>
            </div>
      
            <div class="pl-category">
              <button class="pl-category-btn" onclick="toggleCategory(this)">
                Kirby <span class="pl-arrow">&#9654;</span>
              </button>
              <div class="pl-songs">
                <button class="pl-song-btn" onclick="playSongByIndex(0, this)">Ripple Field 2 — Dreamland 3</button>
                <button class="pl-song-btn" onclick="playSongByIndex(1, this)">Grassland 4 — Dreamland 3</button>
                <button class="pl-song-btn" onclick="playSongByIndex(2, this)">Friends 3 — Dreamland 3</button>
              </div>
            </div>
      
          </div>
          <!-- end accordion -->
      
          <!-- Transport -->
          <div class="music-controls">
            <button onclick="rewindMusic()"    title="Previous"><i class="fa-solid fa-backward-step"></i></button>
            <button onclick="playPauseMusic()" title="Play / Pause"><i class="fa-solid fa-play" id="playButton"></i></button>
            <button onclick="ChangesongPlay()" title="Next"><i class="fa-solid fa-forward-step"></i></button>
          </div>
      
          <!-- Volume -->
          <div class="volume-control">
            <i class="fa-solid fa-volume-low"></i>
            <input type="range" min="0" max="1" step="0.01" value="0.25"
                   class="volume-slider" id="volumeSlider" oninput="changeVolume()">
            <i class="fa-solid fa-volume-high"></i>
          </div>
      
          <audio id="music-tag" src=""></audio>
      
        </div>
      </div>
      `;
      
      const iraImage = this.querySelector('#iraImage');
      const musicBox = this.querySelector('#musicBox');
      
      iraImage.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
          iraImage.src = "/assets/img/homepage/ira.webp";
          musicBox.classList.add('visible');
          
          // Bounce effect
          iraImage.style.transform = 'scale(1.1)';
          setTimeout(() => {
            iraImage.style.transform = 'scale(1)';
          }, 300);
        } else {
          iraImage.src = "/assets/img/homepage/ira.webp";
          musicBox.classList.remove('visible');
        }
      });
    }
}

customElements.define('playlist-block', playlist);


// ── Accordion toggle ────────────────────────────────────────────────────────
function toggleCategory(btn) {
    const songs = btn.nextElementSibling;
    const isOpen = songs.classList.contains('open');

    // Close all open categories first
    document.querySelectorAll('.pl-songs.open').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.pl-category-btn.open').forEach(b => b.classList.remove('open'));

    // Open the clicked one if it wasn't already open
    if (!isOpen) {
        songs.classList.add('open');
        btn.classList.add('open');
    }
}

// ── Play a song by its index in the songs object ─────────────────────────────
function playSongByIndex(index, btnEl) {
    const song = songs['s' + index];
    if (!song) return;

    // Update "playing" highlight
    document.querySelectorAll('.pl-song-btn.playing').forEach(b => b.classList.remove('playing'));
    if (btnEl) btnEl.classList.add('playing');

    songTitle.innerHTML = "Now playing: " + song.title;
    songPlay.src = song.url;

    const playPromise = songPlay.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            playButton.classList.replace("fa-play", "fa-pause");
            saveMusicState();
        }).catch(e => {
            console.warn("Play failed:", e);
            playButton.classList.replace("fa-pause", "fa-play");
        });
    }
}


// Music player functionality
const songs = {
    s0: {
        title: 'Ripple Field 2 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/ripplefield2.mp3'
    },
    s1: {
        title: 'Grassland 4 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/grassland4.mp3'
    },
    s2: {
        title: 'Friends 3 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/friends3.mp3'
    },
    s3: {
        title: 'Adel, Baron Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Adel%2C%20Baron%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s4: {
        title: 'Gladius, Beast Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Gladius%2C%20Beast%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s5: {
        title: 'Heolstor the Nightlord - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Heolstor%20the%20Nightlord%20-%20Elden%20Ring%20Nightreign%20OST.mp3'
    },
    s6: {
        title: "Caligo, Miasma Of Night - Elden Ring Nightreign",
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Caligo%2C%20Miasma%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s7: {
        title: "Libra, Creature Of Night - Elden Ring Nightreign",
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Libra%2C%20Creature%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s8: {
        title: 'Fulghor, Champion Of Nightglow - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Fulghor%2C%20Champion%20Of%20Nightglow%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s9: {
        title: 'Maris, Fathom Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Maris%2C%20Fathom%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s10: {
        title: 'Gnoster, Wisdom Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Gnoster%2C%20Wisdom%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s11: {
        title: 'Beyond the Darkness - FFX',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/beyondthedarkness.mp3'
    },
    s12: {
        title: 'Full Fathom Five - FFXIV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/fullfathomfive.mp3'
    },
    s13: {
        title: 'Galdin Quay - FFXV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/galdinquay.mp3'
    },
    s14: {
        title: 'Hammerhead - FFXV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/hammerhead.mp3'
    },
    s15: {
        title: 'Lost Haven/Shillings - Fear and Hunger 2: Termina',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/losthavenshillings.mp3'
    },
    s16: {
        title: 'Every Schoolday - Fear and Hunger',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/everyschoolday.mp3'
    },
    s17: {
        title: 'A Stab of Happiness - OFF',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/astabofhappiness.mp3'
    },
    s18: {
        title: 'Starless Skyline - FFXIV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/Starless%20Skyline.mp3'
    },
};

const songTitle = document.getElementById("music-title");
const songPlay = document.getElementById("music-tag");
const playButton = document.getElementById("playButton");

// Save state every second
function saveMusicState() {
    if (songPlay && songPlay.src) {
        const musicState = {
            src: songPlay.src,
            title: songTitle.innerText,
            currentTime: songPlay.currentTime,
            volume: songPlay.volume,
            isPlaying: !songPlay.paused,
            timestamp: Date.now()
        };
        localStorage.setItem("musicState", JSON.stringify(musicState));
    }
}

// Load saved state
function loadMusicState() {
    const savedState = localStorage.getItem("musicState");
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (e) {
            console.warn("Failed to parse saved music state", e);
            return null;
        }
    }
    return null;
}

// Highlight the currently playing song button (called after state restore)
function restorePlayingHighlight(src) {
    if (!src) return;
    for (const [key, song] of Object.entries(songs)) {
        if (song.url === src || src.includes(encodeURIComponent(song.url)) || src === song.url) {
            const index = parseInt(key.replace('s', ''));
            // Find the button for this index
            const btn = document.querySelector(`.pl-song-btn[onclick="playSongByIndex(${index}, this)"]`);
            if (btn) {
                btn.classList.add('playing');
                // Open its parent category
                const songsDiv = btn.closest('.pl-songs');
                const categoryBtn = songsDiv?.previousElementSibling;
                if (songsDiv && categoryBtn) {
                    songsDiv.classList.add('open');
                    categoryBtn.classList.add('open');
                }
            }
            return;
        }
    }
}

// Initialize the player
function initializePlayer() {
    const savedState = loadMusicState();
    const volumeSlider = document.getElementById("volumeSlider");
    
    if (savedState) {
        songPlay.src = savedState.src;
        songTitle.innerText = savedState.title;
        songPlay.volume = savedState.volume;
        songPlay.currentTime = savedState.currentTime || 0;
        
        if (volumeSlider) {
            volumeSlider.value = savedState.volume;
        }

        restorePlayingHighlight(savedState.src);
        
        if (savedState.isPlaying) {
            const isRecent = savedState.timestamp && (Date.now() - savedState.timestamp) < 5000;
            
            if (isRecent) {
                const playPromise = songPlay.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playButton.classList.replace("fa-play", "fa-pause");
                    }).catch(e => {
                        console.warn("Autoplay failed:", e);
                        playButton.classList.replace("fa-pause", "fa-play");
                    });
                }
            } else {
                playButton.classList.replace("fa-pause", "fa-play");
            }
        } else {
            songPlay.pause();
            playButton.classList.replace("fa-pause", "fa-play");
        }
    } else {
        songPlay.volume = volumeSlider ? volumeSlider.value : 0.25;
        playButton.classList.replace("fa-pause", "fa-play");
    }
}

function changeVolume() {
    const volumeSlider = document.getElementById("volumeSlider");
    songPlay.volume = volumeSlider.value;
    saveMusicState();
}

function ChangesongPlay() {
    const SongList = Object.values(songs);
    const randomSong = SongList[Math.floor(Math.random() * SongList.length)];
    songTitle.innerHTML = "Now playing: " + randomSong.title;
    songPlay.src = randomSong.url;

    // Clear playing highlight — random pick, can't easily target button
    document.querySelectorAll('.pl-song-btn.playing').forEach(b => b.classList.remove('playing'));
    
    const playPromise = songPlay.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            playButton.classList.replace("fa-play", "fa-pause");
            saveMusicState();
        }).catch(e => {
            console.warn("Play failed:", e);
            playButton.classList.replace("fa-pause", "fa-play");
        });
    }
}

function playPauseMusic() {
    if (songPlay.paused) {
        const playPromise = songPlay.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                playButton.classList.replace("fa-play", "fa-pause");
                saveMusicState();
            }).catch(e => {
                console.warn("Play failed:", e);
            });
        }
    } else {
        songPlay.pause();
        playButton.classList.replace("fa-pause", "fa-play");
        saveMusicState();
    }
}

function rewindMusic() {
    songPlay.currentTime = 0;
    saveMusicState();
}

songPlay.onended = function() {
    ChangesongPlay();
};

// Set up periodic saving
setInterval(saveMusicState, 1000);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(initializePlayer, 100);
});

// Save state when page is unloaded
window.addEventListener("beforeunload", saveMusicState);

// Handle page visibility changes
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        saveMusicState();
    } else {
        const savedState = loadMusicState();
        if (savedState && savedState.isPlaying) {
            const isRecent = savedState.timestamp && (Date.now() - savedState.timestamp) < 5000;
            if (isRecent) {
                const playPromise = songPlay.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playButton.classList.replace("fa-play", "fa-pause");
                    }).catch(e => {
                        console.warn("Autoplay failed:", e);
                    });
                }
            }
        }
    }
});
