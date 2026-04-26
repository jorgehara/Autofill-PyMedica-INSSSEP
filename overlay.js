// INSSSEP AutoFill - Overlay profesional con SVG icons
// Se inyecta directamente en la página de INSSSEP

(function() {
    'use strict';
    
    // Evitar inyecciones múltiples
    if (document.getElementById('insssep-autofill-overlay')) {
        console.log('[AutoFill] Overlay ya existe');
        return;
    }

    console.log('[AutoFill] Iniciando overlay profesional...');

    // Constantes para localStorage
    const STORAGE_KEY = 'insssep_autofill_data';
    
    // Iconos SVG inline adicionales para impresión
    const printIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
    
    // Iconos SVG inline
    const ICONS = {
        medical: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        minimize: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        maximize: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
        close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        list: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
        tools: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        arrowUp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
        arrowDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
        arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        nav: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
        one: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/></svg>',
        all: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
        chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
        chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        resize: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-6.5-7a.55.55 0 0 1 0-1L21 3"/></svg>'
    };

    // Estado
    let pacientes = [];
    let pacienteIndex = 0;
    let isMinimized = false;
    let isDragging = false;
    let isResizing = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let resizeStartWidth = 0;
    let resizeStartHeight = 0;
    
    // Para buscar/reemplazar
    let resultadosBusqueda = [];
    let indiceBusqueda = -1;

    // ===== FUNCIONES DE PERSISTENCIA =====
    
    function guardarDatos() {
        const datos = {
            listado: listadoInput ? listadoInput.value : '',
            pacienteIndex: pacienteIndex,
            pacientes: pacientes,
            secciones: {
                listado: !document.getElementById('content-listado')?.parentElement?.classList.contains('collapsed'),
                buscar: !document.getElementById('content-buscar')?.parentElement?.classList.contains('collapsed'),
                navegacion: !document.getElementById('content-navegacion')?.parentElement?.classList.contains('collapsed'),
                datos: !document.getElementById('content-datos')?.parentElement?.classList.contains('collapsed'),
                config: !document.getElementById('content-config')?.parentElement?.classList.contains('collapsed')
            },
            posicion: {
                left: overlay.style.left,
                top: overlay.style.top,
                right: overlay.style.right,
                width: overlay.style.width,
                height: overlay.style.height
            },
            isMinimized: isMinimized,
            autoPrint: autoPrintCheckbox ? autoPrintCheckbox.checked : true,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
        } catch (e) {
            console.error('[AutoFill] Error guardando:', e);
        }
    }
    
    function cargarDatos() {
        try {
            const datos = localStorage.getItem(STORAGE_KEY);
            return datos ? JSON.parse(datos) : null;
        } catch (e) {
            console.error('[AutoFill] Error cargando:', e);
            return null;
        }
    }
    
    function restaurarDatos(datos) {
        if (!datos) return;
        
        if (datos.listado && listadoInput) {
            listadoInput.value = datos.listado;
        }
        
        if (datos.pacientes && Array.isArray(datos.pacientes)) {
            pacientes = datos.pacientes;
            pacienteIndex = datos.pacienteIndex || 0;
            if (pacienteIndex >= pacientes.length) pacienteIndex = 0;
            mostrarPacienteActual();
        }
        
        if (datos.secciones) {
            setTimeout(() => {
                Object.entries(datos.secciones).forEach(([nombre, expandido]) => {
                    const section = document.getElementById(`section-${nombre}`);
                    const content = document.getElementById(`content-${nombre}`);
                    const btn = section?.querySelector('.af-toggle-btn');
                    if (section && content && btn) {
                        content.style.display = expandido ? '' : 'none';
                        btn.innerHTML = expandido ? ICONS.chevronDown : ICONS.chevronRight;
                        section.classList.toggle('collapsed', !expandido);
                    }
                });
            }, 100);
        }
        
        if (datos.posicion) {
            if (datos.posicion.left) overlay.style.left = datos.posicion.left;
            if (datos.posicion.top) overlay.style.top = datos.posicion.top;
            if (datos.posicion.right) overlay.style.right = datos.posicion.right;
            if (datos.posicion.width) overlay.style.width = datos.posicion.width;
            if (datos.posicion.height) overlay.style.height = datos.posicion.height;
        }
        
        if (datos.isMinimized) {
            isMinimized = true;
            overlay.classList.add('af-minimized');
            if (minimizeBtn) minimizeBtn.innerHTML = ICONS.maximize;
        }
        
        // Restaurar configuración de impresión automática
        if (datos.autoPrint !== undefined && autoPrintCheckbox) {
            autoPrintCheckbox.checked = datos.autoPrint;
        }
    }

    // Crear el overlay
    const overlay = document.createElement('div');
    overlay.id = 'insssep-autofill-overlay';
    overlay.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            #insssep-autofill-overlay {
                --bg-primary: rgba(30, 33, 43, 0.95);
                --bg-secondary: rgba(40, 44, 55, 0.9);
                --bg-tertiary: rgba(50, 55, 70, 0.8);
                --border: rgba(100, 110, 140, 0.3);
                --text-primary: #f0f2f5;
                --text-secondary: #a0a8b8;
                --accent-primary: #3b82f6;
                --accent-hover: #2563eb;
                --accent-success: #10b981;
                --accent-warning: #f59e0b;
                --accent-danger: #ef4444;
                --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                
                position: fixed;
                top: 20px;
                right: 20px;
                width: 380px;
                min-width: 320px;
                min-height: 200px;
                background: var(--bg-primary);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 16px;
                box-shadow: var(--shadow);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 13px;
                color: var(--text-primary);
                z-index: 999999;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            #insssep-autofill-overlay * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            /* Header */
            .af-header {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
                border-bottom: 1px solid var(--border);
                padding: 14px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: move;
                flex-shrink: 0;
            }
            
            .af-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .af-title svg {
                color: var(--accent-primary);
            }
            
            .af-title span {
                font-weight: 400;
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .af-controls {
                display: flex;
                gap: 6px;
            }
            
            .af-btn-control {
                background: rgba(255,255,255,0.05);
                border: 1px solid var(--border);
                color: var(--text-secondary);
                width: 28px;
                height: 28px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .af-btn-control:hover {
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
                border-color: rgba(100, 110, 140, 0.5);
            }
            
            .af-btn-control:last-child:hover {
                background: var(--accent-danger);
                border-color: var(--accent-danger);
                color: white;
            }
            
            /* Content */
            .af-content {
                padding: 16px;
                overflow-y: auto;
                flex: 1;
                max-height: calc(100vh - 100px);
            }
            
            .af-minimized .af-content {
                display: none;
            }
            
            /* Section */
            .af-section {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: 12px;
                margin-bottom: 12px;
                overflow: hidden;
            }
            
            .af-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 14px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .af-section-header:hover {
                background: rgba(255,255,255,0.03);
            }
            
            .af-section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .af-section-title svg {
                color: var(--accent-primary);
            }
            
            .af-toggle-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                transition: transform 0.2s;
            }
            
            .af-section.collapsed .af-toggle-btn {
                transform: rotate(-90deg);
            }
            
            .af-section-content {
                padding: 0 14px 14px;
            }
            
            /* Textarea */
            .af-textarea {
                width: 100%;
                height: 100px;
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 10px 12px;
                color: var(--text-primary);
                font-size: 12px;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                resize: vertical;
                margin-bottom: 10px;
                transition: border-color 0.2s;
            }
            
            .af-textarea:focus {
                outline: none;
                border-color: var(--accent-primary);
            }
            
            /* Inputs */
            .af-input {
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 8px 12px;
                color: var(--text-primary);
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .af-input:focus {
                outline: none;
                border-color: var(--accent-primary);
            }
            
            .af-input::placeholder {
                color: var(--text-secondary);
                opacity: 0.5;
            }
            
            .af-input-small {
                width: 60px;
                text-align: center;
            }
            
            /* Buttons */
            .af-btn {
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 8px 14px;
                font-size: 12px;
                font-weight: 500;
                color: var(--text-primary);
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .af-btn:hover:not(:disabled) {
                background: rgba(255,255,255,0.1);
                border-color: rgba(100, 110, 140, 0.5);
                transform: translateY(-1px);
            }
            
            .af-btn:active:not(:disabled) {
                transform: translateY(0);
            }
            
            .af-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            
            .af-btn-primary {
                background: var(--accent-primary);
                border-color: var(--accent-primary);
                color: white;
            }
            
            .af-btn-primary:hover:not(:disabled) {
                background: var(--accent-hover);
                border-color: var(--accent-hover);
            }
            
            .af-btn-success {
                background: var(--accent-success);
                border-color: var(--accent-success);
                color: white;
            }
            
            .af-btn-success:hover:not(:disabled) {
                background: #059669;
                border-color: #059669;
            }
            
            .af-btn-warning {
                background: var(--accent-warning);
                border-color: var(--accent-warning);
                color: white;
            }
            
            .af-btn-warning:hover:not(:disabled) {
                background: #d97706;
                border-color: #d97706;
            }
            
            .af-btn-danger {
                background: var(--accent-danger);
                border-color: var(--accent-danger);
                color: white;
            }
            
            .af-btn-danger:hover:not(:disabled) {
                background: #dc2626;
                border-color: #dc2626;
            }
            
            .af-btn-icon {
                padding: 12px;
                min-width: 48px;
                min-height: 48px;
            }

            .af-btn-nav {
                padding: 16px 40px;
                min-width: 100px;
                min-height: 60px;
                font-size: 20px;
                flex: 1;
            }

            .af-btn-nav svg {
                width: 28px;
                height: 28px;
            }

            .af-btn-rellenar {
                padding: 14px 24px !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                min-height: 48px;
            }

            .af-btn-rellenar svg {
                width: 18px;
                height: 18px;
            }
            
            /* Actions */
            .af-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .af-actions .af-btn {
                flex: 1;
                min-width: 0;
            }
            
            /* Search */
            .af-search-row {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .af-search-row:last-child {
                margin-bottom: 0;
            }
            
            .af-counter {
                font-size: 11px;
                color: var(--text-secondary);
                min-width: 40px;
                text-align: center;
                font-variant-numeric: tabular-nums;
                font-weight: 500;
            }
            
            /* Navigation */
            .af-nav-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .af-nav-main {
                display: flex;
                align-items: center;
                gap: 15px;
                justify-content: space-between;
            }
            
            .af-nav-info {
                flex: 0 1 auto;
                text-align: center;
                padding: 0 10px;
                white-space: nowrap;
            }
            
            .af-paciente-num {
                font-weight: 600;
                color: var(--accent-primary);
                font-size: 14px;
            }
            
            .af-paciente-total {
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .af-go-to {
                display: flex;
                gap: 8px;
                align-items: center;
                justify-content: center;
                padding-top: 8px;
                border-top: 1px solid var(--border);
            }
            
            .af-go-to span {
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            /* Patient name */
            .af-nombre {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                font-weight: 600;
                font-size: 16px;
                color: var(--accent-primary);
                margin-bottom: 12px;
                word-break: break-all;
                letter-spacing: 0.5px;
            }
            
            /* Form */
            .af-form-grid {
                display: grid;
                grid-template-columns: 70px 1fr;
                gap: 10px;
                align-items: center;
            }
            
            .af-form-grid label {
                font-size: 12px;
                color: var(--text-secondary);
                text-align: right;
                font-weight: 500;
            }
            
            .af-form-actions {
                display: grid;
                grid-template-columns: 1fr 1.5fr;
                gap: 10px;
                margin-top: 14px;
            }
            
            /* Shortcuts */
            .af-shortcuts {
                font-size: 11px;
                color: var(--text-secondary);
                text-align: center;
                padding-top: 14px;
                border-top: 1px solid var(--border);
                margin-top: 14px;
            }
            
            .af-shortcuts kbd {
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
                padding: 3px 6px;
                border-radius: 4px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px;
                color: var(--text-primary);
            }
            
            /* Resize handle */
            .af-resize-handle {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                cursor: se-resize;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            
            .af-resize-handle:hover {
                opacity: 1;
                color: var(--accent-primary);
            }
            
            /* Status */
            .af-status {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: var(--accent-success);
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 500;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 9999999;
            }
            
            .af-status.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .af-status.error {
                background: var(--accent-danger);
            }
            
            .af-status.warning {
                background: var(--accent-warning);
            }
            
            /* Scrollbar */
            .af-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .af-content::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .af-content::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 4px;
            }
            
            .af-content::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 110, 140, 0.5);
            }
        </style>
        
        <div class="af-header">
            <div class="af-title">${ICONS.medical} INSSSEP <span>AutoFill</span></div>
            <div class="af-controls">
                <button class="af-btn-control" id="af-minimize" title="Minimizar">${ICONS.minimize}</button>
                <button class="af-btn-control" id="af-close" title="Cerrar">${ICONS.close}</button>
            </div>
        </div>
        
        <div class="af-content">
            <!-- Listado -->
            <div class="af-section" id="section-listado">
                <div class="af-section-header" data-target="content-listado">
                    <div class="af-section-title">${ICONS.list} Listado de Pacientes</div>
                    <button class="af-toggle-btn">${ICONS.chevronDown}</button>
                </div>
                <div class="af-section-content" id="content-listado">
                    <textarea class="af-textarea" id="af-listado" placeholder="CODIGO,DNI,NOMBRE,AFILIADO
Uno por linea..."></textarea>
                    <div class="af-actions">
                        <button class="af-btn" id="af-formatear">${ICONS.tools} Formatear</button>
                        <button class="af-btn af-btn-success" id="af-cargar">${ICONS.download} Cargar</button>
                        <button class="af-btn af-btn-danger" id="af-limpiar">${ICONS.trash} Limpiar</button>
                    </div>
                </div>
            </div>
            
            <!-- Buscar/Reemplazar -->
            <div class="af-section collapsed" id="section-buscar">
                <div class="af-section-header" data-target="content-buscar">
                    <div class="af-section-title">${ICONS.search} Buscar y Reemplazar</div>
                    <button class="af-toggle-btn">${ICONS.chevronRight}</button>
                </div>
                <div class="af-section-content" id="content-buscar" style="display:none;">
                    <div class="af-search-row">
                        <input type="text" class="af-input" id="af-buscar-texto" placeholder="Buscar...">
                        <button class="af-btn af-btn-icon" id="af-buscar-ant">${ICONS.arrowUp}</button>
                        <button class="af-btn af-btn-icon" id="af-buscar-sig">${ICONS.arrowDown}</button>
                        <span class="af-counter" id="af-buscar-contador">0/0</span>
                    </div>
                    <div class="af-search-row">
                        <input type="text" class="af-input" id="af-reemplazar-texto" placeholder="Reemplazar con...">
                        <button class="af-btn af-btn-warning" id="af-reemplazar-uno">${ICONS.one} Uno</button>
                        <button class="af-btn af-btn-danger" id="af-reemplazar-todos">${ICONS.all} Todos</button>
                    </div>
                </div>
            </div>
            
            <!-- Nombre del paciente -->
            <div class="af-nombre" id="af-nombre">-</div>
            
            <!-- Datos -->
            <div class="af-section" id="section-datos">
                <div class="af-section-header" data-target="content-datos">
                    <div class="af-section-title">${ICONS.user} Datos del Paciente</div>
                    <button class="af-toggle-btn">${ICONS.chevronDown}</button>
                </div>
                <div class="af-section-content" id="content-datos">
                    <div class="af-form-grid">
                        <label>Codigo:</label>
                        <input type="text" class="af-input" id="af-codigo" placeholder="B349">
                        <label>DNI:</label>
                        <input type="text" class="af-input" id="af-dni">
                        <label>Nombre:</label>
                        <input type="text" class="af-input" id="af-nombre-input">
                        <label>Afiliado:</label>
                        <input type="text" class="af-input" id="af-afiliado">
                    </div>
                    <div class="af-form-actions">
                        <button class="af-btn af-btn-warning" id="af-editar">${ICONS.edit} Editar</button>
                        <button class="af-btn af-btn-success af-btn-rellenar" id="af-rellenar">${ICONS.check} Rellenar</button>
                    </div>
                    <div id="af-retry-container" style="display:none;margin-top:10px;text-align:center;">
                        <button class="af-btn af-btn-primary" id="af-reintentar" style="width:100%;">Reintentar Rellenado</button>
                    </div>
                </div>
            </div>
            
            <!-- Navegacion -->
            <div class="af-section" id="section-navegacion">
                <div class="af-section-header" data-target="content-navegacion">
                    <div class="af-section-title">${ICONS.nav} Navegacion</div>
                    <button class="af-toggle-btn">${ICONS.chevronDown}</button>
                </div>
                <div class="af-section-content" id="content-navegacion">
                    <div class="af-nav-section">
                        <div class="af-nav-main">
                            <button class="af-btn af-btn-icon af-btn-nav af-btn-primary" id="af-anterior" title="Anterior (Ctrl+Flecha Izq)">${ICONS.arrowLeft}</button>
                            <div class="af-nav-info">
                                <div class="af-paciente-num" id="af-paciente-info">Sin pacientes</div>
                            </div>
                            <button class="af-btn af-btn-icon af-btn-nav af-btn-primary" id="af-siguiente" title="Siguiente (Ctrl+Flecha Der)">${ICONS.arrowRight}</button>
                        </div>
                        <div class="af-go-to">
                            <span>Ir a:</span>
                            <input type="number" class="af-input af-input-small" id="af-ir-numero" min="1" placeholder="#">
                            <button class="af-btn af-btn-primary" id="af-ir-btn">${ICONS.arrowRight}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Configuracion -->
            <div class="af-section collapsed" id="section-config">
                <div class="af-section-header" data-target="content-config">
                    <div class="af-section-title">${printIcon} Impresion Automatica</div>
                    <button class="af-toggle-btn">${ICONS.chevronRight}</button>
                </div>
                <div class="af-section-content" id="content-config" style="display:none;">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 0;">
                        <input type="checkbox" id="af-auto-print" checked style="width:18px;height:18px;cursor:pointer;">
                        <span style="font-size:12px;color:var(--text-primary);">Imprimir ticket automaticamente despues de validar</span>
                    </label>
                    <div style="font-size:11px;color:var(--text-secondary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
                        El sistema buscara el boton "Imprimir" cuando aparezca el ticket y hara clic automaticamente.
                    </div>
                </div>
            </div>
            
            <!-- Shortcuts -->
            <div class="af-shortcuts">
                <kbd>Ctrl</kbd> + <kbd>Flecha Izq</kbd> Ant | 
                <kbd>Ctrl</kbd> + <kbd>Flecha Der</kbd> Sig | 
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> Rellenar
            </div>
        </div>
        
        <div class="af-resize-handle" id="af-resize">${ICONS.resize}</div>
    `;

    document.body.appendChild(overlay);

    // Status
    const statusDiv = document.createElement('div');
    statusDiv.className = 'af-status';
    statusDiv.id = 'af-status';
    document.body.appendChild(statusDiv);

    // Referencias
    const header = overlay.querySelector('.af-header');
    const minimizeBtn = document.getElementById('af-minimize');
    const closeBtn = document.getElementById('af-close');
    const resizeHandle = document.getElementById('af-resize');
    const listadoInput = document.getElementById('af-listado');
    const formatearBtn = document.getElementById('af-formatear');
    const cargarBtn = document.getElementById('af-cargar');
    const limpiarBtn = document.getElementById('af-limpiar');
    const buscarInput = document.getElementById('af-buscar-texto');
    const buscarAntBtn = document.getElementById('af-buscar-ant');
    const buscarSigBtn = document.getElementById('af-buscar-sig');
    const buscarContador = document.getElementById('af-buscar-contador');
    const reemplazarInput = document.getElementById('af-reemplazar-texto');
    const reemplazarUnoBtn = document.getElementById('af-reemplazar-uno');
    const reemplazarTodosBtn = document.getElementById('af-reemplazar-todos');
    const anteriorBtn = document.getElementById('af-anterior');
    const siguienteBtn = document.getElementById('af-siguiente');
    const irNumeroInput = document.getElementById('af-ir-numero');
    const irBtn = document.getElementById('af-ir-btn');
    const pacienteInfo = document.getElementById('af-paciente-info');
    const nombreDisplay = document.getElementById('af-nombre');
    const codigoInput = document.getElementById('af-codigo');
    const dniInput = document.getElementById('af-dni');
    const nombreInput = document.getElementById('af-nombre-input');
    const afiliadoInput = document.getElementById('af-afiliado');
    const editarBtn = document.getElementById('af-editar');
    const rellenarBtn = document.getElementById('af-rellenar');
    const autoPrintCheckbox = document.getElementById('af-auto-print');
    const reintentarBtn = document.getElementById('af-reintentar');
    const retryContainer = document.getElementById('af-retry-container');

    // ===== FUNCIONES =====

    function mostrarStatus(mensaje, tipo = 'success') {
        statusDiv.textContent = mensaje;
        statusDiv.className = 'af-status show ' + (tipo === 'error' ? 'error' : tipo === 'warning' ? 'warning' : '');
        setTimeout(() => statusDiv.classList.remove('show'), 2500);
    }

    function cargarPacientes() {
        const texto = listadoInput.value.trim();
        if (!texto) {
            mostrarStatus('Ingrese el listado', 'error');
            return;
        }

        pacientes = texto.split('\n').map(linea => {
            const partes = linea.split(',');
            return {
                codigo: partes[0]?.trim() || '',
                dni: partes[1]?.trim() || '',
                nombre: partes[2]?.trim() || '',
                afiliado: partes[3]?.trim() || ''
            };
        }).filter(p => p.codigo && p.dni && p.nombre && p.afiliado);

        pacienteIndex = 0;
        mostrarPacienteActual();
        guardarDatos();
        mostrarStatus(`${pacientes.length} pacientes cargados`);
    }

    function mostrarPacienteActual() {
        if (pacientes.length === 0) {
            pacienteInfo.innerHTML = '<span style="color:var(--text-secondary)">Sin pacientes</span>';
            nombreDisplay.textContent = '-';
            codigoInput.value = '';
            dniInput.value = '';
            nombreInput.value = '';
            afiliadoInput.value = '';
            anteriorBtn.disabled = true;
            siguienteBtn.disabled = true;
            irNumeroInput.value = '';
            return;
        }

        const p = pacientes[pacienteIndex];
        pacienteInfo.innerHTML = `Paciente <b>${pacienteIndex + 1}</b> <span style="color:var(--text-secondary)">de ${pacientes.length}</span>`;
        nombreDisplay.textContent = p.nombre;
        codigoInput.value = p.codigo;
        dniInput.value = p.dni;
        nombreInput.value = p.nombre;
        afiliadoInput.value = p.afiliado;
        irNumeroInput.value = pacienteIndex + 1;

        anteriorBtn.disabled = pacienteIndex === 0;
        siguienteBtn.disabled = pacienteIndex === pacientes.length - 1;
    }

    function anteriorPaciente() {
        if (pacienteIndex > 0) {
            pacienteIndex--;
            mostrarPacienteActual();
            guardarDatos();
        }
    }

    function siguientePaciente() {
        if (pacienteIndex < pacientes.length - 1) {
            pacienteIndex++;
            mostrarPacienteActual();
            guardarDatos();
        }
    }

    function irAPaciente() {
        const numero = parseInt(irNumeroInput.value, 10);
        if (isNaN(numero) || numero < 1 || numero > pacientes.length) {
            mostrarStatus(`Ingrese un numero entre 1 y ${pacientes.length}`, 'error');
            return;
        }
        pacienteIndex = numero - 1;
        mostrarPacienteActual();
        guardarDatos();
    }

    function formatearLista() {
        const raw = listadoInput.value.trim();
        if (!raw) return;

        const lineas = raw.split('\n').map(linea => {
            const partes = linea.trim().split(/\s+/);
            if (partes.length < 4) return linea;
            
            const codigo = partes[0];
            const dni = partes[1];
            let indiceTipo = partes.findIndex(p => p === 'Titular' || p === 'Beneficiario' || p === 'Familiar');
            if (indiceTipo === -1) indiceTipo = partes.length - 1;
            const nombrePartes = partes.slice(2, indiceTipo);
            const nombreCompleto = nombrePartes.join('');
            
            return `${codigo},${dni},${nombreCompleto},${dni}`;
        }).join('\n');
        
        listadoInput.value = lineas;
        mostrarStatus('Lista formateada');
    }

    function buscarTexto() {
        const texto = buscarInput.value;
        resultadosBusqueda = [];
        indiceBusqueda = -1;

        if (!texto) {
            buscarContador.textContent = '0/0';
            return;
        }

        const contenido = listadoInput.value;
        const busquedaLower = texto.toLowerCase();
        let pos = 0;

        while (pos < contenido.length) {
            const idx = contenido.toLowerCase().indexOf(busquedaLower, pos);
            if (idx === -1) break;
            resultadosBusqueda.push({ inicio: idx, fin: idx + texto.length });
            pos = idx + 1;
        }

        buscarContador.textContent = resultadosBusqueda.length > 0 ? `1/${resultadosBusqueda.length}` : '0/0';
        if (resultadosBusqueda.length > 0) irAResultado(0);
    }

    function irAResultado(idx) {
        if (idx < 0 || idx >= resultadosBusqueda.length) return;
        indiceBusqueda = idx;
        const r = resultadosBusqueda[idx];
        listadoInput.focus();
        listadoInput.setSelectionRange(r.inicio, r.fin);
        buscarContador.textContent = `${idx + 1}/${resultadosBusqueda.length}`;
    }

    function buscarAnterior() {
        if (resultadosBusqueda.length === 0) return;
        irAResultado(indiceBusqueda <= 0 ? resultadosBusqueda.length - 1 : indiceBusqueda - 1);
    }

    function buscarSiguiente() {
        if (resultadosBusqueda.length === 0) return;
        irAResultado((indiceBusqueda + 1) % resultadosBusqueda.length);
    }

    function reemplazarUno() {
        if (indiceBusqueda < 0 || indiceBusqueda >= resultadosBusqueda.length) return;
        const r = resultadosBusqueda[indiceBusqueda];
        const nuevo = listadoInput.value.substring(0, r.inicio) + reemplazarInput.value + listadoInput.value.substring(r.fin);
        listadoInput.value = nuevo;
        buscarTexto();
        mostrarStatus('Reemplazado');
    }

    function reemplazarTodos() {
        const buscar = buscarInput.value;
        if (!buscar) return;
        const regex = new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const count = (listadoInput.value.match(regex) || []).length;
        listadoInput.value = listadoInput.value.replace(regex, reemplazarInput.value);
        buscarInput.value = '';
        reemplazarInput.value = '';
        buscarContador.textContent = '0/0';
        resultadosBusqueda = [];
        mostrarStatus(`${count} reemplazos`);
    }

    function rellenarFormulario() {
        const data = {
            codigo: codigoInput.value,
            dni: dniInput.value,
            nombre: nombreInput.value,
            afiliado: afiliadoInput.value,
            autoPrint: autoPrintCheckbox ? autoPrintCheckbox.checked : true
        };

        if (!data.codigo || !data.dni || !data.nombre || !data.afiliado) {
            mostrarStatus('Complete todos los campos', 'error');
            return;
        }

        // Guardar datos del primer rellenado
        const primerRelleno = {
            data: data,
            timestamp: Date.now(),
            ejecutado: false
        };
        
        localStorage.setItem('insssep_primer_relleno', JSON.stringify(primerRelleno));

        // Primer rellenado
        window.postMessage({
            tipo: 'insssep-autofill',
            accion: 'rellenar-formulario',
            datos: data
        }, '*');

        mostrarStatus(data.autoPrint ? 'Rellenando (1/2)...' : 'Rellenando formulario (1/2)...');
        
        // Marcar que el primer relleno se ejecutó (rápido para permitir el segundo)
        setTimeout(() => {
            primerRelleno.ejecutado = true;
            localStorage.setItem('insssep_primer_relleno', JSON.stringify(primerRelleno));
        }, 300);
    }

    function editarPaciente() {
        if (pacientes.length === 0) return;
        pacientes[pacienteIndex] = {
            codigo: codigoInput.value.trim(),
            dni: dniInput.value.trim(),
            nombre: nombreInput.value.trim(),
            afiliado: afiliadoInput.value.trim()
        };
        listadoInput.value = pacientes.map(p => `${p.codigo},${p.dni},${p.nombre},${p.afiliado}`).join('\n');
        nombreDisplay.textContent = pacientes[pacienteIndex].nombre;
        guardarDatos();
        mostrarStatus('Paciente editado');
    }

    // ===== EVENT LISTENERS =====

    // Dragging
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.af-btn-control')) return;
        isDragging = true;
        dragOffsetX = e.clientX - overlay.offsetLeft;
        dragOffsetY = e.clientY - overlay.offsetTop;
        overlay.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            overlay.style.left = (e.clientX - dragOffsetX) + 'px';
            overlay.style.top = (e.clientY - dragOffsetY) + 'px';
            overlay.style.right = 'auto';
        }
        if (isResizing) {
            overlay.style.width = Math.max(320, resizeStartWidth + (e.clientX - resizeStartX)) + 'px';
            overlay.style.height = Math.max(200, resizeStartHeight + (e.clientY - resizeStartY)) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) guardarDatos();
        isDragging = false;
        isResizing = false;
        overlay.style.cursor = 'default';
    });

    // Resizing
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = overlay.offsetWidth;
        resizeStartHeight = overlay.offsetHeight;
        e.preventDefault();
    });

    // Toggle sections
    document.querySelectorAll('.af-section-header').forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.af-toggle-btn')) {
                const targetId = header.dataset.target;
                const target = document.getElementById(targetId);
                const section = header.closest('.af-section');
                const btn = header.querySelector('.af-toggle-btn');
                const isCollapsed = target.style.display === 'none';
                target.style.display = isCollapsed ? '' : 'none';
                btn.innerHTML = isCollapsed ? ICONS.chevronDown : ICONS.chevronRight;
                section.classList.toggle('collapsed', !isCollapsed);
                guardarDatos();
            }
        });
    });

    // Minimize/Close
    minimizeBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        overlay.classList.toggle('af-minimized', isMinimized);
        minimizeBtn.innerHTML = isMinimized ? ICONS.maximize : ICONS.minimize;
        guardarDatos();
    });

    closeBtn.addEventListener('click', () => {
        if (confirm('Cerrar INSSSEP AutoFill?\n\nPresione F5 para volver a abrir.')) {
            overlay.remove();
            statusDiv.remove();
        }
    });

    // Botones principales
    cargarBtn.addEventListener('click', cargarPacientes);
    limpiarBtn.addEventListener('click', () => {
        listadoInput.value = '';
        pacientes = [];
        pacienteIndex = 0;
        mostrarPacienteActual();
        guardarDatos();
        mostrarStatus('Listado limpiado');
    });
    formatearBtn.addEventListener('click', formatearLista);

    // Navegacion
    anteriorBtn.addEventListener('click', anteriorPaciente);
    siguienteBtn.addEventListener('click', siguientePaciente);
    irBtn.addEventListener('click', irAPaciente);
    irNumeroInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') irAPaciente(); });

    // Buscar/Reemplazar
    buscarInput.addEventListener('input', buscarTexto);
    buscarAntBtn.addEventListener('click', buscarAnterior);
    buscarSigBtn.addEventListener('click', buscarSiguiente);
    reemplazarUnoBtn.addEventListener('click', reemplazarUno);
    reemplazarTodosBtn.addEventListener('click', reemplazarTodos);

    // Formulario
    rellenarBtn.addEventListener('click', rellenarFormulario);
    editarBtn.addEventListener('click', editarPaciente);

    // Auto-print checkbox
    if (autoPrintCheckbox) {
        autoPrintCheckbox.addEventListener('change', () => {
            guardarDatos();
            mostrarStatus(autoPrintCheckbox.checked ? 'Impresion automatica activada' : 'Impresion automatica desactivada');
        });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        if (overlay.classList.contains('af-minimized')) return;
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (isInput && e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            rellenarFormulario();
            return;
        }
        if (isInput) return;

        if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); anteriorPaciente(); }
        if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); siguientePaciente(); }
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); rellenarFormulario(); }
    });

    // Respuestas y acciones
    window.addEventListener('message', (e) => {
        if (e.data?.tipo === 'insssep-autofill-response') {
            mostrarStatus(e.data.mensaje, e.data.success ? 'success' : 'error');
            
            // Mostrar botón de reintentar si hubo error
            if (retryContainer) {
                retryContainer.style.display = e.data.success ? 'none' : 'block';
            }
        }
        
        // Escuchar acciones desde atajos de teclado
        if (e.data?.tipo === 'insssep-autofill-action') {
            switch (e.data.accion) {
                case 'rellenar-atajo':
                    rellenarFormulario();
                    break;
                case 'siguiente-atajo':
                    siguientePaciente();
                    break;
                case 'anterior-atajo':
                    anteriorPaciente();
                    break;
            }
        }
    });
    
    // Botón de reintentar
    if (reintentarBtn) {
        reintentarBtn.addEventListener('click', () => {
            rellenarFormulario();
            if (retryContainer) retryContainer.style.display = 'none';
        });
    }

    // Inicializacion
    const datosGuardados = cargarDatos();
    if (datosGuardados) {
        restaurarDatos(datosGuardados);
        mostrarStatus(`Datos recuperados: ${pacientes.length} pacientes`);
    } else {
        mostrarStatus('AutoFill listo - Pegue el listado y cargue');
    }
    
    // Detectar si estamos en página de ticket (consultaMedica.do)
    if (window.location.href.includes('consultaMedica.do')) {
        console.log('[AutoFill Overlay] Página de ticket detectada');
        
        // Verificar si necesitamos clickear Aceptar
        const necesitaAceptar = localStorage.getItem('insssep_needs_accept');
        if (necesitaAceptar === 'true') {
            mostrarStatus('Cerrá el diálogo de impresión para continuar...');
        } else {
            mostrarStatus('Ticket emitido - Imprimiendo automáticamente...');
        }
    }
    
    // Detectar si estamos en ticket.do (después de Aceptar) y vamos a redirigir
    if (window.location.href.includes('ticket.do')) {
        const vieneDeTicket = localStorage.getItem('insssep_viene_de_ticket');
        if (vieneDeTicket === 'true') {
            console.log('[AutoFill Overlay] Redirigiendo a Consulta Médica...');
            mostrarStatus('Volviendo a Consulta Médica...');
        }
    }
    

    


    // Verificar si hay un segundo relleno pendiente (después de recarga de página)
    setTimeout(() => {
        const primerRellenoStr = localStorage.getItem('insssep_primer_relleno');
        if (primerRellenoStr) {
            const primerRelleno = JSON.parse(primerRellenoStr);
            const ahora = Date.now();
            const tiempoTranscurrido = ahora - primerRelleno.timestamp;
            
            // Si el primer relleno fue ejecutado y pasaron entre 1 y 15 segundos, hacer el segundo
            if (primerRelleno.ejecutado && tiempoTranscurrido > 1000 && tiempoTranscurrido < 15000) {
                console.log('[AutoFill] Detectado segundo relleno pendiente después de recarga');
                mostrarStatus('Ejecutando segundo rellenado (2/2)...');
                
                // Ejecutar segundo rellenado inmediatamente
                window.postMessage({
                    tipo: 'insssep-autofill',
                    accion: 'rellenar-formulario',
                    datos: primerRelleno.data
                }, '*');
                
                mostrarStatus(primerRelleno.data.autoPrint ? 'Doble rellenado completado - Imprimiendo...' : 'Doble rellenado completado');
                
                // Limpiar el storage
                localStorage.removeItem('insssep_primer_relleno');
            } else if (tiempoTranscurrido >= 15000) {
                // Si pasaron más de 15 segundos, limpiar
                localStorage.removeItem('insssep_primer_relleno');
            }
        }
    }, 1000);
    
    // Detectar si acabamos de volver al formulario (init.do) y debemos avanzar al siguiente paciente
    // ESTO VA AL FINAL para asegurar que el overlay ya está creado
    if (window.location.href.includes('init.do') && window.location.href.includes('INSSSEP')) {
        const vieneDeConsultaMedica = localStorage.getItem('insssep_viene_de_consulta_medica');
        if (vieneDeConsultaMedica === 'true') {
            console.log('[AutoFill Overlay] Volvimos al formulario, preparando avance...');
            mostrarStatus('Avanzando al siguiente paciente...');
            
            // Doble verificación: esperar a que el overlay exista y luego hacer click
            function intentarClickSiguiente(intentos = 0) {
                const btnSiguiente = document.getElementById('af-siguiente');
                
                if (btnSiguiente) {
                    console.log(`[AutoFill Overlay] Botón Siguiente encontrado (intento ${intentos + 1}), haciendo click...`);
                    btnSiguiente.click();
                    mostrarStatus('Avanzado al siguiente paciente');
                    
                    // Limpiar flags después
                    setTimeout(() => {
                        localStorage.removeItem('insssep_viene_de_consulta_medica');
                        localStorage.removeItem('insssep_viene_de_ticket');
                    }, 500);
                } else if (intentos < 10) {
                    console.log(`[AutoFill Overlay] Botón no encontrado, reintentando... (${intentos + 1}/10)`);
                    setTimeout(() => intentarClickSiguiente(intentos + 1), 500);
                } else {
                    console.error('[AutoFill Overlay] No se pudo encontrar el botón después de 10 intentos');
                    mostrarStatus('Error: Botón no encontrado', 'error');
                    localStorage.removeItem('insssep_viene_de_consulta_medica');
                    localStorage.removeItem('insssep_viene_de_ticket');
                }
            }
            
            // Iniciar búsqueda del botón
            setTimeout(() => intentarClickSiguiente(0), 500);
        }
    }
    
    setInterval(() => { if (pacientes.length > 0) guardarDatos(); }, 30000);
})();
