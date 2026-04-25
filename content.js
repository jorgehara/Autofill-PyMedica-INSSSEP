console.log('[AutoFill] Content script cargado');

// Variable para controlar si estamos en modo automático
let autoPrintEnabled = true;
let currentAutoPrintSetting = true;
let rellenarIntentos = 0;
const MAX_RELLENAR_INTENTOS = 3;

// Función mejorada para buscar el botón Imprimir
function buscarBotonImprimir() {
    console.log('[AutoFill] Buscando botón Imprimir...');
    
    // Estrategia 1: Selectores exactos
    let btn = document.querySelector("input[type='button'][value='Imprimir']");
    if (btn) {
        console.log('[AutoFill] Encontrado por selector exacto input[type=button][value=Imprimir]');
        return btn;
    }
    
    // Estrategia 2: Atributo name
    btn = document.querySelector("input[name='Imprimir']");
    if (btn) {
        console.log('[AutoFill] Encontrado por name=Imprimir');
        return btn;
    }
    
    // Estrategia 3: Case insensitive en value
    const inputs = document.querySelectorAll('input[type="button"], input[type="submit"]');
    for (const input of inputs) {
        const value = input.value || input.getAttribute('value') || '';
        if (value.toLowerCase() === 'imprimir') {
            console.log('[AutoFill] Encontrado por value case-insensitive:', value);
            return input;
        }
    }
    
    // Estrategia 4: Contiene "imprimir"
    for (const input of inputs) {
        const value = input.value || input.getAttribute('value') || '';
        if (value.toLowerCase().includes('imprimir')) {
            console.log('[AutoFill] Encontrado por contains imprimir:', value);
            return input;
        }
    }
    
    // Estrategia 5: Buscar en botones HTML5
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
        const text = button.textContent || button.innerText || '';
        if (text.toLowerCase().includes('imprimir')) {
            console.log('[AutoFill] Encontrado en button element:', text);
            return button;
        }
    }
    
    // Estrategia 6: Buscar por onclick que contenga print
    for (const input of inputs) {
        const onclick = input.getAttribute('onclick') || '';
        if (onclick.toLowerCase().includes('print') || onclick.toLowerCase().includes('imprimir')) {
            console.log('[AutoFill] Encontrado por onclick:', onclick);
            return input;
        }
    }
    
    console.log('[AutoFill] Botón Imprimir NO encontrado');
    return null;
}

