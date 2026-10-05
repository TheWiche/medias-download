/**
 * Orquestador principal (Entry Point).
 */
import { isValidUrl } from './utils/validators.js';
import { fetchDownloadUrl } from './api/cobaltService.js';
import { showToast, showUpdateToast } from './ui/toastService.js';
import { getHistory, saveToHistory } from './utils/storage.js';
import { registerSW } from './pwa/registerServiceWorker.js';
import { initInstallPrompt } from './pwa/installPrompt.js';
import { handleSharedTarget } from './pwa/shareTarget.js';
import { vibrateTap, vibrateSuccess, vibrateError } from './utils/haptics.js';
import { 
    initUIListeners, 
    getFormData, 
    setFormData,
    setLoadingState, 
    resetForm, 
    triggerDownload, 
    onFormSubmit,
    renderHistory
} from './ui/uiHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Registro e Instalación PWA
    registerSW((newWorker) => {
        // Callback inyectado cuando hay una nueva versión de Service Worker
        showUpdateToast(() => {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
        });
    });
    
    initInstallPrompt();

    // 2. Intercepción del Web Share Target
    handleSharedTarget((url, format) => {
        setFormData(url, format);
        showToast('Enlace capturado. Listo para descargar.', 'success');
        vibrateTap();
    });

    // 3. Refrescar UI del Historial
    const updateHistoryUI = () => {
        renderHistory(getHistory(), (url, format) => {
            setFormData(url, format);
            showToast('Enlace cargado del historial.', 'success');
            vibrateTap();
        });
    };

    // 4. Inicializar Eventos DOM
    initUIListeners((msg, type) => {
        if(type === 'error') vibrateError();
        showToast(msg, type);
    });
    updateHistoryUI();

    // 5. Orquestar el Flujo de Descarga
    onFormSubmit(async (e) => {
        e.preventDefault();

        const { url, format } = getFormData();

        if (!isValidUrl(url)) {
            vibrateError();
            showToast('Por favor, ingresa una URL válida.', 'error');
            return;
        }

        vibrateTap(); // Interacción táctil
        setLoadingState(true);

        try {
            const downloadUrl = await fetchDownloadUrl(url, format);
            
            vibrateSuccess(); // Haptic Success
            showToast('¡Descarga iniciada exitosamente!', 'success');
            triggerDownload(downloadUrl);
            
            // Persistir éxito en local
            saveToHistory(url, format);
            updateHistoryUI();
            
            resetForm();
        } catch (error) {
            vibrateError(); // Haptic Error
            console.error('Download error:', error);
            showToast(error.message || 'Error de red. Verifica tu conexión.', 'error');
        } finally {
            setLoadingState(false);
        }
    });
});
