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

		setTimeout(() => {
			console.log('[AutoFill] Paso 3: Buscando y seleccionando "DNI" en el select...');
			const selectIdent = document.getElementById('tipoIdentificacionSelected');
			if (selectIdent) {
				selectIdent.value = '3';
				selectIdent.dispatchEvent(new Event('change', { bubbles: true }));
				console.log('[AutoFill] Paso 3.1: Opción "DNI" seleccionada en el select.');
			} else {
				console.log('[AutoFill] Paso 3.1: No se encontró el select de tipo de identificación.');
			}
			// Esperar 2 segundos más para que el input se habilite si depende del select
			setTimeout(() => {
				console.log('[AutoFill] Paso 4: Buscando input correcto para N° Afiliado...');
				const inputDni = document.getElementById('numeroIdentificacion');
				if (inputDni) {
					inputDni.value = request.afiliado;
					inputDni.dispatchEvent(new Event('input', { bubbles: true }));
					console.log('[AutoFill] Paso 5: N° Afiliado rellenado en input #numeroIdentificacion con valor:', request.afiliado);
					// Esperar 1 segundo antes de hacer clic en el botón 'Continuar'
					setTimeout(() => {
						const btnContinuar = document.querySelector("input[name='Continuar']");
						if (btnContinuar) {
							btnContinuar.click();
							console.log('[AutoFill] Paso 6: Se hizo clic en el botón Continuar.');
						} else {
							console.log('[AutoFill] Paso 6: No se encontró el botón Continuar.');
						}
					}, 1000);
				} else {
					console.log('[AutoFill] Paso 5: No se encontró el input #numeroIdentificacion.');
				}
			}, 2000);
		}, 2000);
	}
});