// Función mejorada para detectar e imprimir ticket
function iniciarObservadorTicket() {
    console.log('[AutoFill] Iniciando observador de ticket...');
    
    let intentos = 0;
    const maxIntentos = 60; // 30 segundos máximo
    let observadorActivo = true;
    
    function intentarImprimir() {
        if (!observadorActivo) return;
        
        const btnImprimir = buscarBotonImprimir();
        
        if (btnImprimir) {
            console.log('[AutoFill] Botón Imprimir encontrado:', btnImprimir.outerHTML);
            observadorActivo = false;
            
            // Esperar 1 segundo antes de hacer clic
            setTimeout(() => {
                console.log('[AutoFill] Haciendo clic en Imprimir...');
                btnImprimir.click();
                
                window.postMessage({
                    tipo: 'insssep-autofill-response',
                    success: true,
                    mensaje: 'Imprimiendo ticket...'
                }, '*');
                
                // Escuchar cuando termine la impresión
                window.addEventListener('afterprint', () => {
                    console.log('[AutoFill] Impresión completada');
                    window.postMessage({
                        tipo: 'insssep-autofill-response',
                        success: true,
                        mensaje: 'Ticket impreso - Listo para siguiente paciente'
                    }, '*');
                }, { once: true });
                
            }, 1000);
            
            return;
        }
        
        intentos++;
        console.log(`[AutoFill] Intento ${intentos}/${maxIntentos} - Botón no encontrado aún`);
        
        if (intentos < maxIntentos) {
            setTimeout(intentarImprimir, 500);
        } else {
            console.log('[AutoFill] Timeout: No se encontró botón Imprimir después de 30 segundos');
            window.postMessage({
                tipo: 'insssep-autofill-response',
                success: false,
                mensaje: 'No se encontró botón Imprimir - Intente manualmente'
            }, '*');
        }
    }
    
    // Iniciar búsqueda
    intentarImprimir();
    
    // También usar MutationObserver como respaldo
    const observer = new MutationObserver((mutations) => {
        if (!observadorActivo) {
            observer.disconnect();
            return;
        }
        
        // Verificar si hay cambios relevantes
        const btn = buscarBotonImprimir();
        if (btn) {
            console.log('[AutoFill] Observer detectó botón Imprimir');
            intentarImprimir();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Detener observer después de 35 segundos
    setTimeout(() => {
        observer.disconnect();
        if (observadorActivo) {
            console.log('[AutoFill] Observer detenido por timeout');
        }
    }, 35000);
}

// Función de rellenado con reintentos
function ejecutarRellenado(data, esReintento = false) {
    console.log(`[AutoFill] Ejecutando rellenado (reintento: ${esReintento})`);
    
    // Paso 1: Página de identificación
    const selectIdent = document.getElementById('tipoIdentificacionSelected');
    if (selectIdent) {
        console.log('[AutoFill] Detectada página de identificación');
        selectIdent.value = '3';
        selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
            const inputDni = document.getElementById('numeroIdentificacion');
            if (inputDni) {
                inputDni.value = data.afiliado;
                inputDni.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('[AutoFill] DNI ingresado:', data.afiliado);
                
                setTimeout(() => {
                    const btnContinuar = document.querySelector("input[name='Continuar']");
                    if (btnContinuar) {
                        btnContinuar.click();
                        console.log('[AutoFill] Click en Continuar');
                    }
                }, 1000);
            }
        }, 500);
        return true;
    }

    // Paso 2: Página de diagnóstico
    const selectorTipo = document.getElementById('tipoDiagnosticoSelected');
    const inputCodigo = document.getElementById('codigoDiagnostico');
    
    if (selectorTipo && inputCodigo) {
        console.log('[AutoFill] Detectada página de diagnóstico');
        
        // Verificar si ya está completo
        const yaCompletado = selectorTipo.value === "2" && 
                            inputCodigo.value && 
                            document.getElementById('radioConsultaID_0')?.checked;
        
        if (yaCompletado && esReintento) {
            console.log('[AutoFill] Formulario ya estaba completo, buscando botón Consumir...');
            const btnValidar = document.querySelector("input[name='Consumir']");
            if (btnValidar) {
                btnValidar.click();
                console.log('[AutoFill] Click en Consumir (reintento)');
                
                if (autoPrintEnabled && currentAutoPrintSetting) {
                    iniciarObservadorTicket();
                }
                return true;
            }
        }
        
        selectorTipo.value = "2";
        selectorTipo.dispatchEvent(new Event('change', { bubbles: true }));
        
        inputCodigo.value = data.codigo || "";
        inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[AutoFill] Código ingresado:', data.codigo);
        
        setTimeout(() => {
            const radioConsulta = document.getElementById('radioConsultaID_0');
            if (radioConsulta) {
                radioConsulta.click();
                console.log('[AutoFill] Radio seleccionado');
            }
            
            setTimeout(() => {
                const btnValidar = document.querySelector("input[name='Consumir']");
                if (btnValidar) {
                    btnValidar.click();
                    console.log('[AutoFill] Click en Consumir');
                    
                    if (autoPrintEnabled && currentAutoPrintSetting) {
                        iniciarObservadorTicket();
                    }
                }
            }, 1000);
        }, 500);
        
        return true;
    }
    
    // Si no encontramos la página correcta
    console.log('[AutoFill] No se detectó página de identificación ni diagnóstico');
    return false;
}

// Función principal de autofill con reintentos
function continuarFlujoAutofill(data) {
    if (!data) {
        console.log('[AutoFill] No hay datos para autofill');
        return;
    }

    currentAutoPrintSetting = data.autoPrint !== false;
    console.log('[AutoFill] Iniciando flujo. Auto-print:', currentAutoPrintSetting);
    
    rellenarIntentos = 0;
    
    function intentar() {
        rellenarIntentos++;
        console.log(`[AutoFill] Intento ${rellenarIntentos}/${MAX_RELLENAR_INTENTOS}`);
        
        const exito = ejecutarRellenado(data, rellenarIntentos > 1);
        
        if (!exito && rellenarIntentos < MAX_RELLENAR_INTENTOS) {
            console.log('[AutoFill] Reintentando en 2 segundos...');
            setTimeout(intentar, 2000);
        } else if (!exito) {
            console.log('[AutoFill] Se agotaron los intentos');
            window.postMessage({
                tipo: 'insssep-autofill-response',
                success: false,
                mensaje: 'No se pudo completar el formulario después de 3 intentos'
            }, '*');
        } else {
            window.postMessage({
                tipo: 'insssep-autofill-response',
                success: true,
                mensaje: 'Procesando consulta...'
            }, '*');
        }
    }
    
    intentar();
}

// Escuchar mensajes desde el overlay
window.addEventListener('message', function(event) {
    if (event.data && event.data.tipo === 'insssep-autofill') {
        const data = event.data.datos;
        
        if (event.data.accion === 'rellenar-formulario') {
            console.log('[AutoFill] Comando recibido desde overlay:', data);
            continuarFlujoAutofill(data);
        }
    }
});

// Escuchar mensajes desde la extensión
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.accion === 'rellenar-formulario') {
        console.log('[AutoFill] Comando recibido desde popup:', request);
        continuarFlujoAutofill(request);
        sendResponse({ success: true });
        return true;
    }
    
    if (request.fromShortcut) {
        console.log('[AutoFill] Comando de atajo:', request.action);
        
        switch (request.action) {
            case 'toggle-overlay':
                // Reinyectar el overlay si no existe, o recargar la página
                if (!document.getElementById('insssep-autofill-overlay')) {
                    console.log('[AutoFill] Overlay no encontrado, reinyectando...');
                    const script = document.createElement('script');
                    script.src = chrome.runtime.getURL('overlay.js');
                    script.onload = function() {
                        this.remove();
                        console.log('[AutoFill] Overlay reinyectado');
                        window.postMessage({
                            tipo: 'insssep-autofill-response',
                            success: true,
                            mensaje: 'Overlay recargado'
                        }, '*');
                    };
                    (document.head || document.documentElement).appendChild(script);
                } else {
                    console.log('[AutoFill] Overlay ya existe');
                    window.postMessage({
                        tipo: 'insssep-autofill-response',
                        success: true,
                        mensaje: 'Overlay ya está activo'
                    }, '*');
                }
                sendResponse({ success: true });
                break;
                
            case 'rellenar-formulario':
                window.postMessage({
                    tipo: 'insssep-autofill-action',
                    accion: 'rellenar-atajo'
                }, '*');
                sendResponse({ success: true });
                break;
                
            case 'siguiente-paciente':
                window.postMessage({
                    tipo: 'insssep-autofill-action',
                    accion: 'siguiente-atajo'
                }, '*');
                sendResponse({ success: true });
                break;
                
            case 'anterior-paciente':
                window.postMessage({
                    tipo: 'insssep-autofill-action',
                    accion: 'anterior-atajo'
                }, '*');
                sendResponse({ success: true });
                break;
        }
        return true;
    }
});

