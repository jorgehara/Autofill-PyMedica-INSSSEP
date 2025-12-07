/**
 * Aplicación Frontend para Sistema INSSSEP
 */

// Estado global
const app = {
    datosActuales: null,
    filtroActivo: 'todos'
};

// Configuración
const API_BASE = '';

// Elementos DOM
const elementos = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Upload - Modo único
    uploadModeRadios: document.querySelectorAll('input[name="uploadMode"]'),
    singleUploadArea: document.getElementById('singleUploadArea'),
    dualUploadArea: document.getElementById('dualUploadArea'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),

    // Upload - Modo dual
    dropZoneAfiliados: document.getElementById('dropZoneAfiliados'),
    fileInputAfiliados: document.getElementById('fileInputAfiliados'),
    fileInfoAfiliados: document.getElementById('fileInfoAfiliados'),
    dropZoneRecetas: document.getElementById('dropZoneRecetas'),
    fileInputRecetas: document.getElementById('fileInputRecetas'),
    fileInfoRecetas: document.getElementById('fileInfoRecetas'),
    btnProcesarDual: document.getElementById('btnProcesarDual'),

    // Texto - Modo único
    textModeRadios: document.querySelectorAll('input[name="textMode"]'),
    singleTextArea: document.getElementById('singleTextArea'),
    dualTextArea: document.getElementById('dualTextArea'),
    textoInput: document.getElementById('textoInput'),
    btnProcesarTexto: document.getElementById('btnProcesarTexto'),

    // Texto - Modo dual
    textoAfiliados: document.getElementById('textoAfiliados'),
    textoRecetas: document.getElementById('textoRecetas'),
    btnProcesarDualTexto: document.getElementById('btnProcesarDualTexto'),

    // Config
    codigoDiagnostico: document.getElementById('codigoDiagnostico'),
    formatoInput: document.getElementById('formatoInput'),

    // Resultados
    estadisticas: document.getElementById('estadisticas'),
    filtros: document.getElementById('filtros'),
    tablaContainer: document.getElementById('tablaContainer'),
    tablaBody: document.getElementById('tablaBody'),
    mensaje: document.getElementById('mensaje'),
    loading: document.getElementById('loading'),

    // Stats
    statAfiliados: document.getElementById('statAfiliados'),
    statConsultas: document.getElementById('statConsultas'),
    statRecetas: document.getElementById('statRecetas'),
    statValidos: document.getElementById('statValidos'),
    statAdvertencias: document.getElementById('statAdvertencias'),
    statErrores: document.getElementById('statErrores'),

    // Exportar
    btnExportarFinal: document.getElementById('btnExportarFinal'),
    btnExportarExtension: document.getElementById('btnExportarExtension'),
    btnExportarCSV: document.getElementById('btnExportarCSV'),
    btnExportarDetallado: document.getElementById('btnExportarDetallado')
};

// Inicializar aplicación
function inicializar() {
    configurarTabs();
    configurarUploadModes();
    configurarTextModes();
    configurarUpload();
    configurarUploadDual();
    configurarFiltros();
    configurarExportacion();
    configurarProcesarTexto();
    configurarProcesarTextoDual();
}

// Configurar cambio de modo de upload
function configurarUploadModes() {
    elementos.uploadModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'single') {
                elementos.singleUploadArea.classList.remove('hidden');
                elementos.dualUploadArea.classList.add('hidden');
            } else {
                elementos.singleUploadArea.classList.add('hidden');
                elementos.dualUploadArea.classList.remove('hidden');
            }
        });
    });
}

// Configurar cambio de modo de texto
function configurarTextModes() {
    elementos.textModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'single') {
                elementos.singleTextArea.classList.remove('hidden');
                elementos.dualTextArea.classList.add('hidden');
            } else {
                elementos.singleTextArea.classList.add('hidden');
                elementos.dualTextArea.classList.remove('hidden');
            }
        });
    });
}

// Configurar tabs
function configurarTabs() {
    elementos.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            // Actualizar botones
            elementos.tabButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Actualizar contenido
            elementos.tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Configurar área de upload
function configurarUpload() {
    // Click en zona de drop
    elementos.dropZone.addEventListener('click', () => {
        elementos.fileInput.click();
    });

    // Selección de archivo
    elementos.fileInput.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            procesarArchivo(archivo);
        }
    });

    // Drag & Drop
    elementos.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elementos.dropZone.classList.add('dragover');
    });

    elementos.dropZone.addEventListener('dragleave', () => {
        elementos.dropZone.classList.remove('dragover');
    });

    elementos.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elementos.dropZone.classList.remove('dragover');

        const archivo = e.dataTransfer.files[0];
        if (archivo) {
            procesarArchivo(archivo);
        }
    });
}

