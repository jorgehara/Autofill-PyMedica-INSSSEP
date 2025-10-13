document.addEventListener('DOMContentLoaded', function() {
    // Restaurar el contenido del textarea al cargar el popup
    const textarea = document.getElementById('datos');
    if (textarea) {
        chrome.storage.local.get('autofillTextarea', function(result) {
            if (result.autofillTextarea) {
                textarea.value = result.autofillTextarea;
            }
        });
        // Guardar el contenido cada vez que se modifica
        textarea.addEventListener('input', function() {
            chrome.storage.local.set({ autofillTextarea: textarea.value });
        });
    }
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

    // Botón para formatear la lista en formato CSV simple
    const formatearBtn = document.getElementById('formatearLista');
    if (formatearBtn) {
        formatearBtn.addEventListener('click', function() {
            const textarea = document.getElementById('datos');
            const raw = textarea.value.trim();
            if (!raw) return;
            // Procesar cada línea y unir por coma
            const lineas = raw.split('\n').map(linea => linea.split(/\s+/).join(',')).join(',');
            textarea.value = lineas;
        });
    }

    let pacientes = [];
    let pacienteIndex = 0;

    // Cargar listado desde memoria al abrir el popup
    chrome.storage.local.get(['autofillListadoPacientes', 'autofillPacienteIndex'], function(result) {
        if (result.autofillListadoPacientes && result.autofillListadoPacientes.length > 0) {
            pacientes = result.autofillListadoPacientes;
            pacienteIndex = result.autofillPacienteIndex || 0;
            document.getElementById('datos').value = pacientes.map(p => `${p.codigo},${p.dni},${p.nombre},${p.afiliado}`).join('\n');
            mostrarPacienteActual();
        }
    });

    // Botón para guardar el listado en memoria como array de pacientes
    const guardarBtn = document.getElementById('guardarListado');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', function() {
            const datosRaw = document.getElementById('datos').value.trim();
            if (!datosRaw) return;
            pacientes = datosRaw.split('\n').map(linea => {
                const partes = linea.split(',');
                return {
                    codigo: partes[0] || '',
                    dni: partes[1] || '',
                    nombre: partes[2] || '',
                    afiliado: partes[3] || ''
                };
            }).filter(p => p.codigo && p.dni);
            pacienteIndex = 0;
            chrome.storage.local.set({
                autofillListadoPacientes: pacientes,
                autofillPacienteIndex: pacienteIndex
            }, function() {
                mostrarMensajeEstado('Listado guardado en memoria.', 'success');
                mostrarPacienteActual();
            });
        });
    }

    // Botón siguiente paciente
    const siguienteBtn = document.getElementById('siguientePaciente');
    if (siguienteBtn) {
        siguienteBtn.addEventListener('click', function() {
            if (pacienteIndex < pacientes.length - 1) {
                pacienteIndex++;
                chrome.storage.local.set({ autofillPacienteIndex: pacienteIndex });
                mostrarPacienteActual();
            }
        });
    }

    // Botón anterior paciente
    const anteriorBtn = document.getElementById('anteriorPaciente');
    if (anteriorBtn) {
        anteriorBtn.addEventListener('click', function() {
            if (pacienteIndex > 0) {
                pacienteIndex--;
                chrome.storage.local.set({ autofillPacienteIndex: pacienteIndex });
                mostrarPacienteActual();
            }
        });
    }

    // Ir a paciente específico
    const btnIrPaciente = document.getElementById('btnIrPaciente');
    const inputIrPaciente = document.getElementById('irPaciente');
    if (btnIrPaciente && inputIrPaciente) {
        btnIrPaciente.addEventListener('click', function() {
            let idx = parseInt(inputIrPaciente.value, 10) - 1;
            if (!isNaN(idx) && idx >= 0 && idx < pacientes.length) {
                pacienteIndex = idx;
                chrome.storage.local.set({ autofillPacienteIndex: pacienteIndex });
                mostrarPacienteActual();
            }
        });
        inputIrPaciente.addEventListener('change', function() {
            let idx = parseInt(inputIrPaciente.value, 10) - 1;
            if (!isNaN(idx) && idx >= 0 && idx < pacientes.length) {
                pacienteIndex = idx;
                chrome.storage.local.set({ autofillPacienteIndex: pacienteIndex });
                mostrarPacienteActual();
            }
        });
    }

    // Mensaje de estado visual
    function mostrarMensajeEstado(mensaje, tipo = 'info') {
        let statusDiv = document.getElementById('statusMessage');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'statusMessage';
            statusDiv.style.margin = '10px 0';
            statusDiv.style.padding = '10px';
            statusDiv.style.borderRadius = '4px';
            statusDiv.style.textAlign = 'center';
            statusDiv.style.fontWeight = 'bold';
            document.body.insertBefore(statusDiv, document.getElementById('datosForm'));
        }
        statusDiv.textContent = mensaje;
        statusDiv.style.display = 'block';
        if (tipo === 'success') {
            statusDiv.style.background = '#0f401b';
            statusDiv.style.color = '#4ec9b0';
            statusDiv.style.border = '1px solid #1e4e2e';
        } else if (tipo === 'error') {
            statusDiv.style.background = '#4e1c24';
            statusDiv.style.color = '#f14c4c';
            statusDiv.style.border = '1px solid #6e2936';
        } else {
            statusDiv.style.background = '#1976d2';
            statusDiv.style.color = '#fff';
            statusDiv.style.border = '1px solid #1976d2';
        }
        setTimeout(() => { statusDiv.style.display = 'none'; }, 2500);
    }

    // Mostrar nombre del paciente actual en grande
    function mostrarPacienteActual() {
        const anteriorBtn = document.getElementById('anteriorPaciente');
        const siguienteBtn = document.getElementById('siguientePaciente');
        const irPaciente = document.getElementById('irPaciente');
        const totalPacientes = document.getElementById('totalPacientes');
        const pacienteActual = document.getElementById('pacienteActual');
        const nombreGrande = document.getElementById('nombreGrande');
        if (pacientes.length === 0) {
            pacienteActual.textContent = 'Sin pacientes';
            totalPacientes.textContent = 'Total: 0';
            anteriorBtn.disabled = true;
            siguienteBtn.disabled = true;
            irPaciente.value = 1;
            irPaciente.disabled = true;
            if (nombreGrande) {
                nombreGrande.textContent = '';
            }
            return;
        }
        const p = pacientes[pacienteIndex];
        document.getElementById('codigo').value = p.codigo;
        document.getElementById('dni').value = p.dni;
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('afiliado').value = p.afiliado;
        pacienteActual.textContent = `Paciente ${pacienteIndex + 1} de ${pacientes.length}`;
        irPaciente.max = pacientes.length;
        irPaciente.value = pacienteIndex + 1;
        irPaciente.disabled = false;
        totalPacientes.textContent = `Total: ${pacientes.length}`;
        anteriorBtn.disabled = pacienteIndex === 0;
        siguienteBtn.disabled = pacienteIndex === pacientes.length - 1;
        if (!nombreGrande) {
            const div = document.createElement('div');
            div.id = 'nombreGrande';
            div.style.fontSize = '1.3em';
            div.style.fontWeight = 'bold';
            div.style.color = '#1976d2';
            div.style.textAlign = 'center';
            div.style.margin = '10px 0 5px 0';
            document.body.insertBefore(div, document.getElementById('datosForm'));
        }
        document.getElementById('nombreGrande').textContent = p.nombre;
    }
});