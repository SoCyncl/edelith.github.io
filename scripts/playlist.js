class playlist extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
    <div class="playlist">
        <div class="music">
            <span id="music-title"></span>
            <div class="music-controls">
                <button onclick="rewindMusic()"><i class="fa-solid fa-backward-step"></i></button>
                <button onclick="playPauseMusic()"><i class="fa-solid fa-play" id="playButton"></i></button>
                <button onclick="ChangesongPlay()"><i class="fa-solid fa-forward-step"></i></button>
                
                <label for="trackList" hidden>Music Track Picker:</label>
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
            </div>
            <audio id="music-tag" src="" autoplay></audio>
            <div class="volume-control">
                    <i class="fa-solid fa-volume-high"></i>
                    <input type="range" min="0" max="1" step="0.01" value="0.25" class="volume-slider" id="volumeSlider" oninput="changeVolume()">
                </div>
        </div>
    </div> 
      `;
    }
}

customElements.define('playlist-block', playlist);

// built off of Nickolox's music player code... which is built off of Dokodemo's! 
// so credits to them both

window.addEventListener("load", ChangesongLoad, false)

const songs = {
    s1: {
        title: 'Ripple Field 2 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/ripplefield2.mp3'
    },
    s2: {
        title: 'Grassland 4 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/grassland4.mp3'
    },
    s3: {
        title: 'Friends 3 - Kirby\'s Dreamland 3',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/friends3.mp3'
    },
    s4: {
        title: 'Adel, Baron Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Adel%2C%20Baron%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s5: {
        title: 'Gladius, Beast Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Gladius%2C%20Beast%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s6: {
        title: 'Heolstor the Nightlord - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Heolstor%20the%20Nightlord%20-%20Elden%20Ring%20Nightreign%20OST.mp3'
    },
    s7: {
        title: "Caligo, Miasma Of Night - Elden Ring Nightreign",
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Caligo%2C%20Miasma%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s8: {
        title: "Libra, Creature Of Night - Elden Ring Nightreign",
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Libra%2C%20Creature%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s9: {
        title: 'Fulghor, Champion Of Nightglow - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Fulghor%2C%20Champion%20Of%20Nightglow%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s10: {
        title: 'Maris, Fathom Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Maris%2C%20Fathom%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s11: {
        title: 'Gnoster, Wisdom Of Night - Elden Ring Nightreign',
        url: 'https://file.garden/aE4BmvQeoiKwc59V/Fromsoft/Gnoster%2C%20Wisdom%20Of%20Night%20-%20Elden%20Ring%20Nightreign%20OST%20Official%20Soundtrack%20Original%20Score.mp3'
    },
    s12: {
        title: 'Beyond the Darkness - FFX',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/beyondthedarkness.mp3'
    },
    s13: {
        title: 'Full Fathom Five - FFXIV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/fullfathomfive.mp3'
    },
    s14: {
        title: 'Galdin Quay - FFXV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/galdinquay.mp3'
    },
    s15: {
        title: 'Hammerhead - FFXV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/hammerhead.mp3'
    },
    s16: {
        title: 'Lost Haven/Shillings - Fear and Hunger 2: Termina',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/losthavenshillings.mp3'
    },
    s17: {
        title: 'Every Schoolday - Fear and Hunger',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/everyschoolday.mp3'
    },
    s18: {
        title: 'A Stab of Happiness - OFF',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/astabofhappiness.mp3'
    },
    s19: {
        title: 'Starless Skyline - FFXIV',
        url: 'https://file.garden/ZRqB-G_MomIqlqQI/music/Starless%20Skyline.mp3'
    },
};

const songTitle = document.getElementById("music-title");
const songPlay = document.getElementById("music-tag");
const playButton = document.getElementById("playButton");

function changeVolume() {
    const volumeSlider = document.getElementById("volumeSlider");
    songPlay.volume = volumeSlider.value;
    sessionStorage.setItem("musicVolume", volumeSlider.value);
}

function ChangesongPlay() {
    const volumeSlider = document.getElementById("volumeSlider");
    songPlay.volume = volumeSlider ? volumeSlider.value : 0.25;
    const SongList = Object.values(songs);
    const randomSong = SongList[Math.floor(Math.random() * SongList.length)];
    songTitle.innerHTML = "Now playing: " + randomSong.title;
    songPlay.src = randomSong.url;
    songPlay.play().then(() => {
        playButton.classList.replace("fa-play", "fa-pause");
    }).catch(e => {
        console.warn("Autoplay failed:", e);
        playButton.classList.replace("fa-pause", "fa-play");
    });
}

function ChangesongLoad() {
    const savedVolume = sessionStorage.getItem("musicVolume") || 0.25;
    songPlay.volume = savedVolume;
    const volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider) volumeSlider.value = savedVolume;
    
    const SongList = Object.values(songs);
    const randomSong = SongList[Math.floor(Math.random() * SongList.length)];
    songTitle.innerHTML = "Now playing: " + randomSong.title;
    songPlay.src = randomSong.url;
    songPlay.pause();
    playButton.classList.replace("fa-pause", "fa-play");
}

setInterval(() => {
    if (songPlay && songPlay.src) {
        sessionStorage.setItem("currentSongSrc", songPlay.src);
        sessionStorage.setItem("currentSongTitle", songTitle.innerText);
        sessionStorage.setItem("currentTime", songPlay.currentTime);
    }
}, 1000);

window.addEventListener("DOMContentLoaded", () => {
    const savedSrc = sessionStorage.getItem("currentSongSrc");
    const savedTitle = sessionStorage.getItem("currentSongTitle");
    const savedTime = parseFloat(sessionStorage.getItem("currentTime") || "0");
    const savedVolume = sessionStorage.getItem("musicVolume") || 0.25;

    if (savedSrc && savedTitle) {
        songPlay.src = savedSrc;
        songTitle.innerText = savedTitle;
        songPlay.volume = savedVolume;
        const volumeSlider = document.getElementById("volumeSlider");
        if (volumeSlider) volumeSlider.value = savedVolume;
        songPlay.currentTime = savedTime || 0;
        songPlay.play().then(() => {
            playButton.classList.replace("fa-play", "fa-pause");
        }).catch(e => {
            console.warn("Autoplay failed:", e);
            playButton.classList.replace("fa-pause", "fa-play");
        });
    }
});

function ChangeSongTrackList() {
    const x = document.getElementById("trackList").value;
    const SongList = Object.values(songs);
    if (x == "none") {
        return;
    } else {
        const newSong = SongList[x];
        songTitle.innerHTML = "Now playing: " + newSong.title;
        songPlay.src = newSong.url;
        songPlay.play().then(() => {
            playButton.classList.replace("fa-play", "fa-pause");
        }).catch(e => {
            console.warn("Play failed:", e);
            playButton.classList.replace("fa-pause", "fa-play");
        });
    }
}

songPlay.onended = function() {
    ChangesongPlay();
};

function playPauseMusic() {
    if (songPlay.paused) {
        songPlay.play().then(() => {
            playButton.classList.replace("fa-play", "fa-pause");
        }).catch(e => {
            console.warn("Play failed:", e);
        });
    } else {
        songPlay.pause();
        playButton.classList.replace("fa-pause", "fa-play");
    }
}

function rewindMusic() {
    songPlay.currentTime = 0;
}
