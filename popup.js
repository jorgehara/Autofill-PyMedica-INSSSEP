document.addEventListener('DOMContentLoaded', function() {
    // ── Toggle listado ──
    const toggleListadoBtn = document.getElementById('toggleListado');
    const datosTextarea = document.getElementById('datos');
    let listadoExpandido = true;
    chrome.storage.local.get('listadoExpandido', function(r) {
        if (r.listadoExpandido === false) colapsar();
    });
    function colapsar() {
        datosTextarea.style.display = 'none';
        toggleListadoBtn.textContent = '▼';
        toggleListadoBtn.title = 'Expandir';
        listadoExpandido = false;
    }
    function expandir() {
        datosTextarea.style.display = '';
        toggleListadoBtn.textContent = '▲';
        toggleListadoBtn.title = 'Minimizar';
        listadoExpandido = true;
    }
    toggleListadoBtn.addEventListener('click', function() {
        listadoExpandido ? colapsar() : expandir();
        chrome.storage.local.set({ listadoExpandido });
    });

    // ── Abrir Side Panel ──
    const abrirPanelBtn = document.getElementById('abrirSidePanel');
    if (abrirPanelBtn) {
        abrirPanelBtn.addEventListener('click', async function() {
            try {
                await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
                window.close(); // Cerrar el popup después de abrir el panel
            } catch (err) {
                console.error('Error al abrir side panel:', err);
                mostrarMensajeEstado('Error al abrir panel lateral', 'error');
            }
        });
    }

    // ── Tema dark/light ──
    const themeBtn = document.getElementById('themeToggle');
    chrome.storage.local.get('theme', function(r) {
        if (r.theme === 'dark') applyTheme('dark');
    });
    function applyTheme(t) {
        document.body.classList.toggle('dark', t === 'dark');
        themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    }
    themeBtn.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark');
        const t = isDark ? 'dark' : 'light';
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        chrome.storage.local.set({ theme: t });
    });

    // Escuchar mensaje para cerrar el popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.accion === 'cerrar-popup') {
            window.close();
        }
    });
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
            
            // Procesar cada línea: CODIGO DNI NOMBRE... Titular CREDENCIAL
            // Convertir a: CODIGO,DNI,NOMBRE_SIN_ESPACIOS,DNI
            const lineas = raw.split('\n').map(linea => {
                const partes = linea.trim().split(/\s+/);
                if (partes.length < 4) return linea; // Si no tiene el formato esperado, dejar como está
                
                const codigo = partes[0];
                const dni = partes[1];
                
                // Encontrar dónde está "Titular" o "Beneficiario"
                let indiceTipo = partes.findIndex(p => p === 'Titular' || p === 'Beneficiario' || p === 'Familiar');
                
                if (indiceTipo === -1) {
                    // Si no encuentra el tipo, asumir que todo entre DNI y último número es el nombre
                    indiceTipo = partes.length - 1;
                }
                
                // El nombre son todas las palabras entre DNI y el tipo
                const nombrePartes = partes.slice(2, indiceTipo);
                const nombreCompleto = nombrePartes.join(''); // Unir sin espacios
                
                // Formato final: CODIGO,DNI,NOMBRE_COMPLETO,DNI
                return `${codigo},${dni},${nombreCompleto},${dni}`;
            }).join('\n');
            
            textarea.value = lineas;
        });
    }

    let pacientes = [];
    let pacienteIndex = 0;

    // Función para actualizar el array de pacientes desde el textarea
    function actualizarPacientesDesdeTextarea() {
        const datosRaw = document.getElementById('datos').value.trim();
        if (!datosRaw) {
            pacientes = [];
            pacienteIndex = 0;
            chrome.storage.local.set({
                autofillListadoPacientes: pacientes,
                autofillPacienteIndex: pacienteIndex
            });
            return;
        }

        pacientes = datosRaw.split('\n').map(linea => {
            const partes = linea.split(',');
            return {
                codigo: partes[0] ? partes[0].trim() : '',
                dni: partes[1] ? partes[1].trim() : '',
                nombre: partes[2] ? partes[2].trim() : '',
                afiliado: partes[3] ? partes[3].trim() : ''
            };
        }).filter(p => p.codigo && p.dni && p.nombre && p.afiliado);

        // Ajustar índice si se salió del rango
        if (pacienteIndex >= pacientes.length) {
            pacienteIndex = Math.max(0, pacientes.length - 1);
        }

        chrome.storage.local.set({
            autofillListadoPacientes: pacientes,
            autofillPacienteIndex: pacienteIndex
        });
    }

    // Cargar listado desde memoria al abrir el popup
    chrome.storage.local.get(['autofillListadoPacientes', 'autofillPacienteIndex'], function(result) {
        if (result.autofillListadoPacientes && result.autofillListadoPacientes.length > 0) {
            pacientes = result.autofillListadoPacientes;
            pacienteIndex = result.autofillPacienteIndex || 0;
            document.getElementById('datos').value = pacientes.map(p => `${p.codigo},${p.dni},${p.nombre},${p.afiliado}`).join('\n');
            mostrarPacienteActual();
        }
    });

    // Botón para guardar el listado en memoria como array de pacientes (formato CSV)
    const guardarBtn = document.getElementById('guardarListado');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', function() {
            const datosRaw = document.getElementById('datos').value.trim();
            if (!datosRaw) return;

            pacienteIndex = 0;
            actualizarPacientesDesdeTextarea();
            mostrarMensajeEstado('Listado guardado en memoria.', 'success');
            mostrarPacienteActual();
        });
    }

    // Botón para limpiar caché y memoria
    const limpiarCacheBtn = document.getElementById('limpiarCache');
    if (limpiarCacheBtn) {
        limpiarCacheBtn.addEventListener('click', function() {
            chrome.storage.local.clear(function() {
                pacientes = [];
                pacienteIndex = 0;
                document.getElementById('datos').value = '';
                document.getElementById('codigo').value = '';
                document.getElementById('dni').value = '';
                document.getElementById('nombre').value = '';
                document.getElementById('afiliado').value = '';
                mostrarMensajeEstado('Caché limpiado correctamente.', 'success');
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

    // Botón para editar el paciente actual
    const editarPacienteBtn = document.getElementById('editarPaciente');
    if (editarPacienteBtn) {
        editarPacienteBtn.addEventListener('click', function() {
            // Verificar que hay pacientes y un índice válido
            if (pacientes.length === 0 || pacienteIndex < 0 || pacienteIndex >= pacientes.length) {
                mostrarMensajeEstado('No hay paciente para editar', 'error');
                return;
            }

            // Obtener los valores actuales del formulario
            const codigoNuevo = document.getElementById('codigo').value.trim();
            const dniNuevo = document.getElementById('dni').value.trim();
            const nombreNuevo = document.getElementById('nombre').value.trim();
            const afiliadoNuevo = document.getElementById('afiliado').value.trim();

            // Validar que todos los campos estén completos
            if (!codigoNuevo || !dniNuevo || !nombreNuevo || !afiliadoNuevo) {
                mostrarMensajeEstado('Complete todos los campos', 'error');
                return;
            }

            // Actualizar el paciente en el array
            pacientes[pacienteIndex] = {
                codigo: codigoNuevo,
                dni: dniNuevo,
                nombre: nombreNuevo,
                afiliado: afiliadoNuevo
            };

            // Actualizar el textarea con todos los pacientes modificados
            const nuevoContenido = pacientes.map(p => `${p.codigo},${p.dni},${p.nombre},${p.afiliado}`).join('\n');
            textarea.value = nuevoContenido;

            // Guardar en storage
            chrome.storage.local.set({
                autofillTextarea: nuevoContenido,
                autofillListadoPacientes: pacientes,
                autofillPacienteIndex: pacienteIndex
            });

            // Actualizar visualización
            mostrarPacienteActual();
            mostrarMensajeEstado('Paciente editado correctamente', 'success');
        });
    }

    // Mensaje de estado visual
    const STATUS_STYLES = {
        success: { bg: 'color-mix(in srgb, var(--success) 15%, var(--surface))', color: 'var(--success)', border: 'var(--success)' },
        error:   { bg: 'color-mix(in srgb, var(--danger)  15%, var(--surface))', color: 'var(--danger)',  border: 'var(--danger)'  },
        info:    { bg: 'color-mix(in srgb, var(--primary) 15%, var(--surface))', color: 'var(--primary)', border: 'var(--primary)' },
    };
    function mostrarMensajeEstado(mensaje, tipo = 'info') {
        const statusDiv = document.getElementById('statusMessage');
        const s = STATUS_STYLES[tipo] || STATUS_STYLES.info;
        statusDiv.textContent = mensaje;
        statusDiv.style.background = s.bg;
        statusDiv.style.color = s.color;
        statusDiv.style.border = `1px solid ${s.border}`;
        statusDiv.style.display = 'block';
        clearTimeout(statusDiv._timeout);
        statusDiv._timeout = setTimeout(() => { statusDiv.style.display = 'none'; }, 2500);
    }

    // Mostrar nombre del paciente actual en grande
    const elAnteriorBtn   = document.getElementById('anteriorPaciente');
    const elSiguienteBtn  = document.getElementById('siguientePaciente');
    const elIrPaciente    = document.getElementById('irPaciente');
    const elTotal         = document.getElementById('totalPacientes');
    const elActual        = document.getElementById('pacienteActual');
    const elNombreGrande  = document.getElementById('nombreGrande');

    function mostrarPacienteActual() {
        if (pacientes.length === 0) {
            elActual.textContent = 'Sin pacientes';
            elTotal.textContent  = 'Total: 0';
            elAnteriorBtn.disabled  = true;
            elSiguienteBtn.disabled = true;
            elIrPaciente.value   = 1;
            elIrPaciente.disabled = true;
            elNombreGrande.textContent = '';
            return;
        }
        const p = pacientes[pacienteIndex];
        document.getElementById('codigo').value   = p.codigo;
        document.getElementById('dni').value      = p.dni;
        document.getElementById('nombre').value   = p.nombre;
        document.getElementById('afiliado').value = p.afiliado;
        elActual.textContent         = `Paciente ${pacienteIndex + 1} de ${pacientes.length}`;
        elTotal.textContent          = `Total: ${pacientes.length}`;
        elIrPaciente.max             = pacientes.length;
        elIrPaciente.value           = pacienteIndex + 1;
        elIrPaciente.disabled        = false;
        elAnteriorBtn.disabled       = pacienteIndex === 0;
        elSiguienteBtn.disabled      = pacienteIndex === pacientes.length - 1;
        elNombreGrande.textContent   = p.nombre;
    }

    // === FUNCIONALIDAD DE BÚSQUEDA Y REEMPLAZO ===
    let resultadosBusqueda = [];
    let indiceActual = -1;
    let ultimaBusqueda = '';

    const buscarInput = document.getElementById('buscarTexto');
    const contadorSpan = document.getElementById('contadorBusqueda');
    // textarea ya está declarado arriba (línea 9)

    // Función para buscar todas las ocurrencias
    function buscarEnTexto(textoBuscado) {
        resultadosBusqueda = [];
        indiceActual = -1;

        if (!textoBuscado || textoBuscado.trim() === '') {
            contadorSpan.textContent = '0/0';
            return;
        }

        const contenido = textarea.value;
        const busquedaLower = textoBuscado.toLowerCase();
        let posicion = 0;

        // Buscar todas las ocurrencias (búsqueda case-insensitive)
        while (posicion < contenido.length) {
            const encontrado = contenido.toLowerCase().indexOf(busquedaLower, posicion);
            if (encontrado === -1) break;

            resultadosBusqueda.push({
                inicio: encontrado,
                fin: encontrado + textoBuscado.length,
                texto: contenido.substring(encontrado, encontrado + textoBuscado.length)
            });
            posicion = encontrado + 1;
        }

        // Actualizar contador
        contadorSpan.textContent = resultadosBusqueda.length > 0 ? `0/${resultadosBusqueda.length}` : '0/0';

        // Si hay resultados, ir al primero automáticamente
        if (resultadosBusqueda.length > 0) {
            irAResultado(0);
        }
    }

    // Función para ir a un resultado específico
    function irAResultado(indice) {
        if (indice < 0 || indice >= resultadosBusqueda.length) return;

        indiceActual = indice;
        const resultado = resultadosBusqueda[indice];

        // Seleccionar el texto encontrado en el textarea
        textarea.focus();
        textarea.setSelectionRange(resultado.inicio, resultado.fin);

        // Scroll automático a la posición
        const linea = textarea.value.substring(0, resultado.inicio).split('\n').length;
        textarea.scrollTop = Math.max(0, (linea - 3) * 20); // Aproximado

        // Actualizar contador
        contadorSpan.textContent = `${indice + 1}/${resultadosBusqueda.length}`;
    }

    // Evento: Buscar mientras se escribe
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            const textoBuscado = buscarInput.value;
            ultimaBusqueda = textoBuscado;
            buscarEnTexto(textoBuscado);
        });

        // Evento: Presionar Enter para buscar siguiente
        buscarInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (resultadosBusqueda.length > 0) {
                    const siguiente = (indiceActual + 1) % resultadosBusqueda.length;
                    irAResultado(siguiente);
                }
            }
        });
    }

    // Botón: Buscar Anterior
    const btnBuscarAnterior = document.getElementById('buscarAnterior');
    if (btnBuscarAnterior) {
        btnBuscarAnterior.addEventListener('click', function() {
            if (resultadosBusqueda.length === 0) return;
            const anterior = indiceActual <= 0 ? resultadosBusqueda.length - 1 : indiceActual - 1;
            irAResultado(anterior);
        });
    }

    // Botón: Buscar Siguiente
    const btnBuscarSiguiente = document.getElementById('buscarSiguiente');
    if (btnBuscarSiguiente) {
        btnBuscarSiguiente.addEventListener('click', function() {
            if (resultadosBusqueda.length === 0) return;
            const siguiente = (indiceActual + 1) % resultadosBusqueda.length;
            irAResultado(siguiente);
        });
    }

    // Botón: Reemplazar (solo la ocurrencia actual)
    const btnReemplazar = document.getElementById('btnReemplazar');
    const reemplazarInput = document.getElementById('reemplazarTexto');
    if (btnReemplazar && reemplazarInput) {
        btnReemplazar.addEventListener('click', function() {
            if (indiceActual < 0 || indiceActual >= resultadosBusqueda.length) return;

            const resultado = resultadosBusqueda[indiceActual];
            const textoReemplazo = reemplazarInput.value;
            const contenidoActual = textarea.value;

            // Reemplazar el texto
            const nuevoContenido = contenidoActual.substring(0, resultado.inicio) +
                                   textoReemplazo +
                                   contenidoActual.substring(resultado.fin);

            textarea.value = nuevoContenido;

            // Guardar en storage
            chrome.storage.local.set({ autofillTextarea: nuevoContenido });

            // Actualizar el array de pacientes en memoria
            actualizarPacientesDesdeTextarea();

            // Actualizar la búsqueda
            buscarEnTexto(buscarInput.value);

            // Mostrar el paciente actual actualizado
            mostrarPacienteActual();

            mostrarMensajeEstado('Texto reemplazado y guardado', 'success');
        });
    }

    // Botón: Reemplazar Todos
    const btnReemplazarTodos = document.getElementById('btnReemplazarTodos');
    if (btnReemplazarTodos && reemplazarInput) {
        btnReemplazarTodos.addEventListener('click', function() {
            const textoBuscado = buscarInput.value;
            const textoReemplazo = reemplazarInput.value;

            if (!textoBuscado || textoBuscado.trim() === '') {
                mostrarMensajeEstado('Ingrese texto para buscar', 'error');
                return;
            }

            // Crear expresión regular para reemplazo global (case-insensitive)
            const regex = new RegExp(textoBuscado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const nuevoContenido = textarea.value.replace(regex, textoReemplazo);

            const cantidadReemplazos = resultadosBusqueda.length;

            textarea.value = nuevoContenido;

            // Guardar en storage
            chrome.storage.local.set({ autofillTextarea: nuevoContenido });

            // Actualizar el array de pacientes en memoria
            actualizarPacientesDesdeTextarea();

            // Limpiar búsqueda
            buscarInput.value = '';
            resultadosBusqueda = [];
            indiceActual = -1;
            contadorSpan.textContent = '0/0';

            // Mostrar el paciente actual actualizado
            mostrarPacienteActual();

            mostrarMensajeEstado(`${cantidadReemplazos} reemplazo(s) realizado(s) y guardado(s)`, 'success');
        });
    }
});