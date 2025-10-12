console.log("Content script cargado")
// ...existing code...

// Escuchar mensajes desde popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.accion === 'rellenar-formulario') {
		console.log('[AutoFill] Paso 1: Buscando enlace "Consulta Médica"...');
		const enlaceConsulta = document.querySelector('a.linkMenu[href*="menuConsultaMedica.do"]');
		if (enlaceConsulta) {
			console.log('[AutoFill] Paso 2: Enlace "Consulta Médica" encontrado, haciendo clic...');
			enlaceConsulta.click();
		} else {
			console.log('[AutoFill] Paso 2: No se encontró el enlace "Consulta Médica".');
		}
		// Guardar los datos recibidos en chrome.storage.local para usarlos tras la recarga
		chrome.storage.local.set({ autofillData: request }, function() {
			console.log('[AutoFill] Datos guardados en memoria desde content script:', request);
		});
		// Esperar 2 segundos antes de continuar con el select
		setTimeout(() => {
			continuarFlujoAutofill();
		}, 2000);
	}
});

// Función para continuar el flujo después de la recarga si hay datos guardados
function continuarFlujoAutofill() {
	chrome.storage.local.get('autofillData', function(result) {
		const data = result.autofillData;
		if (data && data.afiliado) {
			console.log('[AutoFill] Flujo post-recarga: usando datos guardados:', data);
			// Usar MutationObserver para detectar el select
			const observerSelect = new MutationObserver((mutations, obs) => {
				const selectIdent = document.getElementById('tipoIdentificacionSelected');
				if (selectIdent) {
					selectIdent.value = '3';
					selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
					console.log('[AutoFill] Paso post-recarga: Opción "DNI" seleccionada en el select.');
					obs.disconnect();
					// Usar otro observer para el input
					const observerInput = new MutationObserver((mutations, obs2) => {
						const inputDni = document.getElementById('numeroIdentificacion');
						if (inputDni) {
							inputDni.value = data.afiliado;
							inputDni.dispatchEvent(new Event('input', { bubbles: true }));
							console.log('[AutoFill] Paso post-recarga: N° Afiliado rellenado en input #numeroIdentificacion con valor:', data.afiliado);
							obs2.disconnect();
							// Observer para el botón
							const observerBtn = new MutationObserver((mutations, obs3) => {
								const btnContinuar = document.querySelector("input[name='Continuar']");
								if (btnContinuar) {
									btnContinuar.click();
									console.log('[AutoFill] Paso post-recarga: Se hizo clic en el botón Continuar.');
									obs3.disconnect();
								}
							});
							observerBtn.observe(document.body, { childList: true, subtree: true });
						}
					});
					observerInput.observe(document.body, { childList: true, subtree: true });
				}
			});
			observerSelect.observe(document.body, { childList: true, subtree: true });
		}
	});
}

// Ejecutar el flujo automáticamente si hay datos guardados al cargar la página
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(() => {
		chrome.storage.local.get('autofillData', function(result) {
			const data = result.autofillData;
			if (data && data.afiliado) {
				console.log('[AutoFill] Iniciando autofill directamente desde el selector...');
				continuarFlujoAutofill();
			} else {
				console.log('[AutoFill] No hay datos guardados para autofill.');
			}
		});
	}, 1500);
});
