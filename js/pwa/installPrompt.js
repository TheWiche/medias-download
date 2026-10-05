/**
 * Módulo para gestionar el prompt nativo de instalación PWA (Bottom Sheet).
 */

let deferredPrompt;

export function initInstallPrompt() {
    const installBanner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = document.getElementById('pwa-close-btn');
    const iosInstructions = document.getElementById('pwa-ios-instructions');
    const standardInstructions = document.getElementById('pwa-standard-instructions');

    if(!installBanner) return; // Salvaguarda

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

    // Acción para cerrar
    const closeBanner = () => {
        installBanner.classList.remove('translate-y-0');
        installBanner.classList.add('translate-y-full');
        localStorage.setItem('md_pwa_banner_closed', 'true');
    };

    closeBtn.addEventListener('click', closeBanner);

    // Evitar molestias
    if (isStandalone() || localStorage.getItem('md_pwa_banner_closed') === 'true') {
        return;
    }

    if (isIos()) {
        standardInstructions.classList.add('hidden');
        iosInstructions.classList.remove('hidden');
        installBtn.classList.add('hidden'); 
        
        // Retraso para que el usuario observe la app primero
        setTimeout(() => {
            installBanner.classList.remove('translate-y-full');
            installBanner.classList.add('translate-y-0');
        }, 2000);
        
    } else {
        // Lógica Android / Desktop
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar Bottom Sheet
            installBanner.classList.remove('translate-y-full');
            installBanner.classList.add('translate-y-0');
        });

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('Instalación aceptada.');
                }
                deferredPrompt = null;
                closeBanner();
            }
        });
    }
}
