console.log('Content script cargado');

function continuarFlujoAutofill() {
    chrome.storage.local.get('autofillData', function(result) {
        const data = result.autofillData;
        if (data && data.afiliado) {
            console.log('[AutoFill] Usando datos guardados:', data);

            // 1. Seleccionar "DNI" en el selector
            const selectIdent = document.getElementById('tipoIdentificacionSelected');
            if (selectIdent) {
                selectIdent.value = '3';
                selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('[AutoFill] Seleccionado DNI en el selector.');
            } else {
                console.log('[AutoFill] No se encontró el selector tipoIdentificacionSelected.');
                return;
            }

            // 2. Esperar 2 segundos y rellenar el input
            setTimeout(() => {
                const inputDni = document.getElementById('numeroIdentificacion');
                if (inputDni) {
                    inputDni.value = data.afiliado;
                    inputDni.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('[AutoFill] Rellenado N° Afiliado en input numeroIdentificacion:', data.afiliado);

                    // 3. Esperar 1 segundo y hacer clic en el botón Continuar
                    setTimeout(() => {
                        const btnContinuar = document.querySelector("input[name='Continuar']");
                        if (btnContinuar) {
                            btnContinuar.click();
                            console.log('[AutoFill] Se hizo clic en el botón Continuar.');
                        } else {
                            console.log('[AutoFill] No se encontró el botón Continuar.');
                        }
                    }, 1000);
                } else {
                    console.log('[AutoFill] No se encontró el input numeroIdentificacion.');
                }
            }, 2000);
        } else {
            console.log('[AutoFill] No hay datos guardados para autofill.');
        }
    });
}

// Ejecutar el flujo automáticamente si hay datos guardados al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        continuarFlujoAutofill();
    }, 1500);
});

// Escuchar mensajes desde popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.accion === 'rellenar-formulario') {
        console.log('[AutoFill] Recibido mensaje para autofill desde popup.');
        chrome.storage.local.set({ autofillData: request }, function() {
            console.log('[AutoFill] Datos guardados en memoria desde content script:', request);
            setTimeout(() => {
                continuarFlujoAutofill();
            }, 2000);
        });
    }
});