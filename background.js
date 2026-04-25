console.log("[AutoFill] Service Worker iniciado");

chrome.runtime.onInstalled.addListener(() => {
    console.log("[AutoFill] Extensión instalada y lista");
    console.log("[AutoFill] Atajos configurados:");
    console.log("  - Ctrl+Shift+I: Mostrar/Ocultar overlay");
    console.log("  - Ctrl+Shift+R: Rellenar formulario");
    console.log("  - Ctrl+Shift+→: Siguiente paciente");
    console.log("  - Ctrl+Shift+←: Paciente anterior");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[AutoFill] Mensaje recibido:", request);
    
    if (request.type === "fillForm" || request.type === "clearForm") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                console.error("[AutoFill] No hay pestañas activas");
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, request)
                .then(response => {
                    console.log("[AutoFill] Respuesta del content script:", response);
                    sendResponse(response);
                })
                .catch(error => {
                    console.error("[AutoFill] Error:", error);
                    sendResponse({ success: false, message: error.message });
                });
        });
    }
    
    return true;
});

// Al hacer clic en el icono, abrir INSSSEP si no está abierta
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.includes('online.insssep.gob.ar')) {
        chrome.tabs.create({
            url: 'https://online.insssep.gob.ar/INSSSEP/init.do'
        });
    }
});

// Comandos de teclado
chrome.commands.onCommand.addListener((command, tab) => {
    console.log(`[AutoFill] Comando recibido: ${command}`);
    
    // Verificar si estamos en INSSSEP
    if (!tab || !tab.url.includes('online.insssep.gob.ar')) {
        // Si no estamos en INSSSEP, abrirlo
        if (command === 'toggle-overlay') {
            chrome.tabs.create({
                url: 'https://online.insssep.gob.ar/INSSSEP/init.do'
            });
        }
        return;
    }
    
    // Enviar comando al content script
    chrome.tabs.sendMessage(tab.id, {
        action: command,
        fromShortcut: true
    }).catch(error => {
        console.error('[AutoFill] Error enviando comando:', error);
    });
});
