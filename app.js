function loadStream(id) {
    if (!id) return;
    const cleanId = id.trim().replace('acestream://', '').replace('//', '');
    
    idPanel.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    statusText.innerText = "Despertando el motor Ace Stream...";

    // PASO 1: Le decimos al motor que inicie la descarga del ID
    // Usamos el comando 'stat' para comprobar si el motor lo reconoce
    const startUrl = `http://127.0.0.1:6878/ace/getstream?id=${cleanId}&sid=eltikitaka&format=json`;

    fetch(startUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del motor:", data);
            
            // Si el motor nos da una URL de reproducción, la usamos
            let playUrl = "";
            if (data.response && data.response.playback_url) {
                playUrl = data.response.playback_url;
            } else {
                // Si no, forzamos la URL de manifiesto que es la más fiable
                playUrl = `http://127.0.0.1:6878/ace/manifest.m3u8?id=${cleanId}`;
            }

            statusText.innerText = "Canal listo. Iniciando reproducción...";
            
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play();
                    loadingOverlay.classList.add('hidden');
                });
            } else {
                video.src = playUrl;
                video.play();
                loadingOverlay.classList.add('hidden');
            }
        })
        .catch(err => {
            console.error("Error al despertar el motor:", err);
            statusText.innerText = "Error: El motor no responde. ¿Está abierto Ace Stream Engine?";
            
            // Intento desesperado: Carga directa
            video.src = `http://127.0.0.1:6878/ace/getstream?id=${cleanId}`;
            video.play();
        });
}
