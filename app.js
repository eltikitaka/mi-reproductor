// app.js - MODO DIAGNÓSTICO
const video = document.getElementById('video-player');
const loadingOverlay = document.getElementById('loading-overlay');
const statusText = loadingOverlay.querySelector('p');

function loadStream(id) {
    if (!id) return;
    const cleanId = id.trim().replace('acestream://', '').replace('//', '');
    
    // Probamos el formato más básico (MPEG-TS directo)
    const url = `http://127.0.0.1:6878/ace/getstream?id=${cleanId}`;
    
    statusText.innerText = "Probando conexión con el motor...";
    idPanel.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');

    // Intentamos "pingear" al motor antes de cargar el video
    fetch(url, { mode: 'no-cors' })
        .then(() => {
            statusText.innerText = "Motor detectado. Cargando video...";
            video.src = url;
            video.play().catch(e => {
                statusText.innerText = "Error: " + e.message + ". Intenta pulsar PLAY manualmente.";
                console.error(e);
            });
        })
        .catch(err => {
            statusText.innerText = "ERROR: El motor no responde en 127.0.0.1:6878. ¿Está el Engine encendido?";
            console.error("Error de red:", err);
        });
}

// Al final del archivo, añade esto para ver logs en la pantalla del móvil
const debugDiv = document.createElement('div');
debugDiv.style = "position:fixed; top:0; left:0; background:rgba(0,0,0,0.7); color:lime; font-size:10px; z-index:9999; pointer-events:none; padding:5px;";
document.body.appendChild(debugDiv);
console.log = (msg) => { debugDiv.innerText += msg + "\n"; };
