/**
 * Módulo para interactuar con APIs de descarga (Alternativas a Cobalt).
 * Implementa Proxys CORS para evadir bloqueos de navegador.
 */

// APIs alternativas gratuitas (No usan Cobalt)
const FALLBACK_APIS = [
    {
        // VKR Downloader (Muy estable, devuelve JSON con 'data.downloads')
        url: (link) => `https://api.vkrdownloader.vercel.app/server?vkr=${encodeURIComponent(link)}`,
        parse: (data, format) => {
            if (!data?.data?.downloads?.length) return null;
            if (format === 'audio') {
                const aud = data.data.downloads.find(d => d.format === 'mp3' || d.format === 'm4a');
                return aud ? aud.url : data.data.downloads[0].url;
            }
            const vid = data.data.downloads.find(d => d.format === 'mp4');
            return vid ? vid.url : data.data.downloads[0].url;
        }
    },
    {
        // Siputzx API (Alternativa asiática)
        url: (link) => `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(link)}`,
        parse: (data, format) => {
            if (data?.status && data?.data?.dl) return data.data.dl;
            return null;
        }
    },
    {
        // Kizzy API
        url: (link) => `https://api.kizzy.co/v1/youtube?url=${encodeURIComponent(link)}`,
        parse: (data, format) => {
            if (format === 'audio' && data?.audio?.length) return data.audio[0].url;
            if (data?.video?.length) return data.video[0].url;
            return null;
        }
    }
];

// Usaremos un Proxy CORS público por si las APIs están bloqueando peticiones directas desde el navegador
const CORS_PROXY = "https://corsproxy.io/?";

export async function fetchDownloadUrl(url, format) {
    let lastError = null;

    for (const api of FALLBACK_APIS) {
        const targetUrl = api.url(url);
        // Envolvemos la URL en el proxy CORS para engañar al servidor
        const proxiedUrl = CORS_PROXY + encodeURIComponent(targetUrl);
        
        try {
            console.log(`[Downloader] Probando alternativa: ${targetUrl.split('/')[2]}`);
            
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                lastError = `HTTP ${response.status}`;
                continue;
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                lastError = 'Respuesta no es JSON válido';
                continue;
            }

            const downloadLink = api.parse(data, format);
            
            if (downloadLink) {
                console.log(`[Downloader] ¡Éxito con ${targetUrl.split('/')[2]}!`);
                return downloadLink;
            } else {
                lastError = 'No se encontró enlace en la respuesta';
            }
            
        } catch (error) {
            console.warn(`[Downloader] Falló ${targetUrl.split('/')[2]}:`, error.message);
            lastError = error.message;
        }
    }

    // Si todas las alternativas fallan
    console.error("[Downloader] Todas las APIs alternativas fallaron. Último error:", lastError);
    throw new Error('Todas las APIs públicas están bloqueando la petición. Intenta descargar desde otra red o más tarde.');
}
