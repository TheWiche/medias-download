/**
 * Módulo para gestionar la Interfaz de Usuario.
 */
import { pasteFromClipboard } from '../utils/clipboard.js';

const DOM = {
    form: document.getElementById('download-form'),
    urlInput: document.getElementById('url'),
    submitBtn: document.getElementById('submit-btn'),
    btnText: document.getElementById('btn-text'),
    btnSpinner: document.getElementById('btn-spinner'),
    formatSlider: document.getElementById('format-slider'),
    formatRadios: document.querySelectorAll('input[name="format"]'),
    pasteBtn: document.getElementById('paste-btn'),
    clearBtn: document.getElementById('clear-btn'),
    historyToggleBtn: document.getElementById('history-toggle'),
    historyIcon: document.getElementById('history-icon'),
    historyContent: document.getElementById('history-content'),
    historyList: document.getElementById('history-list')
};

export function initUIListeners(onToastCallback) {
    // Slider Format
    DOM.formatRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateSliderPos(e.target.value);
        });
    });

    // Input dynamics (Show clear button)
    DOM.urlInput.addEventListener('input', toggleInputButtons);

    // Clear Button
    DOM.clearBtn.addEventListener('click', () => {
        DOM.urlInput.value = '';
        toggleInputButtons();
        DOM.urlInput.focus();
    });

    // Paste Button
    DOM.pasteBtn.addEventListener('click', async () => {
        try {
            const text = await pasteFromClipboard();
            if (text) {
                DOM.urlInput.value = text;
                toggleInputButtons();
            }
        } catch (e) {
            onToastCallback(e.message, 'error');
        }
    });

    // History Accordion
    DOM.historyToggleBtn.addEventListener('click', () => {
        const isHidden = DOM.historyContent.classList.toggle('hidden');
        DOM.historyIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });
}

function updateSliderPos(value) {
    DOM.formatSlider.style.transform = value === 'video' ? 'translateX(100%)' : 'translateX(0)';
}

function toggleInputButtons() {
    if (DOM.urlInput.value.trim().length > 0) {
        DOM.clearBtn.classList.remove('hidden');
        DOM.pasteBtn.classList.add('hidden');
    } else {
        DOM.clearBtn.classList.add('hidden');
        DOM.pasteBtn.classList.remove('hidden');
    }
}

export function getFormData() {
    return {
        url: DOM.urlInput.value.trim(),
        format: document.querySelector('input[name="format"]:checked').value
    };
}

export function setFormData(url, format) {
    DOM.urlInput.value = url;
    document.querySelector(`input[name="format"][value="${format}"]`).checked = true;
    updateSliderPos(format);
    toggleInputButtons();
}

export function setLoadingState(isLoading) {
    if (isLoading) {
        DOM.submitBtn.disabled = true;
        DOM.btnText.textContent = 'Procesando...';
        DOM.btnSpinner.classList.remove('hidden');
    } else {
        DOM.submitBtn.disabled = false;
        DOM.btnText.textContent = 'Descargar';
        DOM.btnSpinner.classList.add('hidden');
    }
}

export function resetForm() {
    DOM.urlInput.value = '';
    toggleInputButtons();
    document.querySelector('input[name="format"][value="audio"]').checked = true;
    updateSliderPos('audio');
}

export function renderHistory(items, onItemClick) {
    DOM.historyList.innerHTML = '';
    
    if (items.length === 0) {
        DOM.historyList.innerHTML = '<p class="text-zinc-500 text-[13px] text-center py-3 italic">Aún no hay enlaces descargados.</p>';
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors border border-zinc-700/30 group';
        
        li.innerHTML = `
            <div class="truncate pr-4 flex-1">
                <p class="text-sm text-zinc-300 truncate font-medium">${item.url}</p>
                <p class="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">${item.format}</p>
            </div>
            <div class="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </div>
        `;
        
        li.addEventListener('click', () => onItemClick(item.url, item.format));
        DOM.historyList.appendChild(li);
    });
}

export function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function onFormSubmit(callback) {
    DOM.form.addEventListener('submit', callback);
}
