/**
 * Módulo para gestionar el Historial (LocalStorage).
 */
const HISTORY_KEY = 'md_history_v1';
const MAX_HISTORY = 5;

export function getHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error al leer historial:', e);
        return [];
    }
}

export function saveToHistory(url, format) {
    let history = getHistory();
    
    // Eliminar si existe para moverlo al top
    history = history.filter(item => item.url !== url);
    
    // Insertar al inicio
    history.unshift({ url, format, timestamp: new Date().getTime() });
    
    // Recortar al máximo
    if (history.length > MAX_HISTORY) {
        history.pop();
    }
    
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error al guardar historial:', e);
    }
}
