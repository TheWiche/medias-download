/**
 * Módulo para interactuar con la API de Descargas (Reemplazo de Cobalt).
 */
const API_URL = 'https://api.vkrdownloader.vercel.app/server?vkr=';

export async function fetchDownloadUrl(url, format) {
    try {
        // Usamos una API pública alternativa porque Cobalt cerró su acceso libre globalmente
        const response = await fetch(`${API_URL}${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error de servidor (${response.status})`);
        }

        const data = await response.json();

        // Extraer la URL dependiendo de la respuesta de esta nueva API
        let downloadUrl = null;
        
        if (data && data.data && data.data.downloads && data.data.downloads.length > 0) {
            if (format === 'audio') {
                const audioObj = data.data.downloads.find(d => d.format === 'mp3' || d.format === 'm4a');
                downloadUrl = audioObj ? audioObj.url : data.data.downloads[0].url;
            } else {
                const videoObj = data.data.downloads.find(d => d.format === 'mp4');
                downloadUrl = videoObj ? videoObj.url : data.data.downloads[0].url;
            }
        }

        if (downloadUrl) return downloadUrl;

        throw new Error('No se encontró un enlace de descarga válido.');
        
    } catch (error) {
        console.error("[Downloader API Error] Petición fallida:", error);
        throw new Error('La API pública rechazó la petición o está saturada.');
    }
}
