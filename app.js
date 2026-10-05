document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const urlInput = document.getElementById('url');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.getElementById('notification');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        const format = document.querySelector('input[name="format"]:checked').value;
        
        // Validación básica
        if (!isValidUrl(url)) {
            showNotification('Por favor, ingresa una URL válida.', 'error');
            return;
        }

        // Estado inicial de carga
        setLoadingState(true);
        hideNotification();

        try {
            // Construcción del payload (Soporte mixto Cobalt API v6 / v7)
            const payload = {
                url: url
            };

            // Configuración para forzar solo audio
            if (format === 'audio') {
                payload.isAudioOnly = true;     // Parámetro v6
                payload.downloadMode = 'audio'; // Parámetro v7
            }

            const response = await fetch('https://api.cobalt.tools/api/json', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Manejo de errores devueltos por HTTP status
            if (!response.ok) {
                const errorMsg = data.text || data.error?.text || 'Error al procesar la solicitud con el servidor.';
                throw new Error(errorMsg);
            }

            // Manejo de errores devueltos internamente en status 200 (Cobalt API errors)
            if (data.status === 'error') {
                throw new Error(data.text || 'Ocurrió un error en la API.');
            }

            // Exito: obteniendo la URL
            if (data.url) {
                showNotification('¡Procesado! Iniciando descarga...', 'success');
                
                // Forzar descarga o apertura del recurso
                triggerDownload(data.url);
                
                // Restablecer la UI
                form.reset();
                const slider = document.getElementById('format-slider');
                if (slider) slider.style.transform = 'translateX(0)'; // Resetear slider a audio por default
            } else {
                throw new Error('No se recibió la URL de descarga esperada.');
            }

        } catch (error) {
            console.error('Error en la descarga:', error);
            showNotification(error.message || 'Error de red. Verifica tu conexión e intenta nuevamente.', 'error');
        } finally {
            // Restaurar estado del botón
            setLoadingState(false);
        }
    });

    /**
     * Valida si el string tiene un formato de URL válido
     */
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Alterna la UI entre el estado "Procesando" y el estado normal
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'pointer-events-none');
            btnText.textContent = 'Procesando...';
            btnSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'pointer-events-none');
            btnText.textContent = 'Descargar';
            btnSpinner.classList.add('hidden');
        }
    }

    /**
     * Muestra notificaciones con estilos dependiendo del tipo
     */
    function showNotification(message, type) {
        notification.textContent = message;
        // Limpiamos las clases previas y dejamos las bases
        notification.className = 'p-4 rounded-2xl text-[14px] text-center font-medium shadow-lg transition-all duration-300';
        
        if (type === 'error') {
            notification.classList.add('bg-red-950/40', 'text-red-400', 'border', 'border-red-900/50');
        } else if (type === 'success') {
            notification.classList.add('bg-green-950/40', 'text-green-400', 'border', 'border-green-900/50');
        }
        
        notificationContainer.classList.remove('hidden');
    }

    /**
     * Oculta el contenedor de notificaciones
     */
    function hideNotification() {
        notificationContainer.classList.add('hidden');
    }

    /**
     * Fuerza la descarga o abre el link provisto por la API
     */
    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});


// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado con éxito en el scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Error al registrar el Service Worker:', error);
            });
    });
}
