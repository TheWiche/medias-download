/**
 * Módulo de Haptic Feedback (Retroalimentación háptica / Vibración)
 */

export function vibrateTap() {
    if (navigator.vibrate) {
        // Vibración sumamente sutil (ej. tap en botones)
        navigator.vibrate(50);
    }
}

export function vibrateSuccess() {
    if (navigator.vibrate) {
        // Doble pulso (común para operaciones exitosas)
        navigator.vibrate([100, 50, 100]); 
    }
}

export function vibrateError() {
    if (navigator.vibrate) {
        // 3 pulsos cortos (advertencias / errores)
        navigator.vibrate([50, 50, 50, 50, 50]); 
    }
}
