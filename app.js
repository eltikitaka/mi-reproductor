const ACE_ENGINE_URL = "http://127.0.0.1:6878/ace/getstream";

function loadStream(id) {
    if (!id) return;
    
    // Limpieza profunda del ID
    const cleanId = id.trim().split(' ').join('').replace('acestream://', '').replace('//', '');
    
    // Probamos con el formato universal de Android
    // Usamos content_id en lugar de solo id
    const url = `${ACE_ENGINE_URL}?content_id=${cleanId}&format=json`;
    
    idPanel.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    
    console.log("Solicitando stream a:", url);

    // Primero pedimos la URL real del stream al motor
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.response && data.response.stat_url) {
                // El motor nos devuelve la URL real del video
                console.log("URL de video recibida:", data.response.stat_url);
                video.src = data.response.stat_url;
                video.play();
                loadingOverlay.classList.add('hidden');
            } else if (data.response && data.response.playback_url) {
                video.src = data.response.playback_url;
                video.play();
                loadingOverlay.classList.add('hidden');
            } else {
                // Si el JSON no tiene la URL, probamos el stream directo clásico
                video.src = `${ACE_ENGINE_URL}?id=${cleanId}`;
                video.play();
                loadingOverlay.classList.add('hidden');
            }
        })
        .catch(err => {
            console.error("Error pidiendo JSON, intentando stream directo...");
            // Si falla el JSON, intentamos el modo directo que siempre funciona
            video.src = `http://127.0.0.1:6878/ace/getstream?id=${cleanId}`;
            video.play();
            loadingOverlay.classList.add('hidden');
        });
}
