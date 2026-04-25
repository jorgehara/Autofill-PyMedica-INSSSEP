console.log("Service Worker iniciado")

chrome.runtime.onInstalled.addListener(() => {
    console.log("AutoFill Médica instalada y lista para usar.");
});

// Permitir que el side panel se abra en cualquier página
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Mensaje recibido en background:", request);
    
    if (request.type === "fillForm" || request.type === "clearForm") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                console.error("No hay pestañas activas");
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, request)
                .then(response => {
                    console.log("Respuesta de content script:", response);
                    sendResponse(response);
                })
                .catch(error => {
                    console.error("Error al enviar mensaje al content script:", error);
                    sendResponse({ success: false, message: error.message });
                });
        });
    }
    
    return true; // Mantiene la conexión abierta para la respuesta asíncrona
});

// Habilitar side panel solo en el dominio de INSSSEP
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('online.insssep.gob.ar')) {
            chrome.sidePanel.setOptions({
                tabId: tabId,
                path: 'sidepanel.html',
                enabled: true
            });
        } else {
            chrome.sidePanel.setOptions({
                tabId: tabId,
                enabled: false
            });
        }
    }
});