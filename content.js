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

// Detectar si estamos en la página ticket.do (después de Aceptar) y necesitamos volver a Consulta Médica
if (window.location.href.includes('ticket.do')) {
    console.log('[AutoFill] Detectada página ticket.do - verificando si necesitamos ir a Consulta Médica...');
    
    // Verificar si venimos de completar un ticket (después de Aceptar)
    const vieneDeTicket = localStorage.getItem('insssep_viene_de_ticket');
    if (vieneDeTicket === 'true') {
        console.log('[AutoFill] Venimos de completar un ticket, buscando enlace Consulta Médica...');
        
        function buscarYClickConsultaMedica() {
            let enlace = null;
            
            // Estrategia 1: Buscar por href exacto
            enlace = document.querySelector('a[href="./menuConsultaMedica.do"]');
            if (enlace) {
                console.log('[AutoFill] Enlace Consulta Médica encontrado por href exacto');
            }
            
            // Estrategia 2: Buscar por href que contenga menuConsultaMedica
            if (!enlace) {
                enlace = document.querySelector('a[href*="menuConsultaMedica.do"]');
                if (enlace) console.log('[AutoFill] Enlace Consulta Médica encontrado por href parcial');
            }
            
            // Estrategia 3: Selector específico del usuario
            if (!enlace) {
                try {
                    enlace = document.querySelector("body > table > tbody > tr:nth-child(2) > td.backMenu > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td.linkMenu > table > tbody > tr:nth-child(2) > td:nth-child(2) > a");
                    if (enlace && (enlace.textContent.includes('Consulta Médica') || enlace.href.includes('menuConsultaMedica'))) {
                        console.log('[AutoFill] Enlace Consulta Médica encontrado por selector específico');
                    } else {
                        enlace = null;
                    }
                } catch (e) {
                    console.log('[AutoFill] Selector específico no funcionó');
                }
            }
            
            // Estrategia 4: Buscar por texto exacto
            if (!enlace) {
                const links = document.querySelectorAll('a');
                for (const link of links) {
                    const texto = link.textContent.trim();
                    if (texto === 'Consulta Médica' || texto === 'Consulta Medica') {
                        enlace = link;
                        console.log('[AutoFill] Enlace Consulta Médica encontrado por texto exacto');
                        break;
                    }
                }
            }
            
            // Estrategia 5: Buscar por clase linkMenu y texto
            if (!enlace) {
                const links = document.querySelectorAll('a.linkMenu');
                for (const link of links) {
                    if (link.textContent.includes('Consulta Médica') || 
                        link.textContent.includes('Consulta Medica')) {
                        enlace = link;
                        console.log('[AutoFill] Enlace Consulta Médica encontrado por clase linkMenu');
                        break;
                    }
                }
            }
            
            if (enlace) {
                console.log('[AutoFill] Haciendo clic en Consulta Médica:', enlace);
                
                // Guardar flag para saber que vamos al formulario y debemos avanzar al siguiente
                localStorage.setItem('insssep_viene_de_consulta_medica', 'true');
                
                setTimeout(() => {
                    enlace.click();
                    console.log('[AutoFill] Click en Consulta Médica ejecutado');
                }, 500);
                
                // Limpiar el flag anterior
                localStorage.removeItem('insssep_viene_de_ticket');
            } else {
                console.log('[AutoFill] Enlace Consulta Médica no encontrado');
                // Debug: listar todos los enlaces encontrados
                const allLinks = document.querySelectorAll('a');
                console.log('[AutoFill] Total de enlaces en página:', allLinks.length);
                allLinks.forEach((link, i) => {
                    if (i < 10) console.log(`  - Link ${i}: "${link.textContent.trim()}" href="${link.href}"`);
                });
            }
        }
        
        // Intentar rápidamente - último delay de 0.5 segundos
        setTimeout(buscarYClickConsultaMedica, 300);
        setTimeout(buscarYClickConsultaMedica, 500);
        setTimeout(buscarYClickConsultaMedica, 500);
    }
}