// Autoejecutar si hay datos guardados
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        chrome.storage.local.get('autofillData', function(result) {
            if (result.autofillData) {
                console.log('[AutoFill] Auto-ejecutando con datos guardados');
                continuarFlujoAutofill(result.autofillData);
                chrome.storage.local.remove('autofillData');
            }
        });
    }, 1500);
});

// Inyectar el overlay
if (window.location.href.includes('online.insssep.gob.ar/INSSSEP/')) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('overlay.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
    console.log('[AutoFill] Overlay inyectado');
}

// Detectar página de ticket (consultaMedica.do) e imprimir automáticamente
if (window.location.href.includes('consultaMedica.do')) {
    console.log('[AutoFill] Detectada página de ticket - Iniciando impresión automática...');
    
    // Variable de control para evitar múltiples clics
    let impresionEjecutada = false;
    let intervaloBusqueda = null;
    
    function intentarImprimirTicket() {
        // Si ya se ejecutó, no hacer nada
        if (impresionEjecutada) {
            console.log('[AutoFill] Impresión ya ejecutada, deteniendo búsqueda');
            if (intervaloBusqueda) {
                clearInterval(intervaloBusqueda);
                intervaloBusqueda = null;
            }
            return;
        }
        
        console.log('[AutoFill] Buscando botón Imprimir...');
        
        // Estrategia 1: Buscar por ID
        let btn = document.getElementById('impresion');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por ID: #impresion');
            impresionEjecutada = true;
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Finalizando');
            }, 500);
            return;
        }
        
        // Estrategia 2: Buscar por atributo name
        btn = document.querySelector('input[name="toPrint"]');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por name: toPrint');
            impresionEjecutada = true;
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Finalizando');
            }, 500);
            return;
        }
        
        // Estrategia 3: Buscar por value
        btn = document.querySelector('input[value="Imprimir"]');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por value: Imprimir');
            impresionEjecutada = true;
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Finalizando');
            }, 500);
            return;
        }
        
        // Estrategia 4: Buscar por clase y tipo
        const botones = document.querySelectorAll('input[type="button"].buttonStyle');
        for (const b of botones) {
            if (b.value === 'Imprimir' || b.name === 'toPrint') {
                console.log('[AutoFill] Botón encontrado por clase buttonStyle');
                impresionEjecutada = true;
                setTimeout(() => {
                    b.click();
                    console.log('[AutoFill] Click en botón Imprimir ejecutado - Finalizando');
                }, 500);
                return;
            }
        }
        
        // Estrategia 5: Llamar directamente a la función imprimir() si existe
        if (typeof window.imprimir === 'function') {
            console.log('[AutoFill] Llamando función imprimir() directamente');
            impresionEjecutada = true;
            setTimeout(() => {
                window.imprimir();
                console.log('[AutoFill] Función imprimir() ejecutada - Finalizando');
            }, 500);
            return;
        }
        
        console.log('[AutoFill] Botón Imprimir no encontrado en este intento');
    }
    
    // Intentar múltiples veces con intervalos, pero detenerse al encontrar
    setTimeout(intentarImprimirTicket, 1000);
    setTimeout(intentarImprimirTicket, 2000);
    setTimeout(intentarImprimirTicket, 3000);
    
    // Detener completamente después de 5 segundos por seguridad
    setTimeout(() => {
        if (!impresionEjecutada) {
            console.log('[AutoFill] Tiempo máximo alcanzado, deteniendo búsqueda');
        }
    }, 5000);
}
