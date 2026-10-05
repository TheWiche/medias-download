/**
 * Módulo para interacción con el Portapapeles (API Navigator).
 */
export async function pasteFromClipboard() {
    try {
        if (!navigator.clipboard) {
            throw new Error('El navegador no soporta lectura del portapapeles.');
        }
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Error de Clipboard API: ', err);
        throw new Error('Permiso denegado o portapapeles inaccesible.');
    }
}