// Detectar página de ticket (consultaMedica.do) e imprimir automáticamente
if (window.location.href.includes('consultaMedica.do')) {
    console.log('[AutoFill] Detectada página de ticket - Iniciando impresión automática...');
    
    // Variable de control para evitar múltiples clics
    let impresionEjecutada = false;
    let aceptarEjecutado = false;
    
    function intentarClickAceptar() {
        // Si ya se ejecutó Aceptar, no hacer nada
        if (aceptarEjecutado) {
            console.log('[AutoFill] Aceptar ya ejecutado');
            return;
        }
        
        console.log('[AutoFill] Buscando botón Aceptar...');
        
        let btnAceptar = null;
        
        // Estrategia 1: Selector específico del usuario
        try {
            btnAceptar = document.querySelector("body > form > table:nth-child(6) > tbody > tr > td > input:nth-child(1)");
            if (btnAceptar && btnAceptar.value === 'Aceptar') {
                console.log('[AutoFill] Botón Aceptar encontrado por selector específico');
            } else {
                btnAceptar = null;
            }
        } catch (e) {
            console.log('[AutoFill] Selector específico no funcionó');
        }
        
        // Estrategia 2: Buscar por name
        if (!btnAceptar) {
            btnAceptar = document.querySelector('input[name="Aceptar"]');
            if (btnAceptar) console.log('[AutoFill] Botón Aceptar encontrado por name');
        }
        
        // Estrategia 3: Buscar por value
        if (!btnAceptar) {
            btnAceptar = document.querySelector('input[value="Aceptar"]');
            if (btnAceptar) console.log('[AutoFill] Botón Aceptar encontrado por value');
        }
        
        // Estrategia 4: Buscar por type submit
        if (!btnAceptar) {
            const botones = document.querySelectorAll('input[type="submit"]');
            for (const btn of botones) {
                if (btn.value === 'Aceptar' || btn.name === 'Aceptar') {
                    btnAceptar = btn;
                    console.log('[AutoFill] Botón Aceptar encontrado por type submit');
                    break;
                }
            }
        }
        
        // Estrategia 5: Buscar en tabla específica
        if (!btnAceptar) {
            const tablas = document.querySelectorAll('table');
            for (const tabla of tablas) {
                const inputs = tabla.querySelectorAll('input[type="submit"], input[type="button"]');
                for (const input of inputs) {
                    if (input.value === 'Aceptar') {
                        btnAceptar = input;
                        console.log('[AutoFill] Botón Aceptar encontrado en tabla');
                        break;
                    }
                }
                if (btnAceptar) break;
            }
        }
        
        if (btnAceptar) {
            console.log('[AutoFill] Botón Aceptar encontrado, haciendo clic...');
            aceptarEjecutado = true;
            
            // Guardar flag para volver a Consulta Médica después
            localStorage.setItem('insssep_viene_de_ticket', 'true');
            
            setTimeout(() => {
                btnAceptar.click();
                console.log('[AutoFill] Click en botón Aceptar ejecutado - Redirigiendo a menú...');
            }, 500);
        } else {
            console.log('[AutoFill] Botón Aceptar no encontrado');
        }
    }
    
    // Guardar en localStorage que necesitamos clickear Aceptar después
    function guardarNecesidadAceptar() {
        localStorage.setItem('insssep_needs_accept', 'true');
        localStorage.setItem('insssep_accept_timestamp', Date.now().toString());
    }
    
    function intentarImprimirTicket() {
        // Si ya se ejecutó, no hacer nada
        if (impresionEjecutada) {
            console.log('[AutoFill] Impresión ya ejecutada');
            return;
        }
        
        console.log('[AutoFill] Buscando botón Imprimir...');
        
        // Estrategia 1: Buscar por ID
        let btn = document.getElementById('impresion');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por ID: #impresion');
            impresionEjecutada = true;
            guardarNecesidadAceptar();
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Esperando cierre de diálogo...');
            }, 500);
            return;
        }
        
        // Estrategia 2: Buscar por atributo name
        btn = document.querySelector('input[name="toPrint"]');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por name: toPrint');
            impresionEjecutada = true;
            guardarNecesidadAceptar();
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Esperando cierre de diálogo...');
            }, 500);
            return;
        }
        
        // Estrategia 3: Buscar por value
        btn = document.querySelector('input[value="Imprimir"]');
        if (btn) {
            console.log('[AutoFill] Botón encontrado por value: Imprimir');
            impresionEjecutada = true;
            guardarNecesidadAceptar();
            setTimeout(() => {
                btn.click();
                console.log('[AutoFill] Click en botón Imprimir ejecutado - Esperando cierre de diálogo...');
            }, 500);
            return;
        }
        
        // Estrategia 4: Buscar por clase y tipo
        const botones = document.querySelectorAll('input[type="button"].buttonStyle');
        for (const b of botones) {
            if (b.value === 'Imprimir' || b.name === 'toPrint') {
                console.log('[AutoFill] Botón encontrado por clase buttonStyle');
                impresionEjecutada = true;
                guardarNecesidadAceptar();
                setTimeout(() => {
                    b.click();
                    console.log('[AutoFill] Click en botón Imprimir ejecutado - Esperando cierre de diálogo...');
                }, 500);
                return;
            }
        }
        
        // Estrategia 5: Llamar directamente a la función imprimir() si existe
        if (typeof window.imprimir === 'function') {
            console.log('[AutoFill] Llamando función imprimir() directamente');
            impresionEjecutada = true;
            guardarNecesidadAceptar();
            setTimeout(() => {
                window.imprimir();
                console.log('[AutoFill] Función imprimir() ejecutada - Esperando cierre de diálogo...');
            }, 500);
            return;
        }
        
        console.log('[AutoFill] Botón Imprimir no encontrado en este intento');
    }
    
    // Verificar si venimos de una impresión (al cargar la página)
    const necesitaAceptar = localStorage.getItem('insssep_needs_accept');
    const timestamp = localStorage.getItem('insssep_accept_timestamp');
    if (necesitaAceptar === 'true' && timestamp) {
        const tiempoTranscurrido = Date.now() - parseInt(timestamp);
        // Si pasaron menos de 30 segundos desde la impresión
        if (tiempoTranscurrido < 30000) {
            console.log('[AutoFill] Detectado que necesitamos clickear Aceptar');
            // Esperar a que la página esté lista
            setTimeout(() => {
                intentarClickAceptar();
                // Limpiar el flag
                localStorage.removeItem('insssep_needs_accept');
                localStorage.removeItem('insssep_accept_timestamp');
            }, 1000);
        } else {
            // Limpiar si pasó mucho tiempo
            localStorage.removeItem('insssep_needs_accept');
            localStorage.removeItem('insssep_accept_timestamp');
        }
    }
    
    // Intentar múltiples veces con intervalos cortos, pero detenerse al encontrar
    setTimeout(intentarImprimirTicket, 500);
    setTimeout(intentarImprimirTicket, 1000);
    setTimeout(intentarImprimirTicket, 1500);
    
    // Detener completamente después de 5 segundos por seguridad
    setTimeout(() => {
        if (!impresionEjecutada) {
            console.log('[AutoFill] Tiempo máximo alcanzado, deteniendo búsqueda');
        }
    }, 5000);
    
    // Evento afterprint - se dispara inmediatamente después de cerrar el diálogo de impresión
    window.addEventListener('afterprint', () => {
        console.log('[AutoFill] afterprint detectado - Impresión completada');
        const needsAccept = localStorage.getItem('insssep_needs_accept');
        if (needsAccept === 'true' && !aceptarEjecutado) {
            console.log('[AutoFill] Buscando Aceptar después de impresión...');
            // Intentar inmediatamente y varias veces rápido
            intentarClickAceptar();
            setTimeout(intentarClickAceptar, 300);
            setTimeout(intentarClickAceptar, 600);
            setTimeout(() => {
                localStorage.removeItem('insssep_needs_accept');
                localStorage.removeItem('insssep_accept_timestamp');
            }, 1000);
        }
    });
    
    // Backup: por si el evento afterprint no funciona en algunos navegadores
    let checkInterval = setInterval(() => {
        const needsAccept = localStorage.getItem('insssep_needs_accept');
        if (needsAccept === 'true' && impresionEjecutada && !aceptarEjecutado) {
            // Verificar si el documento está visible (no hay diálogo de impresión)
            if (document.visibilityState === 'visible') {
                console.log('[AutoFill] Documento visible, intentando Aceptar...');
                intentarClickAceptar();
                if (aceptarEjecutado) {
                    clearInterval(checkInterval);
                    localStorage.removeItem('insssep_needs_accept');
                    localStorage.removeItem('insssep_accept_timestamp');
                }
            }
        }
    }, 500);
    
    // Limpiar intervalo después de 15 segundos
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 15000);
}

// El overlay maneja automáticamente el avance al siguiente paciente cuando vuelve a init.do
