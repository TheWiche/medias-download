/**
 * Módulo para interactuar con la API de Cobalt.
 */
const API_URL = 'https://api.cobalt.tools/api/json';

export async function fetchDownloadUrl(url, format) {
    const payload = { url: url };

    if (format === 'audio') {
        payload.isAudioOnly = true;
        payload.downloadMode = 'audio';
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.text || data.error?.text || 'Error al procesar la solicitud con el servidor.');
    }

    if (data.status === 'error') {
        throw new Error(data.text || 'Ocurrió un error interno en la API.');
    }

    if (data.url) return data.url;

    throw new Error('No se recibió URL de descarga.');
}
