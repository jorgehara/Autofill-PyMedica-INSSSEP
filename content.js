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
                            // 4. Esperar 2 segundos y seleccionar 'Definitivo' en tipoDiagnosticoSelected
                            setTimeout(() => {
                                const selectDiagnostico = document.getElementById('tipoDiagnosticoSelected');
                                if (selectDiagnostico) {
                                    selectDiagnostico.value = '2';
                                    selectDiagnostico.dispatchEvent(new Event('change', { bubbles: true }));
                                    console.log('[AutoFill] Seleccionado "Definitivo" en el selector tipoDiagnosticoSelected.');
                                    // Esperar 1 segundo y rellenar el input de código de diagnóstico
                                    setTimeout(() => {
                                        const inputCodigo = document.getElementById('codigoDiagnostico');
                                        if (inputCodigo) {
                                            inputCodigo.value = data.codigo;
                                            inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));
                                            console.log('[AutoFill] Rellenado Código de Diagnóstico en input codigoDiagnostico:', data.codigo);
                                            // Si el código es 'DEF', seleccionar automáticamente 'Definitivo'
                                            if (data.codigo && data.codigo.toUpperCase() === 'DEF') {
                                                const selectDiagnostico = document.getElementById('tipoDiagnosticoSelected');
                                                if (selectDiagnostico) {
                                                    selectDiagnostico.value = '2';
                                                    selectDiagnostico.dispatchEvent(new Event('change', { bubbles: true }));
                                                    console.log('[AutoFill] Seleccionado "Definitivo" en el selector tipoDiagnosticoSelected por código DEF.');
                                                }
                                            }
                                        } else {
                                            console.log('[AutoFill] No se encontró el input codigoDiagnostico.');
                                        }
                                    }, 1000);
                                } else {
                                    console.log('[AutoFill] No se encontró el selector tipoDiagnosticoSelected.');
                                }
                            }, 2000);
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
        if (window.location.href.includes('identificacion.do')) {
            console.log('[AutoFill] Ejecutando autofill en la página de identificación:', window.location.href);
        }
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