// app.js - Versión compatible con APK
const video = document.getElementById('video-player');
const loadingOverlay = document.getElementById('loading-overlay');

function loadStream(id) {
    if (!id) return;
    const cleanId = id.trim().replace('acestream://', '').replace('//', '');
    
    // Probamos primero con 127.0.0.1, si falla, el error handler probará con localhost
    const url = `http://127.0.0.1:6878/ace/getstream?id=${cleanId}&format=hls`;
    
    console.log("Intentando cargar:", url);
    idPanel.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    
    // Usamos HLS.js
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
            loadingOverlay.classList.add('hidden');
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.details === 'manifestLoadError') {
                // SEGUNDO INTENTO: Si 127.0.0.1 falla, probamos localhost
                const fallbackUrl = `http://localhost:6878/ace/getstream?id=${cleanId}&format=hls`;
                console.log("Fallo 127.0.0.1, probando:", fallbackUrl);
                hls.loadSource(fallbackUrl);
            }
        });
    }
}

// Comprobación de salud del motor
async function checkEngine() {
    try {
        await fetch('http://127.0.0.1:6878/ace/getstream');
    } catch (e) {
        console.warn("El motor no responde en 127.0.0.1, podría ser por bloqueo de Cleartext Traffic en la APK.");
    }
}
checkEngine();
