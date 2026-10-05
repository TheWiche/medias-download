/**
 * Módulo dedicado a inyectar notificaciones flotantes temporales (Toasts).
 */
const container = document.getElementById('toast-container');

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    
    // Base Classes (Tailwind + Custom Animation)
    toast.className = 'flex items-center w-full p-4 text-sm font-medium rounded-2xl shadow-xl transition-all duration-300 animate-slide-in backdrop-blur-md';
    
    // Styling
    if (type === 'success') {
        toast.classList.add('bg-green-950/90', 'text-green-400', 'border', 'border-green-900/50');
    } else if (type === 'error') {
        toast.classList.add('bg-red-950/90', 'text-red-400', 'border', 'border-red-900/50');
    } else {
        toast.classList.add('bg-zinc-800/90', 'text-zinc-300', 'border', 'border-zinc-700/50');
    }
    
    // Icon and text structure
    const iconStr = type === 'success' 
        ? `<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
        : `<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

    toast.innerHTML = `${iconStr} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('animate-slide-in');
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300); // Esperar CSS transition
    }, 3000);
}

export function showUpdateToast(onConfirm) {
    const toast = document.createElement('div');
    
    toast.className = 'flex items-center justify-between w-full p-4 text-sm font-medium rounded-2xl shadow-xl animate-slide-in backdrop-blur-md bg-blue-950/95 text-blue-300 border border-blue-900/50 pointer-events-auto';
    
    toast.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Nueva versión disponible</span>
        </div>
        <div class="flex items-center space-x-2">
            <button class="update-btn text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs shadow-lg shadow-blue-500/30">
                Actualizar
            </button>
            <button class="dismiss-btn text-zinc-400 hover:text-white px-2 py-1.5 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(toast);
    
    toast.querySelector('.update-btn').addEventListener('click', () => {
        onConfirm();
    });

    toast.querySelector('.dismiss-btn').addEventListener('click', () => {
        toast.classList.remove('animate-slide-in');
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    });
}
