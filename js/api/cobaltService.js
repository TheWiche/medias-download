/**
 * Módulo para interactuar con la API de Cobalt.
 */
const API_URL = 'https://api.cobalt.tools/';

export async function fetchDownloadUrl(url, format) {
    // La versión actual de la API de Cobalt (cobalt.tools/api) acepta parámetros de forma ligeramente distinta
    // y requiere headers estrictos en algunos casos.
    const payload = { 
        url: url,
        // downloadMode fue reemplazado en la v11 por otros campos, o puede requerirse aAudio/isAudioOnly. 
        // Usamos la configuración recomendada para extraer solo audio:
        ...(format === 'audio' && { isAudioOnly: true, aFormat: "best" }) 
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // A veces es útil mandar un User-Agent distinto o CORS restringe, pero lo básico es:
            },
            body: JSON.stringify(payload)
        });

        // Verificamos si falló en nivel HTTP (ej. 403, 429, 500)
        if (!response.ok) {
            // Extraer el texto para analizar qué está rechazando el servidor
            const errorText = await response.text();
            console.error(`[Cobalt API Error] HTTP ${response.status}:`, errorText);
            
            try {
                // Intentar parsearlo por si es JSON
                const errJson = JSON.parse(errorText);
                throw new Error(errJson.text || errJson.error?.text || `Error HTTP ${response.status}`);
            } catch(e) {
                // Si no era JSON, lanzar el texto crudo
                throw new Error(`Error de servidor (${response.status}): ${errorText.substring(0, 50)}...`);
            }
        }

        const data = await response.json();

        if (data.status === 'error') {
            console.error("[Cobalt API Error] Status Error:", data);
            throw new Error(data.text || 'Ocurrió un error interno en la API.');
        }

        if (data.url) return data.url;

        console.error("[Cobalt API Error] No URL in response:", data);
        throw new Error('No se recibió URL de descarga de la API.');
        
    } catch (error) {
        // Bloque general que atrapa fallas de red (CORS, offline) y nuestros throw Error
        console.error("[Cobalt API Try/Catch] Petición fallida:", error);
        throw error;
    }
}
