console.log('Content script cargado');

function continuarFlujoAutofill() {
    chrome.storage.local.get('autofillData', function(result) {
        const data = result.autofillData;
        if (!data) {
            console.log('[AutoFill] No hay datos guardados para autofill.');
            return;
        }
        // Paso 1: Si existe el selector de DNI, estamos en la primera pantalla
        const selectIdent = document.getElementById('tipoIdentificacionSelected');
        if (selectIdent) {
            selectIdent.value = '3';
            selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[AutoFill] Seleccionado DNI en el selector.');
            setTimeout(() => {
                const inputDni = document.getElementById('numeroIdentificacion');
                if (inputDni) {
                    inputDni.value = data.afiliado;
                    inputDni.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('[AutoFill] Rellenado N° Afiliado en input numeroIdentificacion:', data.afiliado);
                    setTimeout(() => {
                        const btnContinuar = document.querySelector("input[name='Continuar']");
                        if (btnContinuar) {
                            btnContinuar.click();
                            console.log('[AutoFill] Click en botón Continuar.');
                        } else {
                            console.log('[AutoFill] No se encontró el botón Continuar.');
                        }
                    }, 1000);
                } else {
                    console.log('[AutoFill] No se encontró el input numeroIdentificacion.');
                }
            }, 500);
            return;
        }
        // Paso 2: Espera activa para el selector de diagnóstico
        let intentos = 0;
        const maxIntentos = 10; // 10 intentos x 500ms = 5 segundos
        function intentarDiagnostico() {
            const selectorTipo = document.getElementById('tipoDiagnosticoSelected');
            const inputCodigo = document.getElementById('codigoDiagnostico');
            if (selectorTipo && inputCodigo) {
                selectorTipo.value = "2"; // "2" es Definitivo
                selectorTipo.dispatchEvent(new Event('change', { bubbles: true }));
                console.log("[AutoFill] Selector de tipo diagnóstico colocado en 'Definitivo'");
                inputCodigo.value = data.codigo || "";
                inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));
                console.log("[AutoFill] Input de código diagnóstico rellenado:", inputCodigo.value);
                // Clic automático en el radio
                setTimeout(() => {
                    const radioConsulta = document.getElementById('radioConsultaID_0');
                    if (radioConsulta) {
                        radioConsulta.click();
                        console.log('[AutoFill] Radio radioConsultaID_0 clickeado automáticamente.');
                    } else {
                        console.log('[AutoFill] No se encontró el radio radioConsultaID_0.');
                    }
                        // Nuevo: Clic automático en el botón Validar
                        setTimeout(() => {
                            const btnValidar = document.querySelector("input[name='Consumir']");
                            if (btnValidar) {
                                btnValidar.click();
                                console.log('[AutoFill] Botón Validar clickeado automáticamente.');
                                // Enviar mensaje para cerrar el popup
                                chrome.runtime.sendMessage({ accion: 'cerrar-popup' });
                            } else {
                                console.log('[AutoFill] No se encontró el botón Validar (Consumir).');
                            }
                        }, 1000);
                }, 500);
                return;
            }
            intentos++;
            if (intentos < maxIntentos) {
                setTimeout(intentarDiagnostico, 500);
            } else {
                console.log('[AutoFill] No se encontraron los elementos de diagnóstico tras esperar.');
            }
        }
        intentarDiagnostico();
    });
}

// Ejecutar el flujo automáticamente si hay datos guardados al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.href.includes('identificacion.do')) {
            console.log('[AutoFill] Ejecutando autofill en la página de identificación:', window.location.href);
        }
            chrome.storage.local.get('autofillData', function(result) {
                const data = result.autofillData;
                if (data) {
                    continuarFlujoAutofill();
                    // Simular clic en el botón 'Rellenar' si existe en la segunda página
                    setTimeout(() => {
                        const btnRellenar = document.querySelector('button, input[type="button"], input[type="submit"]');
                        if (btnRellenar && (btnRellenar.textContent.trim().toLowerCase() === 'rellenar' || btnRellenar.value?.trim().toLowerCase() === 'rellenar')) {
                            btnRellenar.click();
                            console.log('[AutoFill] Botón Rellenar clickeado automáticamente.');
                        }
                    }, 3000);
                } else {
                    console.log('[AutoFill] No hay datos guardados para autofill en esta recarga.');
                }
            });
    }, 1500);
});

// Escuchar mensajes desde popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.accion === 'rellenar-formulario') {
        console.log('[AutoFill] Recibido mensaje para autofill desde popup.');
        chrome.storage.local.set({ autofillData: request }, function() {
            console.log('[AutoFill] Datos guardados en memoria desde content script:', request);
            // Ejecutar autofill inmediatamente, sin esperar el botón
            continuarFlujoAutofill();
        });
    }
        // NUEVO: Solo seleccionar 'Definitivo' y colocar el código
        if (request.action === "autofill" && request.datos) {
            console.log("[AutoFill] Recibido autofill directo:", request.datos);
            setTimeout(() => {
                    const selectorTipo = document.getElementById('tipoDiagnosticoSelected');
                    if (selectorTipo) {
                        selectorTipo.value = "2"; // "2" es Definitivo
                        selectorTipo.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("[AutoFill] Selector de tipo diagnóstico colocado en 'Definitivo'");
                    } else {
                        console.warn("[AutoFill] No se encontró el selector tipoDiagnosticoSelected");
                    }
                    const inputCodigo = document.getElementById('codigoDiagnostico');
                    if (inputCodigo) {
                        inputCodigo.value = request.datos.codigo || "";
                        inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));
                        console.log("[AutoFill] Input de código diagnóstico rellenado:", inputCodigo.value);
                    } else {
                        console.warn("[AutoFill] No se encontró el input codigoDiagnostico");
                    }
            }, 500);
        }
});