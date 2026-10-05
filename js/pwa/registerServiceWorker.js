export function registerSW(onUpdateAvailable) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('Service Worker registrado con éxito en el scope:', registration.scope);

                // Detectar si hay un worker descargándose (Update flow)
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        // Si se terminó de instalar y ya hay un controlador previo, es una NUEVA actualización
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (onUpdateAvailable) {
                                onUpdateAvailable(newWorker);
                            }
                        }
                    });
                });

            } catch (error) {
                console.error('Error al registrar el Service Worker:', error);
            }
        });

        // Cuando el nuevo SW invoca clients.claim(), el controlador cambia.
        // Recargamos la página para montar los nuevos assets limpios.
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });

    } else {
        console.warn('El navegador no soporta Service Workers.');
    }
}
