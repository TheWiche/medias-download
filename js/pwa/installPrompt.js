/**
 * Módulo para gestionar el prompt nativo de instalación PWA (Bottom Sheet).
 */

let deferredPrompt = null;
let uiReady = false; // Bandera para saber si el DOM ya cargó el banner

console.log("[PWA] Service Worker registrado - Módulo de instalación inicializado");

// 1. Escuchar SIEMPRE Y DE INMEDIATO el evento, a nivel global del módulo
// No lo metas dentro de la inicialización del DOM porque puede dispararse antes.
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("[PWA] Evento beforeinstallprompt disparado y capturado exitosamente.");
    
    // Si la UI ya cargó cuando esto ocurre, mostramos el banner
    if (uiReady) {
        showBanner();
    }
});

let installBannerEl, closeBtnEl, installBtnEl;

function showBanner() {
    if (!installBannerEl) return;
    installBannerEl.classList.remove('translate-y-full');
    installBannerEl.classList.add('translate-y-0');
}

function closeBanner() {
    if (!installBannerEl) return;
    installBannerEl.classList.remove('translate-y-0');
    installBannerEl.classList.add('translate-y-full');
    localStorage.setItem('md_pwa_banner_closed', 'true');
}

export function initInstallPrompt() {
    uiReady = true;

    installBannerEl = document.getElementById('pwa-install-banner');
    installBtnEl = document.getElementById('pwa-install-btn');
    closeBtnEl = document.getElementById('pwa-close-btn');
    const iosInstructions = document.getElementById('pwa-ios-instructions');
    const standardInstructions = document.getElementById('pwa-standard-instructions');

    if(!installBannerEl) return; // Salvaguarda

    // Detección de iOS
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detección si ya está en modo Standalone
    const isStandalone = () => {
        return ('standalone' in window.navigator && window.navigator.standalone) || 
               window.matchMedia('(display-mode: standalone)').matches;
    };

    closeBtnEl.addEventListener('click', closeBanner);

    // Evitar molestias si ya está instalada o el banner se cerró antes
    if (isStandalone() || localStorage.getItem('md_pwa_banner_closed') === 'true') {
        console.log("[PWA] La app ya está instalada o el usuario cerró el banner previamente.");
        return;
    }

    if (isIos()) {
        standardInstructions.classList.add('hidden');
        iosInstructions.classList.remove('hidden');
        installBtnEl.classList.add('hidden'); 
        
        // Retraso para que el usuario observe la app primero
        setTimeout(showBanner, 2000);
    } else {
        // Enlazar correctamente el botón de instalación
        installBtnEl.addEventListener('click', async () => {
            if (deferredPrompt) {
                console.log("[PWA] Solicitando prompt nativo al usuario...");
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('[PWA] Instalación aceptada.');
                } else {
                    console.log('[PWA] Instalación rechazada.');
                }
                deferredPrompt = null;
                closeBanner();
            } else {
                console.warn("[PWA] No hay deferredPrompt disponible al hacer clic en instalar.");
            }
        });

        // Si el evento beforeinstallprompt ya se disparó y capturó antes de llegar aquí:
        if (deferredPrompt) {
            console.log("[PWA] Mostrando banner porque beforeinstallprompt ya había ocurrido.");
            showBanner();
        }
    }
}
