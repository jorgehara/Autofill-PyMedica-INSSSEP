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
				// Depuración: mostrar todos los selects presentes
				const allSelects = Array.from(document.querySelectorAll('select'));
				console.log('[AutoFill][Depuración] Selects encontrados:', allSelects.map(s => s.id || s.name || s.className));
				const selectIdent = document.getElementById('tipoIdentificacionSelected') || document.querySelector('select[name="tipoIdentificacionSelected"]') || document.querySelector('select.comboStyle2');
				if (selectIdent) {
					selectIdent.value = '3';
					selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
					console.log('[AutoFill] Paso post-recarga: Opción "DNI" seleccionada en el select.', selectIdent);
					obs.disconnect();
					// Usar otro observer para el input
					const observerInput = new MutationObserver((mutations, obs2) => {
						// Depuración: mostrar todos los inputs presentes
						const allInputs = Array.from(document.querySelectorAll('input'));
						console.log('[AutoFill][Depuración] Inputs encontrados:', allInputs.map(i => i.id || i.name || i.className));
						const inputDni = document.getElementById('numeroIdentificacion') || document.querySelector('input[name="numeroIdentificacion"]') || document.querySelector('input.inputEditStyle');
						if (inputDni) {
							inputDni.value = data.afiliado;
							inputDni.dispatchEvent(new Event('input', { bubbles: true }));
							console.log('[AutoFill] Paso post-recarga: N° Afiliado rellenado en input #numeroIdentificacion con valor:', data.afiliado, inputDni);
							obs2.disconnect();
							// Observer para el botón
							const observerBtn = new MutationObserver((mutations, obs3) => {
								// Depuración: mostrar todos los botones presentes
								const allBtns = Array.from(document.querySelectorAll('input[type="submit"], input[type="button"], input'));
								console.log('[AutoFill][Depuración] Botones encontrados:', allBtns.map(b => b.id || b.name || b.className));
								const btnContinuar = document.querySelector("input[name='Continuar']") || document.querySelector('input[type="submit"]');
								if (btnContinuar) {
									btnContinuar.click();
									console.log('[AutoFill] Paso post-recarga: Se hizo clic en el botón Continuar.', btnContinuar);
									obs3.disconnect();
								}
							});
							observerBtn.observe(document.body, { childList: true, subtree: true });
						}
					});
					observerInput.observe(document.body, { childList: true, subtree: true });
				}
			});
			// Aumentar el tiempo de espera del observer a 60 segundos
			setTimeout(() => {
				observerSelect.disconnect();
				console.log('[AutoFill][Depuración] Timeout: No se encontró el select de tipo de identificación tras 60 segundos.');
			}, 60000);
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
