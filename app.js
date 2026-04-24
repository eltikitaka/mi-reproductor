const ACE_ENGINE_URL = "http://127.0.0.1:6878/ace/getstream";

// DOM Elements
const video = document.getElementById('video-player');
const idPanel = document.getElementById('id-panel');
const idInput = document.getElementById('acestream-id');
const loadBtn = document.getElementById('load-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const activeIdText = document.getElementById('active-id-text');
const loadingOverlay = document.getElementById('loading-overlay');
const tickerContent = document.getElementById('ticker-content');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// --- Ticker Logic ---

const ESPN_ENDPOINTS = [
    { name: "LA LIGA", url: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard" },
    { name: "NBA", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard" },
    { name: "CHAMPIONS", url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard" },
    { name: "PREMIER", url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard" }
];

async function fetchScores() {
    let allEvents = [];
    
    for (const league of ESPN_ENDPOINTS) {
        try {
            const response = await fetch(league.url);
            const data = await response.json();
            if (data.events) {
                const events = data.events.map(event => {
                    const status = event.status.type.shortDetail;
                    const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
                    const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
                    
                    return `
                        <div class="ticker-item">
                            <strong>${league.name}</strong>: 
                            ${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.score} ${homeTeam.team.abbreviation}
                            <span class="time">${status}</span>
                        </div>
                    `;
                });
                allEvents = [...allEvents, ...events];
            }
        } catch (error) {
            console.error(`Error fetching ${league.name}:`, error);
        }
    }

    if (allEvents.length > 0) {
        // Double the content for seamless loop
        tickerContent.innerHTML = allEvents.join('') + allEvents.join('');
        // Adjust animation duration based on content length
        const duration = allEvents.length * 5; // 5s per item
        tickerContent.style.animationDuration = `${duration}s`;
    } else {
        tickerContent.innerHTML = '<div class="ticker-item">No hay resultados en vivo disponibles</div>';
    }
}

// Refresh scores every 2 minutes
setInterval(fetchScores, 120000);
fetchScores();

// --- Player Logic ---

function loadStream(id) {
    if (!id) return;
    
    // Sanitize ID: remove protocol prefixes if present
    let cleanId = id.trim();
    if (cleanId.includes('://')) {
        cleanId = cleanId.split('://')[1];
    }
    // Remove trailing slash if present
    cleanId = cleanId.replace(/\/$/, "");
    
    // Construct AceStream URL
    const streamUrl = `${ACE_ENGINE_URL}?id=${cleanId}`;
    
    activeIdText.textContent = cleanId;
    idPanel.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    
    video.src = streamUrl;
    video.load();
    
    video.play().then(() => {
        loadingOverlay.classList.add('hidden');
        updatePlayIcons(true);
    }).catch(err => {
        console.error("Error starting playback:", err);
        // Sometimes browsers block autoplay without interaction
        loadingOverlay.classList.add('hidden');
        updatePlayIcons(false);
    });
}

function updatePlayIcons(isPlaying) {
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

// Event Listeners
loadBtn.addEventListener('click', () => {
    loadStream(idInput.value);
});

playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        updatePlayIcons(true);
    } else {
        video.pause();
        updatePlayIcons(false);
    }
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Check for ID in URL on startup
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id') || params.get('contentId');
    
    if (contentId) {
        idInput.value = contentId;
        loadStream(contentId);
    }
});

// Handle video errors
video.addEventListener('error', (e) => {
    console.error("Video error:", e);
    alert("Error al cargar el stream. Asegúrate de que Ace Stream Engine esté corriendo.");
    loadingOverlay.classList.add('hidden');
    idPanel.classList.remove('hidden');
});
