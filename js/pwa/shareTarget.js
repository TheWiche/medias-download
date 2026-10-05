/**
 * Módulo para gestionar la Web Share Target API.
 * Extrae URLs compartidas desde otras aplicaciones (ej. YouTube) hacia nuestra PWA.
 */

export function handleSharedTarget(setFormDataCallback) {
    // Si no hay parámetros GET en la URL, no venimos de un Share Intent
    if (!window.location.search) return;

    const urlParams = new URLSearchParams(window.location.search);
    const sharedTitle = urlParams.get('title') || '';
    const sharedText = urlParams.get('text') || '';
    const sharedUrl = urlParams.get('url') || '';

    // Algunas apps (como YouTube en Android) envían la URL concatenada dentro de 'text'
    const combinedString = `${sharedTitle} ${sharedText} ${sharedUrl}`;

    // Regex para buscar un enlace con formato http/https
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = combinedString.match(urlRegex);

    if (matches && matches.length > 0) {
        // Tomar la primera coincidencia (la URL cruda)
        const extractedUrl = matches[0];
        
        // Inyectar en la Interfaz (por defecto a audio)
        setFormDataCallback(extractedUrl, 'audio');

        // Limpiar la barra del navegador (borrar parámetros basuras GET) para evitar repeticiones al recargar
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
}
