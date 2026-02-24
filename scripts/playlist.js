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
        	width: 359px;
        	right: 25px;
        	top: -177px;
        	z-index: 100;
        	max-width: 114%;
        	cursor: pointer;
        	transition: transform 0.3s ease;
        	filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
          
      .ira:hover {
        	transform: scale(1.05);
          }
          
      .musicbox {
        	position: absolute;
        	right: 25px;
        	top: -36px;
        	width: 300px;
        	opacity: 0;
        	visibility: hidden;
        	transition: opacity 0.3s ease, visibility 0.3s ease;
        	background: var(--box-bg);
        	border: 3px solid var(--box-br);
        	border-radius: 8px;
        	padding: 15px;
        	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        	z-index: 99;
          }
          
      .musicbox.visible {
        	opacity: 1;
        	visibility: visible;
          }
          
      .music-player {
        	color: var(--emphasized-text);
        	font-family: inherit;
          }
          
      .music-title {
        	display: block;
        	margin: 10px 0;
        	padding: 8px 0;
        	color: var(--emphasized-text);
        	font-size: 0.95rem;
        	border-bottom: 1px solid var(--box-br);
        	white-space: nowrap;
        	overflow: hidden;
        	text-overflow: ellipsis;
          }

      /* Playlist accordion */
      .playlist-accordion {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 10px 0;
          max-height: 180px;
          overflow-y: auto;
          padding-right: 2px;
      }

      .playlist-accordion::-webkit-scrollbar {
          width: 4px;
      }
      .playlist-accordion::-webkit-scrollbar-track {
          background: var(--content-bg);
          border-radius: 2px;
      }
      .playlist-accordion::-webkit-scrollbar-thumb {
          background: var(--box-br);
          border-radius: 2px;
      }

      .pl-category {
          width: 100%;
      }

      .pl-category-btn {
          width: 100%;
          text-align: left;
          padding: 7px 10px;
          background: var(--nav-bg);
          border: 2px solid var(--box-br);
          border-radius: 4px;
          color: var(--emphasized-text);
          font-size: 0.85rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s ease;
          font-family: inherit;
      }

      .pl-category-btn:hover {
          background: var(--content-bg);
      }

      .pl-category-btn .pl-arrow {
          font-size: 0.7rem;
          transition: transform 0.2s ease;
          opacity: 0.7;
      }

      .pl-category-btn.open .pl-arrow {
          transform: rotate(90deg);
      }

      .pl-songs {
          display: none;
          flex-direction: column;
          gap: 2px;
          margin-top: 2px;
          padding-left: 8px;
      }

      .pl-songs.open {
          display: flex;
      }

      .pl-song-btn {
          width: 100%;
          text-align: left;
          padding: 5px 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 3px;
          color: var(--default-text);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
      }

      .pl-song-btn:hover {
          background: var(--content-bg);
          border-color: var(--box-br);
          color: var(--emphasized-text);
      }

      .pl-song-btn.playing {
          color: var(--emphasized-text);
          font-weight: bold;
          border-color: var(--box-br);
          background: var(--content-bg);
      }

      /* Transport controls row */
      .music-controls {
        	display: flex;
        	flex-wrap: wrap;
        	gap: 8px;
        	margin: 10px 0 0 0;
        	align-items: center;
          }
          
      .music-controls button {
        	flex: 1;
        	padding: 8px 0;
        	background: var(--nav-bg);
        	border: 2px solid var(--box-br);
        	border-radius: 4px;
        	color: var(--emphasized-text);
        	cursor: pointer;
        	transition: all 0.2s ease;
          font-family: inherit;
          }
          
      .music-controls button:hover {
        	background: var(--content-bg);
        	color: white;
          }
          
      .volume-control {
        	display: flex;
        	align-items: center;
        	gap: 8px;
        	margin-top: 10px;
          }
          
      .volume-control i {
        	color: var(--emphasized-text);
        	font-size: 0.9rem;
          }
          
      .volume-control input[type="range"] {
        	flex: 1;
        	height: 4px;
        	background: var(--content-bg);
        	border-radius: 2px;
        	-webkit-appearance: none;
          }
          
      .volume-control input[type="range"]::-webkit-slider-thumb {
        	-webkit-appearance: none;
        	width: 14px;
        	height: 14px;
        	border-radius: 50%;
        	background: var(--emphasized-text);
        	cursor: pointer;
          }
          
      </style>
      <img class="fade-block ira" src="/assets/img/homepage/ira.webp" id="iraImage">
        <div class="musicbox" id="musicBox">
          <div class="music-player fade-block">
            <h2>Now Playing</h2>
            <span id="music-title" class="music-title">Nothing Playing</span>

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
                  <button class="pl-song-btn" onclick="playSongByIndex(15, this)">Lost Haven/Shillings — Fear &amp; Hunger 2</button>
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

            <div class="music-controls">
              <button onclick="rewindMusic()"><i class="fa-solid fa-backward-step"></i></button>
              <button onclick="playPauseMusic()"><i class="fa-solid fa-play" id="playButton"></i></button>
              <button onclick="ChangesongPlay()"><i class="fa-solid fa-forward-step"></i></button>
            </div>
            <div class="volume-control">
              <i class="fa-solid fa-volume-high"></i>
              <input type="range" min="0" max="1" step="0.01" value="0.25" class="volume-slider" id="volumeSlider" oninput="changeVolume()">
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