// Configurar upload dual (dos archivos)
function configurarUploadDual() {
    let archivoAfiliados = null;
    let archivoRecetas = null;

    // Afiliados
    elementos.dropZoneAfiliados.addEventListener('click', () => {
        elementos.fileInputAfiliados.click();
    });

    elementos.fileInputAfiliados.addEventListener('change', (e) => {
        archivoAfiliados = e.target.files[0];
        if (archivoAfiliados) {
            elementos.fileInfoAfiliados.textContent = `✓ ${archivoAfiliados.name}`;
            elementos.fileInfoAfiliados.classList.remove('hidden');
            verificarArchivosCompletos();
        }
    });

    // Recetas
    elementos.dropZoneRecetas.addEventListener('click', () => {
        elementos.fileInputRecetas.click();
    });

    elementos.fileInputRecetas.addEventListener('change', (e) => {
        archivoRecetas = e.target.files[0];
        if (archivoRecetas) {
            elementos.fileInfoRecetas.textContent = `✓ ${archivoRecetas.name}`;
            elementos.fileInfoRecetas.classList.remove('hidden');
            verificarArchivosCompletos();
        }
    });

    function verificarArchivosCompletos() {
        if (archivoAfiliados && archivoRecetas) {
            elementos.btnProcesarDual.disabled = false;
        }
    }

    // Procesar ambos archivos
    elementos.btnProcesarDual.addEventListener('click', async () => {
        if (!archivoAfiliados || !archivoRecetas) {
            mostrarMensaje('Debes seleccionar ambos archivos', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('archivo_afiliados', archivoAfiliados);
        formData.append('archivo_recetas', archivoRecetas);
        formData.append('codigo_diagnostico', elementos.codigoDiagnostico.value || 'B349');

        mostrarLoading(true);
        ocultarMensaje();

        try {
            const response = await fetch(`${API_BASE}/api/procesar`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                mostrarResultados(data);
                mostrarMensaje(
                    `✓ Archivos procesados correctamente. Cruce de afiliados y recetas completado.`,
                    'success'
                );
            } else {
                mostrarMensaje(data.error || 'Error al procesar archivos', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
}

// Procesar archivo subido
async function procesarArchivo(archivo) {
    // Validar tamaño
    if (archivo.size > 16 * 1024 * 1024) {
        mostrarMensaje('Archivo muy grande. Tamaño máximo: 16MB', 'error');
        return;
    }

    // Validar extensión
    const extension = archivo.name.split('.').pop().toLowerCase();
    if (!['txt', 'csv'].includes(extension)) {
        mostrarMensaje('Formato no válido. Use archivos .txt o .csv', 'error');
        return;
    }

    // Mostrar info del archivo
    elementos.fileInfo.textContent = `📄 ${archivo.name} (${formatearTamano(archivo.size)})`;
    elementos.fileInfo.classList.remove('hidden');

    // Crear FormData
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('codigo_diagnostico', elementos.codigoDiagnostico.value || 'B349');

    const formato = elementos.formatoInput.value;
    if (formato) {
        formData.append('formato', formato);
    }

    // Enviar
    mostrarLoading(true);
    ocultarMensaje();

    try {
        const response = await fetch(`${API_BASE}/api/procesar`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            mostrarResultados(data);
            mostrarMensaje(
                `✓ Archivo procesado correctamente. Formato detectado: ${formatearFormato(data.formato)}`,
                'success'
            );
        } else {
            mostrarMensaje(data.error || 'Error al procesar archivo', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión con el servidor', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Configurar procesamiento de texto
function configurarProcesarTexto() {
    elementos.btnProcesarTexto.addEventListener('click', async () => {
        const texto = elementos.textoInput.value.trim();

        if (!texto) {
            mostrarMensaje('Por favor, pega el texto a procesar', 'error');
            return;
        }

        mostrarLoading(true);
        ocultarMensaje();

        try {
            const response = await fetch(`${API_BASE}/api/procesar/texto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texto: texto,
                    codigo_diagnostico: elementos.codigoDiagnostico.value || 'B349',
                    formato: elementos.formatoInput.value || null
                })
            });

            const data = await response.json();

            if (data.success) {
                mostrarResultados(data);
                mostrarMensaje(
                    `✓ Texto procesado correctamente. Formato detectado: ${formatearFormato(data.formato)}`,
                    'success'
                );
            } else {
                mostrarMensaje(data.error || 'Error al procesar texto', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
}

// Configurar procesamiento de texto dual (dos textos)
function configurarProcesarTextoDual() {
    elementos.btnProcesarDualTexto.addEventListener('click', async () => {
        const textoAfiliados = elementos.textoAfiliados.value.trim();
        const textoRecetas = elementos.textoRecetas.value.trim();

        if (!textoAfiliados || !textoRecetas) {
            mostrarMensaje('Debes pegar ambos textos', 'error');
            return;
        }

        mostrarLoading(true);
        ocultarMensaje();

        try {
            const response = await fetch(`${API_BASE}/api/procesar/texto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texto_afiliados: textoAfiliados,
                    texto_recetas: textoRecetas,
                    codigo_diagnostico: elementos.codigoDiagnostico.value || 'B349'
                })
            });

            const data = await response.json();

            if (data.success) {
                mostrarResultados(data);
                mostrarMensaje(
                    `✓ Textos procesados correctamente. Cruce de afiliados y recetas completado.`,
                    'success'
                );
            } else {
                mostrarMensaje(data.error || 'Error al procesar textos', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
}

// Mostrar resultados
function mostrarResultados(data) {
    app.datosActuales = data;

    // Actualizar estadísticas
    const stats = data.estadisticas;
    elementos.statAfiliados.textContent = stats.total_afiliados;
    elementos.statConsultas.textContent = stats.total_consultas;
    elementos.statRecetas.textContent = stats.total_recetas;
    elementos.statValidos.textContent = stats.validos;
    elementos.statAdvertencias.textContent = stats.advertencias;
    elementos.statErrores.textContent = stats.errores + stats.excepciones;

    // Mostrar secciones
    elementos.estadisticas.classList.remove('hidden');
    elementos.filtros.classList.remove('hidden');
    elementos.tablaContainer.classList.remove('hidden');

    // Resetear filtro
    app.filtroActivo = 'todos';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'todos');
    });

    // Mostrar tabla
    mostrarTabla(data.afiliados);
}

// Mostrar tabla de afiliados
function mostrarTabla(afiliados) {
    elementos.tablaBody.innerHTML = '';

    if (!afiliados || afiliados.length === 0) {
        elementos.tablaBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">
                    No hay datos para mostrar
                </td>
            </tr>
        `;
        return;
    }

    afiliados.forEach((afiliado, index) => {
        const tr = document.createElement('tr');

        const estadoClass = `estado-${afiliado.estado}`;
        const estadoText = obtenerTextoEstado(afiliado.estado);

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${afiliado.dni}</strong></td>
            <td>${afiliado.nombre}</td>
            <td><code>${afiliado.codigo}</code></td>
            <td>${afiliado.tipo}</td>
            <td><strong>${afiliado.consultas}</strong></td>
            <td>${afiliado.recetas}</td>
            <td>
                <span class="estado-badge ${estadoClass}" title="${afiliado.mensaje}">
                    ${estadoText}
                </span>
            </td>
        `;

        elementos.tablaBody.appendChild(tr);
    });
}

// Configurar filtros
function configurarFiltros() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const filtro = button.dataset.filter;

            // Actualizar UI
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            app.filtroActivo = filtro;

            if (filtro === 'todos') {
                // Mostrar todos
                mostrarTabla(app.datosActuales.afiliados);
            } else {
                // Filtrar por estado
                const afiliadosFiltrados = app.datosActuales.afiliados.filter(
                    a => a.estado === filtro
                );
                mostrarTabla(afiliadosFiltrados);
            }
        });
    });
}

// Configurar exportación
function configurarExportacion() {
    elementos.btnExportarFinal.addEventListener('click', () => {
        descargarArchivo('final');
    });

    elementos.btnExportarExtension.addEventListener('click', () => {
        descargarArchivo('extension');
    });

    elementos.btnExportarCSV.addEventListener('click', () => {
        descargarArchivo('csv');
    });

    elementos.btnExportarDetallado.addEventListener('click', () => {
        descargarArchivo('detallado');
    });
}

// Descargar archivo
async function descargarArchivo(formato) {
    if (!app.datosActuales) {
        mostrarMensaje('No hay datos para exportar', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/exportar/${formato}`);

        if (!response.ok) {
            throw new Error('Error al exportar');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `export_${formato}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarMensaje('✓ Archivo exportado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al exportar archivo', 'error');
    }
}

// Utilidades
function mostrarMensaje(texto, tipo = 'info') {
    elementos.mensaje.textContent = texto;
    elementos.mensaje.className = `mensaje ${tipo}`;
    elementos.mensaje.classList.remove('hidden');

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        ocultarMensaje();
    }, 5000);
}

function ocultarMensaje() {
    elementos.mensaje.classList.add('hidden');
}

function mostrarLoading(mostrar) {
    if (mostrar) {
        elementos.loading.classList.remove('hidden');
    } else {
        elementos.loading.classList.add('hidden');
    }
}

function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatearFormato(formato) {
    const formatos = {
        'recetas_insssep': 'Recetas INSSSEP',
        'lista_formateada': 'Lista Formateada'
    };
    return formatos[formato] || formato;
}

function obtenerTextoEstado(estado) {
    const textos = {
        'valido': '✓ Válido',
        'advertencia': '⚠️ 3 consultas',
        'excepcion': '🔔 4 consultas',
        'error': '✗ Excedido'
    };
    return textos[estado] || estado;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
