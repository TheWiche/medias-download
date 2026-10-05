/**
 * Módulo para interactuar con la API de Cobalt.
 * Implementa un sistema de "Fallback" (Rotación de servidores) para evadir caídas.
 */
const INSTANCES = [
    'https://co.wuk.sh/',
    'https://cobalt.owo.network/',
    'https://co.pussthecat.org/',
    'https://cobalt.tu.fo/',
    'https://cobalt.kwiatechu.com/',
    'https://api.cobalt.tools/' // El oficial al final (por si le quitan el auth)
];

export async function fetchDownloadUrl(url, format) {
    const payload = { 
        url: url,
        ...(format === 'audio' && { isAudioOnly: true, aFormat: "best" }) 
    };

    let lastError = null;

    // Intentar con cada servidor uno por uno hasta que uno responda con éxito
    for (const apiUrl of INSTANCES) {
        try {
            console.log(`[Downloader] Intentando con servidor: ${apiUrl}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                lastError = `Servidor ${apiUrl} respondió HTTP ${response.status}`;
                continue; // Saltar al siguiente servidor
            }

            const data = await response.json();

            if (data.status === 'error') {
                lastError = data.text || 'Error interno en la API';
                continue;
            }

            if (data.url) {
                console.log(`[Downloader] ¡Éxito con ${apiUrl}!`);
                return data.url;
            }
            
        } catch (error) {
            console.warn(`[Downloader] Servidor ${apiUrl} caído o bloqueado. Probando el siguiente...`);
            lastError = error.message;
        }
    }

    // Si todos fallan
    console.error("[Downloader] Todos los servidores fallaron. Último error:", lastError);
    throw new Error('Todos los servidores públicos están saturados ahora mismo. Intenta en unos minutos.');
}
