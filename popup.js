document.addEventListener('DOMContentLoaded', function() {
    // Responder al content script con el DNI
    window.addEventListener('message', function(event) {
        if (event.data && event.data.tipo === 'solicitar-dni') {
            const dni = document.getElementById('dni').value;
            window.postMessage({ tipo: 'rellenar-dni', dni }, '*');
        }
    });
    console.log('Popup DOM cargado INSSSEP');
    // Lógica para el botón 'Cargar campos'
    const cargarBtn = document.getElementById('cargarCampos');
    if (cargarBtn) {
        cargarBtn.addEventListener('click', function() {
            const datosRaw = document.getElementById('datos').value.trim();
            const partes = datosRaw.split(/\s+/);
            if (partes.length >= 4) {
                document.getElementById('codigo').value = partes[0] || '';
                document.getElementById('dni').value = partes[1] || '';
                let nombre = '';
                let i = 2;
                while (i < partes.length && partes[i] !== 'Titular' && isNaN(Number(partes[i]))) {
                    nombre += partes[i] + ' ';
                    i++;
                }
                document.getElementById('nombre').value = nombre.trim();
                let afiliado = '';
                while (i < partes.length) {
                    if (/^\d+$/.test(partes[i])) {
                        afiliado = partes[i];
                        break;
                    }
                    i++;
                }
                document.getElementById('afiliado').value = afiliado;
            }
        });
    }

    // Lógica para el botón 'Rellenar' (enviar datos al content script)
    const rellenarBtn = document.querySelector('button[type="submit"]');
    if (rellenarBtn) {
        rellenarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Obtener los datos del formulario
            const codigo = document.getElementById('codigo').value;
            const dni = document.getElementById('dni').value;
            const nombre = document.getElementById('nombre').value;
            const afiliado = document.getElementById('afiliado').value;
            // Enviar mensaje al content script con los datos
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    accion: 'rellenar-formulario',
                    codigo,
                    dni,
                    nombre,
                    afiliado
                });
            });
        });
    }
});