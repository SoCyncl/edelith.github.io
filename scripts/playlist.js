class playlist extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <div class="musicbox">
          <div class="music-player fade-block">
            <h2>Now Playing</h2>
            <div class="music">
              <span id="music-title" class="music-title">Nothing Playing</span>
              <div class="music-controls">
                <label for="trackList" hidden>Track Picker</label>
                <select id="trackList" onchange="ChangeSongTrackList()">
                  <option value="none" selected>Pick a song...</option>
                  <optgroup label="Elden Ring Night Reign">
                    <option value="3">Adel, Baron Of Night - Elden Ring Nightreign</option>
                    <option value="4">Gladius, Beast Of Night - Elden Ring Nightreign</option>
                    <option value="5">Heolstor the Nightlord - Elden Ring Nightreign</option>
                    <option value="6">Caligo, Miasma Of Night - Elden Ring Nightreign</option>
                    <option value="7">Libra, Creature Of Night - Elden Ring Nightreign</option>
                    <option value="8">Fulghor, Champion Of Nightglow - Elden Ring Nightreign</option>
                    <option value="9">Maris, Fathom Of Night - Elden Ring Nightreign</option>
                    <option value="10">Gnoster, Wisdom Of Night - Elden Ring Nightreign</option>                        
                  </optgroup>
                  <optgroup label="Final Fantasy">
                    <option value="11">Beyond the Darkness - FFX</option>
                    <option value="12">Full Fathom Five - FFXIV</option>
                    <option value="18">Starless Skyline - FFXIV</option>
                    <option value="13">Galdin Quay - FFXV</option>
                    <option value="14">Hammerhead - FFXV</option>
                  </optgroup>
                  <optgroup label="RPG Maker">
                    <option value="15">Lost Haven/Shillings - Fear and Hunger 2: Termina</option>
                    <option value="16">Every Schoolday - Fear and Hunger</option>
                    <option value="17">A Stab of Happiness - OFF</option>
                  </optgroup>
                  <optgroup label="Kirby">
                    <option value="0">Ripple Field 2 - Kirby's Dreamland 3</option>
                    <option value="1">Grassland 4 - Kirby's Dreamland 3</option>
                    <option value="2">Friends 3 - Kirby's Dreamland 3</option>
                  </optgroup>
                </select>
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
        </div>
      `;
    }
}

customElements.define('playlist-block', playlist);

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

// Initialize the player
function initializePlayer() {
    const savedState = loadMusicState();
    const volumeSlider = document.getElementById("volumeSlider");
    
    if (savedState) {
        // Restore saved state
        songPlay.src = savedState.src;
        songTitle.innerText = savedState.title;
        songPlay.volume = savedState.volume;
        songPlay.currentTime = savedState.currentTime || 0;
        
        if (volumeSlider) {
            volumeSlider.value = savedState.volume;
        }
        
        // Update the play/pause button based on saved state
        if (savedState.isPlaying) {
            // Only auto-play if the state is recent (less than 5 seconds old)
            // This prevents autoplay when coming back after a long time
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
                // If state isn't recent, respect the paused state
                playButton.classList.replace("fa-pause", "fa-play");
            }
        } else {
            // Explicitly paused state
            songPlay.pause();
            playButton.classList.replace("fa-pause", "fa-play");
        }
        
        // Update the dropdown to show the current song
        updateTrackListSelection(savedState.src);
    } else {
        // No saved state, initialize with defaults
        songPlay.volume = volumeSlider ? volumeSlider.value : 0.25;
        playButton.classList.replace("fa-pause", "fa-play");
    }
}

// Update the track list dropdown to show the current song
function updateTrackListSelection(src) {
    if (!src) return;
    
    const trackList = document.getElementById("trackList");
    if (!trackList) return;
    
    // Find which song matches the current src
    for (const [key, song] of Object.entries(songs)) {
        if (song.url === src) {
            const songIndex = parseInt(key.replace('s', ''));
            trackList.value = songIndex;
            return;
        }
    }
    
    // If no match found, reset to "none"
    trackList.value = "none";
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

function ChangeSongTrackList() {
    const x = document.getElementById("trackList").value;
    const SongList = Object.values(songs);
    
    if (x === "none") {
        songPlay.pause();
        songPlay.src = "";
        songTitle.innerHTML = "Nothing Playing";
        playButton.classList.replace("fa-pause", "fa-play");
        localStorage.removeItem("musicState");
        return;
    } else {
        const newSong = SongList[x];
        songTitle.innerHTML = "Now playing: " + newSong.title;
        songPlay.src = newSong.url;
        
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
    // Wait a brief moment to ensure all elements are ready
    setTimeout(initializePlayer, 100);
});

// Save state when page is unloaded
window.addEventListener("beforeunload", saveMusicState);

// Handle page visibility changes
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        // Page is hidden (tab switched or minimized)
        saveMusicState();
    } else {
        // Page is visible again
        const savedState = loadMusicState();
        if (savedState && savedState.isPlaying) {
            // Only resume if it was playing very recently (last 5 seconds)
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
