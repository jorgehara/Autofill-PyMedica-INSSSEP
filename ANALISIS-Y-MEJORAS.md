# Análisis Completo del Proyecto AutoFill-PyMedica-INSSSSEP

## Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Entendimiento del Proyecto](#entendimiento-del-proyecto)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Análisis Detallado por Componente](#análisis-detallado-por-componente)
5. [Sugerencias de Mejora](#sugerencias-de-mejora)
6. [Plan de Implementación de Mejoras](#plan-de-implementación-de-mejoras)

---

## Resumen Ejecutivo

**AutoFill-PyMedica-INSSSSEP** es un sistema híbrido compuesto por:
- **Backend Python**: Scripts para procesar y extraer datos de afiliados de INSSSEP desde archivos de recetas
- **Extensión de Chrome**: Herramienta de autocompletado para el sistema web de INSSSEP

### Propósito Principal
Automatizar el proceso de carga de consultas médicas en el sistema INSSSEP, reduciendo el tiempo de entrada manual de datos y minimizando errores.

### Tecnologías Utilizadas
- **Backend**: Python 3.x con librerías estándar (re, collections, os)
- **Frontend**: JavaScript vanilla, Chrome Extension Manifest V3
- **Comunicación**: Chrome Storage API para persistencia de datos

---

## Entendimiento del Proyecto

### Flujo de Trabajo Completo

#### Fase 1: Procesamiento de Datos (Backend Python)
```
Archivos de Recetas (TXT)
    ↓
[Paso 1] extractor_datos_paso1.py
    → Extrae afiliados de INSSSEP AMB
    → Genera lista_afiliados_recetas.txt
    ↓
[Paso 2] extractor_datos_paso2.py
    → Convierte a formato CSV
    → Genera lista_afiliados_recetas_desestructurado.csv
    ↓
[Paso 3] ordenar_por_frecuencia_paso3.py
    → Ordena por frecuencia de apariciones
    → Genera archivo ordenado
    ↓
[Paso 4] contabilizar_ordenes_cheking_paso4.py
    → Genera reporte de análisis
    → Detecta inconsistencias
    ↓
[Paso 6] formatear_lista_final_para_extension_paso6.py
    → Formatea datos para la extensión
    → Formato: codigo,dni,nombre,afiliado
```

#### Fase 2: Autocompletado Web (Extensión Chrome)
```
Usuario carga listado en popup.html
    ↓
popup.js procesa y guarda en chrome.storage
    ↓
Usuario navega a online.insssep.gob.ar
    ↓
content.js detecta la página
    ↓
Usuario hace clic en "Rellenar"
    ↓
Autocompletado automático de formularios
    ↓
Validación y envío de consulta
```

### Componentes Principales

#### Backend (Python)
1. **extractor_datos_paso1.py** - Extractor principal de datos
   - Patrón regex para INSSSEP AMB
   - Conteo de recetas por afiliado
   - Generación de diagnósticos por defecto

2. **extractor_datos_paso2.py** - Conversor a CSV
   - Desestructura el archivo de texto
   - Genera CSV simple con Nombre, DNI, Recetas

3. **ordenar_por_frecuencia_paso3.py** - Ordenador por frecuencia
   - Usa Counter de collections
   - Ordena de mayor a menor apariciones

4. **contabilizar_ordenes_cheking_paso4.py** - Analizador y validador
   - Detecta inconsistencias (titular/beneficiario)
   - Identifica afiliados con alta frecuencia
   - Genera reportes detallados

5. **formatear_lista_final_para_extension_paso6.py** - Formateador final
   - Prepara datos para la extensión
   - Formato: codigo,dni,nombreCompleto,afiliado

#### Frontend (Extensión Chrome)

1. **manifest.json** - Configuración de la extensión
   - Manifest V3
   - Permisos: activeTab, storage
   - Host permissions para INSSSEP y localhost

2. **popup.html/popup.js** - Interfaz de usuario
   - Textarea para pegar listado
   - Navegación entre pacientes (anterior/siguiente/ir a)
   - Almacenamiento persistente en chrome.storage.local
   - Formateo y guardado de listado

3. **content.js** - Script de inyección
   - Autofill automático del formulario INSSSEP
   - Manejo de dos pantallas:
     - Pantalla 1: Identificación del afiliado
     - Pantalla 2: Diagnóstico y validación
   - Clicks automatizados en botones

4. **background.js** - Service Worker
   - Manejo de mensajes entre componentes
   - Logging básico

---

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│           BACKEND (Python Scripts)              │
├─────────────────────────────────────────────────┤
│  Archivos de entrada:                           │
│  - archivos-recetas.txt                         │
│  - Nuevo Listado a partir de 03 de Dic.txt     │
│  - Nuevo Listado a partir de 061125.txt        │
│                                                  │
│  Pipeline de procesamiento:                     │
│  [Paso 1] → [Paso 2] → [Paso 3] → [Paso 4]    │
│     ↓          ↓          ↓          ↓          │
│   TXT       CSV       Ordenado   Reporte        │
│                                                  │
│  [Paso 6] Formateo final → lista_formateada.txt│
└─────────────────────────────────────────────────┘
                        ↓
                  Usuario copia datos
                        ↓
┌─────────────────────────────────────────────────┐
│        FRONTEND (Chrome Extension)              │
├─────────────────────────────────────────────────┤
│  popup.html + popup.js                          │
│  ┌──────────────────────────────────┐          │
│  │ [Textarea - Pegar listado]       │          │
│  │ [Formatear] [Guardar]            │          │
│  │ [←] [Paciente 1/N] [→] [Ir]     │          │
│  │                                   │          │
│  │ Código: _____                    │          │
│  │ DNI: _____                       │          │
│  │ Nombre: _____                    │          │
│  │ Afiliado: _____                  │          │
│  │ [Rellenar]                       │          │
│  └──────────────────────────────────┘          │
│              ↓ chrome.storage.local             │
│        content.js (inyectado)                   │
│              ↓                                   │
│   https://online.insssep.gob.ar                │
│              ↓                                   │
│   Autofill automático de formularios           │
└─────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Archivo TXT → Regex Parser → Estructuración → CSV → Ordenamiento
                                                       ↓
                                              Análisis + Validación
                                                       ↓
                                              Formateo para Extension
                                                       ↓
                                              Chrome Storage
                                                       ↓
                                              Autofill en Web
```

---

## Análisis Detallado por Componente

### Backend Python

#### Fortalezas
- **Modularidad**: Cada paso tiene su propio script
- **Regex robusto**: Maneja variaciones en el formato (Dispensada, saltos de línea)
- **Análisis completo**: Detecta inconsistencias y genera reportes

#### Debilidades

##### 1. **Código Duplicado** (Crítico)
- `extractor_datos_paso1.py` tiene dos funciones que hacen lo mismo:
  - `extraer_datos()` (líneas 4-47)
  - `extraer_insssep_amb()` (líneas 49-82)

##### 2. **Hardcoded Paths** (Alto)
- Rutas absolutas en archivos:
  ```python
  # encontrar_afiliados_3_apariciones_txt.py:16
  'c:/Users/JorgeHaraDevs/Desktop/AutoFill-PyMedica-INSSSSEP/Backend/test.txt'
  ```
- Nombres de archivos hardcodeados:
  ```python
  # contabilizar_ordenes_cheking_paso4.py:85
  archivo_entrada = 'Filtrados de menor a mayor.txt'
  ```

##### 3. **Sin Manejo de Errores** (Alto)
- Falta validación de archivos
- No hay try-except en la mayoría de scripts
- Posibles crashes silenciosos

##### 4. **Inconsistencia en Rutas** (Medio)
- `extractor_datos_paso2.py:4` usa 'Resultados/'
- `extractor_datos_paso1.py:28` usa 'resultados/' (minúscula)

##### 5. **Código Muerto** (Medio)
```python
# formatear_lista_final_para_extension_paso6.py:36
return nombre_formateado  # Variable que no existe
# Línea 63: procesar_archivo llamado dos veces
```

##### 6. **Sin Documentación** (Medio)
- Falta docstrings en la mayoría de funciones
- No hay comentarios explicativos del flujo

##### 7. **Sin Tests** (Medio)
- No hay pruebas unitarias
- Dificulta refactoring seguro

##### 8. **Nombres de Variables Poco Claros** (Bajo)
```python
# ordenar_por_frecuencia_paso3.py:6
input_file = 'Filtrados de menor a mayor.txt'  # Nombre confuso
```

### Frontend (Extensión Chrome)

#### Fortalezas
- **Persistencia**: Uso correcto de chrome.storage.local
- **Navegación intuitiva**: Botones anterior/siguiente/ir a paciente
- **Autofill completo**: Maneja todo el flujo de INSSSEP
- **Visual feedback**: Mensajes de estado al usuario

#### Debilidades

##### 1. **Timeouts Hardcodeados** (Alto)
```javascript
// content.js:16,22,60,70,96,102
setTimeout(() => { ... }, 500);   // ¿Por qué 500ms?
setTimeout(() => { ... }, 1000);  // ¿Por qué 1000ms?
setTimeout(() => { ... }, 1500);  // ¿Por qué 1500ms?
setTimeout(() => { ... }, 3000);  // ¿Por qué 3000ms?
```
**Problema**: Valores mágicos, puede fallar en conexiones lentas

##### 2. **Código Duplicado en content.js** (Alto)
- Lógica de autofill repetida en dos lugares:
  - `continuarFlujoAutofill()` (línea 3)
  - Listener de mensajes (línea 121)

##### 3. **Sin Validación de Datos** (Alto)
```javascript
// popup.js:34
const partes = datosRaw.split(/\s+/);
if (partes.length >= 4) {  // ¿Qué pasa si length < 4?
    // ... acceso sin validación
}
```

##### 4. **Parsing Frágil** (Alto)
```javascript
// popup.js:46-52
// Busca números en el array sin validar posición
while (i < partes.length) {
    if (/^\d+$/.test(partes[i])) {
        afiliado = partes[i];
        break;
    }
    i++;
}
```

##### 5. **Código Muerto en background.js** (Medio)
```javascript
// background.js:10-26
// Manejo de mensajes que nunca se usan
if (request.type === "fillForm" || request.type === "clearForm") {
    // Este código no se ejecuta porque no hay mensajes de este tipo
}
```

##### 6. **Falta Manejo de Errores** (Alto)
```javascript
// popup.js:69-77
chrome.tabs.sendMessage(tabs[0].id, {...});
// No hay .catch() ni validación de respuesta
```

##### 7. **Selectores Frágiles** (Alto)
```javascript
// content.js:12,17,23,42,43,52,61
document.getElementById('tipoIdentificacionSelected')
// Si INSSSEP cambia los IDs, todo se rompe
```

##### 8. **Estilos Inline** (Bajo)
```html
<!-- popup.html:10 -->
<body style="font-family: Arial, sans-serif; padding: 16px; ...">
```
**Problema**: Dificulta mantenimiento y reutilización

##### 9. **Sin Logging Consistente** (Bajo)
- Mezcla de console.log y console.warn
- No hay niveles de logging (debug, info, error)

---

## Sugerencias de Mejora

### Prioridad CRÍTICA

#### 1. Manejo de Errores Robusto

**Backend Python**
```python
# Agregar a TODOS los scripts
import logging
from typing import Optional, Dict, List

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('procesamiento.log'),
        logging.StreamHandler()
    ]
)

def extraer_datos_seguro(archivo: str) -> Optional[Dict]:
    """
    Extrae datos de archivo con manejo de errores completo.

    Args:
        archivo: Ruta al archivo de entrada

    Returns:
        Dict con datos extraídos o None si hay error

    Raises:
        FileNotFoundError: Si el archivo no existe
        UnicodeDecodeError: Si el encoding es incorrecto
    """
    try:
        if not os.path.exists(archivo):
            logging.error(f"Archivo no encontrado: {archivo}")
            return None

        with open(archivo, 'r', encoding='utf-8') as f:
            texto = f.read()

        if not texto.strip():
            logging.warning(f"Archivo vacío: {archivo}")
            return None

        # Procesar...
        logging.info(f"Archivo procesado exitosamente: {archivo}")
        return datos

    except UnicodeDecodeError as e:
        logging.error(f"Error de encoding en {archivo}: {e}")
        return None
    except Exception as e:
        logging.error(f"Error inesperado: {e}", exc_info=True)
        return None
```

**Frontend JavaScript**
```javascript
// Agregar a popup.js y content.js
class AutoFillError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AutoFillError';
        this.code = code;
    }
}

async function rellenarFormularioSeguro(datos) {
    try {
        // Validar datos
        if (!datos || !datos.dni || !datos.codigo) {
            throw new AutoFillError('Datos incompletos', 'INVALID_DATA');
        }

        const tabs = await chrome.tabs.query({active: true, currentWindow: true});

        if (!tabs || tabs.length === 0) {
            throw new AutoFillError('No hay pestaña activa', 'NO_TAB');
        }

        const response = await chrome.tabs.sendMessage(tabs[0].id, {
            accion: 'rellenar-formulario',
            ...datos
        });

        if (!response || !response.success) {
            throw new AutoFillError('Error en content script', 'CONTENT_ERROR');
        }

        mostrarMensajeEstado('Formulario rellenado correctamente', 'success');

    } catch (error) {
        console.error('[AutoFill Error]', error);

        let mensaje = 'Error desconocido';
        if (error instanceof AutoFillError) {
            mensaje = error.message;
        } else if (error.message.includes('Could not establish connection')) {
            mensaje = 'Asegúrate de estar en la página de INSSSEP';
        }

        mostrarMensajeEstado(mensaje, 'error');
    }
}
```

#### 2. Configuración Centralizada

**Crear archivo `config.py`**
```python
# Backend/config.py
from pathlib import Path
from typing import Dict

class Config:
    """Configuración centralizada del proyecto."""

    # Directorios
    BASE_DIR = Path(__file__).parent
    ARCHIVOS_DIR = BASE_DIR / 'archivos'
    RESULTADOS_DIR = BASE_DIR / 'Resultados'

    # Archivos de entrada
    ARCHIVO_RECETAS = ARCHIVOS_DIR / 'archivos-recetas.txt'
    LISTADO_DICIEMBRE = ARCHIVOS_DIR / 'Nuevo Listado a partir de 03 de Dic.txt'
    LISTADO_NOVIEMBRE = ARCHIVOS_DIR / 'Nuevo Listado a partir de 061125.txt'

    # Archivos de salida
    LISTA_AFILIADOS = RESULTADOS_DIR / 'lista_afiliados_recetas.txt'
    LISTA_CSV = RESULTADOS_DIR / 'lista_afiliados_recetas_desestructurado.csv'
    LISTA_ORDENADA = RESULTADOS_DIR / 'lista_ordenada.txt'
    REPORTE_ANALISIS = RESULTADOS_DIR / 'reporte_analisis_afiliados.txt'
    LISTA_FORMATEADA = RESULTADOS_DIR / 'lista_formateada_final.txt'

    # Patrones regex
    PATRON_INSSSEP = r"INSSSEP AMB(?:\s*\nDispensada)?\s*\nAfiliado:\s*(.*?)\s*\nD\.N\.I\.: ?(\d+)\s*Credencial:\s*(\d+)"

    # Diagnósticos por defecto
    DIAGNOSTICOS_DEFAULT = ['B349', 'J029', 'Z000', 'J129', 'T784']

    # Configuración de logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = BASE_DIR / 'procesamiento.log'

    @classmethod
    def crear_directorios(cls):
        """Crea directorios necesarios si no existen."""
        cls.ARCHIVOS_DIR.mkdir(exist_ok=True)
        cls.RESULTADOS_DIR.mkdir(exist_ok=True)

    @classmethod
    def validar_archivos_entrada(cls) -> Dict[str, bool]:
        """Valida existencia de archivos de entrada."""
        return {
            'recetas': cls.ARCHIVO_RECETAS.exists(),
            'diciembre': cls.LISTADO_DICIEMBRE.exists(),
            'noviembre': cls.LISTADO_NOVIEMBRE.exists()
        }

# Uso en scripts:
# from config import Config
# Config.crear_directorios()
# with open(Config.ARCHIVO_RECETAS, 'r') as f:
#     ...
```

**Crear archivo `config.js`**
```javascript
// Frontend/config.js
const CONFIG = {
    // URLs
    INSSSEP_URL: 'https://online.insssep.gob.ar/INSSSEP/',

    // Selectores DOM
    SELECTORS: {
        tipoIdentificacion: 'tipoIdentificacionSelected',
        numeroIdentificacion: 'numeroIdentificacion',
        tipoDiagnostico: 'tipoDiagnosticoSelected',
        codigoDiagnostico: 'codigoDiagnostico',
        radioConsulta: 'radioConsultaID_0',
        btnContinuar: "input[name='Continuar']",
        btnValidar: "input[name='Consumir']"
    },

    // Timeouts (en milisegundos)
    TIMEOUTS: {
        shortDelay: 500,
        mediumDelay: 1000,
        longDelay: 1500,
        buttonClick: 3000
    },

    // Valores por defecto
    DEFAULTS: {
        tipoDiagnostico: "2",  // Definitivo
        tipoIdentificacion: "3"  // DNI
    },

    // Configuración de retry
    RETRY: {
        maxIntentos: 10,
        intervalo: 500
    },

    // Storage keys
    STORAGE_KEYS: {
        textarea: 'autofillTextarea',
        listadoPacientes: 'autofillListadoPacientes',
        pacienteIndex: 'autofillPacienteIndex',
        autofillData: 'autofillData'
    },

    // Mensajes
    MESSAGES: {
        listadoGuardado: 'Listado guardado en memoria.',
        sinPacientes: 'Sin pacientes',
        errorPagina: 'Asegúrate de estar en la página de INSSSEP',
        errorConexion: 'No se pudo conectar con la página'
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
```

#### 3. Refactorización de Timeouts

**Crear sistema de espera basado en eventos**
```javascript
// utils.js
class DOMWaiter {
    /**
     * Espera a que un elemento exista en el DOM
     * @param {string} selector - Selector CSS del elemento
     * @param {number} timeout - Tiempo máximo de espera (ms)
     * @param {number} interval - Intervalo entre comprobaciones (ms)
     * @returns {Promise<Element>}
     */
    static waitForElement(selector, timeout = 5000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElement = () => {
                const element = document.getElementById(selector) ||
                               document.querySelector(selector);

                if (element) {
                    console.log(`[DOMWaiter] Elemento encontrado: ${selector}`);
                    resolve(element);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    console.error(`[DOMWaiter] Timeout esperando: ${selector}`);
                    reject(new Error(`Timeout esperando elemento: ${selector}`));
                    return;
                }

                setTimeout(checkElement, interval);
            };

            checkElement();
        });
    }

    /**
     * Espera a que un elemento sea visible e interactuable
     */
    static async waitForInteractable(selector, timeout = 5000) {
        const element = await this.waitForElement(selector, timeout);

        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkInteractable = () => {
                const isVisible = element.offsetParent !== null;
                const isEnabled = !element.disabled;

                if (isVisible && isEnabled) {
                    resolve(element);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Elemento no interactuable: ${selector}`));
                    return;
                }

                setTimeout(checkInteractable, 100);
            };

            checkInteractable();
        });
    }
}

// Uso mejorado en content.js
async function continuarFlujoAutofillMejorado() {
    try {
        const data = await obtenerDatosStorage();
        if (!data) return;

        // Pantalla 1: Identificación
        const selectIdent = document.getElementById('tipoIdentificacionSelected');
        if (selectIdent) {
            selectIdent.value = CONFIG.DEFAULTS.tipoIdentificacion;
            selectIdent.dispatchEvent(new Event('change', { bubbles: true }));

            // Esperar a que aparezca el input (en vez de timeout fijo)
            const inputDni = await DOMWaiter.waitForElement('numeroIdentificacion', 2000);
            inputDni.value = data.afiliado;
            inputDni.dispatchEvent(new Event('input', { bubbles: true }));

            // Esperar a que el botón sea clickeable
            const btnContinuar = await DOMWaiter.waitForInteractable(
                CONFIG.SELECTORS.btnContinuar,
                2000
            );
            btnContinuar.click();
            return;
        }

        // Pantalla 2: Diagnóstico
        const selectorTipo = await DOMWaiter.waitForElement('tipoDiagnosticoSelected', 5000);
        const inputCodigo = await DOMWaiter.waitForElement('codigoDiagnostico', 5000);

        selectorTipo.value = CONFIG.DEFAULTS.tipoDiagnostico;
        selectorTipo.dispatchEvent(new Event('change', { bubbles: true }));

        inputCodigo.value = data.codigo || "";
        inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));

        const radioConsulta = await DOMWaiter.waitForInteractable('radioConsultaID_0', 2000);
        radioConsulta.click();

        const btnValidar = await DOMWaiter.waitForInteractable(CONFIG.SELECTORS.btnValidar, 2000);
        btnValidar.click();

        chrome.runtime.sendMessage({ accion: 'cerrar-popup' });

    } catch (error) {
        console.error('[AutoFill Error]', error);
        mostrarMensajeError('Error al rellenar formulario: ' + error.message);
    }
}
```

### Prioridad ALTA

#### 4. Validación de Datos

**Backend**
```python
# validators.py
from typing import Dict, List, Optional
import re

class DataValidator:
    """Validador de datos de afiliados."""

    @staticmethod
    def validar_dni(dni: str) -> bool:
        """Valida formato de DNI."""
        if not dni:
            return False
        return bool(re.match(r'^\d{7,8}$', dni))

    @staticmethod
    def validar_credencial(credencial: str) -> bool:
        """Valida formato de credencial."""
        if not credencial:
            return False
        return bool(re.match(r'^\d{10}$', credencial))

    @staticmethod
    def validar_nombre(nombre: str) -> bool:
        """Valida formato de nombre."""
        if not nombre or len(nombre) < 3:
            return False
        # Solo letras, espacios y caracteres especiales comunes
        return bool(re.match(r'^[A-ZÁÉÍÓÚÑ ,.\'-]+$', nombre.upper()))

    @staticmethod
    def validar_codigo_diagnostico(codigo: str) -> bool:
        """Valida formato de código de diagnóstico CIE-10."""
        if not codigo:
            return False
        # Formato CIE-10: Letra + 2-3 dígitos (ej: B349, J029)
        return bool(re.match(r'^[A-Z]\d{2,3}$', codigo.upper()))

    @staticmethod
    def validar_afiliado(afiliado: Dict) -> tuple[bool, List[str]]:
        """
        Valida un afiliado completo.

        Returns:
            tuple: (es_valido, lista_errores)
        """
        errores = []

        if not DataValidator.validar_dni(afiliado.get('dni', '')):
            errores.append(f"DNI inválido: {afiliado.get('dni')}")

        if not DataValidator.validar_credencial(afiliado.get('credencial', '')):
            errores.append(f"Credencial inválida: {afiliado.get('credencial')}")

        if not DataValidator.validar_nombre(afiliado.get('nombre', '')):
            errores.append(f"Nombre inválido: {afiliado.get('nombre')}")

        return (len(errores) == 0, errores)

# Uso en extractor_datos_paso1.py
def extraer_datos_validado(texto: str):
    coincidencias = re.findall(Config.PATRON_INSSSEP, texto, re.MULTILINE)

    datos_validos = []
    errores_validacion = []

    for nombre, dni, credencial in coincidencias:
        afiliado = {
            'nombre': nombre.strip(),
            'dni': dni.strip(),
            'credencial': credencial.strip()
        }

        es_valido, errores = DataValidator.validar_afiliado(afiliado)

        if es_valido:
            datos_validos.append(afiliado)
        else:
            errores_validacion.append({
                'afiliado': afiliado,
                'errores': errores
            })
            logging.warning(f"Afiliado inválido: {errores}")

    if errores_validacion:
        with open(Config.RESULTADOS_DIR / 'errores_validacion.log', 'w') as f:
            for item in errores_validacion:
                f.write(f"{item['afiliado']}: {item['errores']}\n")

    return datos_validos
```

**Frontend**
```javascript
// validators.js
class FormValidator {
    static validarDNI(dni) {
        if (!dni) return { valido: false, error: 'DNI vacío' };

        const dniLimpio = dni.toString().replace(/\D/g, '');

        if (dniLimpio.length < 7 || dniLimpio.length > 8) {
            return { valido: false, error: 'DNI debe tener 7 u 8 dígitos' };
        }

        return { valido: true };
    }

    static validarCodigo(codigo) {
        if (!codigo) return { valido: false, error: 'Código vacío' };

        const codigoUpper = codigo.toUpperCase();
        const regex = /^[A-Z]\d{2,3}$/;

        if (!regex.test(codigoUpper)) {
            return {
                valido: false,
                error: 'Código debe tener formato CIE-10 (ej: B349)'
            };
        }

        return { valido: true };
    }

    static validarNombre(nombre) {
        if (!nombre) return { valido: false, error: 'Nombre vacío' };

        if (nombre.length < 3) {
            return { valido: false, error: 'Nombre muy corto' };
        }

        const regex = /^[A-ZÁÉÍÓÚÑ ,.\'-]+$/i;
        if (!regex.test(nombre)) {
            return {
                valido: false,
                error: 'Nombre contiene caracteres inválidos'
            };
        }

        return { valido: true };
    }

    static validarPaciente(paciente) {
        const errores = [];

        const validacionDNI = this.validarDNI(paciente.dni);
        if (!validacionDNI.valido) errores.push(validacionDNI.error);

        const validacionCodigo = this.validarCodigo(paciente.codigo);
        if (!validacionCodigo.valido) errores.push(validacionCodigo.error);

        const validacionNombre = this.validarNombre(paciente.nombre);
        if (!validacionNombre.valido) errores.push(validacionNombre.error);

        return {
            valido: errores.length === 0,
            errores
        };
    }
}

// Uso en popup.js
document.getElementById('rellenarBtn').addEventListener('click', function(e) {
    e.preventDefault();

    const paciente = {
        codigo: document.getElementById('codigo').value,
        dni: document.getElementById('dni').value,
        nombre: document.getElementById('nombre').value,
        afiliado: document.getElementById('afiliado').value
    };

    const validacion = FormValidator.validarPaciente(paciente);

    if (!validacion.valido) {
        mostrarMensajeEstado(
            'Datos inválidos: ' + validacion.errores.join(', '),
            'error'
        );
        return;
    }

    // Continuar con el envío...
});
```

#### 5. Eliminar Código Duplicado

**Backend: Unificar funciones en extractor_datos_paso1.py**
```python
# ANTES: Dos funciones duplicadas
def extraer_datos(texto: str):
    # ...código...

def extraer_insssep_amb(texto: str):
    # ...código duplicado...

# DESPUÉS: Una función reutilizable
def extraer_insssep_amb(
    texto: str,
    incluir_diagnosticos: bool = True,
    diagnosticos_default: Optional[List[str]] = None
) -> Dict:
    """
    Extrae afiliados de INSSSEP AMB del texto.

    Args:
        texto: Texto con datos de recetas
        incluir_diagnosticos: Si True, agrega diagnósticos por defecto
        diagnosticos_default: Lista de diagnósticos a usar

    Returns:
        Dict con 'afiliados' y 'estadisticas'
    """
    logging.info("Iniciando extracción de datos INSSSEP AMB")

    coincidencias = re.findall(Config.PATRON_INSSSEP, texto, re.MULTILINE)
    logging.info(f"Encontradas {len(coincidencias)} coincidencias")

    conteo_recetas = {}
    datos_afiliados = {}

    for nombre, dni, credencial in coincidencias:
        afiliado = {
            'nombre': nombre.strip(),
            'dni': dni.strip(),
            'credencial': credencial.strip()
        }

        # Validar datos
        es_valido, errores = DataValidator.validar_afiliado(afiliado)
        if not es_valido:
            logging.warning(f"Afiliado inválido: {errores}")
            continue

        dni_clean = afiliado['dni']
        conteo_recetas[dni_clean] = conteo_recetas.get(dni_clean, 0) + 1
        datos_afiliados[dni_clean] = (afiliado['nombre'], afiliado['credencial'])

    return {
        'conteo_recetas': conteo_recetas,
        'datos_afiliados': datos_afiliados,
        'total_coincidencias': len(coincidencias),
        'afiliados_unicos': len(datos_afiliados)
    }

def generar_archivo_salida(
    resultado: Dict,
    ruta_salida: Path,
    incluir_diagnosticos: bool = True
):
    """Genera el archivo de salida formateado."""
    Config.crear_directorios()

    diagnosticos_str = ', '.join(Config.DIAGNOSTICOS_DEFAULT) if incluir_diagnosticos else ''

    with open(ruta_salida, 'w', encoding='utf-8') as f:
        f.write("LISTADO DE AFILIADOS INSSSEP AMB Y CANTIDAD DE RECETAS\n")
        f.write("=" * 54 + "\n\n")

        dnis_ordenados = sorted(
            resultado['conteo_recetas'].keys(),
            key=lambda x: resultado['conteo_recetas'][x],
            reverse=True
        )

        for i, dni in enumerate(dnis_ordenados, 1):
            nombre, credencial = resultado['datos_afiliados'][dni]
            cantidad = resultado['conteo_recetas'][dni]

            f.write(f"{i}. {nombre}\n")
            f.write(f"   DNI: {dni}\n")
            f.write(f"   Credencial: {credencial}\n")
            f.write(f"   Obra social: INSSSEP AMB\n")
            f.write(f"   Consultas: 0\n")
            f.write(f"   Recetas: {cantidad}\n")

            if incluir_diagnosticos:
                f.write(f"   Diagnóstico: {diagnosticos_str}\n")

            f.write("-" * 50 + "\n")

    logging.info(f"Archivo guardado en: {ruta_salida}")
```

**Frontend: Unificar lógica de autofill**
```javascript
// content.js - Versión refactorizada

class AutoFillManager {
    constructor() {
        this.data = null;
        this.waiter = DOMWaiter;
    }

    async cargarDatos() {
        return new Promise((resolve) => {
            chrome.storage.local.get(CONFIG.STORAGE_KEYS.autofillData, (result) => {
                this.data = result[CONFIG.STORAGE_KEYS.autofillData];
                resolve(this.data);
            });
        });
    }

    async rellenarPantallaIdentificacion() {
        console.log('[AutoFill] Rellenando pantalla de identificación');

        const selectIdent = await this.waiter.waitForElement(
            CONFIG.SELECTORS.tipoIdentificacion
        );

        selectIdent.value = CONFIG.DEFAULTS.tipoIdentificacion;
        selectIdent.dispatchEvent(new Event('change', { bubbles: true }));

        const inputDni = await this.waiter.waitForElement(
            CONFIG.SELECTORS.numeroIdentificacion
        );

        inputDni.value = this.data.afiliado;
        inputDni.dispatchEvent(new Event('input', { bubbles: true }));

        const btnContinuar = await this.waiter.waitForInteractable(
            CONFIG.SELECTORS.btnContinuar
        );

        btnContinuar.click();
        console.log('[AutoFill] Click en Continuar');
    }

    async rellenarPantallaDiagnostico() {
        console.log('[AutoFill] Rellenando pantalla de diagnóstico');

        const selectorTipo = await this.waiter.waitForElement(
            CONFIG.SELECTORS.tipoDiagnostico,
            CONFIG.TIMEOUTS.longDelay * 3
        );

        selectorTipo.value = CONFIG.DEFAULTS.tipoDiagnostico;
        selectorTipo.dispatchEvent(new Event('change', { bubbles: true }));

        const inputCodigo = await this.waiter.waitForElement(
            CONFIG.SELECTORS.codigoDiagnostico
        );

        inputCodigo.value = this.data.codigo || "";
        inputCodigo.dispatchEvent(new Event('input', { bubbles: true }));

        const radioConsulta = await this.waiter.waitForInteractable(
            CONFIG.SELECTORS.radioConsulta
        );

        radioConsulta.click();
        console.log('[AutoFill] Radio clickeado');

        const btnValidar = await this.waiter.waitForInteractable(
            CONFIG.SELECTORS.btnValidar
        );

        btnValidar.click();
        console.log('[AutoFill] Botón Validar clickeado');

        chrome.runtime.sendMessage({ accion: 'cerrar-popup' });
    }

    async ejecutarFlujo() {
        try {
            await this.cargarDatos();

            if (!this.data) {
                console.log('[AutoFill] No hay datos para autofill');
                return;
            }

            // Detectar en qué pantalla estamos
            const esPantallaIdentificacion = document.getElementById(
                CONFIG.SELECTORS.tipoIdentificacion
            ) !== null;

            if (esPantallaIdentificacion) {
                await this.rellenarPantallaIdentificacion();
            } else {
                await this.rellenarPantallaDiagnostico();
            }

        } catch (error) {
            console.error('[AutoFill Error]', error);
            throw error;
        }
    }
}

// Uso simplificado
const autoFillManager = new AutoFillManager();

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.href.includes('insssep.gob.ar')) {
        setTimeout(() => autoFillManager.ejecutarFlujo(), 1500);
    }
});

// Escuchar mensajes desde popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.accion === 'rellenar-formulario') {
        console.log('[AutoFill] Mensaje recibido desde popup');

        chrome.storage.local.set({ autofillData: request }, async function() {
            await autoFillManager.ejecutarFlujo();
            sendResponse({ success: true });
        });

        return true; // Mantener canal abierto para async
    }
});
```

### Prioridad MEDIA

#### 6. Implementar Pipeline de Procesamiento

```python
# pipeline.py
from pathlib import Path
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass
from enum import Enum

class PasoEstado(Enum):
    """Estados posibles de un paso del pipeline."""
    PENDIENTE = "pendiente"
    EN_PROCESO = "en_proceso"
    COMPLETADO = "completado"
    ERROR = "error"
    OMITIDO = "omitido"

@dataclass
class ResultadoPaso:
    """Resultado de ejecutar un paso del pipeline."""
    nombre: str
    estado: PasoEstado
    datos: Optional[Dict] = None
    error: Optional[str] = None
    tiempo_ejecucion: float = 0.0

class PasoPipeline:
    """Clase base para pasos del pipeline."""

    def __init__(self, nombre: str):
        self.nombre = nombre
        self.logger = logging.getLogger(f"Pipeline.{nombre}")

    def validar_entrada(self, datos_entrada: Dict) -> tuple[bool, Optional[str]]:
        """
        Valida que los datos de entrada sean correctos.

        Returns:
            tuple: (es_valido, mensaje_error)
        """
        return True, None

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        """
        Ejecuta el paso del pipeline.

        Args:
            datos_entrada: Datos del paso anterior

        Returns:
            Dict con resultados del paso
        """
        raise NotImplementedError

    def procesar(self, datos_entrada: Dict) -> ResultadoPaso:
        """
        Procesa el paso con validación y manejo de errores.
        """
        import time

        self.logger.info(f"Iniciando paso: {self.nombre}")
        inicio = time.time()

        try:
            # Validar entrada
            es_valido, error = self.validar_entrada(datos_entrada)
            if not es_valido:
                return ResultadoPaso(
                    nombre=self.nombre,
                    estado=PasoEstado.ERROR,
                    error=f"Validación fallida: {error}"
                )

            # Ejecutar
            resultado = self.ejecutar(datos_entrada)

            tiempo = time.time() - inicio
            self.logger.info(f"Paso completado en {tiempo:.2f}s")

            return ResultadoPaso(
                nombre=self.nombre,
                estado=PasoEstado.COMPLETADO,
                datos=resultado,
                tiempo_ejecucion=tiempo
            )

        except Exception as e:
            tiempo = time.time() - inicio
            self.logger.error(f"Error en paso: {e}", exc_info=True)

            return ResultadoPaso(
                nombre=self.nombre,
                estado=PasoEstado.ERROR,
                error=str(e),
                tiempo_ejecucion=tiempo
            )

class Paso1Extraccion(PasoPipeline):
    """Paso 1: Extracción de datos desde archivos de recetas."""

    def __init__(self):
        super().__init__("Extracción de datos")

    def validar_entrada(self, datos_entrada: Dict) -> tuple[bool, Optional[str]]:
        archivo = datos_entrada.get('archivo_entrada')

        if not archivo:
            return False, "No se especificó archivo de entrada"

        if not Path(archivo).exists():
            return False, f"Archivo no existe: {archivo}"

        return True, None

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        archivo = datos_entrada['archivo_entrada']

        with open(archivo, 'r', encoding='utf-8') as f:
            texto = f.read()

        resultado = extraer_insssep_amb(texto)

        # Guardar resultado
        generar_archivo_salida(resultado, Config.LISTA_AFILIADOS)

        return {
            'afiliados': resultado['datos_afiliados'],
            'conteo_recetas': resultado['conteo_recetas'],
            'archivo_salida': str(Config.LISTA_AFILIADOS),
            'estadisticas': {
                'total_coincidencias': resultado['total_coincidencias'],
                'afiliados_unicos': resultado['afiliados_unicos']
            }
        }

class Paso2ConversionCSV(PasoPipeline):
    """Paso 2: Conversión a formato CSV."""

    def __init__(self):
        super().__init__("Conversión a CSV")

    def validar_entrada(self, datos_entrada: Dict) -> tuple[bool, Optional[str]]:
        if 'archivo_salida' not in datos_entrada:
            return False, "No hay archivo del paso anterior"

        archivo = Path(datos_entrada['archivo_salida'])
        if not archivo.exists():
            return False, f"Archivo no existe: {archivo}"

        return True, None

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        archivo_entrada = datos_entrada['archivo_salida']

        # Lógica de conversión a CSV...
        registros = []

        with open(archivo_entrada, encoding='utf-8') as f:
            # ... parsear y convertir ...
            pass

        # Escribir CSV
        with open(Config.LISTA_CSV, 'w', encoding='utf-8') as f:
            f.write('Nombre,DNI,Recetas\n')
            for reg in registros:
                f.write(f'"{reg[0]}",{reg[1]},{reg[2]}\n')

        return {
            'archivo_csv': str(Config.LISTA_CSV),
            'total_registros': len(registros)
        }

class Paso3Ordenamiento(PasoPipeline):
    """Paso 3: Ordenamiento por frecuencia."""

    def __init__(self):
        super().__init__("Ordenamiento por frecuencia")

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        # Lógica de ordenamiento...
        return {
            'archivo_ordenado': str(Config.LISTA_ORDENADA)
        }

class Paso4Analisis(PasoPipeline):
    """Paso 4: Análisis y generación de reportes."""

    def __init__(self):
        super().__init__("Análisis y reportes")

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        # Lógica de análisis...
        return {
            'archivo_reporte': str(Config.REPORTE_ANALISIS)
        }

class Paso6Formateo(PasoPipeline):
    """Paso 6: Formateo final para extensión."""

    def __init__(self):
        super().__init__("Formateo para extensión")

    def ejecutar(self, datos_entrada: Dict) -> Dict:
        # Lógica de formateo...
        return {
            'archivo_final': str(Config.LISTA_FORMATEADA)
        }

class Pipeline:
    """Pipeline completo de procesamiento de datos."""

    def __init__(self):
        self.pasos: List[PasoPipeline] = [
            Paso1Extraccion(),
            Paso2ConversionCSV(),
            Paso3Ordenamiento(),
            Paso4Analisis(),
            Paso6Formateo()
        ]
        self.logger = logging.getLogger("Pipeline")

    def ejecutar(self, datos_iniciales: Dict) -> List[ResultadoPaso]:
        """
        Ejecuta todos los pasos del pipeline en secuencia.

        Args:
            datos_iniciales: Datos para el primer paso

        Returns:
            Lista de resultados de cada paso
        """
        resultados = []
        datos_actuales = datos_iniciales

        for paso in self.pasos:
            self.logger.info(f"\n{'='*60}")
            self.logger.info(f"Ejecutando: {paso.nombre}")
            self.logger.info(f"{'='*60}")

            resultado = paso.procesar(datos_actuales)
            resultados.append(resultado)

            if resultado.estado == PasoEstado.ERROR:
                self.logger.error(f"Pipeline detenido por error en: {paso.nombre}")
                break

            # Pasar datos al siguiente paso
            datos_actuales = resultado.datos or {}

        self._generar_resumen(resultados)
        return resultados

    def _generar_resumen(self, resultados: List[ResultadoPaso]):
        """Genera un resumen de la ejecución del pipeline."""
        self.logger.info(f"\n{'='*60}")
        self.logger.info("RESUMEN DE EJECUCIÓN")
        self.logger.info(f"{'='*60}")

        total_tiempo = sum(r.tiempo_ejecucion for r in resultados)
        completados = sum(1 for r in resultados if r.estado == PasoEstado.COMPLETADO)
        errores = sum(1 for r in resultados if r.estado == PasoEstado.ERROR)

        self.logger.info(f"Total de pasos: {len(resultados)}")
        self.logger.info(f"Completados: {completados}")
        self.logger.info(f"Con errores: {errores}")
        self.logger.info(f"Tiempo total: {total_tiempo:.2f}s")

        for resultado in resultados:
            estado_emoji = {
                PasoEstado.COMPLETADO: "✓",
                PasoEstado.ERROR: "✗",
                PasoEstado.EN_PROCESO: "⋯",
                PasoEstado.PENDIENTE: "○",
                PasoEstado.OMITIDO: "⊘"
            }

            emoji = estado_emoji.get(resultado.estado, "?")
            self.logger.info(
                f"  {emoji} {resultado.nombre}: {resultado.estado.value} "
                f"({resultado.tiempo_ejecucion:.2f}s)"
            )

            if resultado.error:
                self.logger.error(f"    Error: {resultado.error}")

# main.py - Punto de entrada
def main():
    # Configurar logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(Config.LOG_FILE),
            logging.StreamHandler()
        ]
    )

    # Crear directorios necesarios
    Config.crear_directorios()

    # Configurar pipeline
    pipeline = Pipeline()

    # Ejecutar
    datos_iniciales = {
        'archivo_entrada': Config.ARCHIVO_RECETAS
    }

    resultados = pipeline.ejecutar(datos_iniciales)

    # Verificar resultado final
    ultimo_resultado = resultados[-1]
    if ultimo_resultado.estado == PasoEstado.COMPLETADO:
        print("\n✓ Pipeline completado exitosamente")
        print(f"Archivo final: {ultimo_resultado.datos.get('archivo_final')}")
        return 0
    else:
        print("\n✗ Pipeline finalizado con errores")
        return 1

if __name__ == "__main__":
    exit(main())
```

#### 7. Tests Unitarios

```python
# tests/test_validators.py
import pytest
from validators import DataValidator

class TestDataValidator:

    def test_validar_dni_valido(self):
        assert DataValidator.validar_dni("12345678") == True
        assert DataValidator.validar_dni("1234567") == True

    def test_validar_dni_invalido(self):
        assert DataValidator.validar_dni("123") == False
        assert DataValidator.validar_dni("abc") == False
        assert DataValidator.validar_dni("") == False
        assert DataValidator.validar_dni(None) == False

    def test_validar_credencial_valida(self):
        assert DataValidator.validar_credencial("8000012214") == True

    def test_validar_credencial_invalida(self):
        assert DataValidator.validar_credencial("123") == False
        assert DataValidator.validar_credencial("abc") == False

    def test_validar_nombre_valido(self):
        assert DataValidator.validar_nombre("JUAN PÉREZ") == True
        assert DataValidator.validar_nombre("MARÍA DEL CARMEN") == True

    def test_validar_nombre_invalido(self):
        assert DataValidator.validar_nombre("AB") == False
        assert DataValidator.validar_nombre("123") == False
        assert DataValidator.validar_nombre("") == False

    def test_validar_codigo_diagnostico_valido(self):
        assert DataValidator.validar_codigo_diagnostico("B349") == True
        assert DataValidator.validar_codigo_diagnostico("J029") == True

    def test_validar_codigo_diagnostico_invalido(self):
        assert DataValidator.validar_codigo_diagnostico("123") == False
        assert DataValidator.validar_codigo_diagnostico("ABC") == False
        assert DataValidator.validar_codigo_diagnostico("") == False

    def test_validar_afiliado_completo_valido(self):
        afiliado = {
            'dni': '12345678',
            'credencial': '8000012214',
            'nombre': 'JUAN PÉREZ'
        }
        es_valido, errores = DataValidator.validar_afiliado(afiliado)
        assert es_valido == True
        assert len(errores) == 0

    def test_validar_afiliado_completo_invalido(self):
        afiliado = {
            'dni': '123',
            'credencial': 'abc',
            'nombre': 'AB'
        }
        es_valido, errores = DataValidator.validar_afiliado(afiliado)
        assert es_valido == False
        assert len(errores) > 0

# tests/test_extractor.py
import pytest
from unittest.mock import mock_open, patch
from extractor_datos_paso1 import extraer_insssep_amb

class TestExtractorDatos:

    def test_extraer_datos_basico(self):
        texto = """
        INSSSEP AMB
        Afiliado: JUAN PÉREZ
        D.N.I.: 12345678 Credencial: 8000012214
        """

        resultado = extraer_insssep_amb(texto)

        assert resultado['afiliados_unicos'] == 1
        assert '12345678' in resultado['datos_afiliados']

    def test_extraer_datos_con_dispensada(self):
        texto = """
        INSSSEP AMB
        Dispensada
        Afiliado: JUAN PÉREZ
        D.N.I.: 12345678 Credencial: 8000012214
        """

        resultado = extraer_insssep_amb(texto)

        assert resultado['afiliados_unicos'] == 1

    def test_conteo_recetas_multiples(self):
        texto = """
        INSSSEP AMB
        Afiliado: JUAN PÉREZ
        D.N.I.: 12345678 Credencial: 8000012214

        INSSSEP AMB
        Afiliado: JUAN PÉREZ
        D.N.I.: 12345678 Credencial: 8000012214
        """

        resultado = extraer_insssep_amb(texto)

        assert resultado['conteo_recetas']['12345678'] == 2

# Ejecutar tests:
# pytest tests/ -v
```

#### 8. Documentación Mejorada

```python
# Backend/README.md

# Backend - Sistema de Procesamiento de Datos INSSSEP

## Descripción

Pipeline de procesamiento de datos de afiliados de INSSSEP desde archivos de recetas médicas.

## Requisitos

```bash
Python 3.8+
pip install -r requirements.txt
```

## Estructura de Archivos

```
Backend/
├── config.py                          # Configuración centralizada
├── validators.py                      # Validadores de datos
├── pipeline.py                        # Pipeline de procesamiento
├── main.py                           # Punto de entrada
├── extractor_datos_paso1.py          # [LEGACY] Extractor
├── requirements.txt                   # Dependencias
├── archivos/                         # Archivos de entrada
│   └── archivos-recetas.txt
└── Resultados/                       # Archivos generados
    ├── lista_afiliados_recetas.txt
    ├── lista_afiliados_recetas_desestructurado.csv
    ├── lista_ordenada.txt
    ├── reporte_analisis_afiliados.txt
    └── lista_formateada_final.txt
```

## Uso Rápido

### Ejecutar Pipeline Completo

```bash
cd Backend
python main.py
```

### Ejecutar Paso Individual

```python
from config import Config
from pipeline import Paso1Extraccion

paso1 = Paso1Extraccion()
resultado = paso1.procesar({
    'archivo_entrada': Config.ARCHIVO_RECETAS
})

print(resultado)
```

## Pasos del Pipeline

### Paso 1: Extracción de Datos
- **Entrada**: `archivos-recetas.txt`
- **Salida**: `lista_afiliados_recetas.txt`
- **Función**: Extrae datos de afiliados usando regex

### Paso 2: Conversión a CSV
- **Entrada**: `lista_afiliados_recetas.txt`
- **Salida**: `lista_afiliados_recetas_desestructurado.csv`
- **Función**: Convierte a formato tabular

### Paso 3: Ordenamiento
- **Entrada**: CSV del paso anterior
- **Salida**: `lista_ordenada.txt`
- **Función**: Ordena por frecuencia de apariciones

### Paso 4: Análisis
- **Entrada**: Lista ordenada
- **Salida**: `reporte_analisis_afiliados.txt`
- **Función**: Genera reportes y detecta inconsistencias

### Paso 6: Formateo Final
- **Entrada**: Lista analizada
- **Salida**: `lista_formateada_final.txt`
- **Función**: Formatea para uso en extensión Chrome

## Configuración

Editar `config.py` para modificar:
- Rutas de archivos
- Patrones regex
- Diagnósticos por defecto
- Nivel de logging

## Validaciones

El sistema valida:
- ✓ DNI (7-8 dígitos)
- ✓ Credencial (10 dígitos)
- ✓ Nombre (solo letras y espacios)
- ✓ Código diagnóstico (formato CIE-10)

## Logging

Los logs se guardan en `procesamiento.log` con formato:
```
2024-10-13 12:30:45 - Pipeline.Extracción - INFO - Paso completado en 2.34s
```

## Tests

```bash
pytest tests/ -v
```

## Solución de Problemas

### Error: "Archivo no encontrado"
- Verificar que existe `archivos/archivos-recetas.txt`
- Ejecutar `Config.crear_directorios()`

### Error: "Encoding incorrecto"
- Asegurarse que archivos usen UTF-8

### Error: "No se encontraron coincidencias"
- Verificar formato del archivo de entrada
- Revisar patrón regex en `config.py`
```

### Prioridad BAJA

#### 9. Separar Estilos CSS

```css
/* Frontend/styles.css */

:root {
    --primary-color: #1976d2;
    --success-color: #43a047;
    --warning-color: #ffa000;
    --error-color: #f14c4c;
    --info-color: #009688;
    --bg-color: #f5f5f5;
    --text-color: #333;
    --border-color: #ccc;

    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;

    --border-radius: 4px;
    --font-family: Arial, sans-serif;
}

body {
    font-family: var(--font-family);
    padding: var(--spacing-md);
    background: var(--bg-color);
    border-radius: var(--border-radius);
    width: 450px;
    box-sizing: border-box;
}

/* Textarea para listado */
.listado-textarea {
    width: 400px;
    height: 120px;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-family: monospace;
}

/* Botones */
.btn {
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn:hover {
    opacity: 0.9;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-success {
    background: var(--success-color);
    color: white;
}

.btn-warning {
    background: var(--warning-color);
    color: white;
}

.btn-info {
    background: var(--info-color);
    color: white;
}

.btn-secondary {
    background: #888;
    color: white;
}

/* Navegación de pacientes */
.navegacion-pacientes {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.paciente-actual {
    font-weight: bold;
    color: var(--primary-color);
}

.ir-paciente-input {
    width: 60px;
    text-align: center;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    font-weight: bold;
}

/* Formulario */
.formulario {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    max-width: 350px;
    margin: 0 auto;
}

.formulario label {
    font-weight: bold;
    margin-bottom: var(--spacing-xs);
}

.formulario input {
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
}

/* Mensajes de estado */
.mensaje-estado {
    margin: var(--spacing-md) 0;
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    text-align: center;
    font-weight: bold;
}

.mensaje-success {
    background: #0f401b;
    color: #4ec9b0;
    border: 1px solid #1e4e2e;
}

.mensaje-error {
    background: #4e1c24;
    color: var(--error-color);
    border: 1px solid #6e2936;
}

.mensaje-info {
    background: var(--primary-color);
    color: white;
    border: 1px solid var(--primary-color);
}

/* Nombre grande del paciente */
.nombre-grande {
    font-size: 1.3em;
    font-weight: bold;
    color: var(--primary-color);
    text-align: center;
    margin: var(--spacing-md) 0 var(--spacing-xs) 0;
}
```

```html
<!-- popup.html - Versión con CSS externo -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INSSSEP AutoFill PyMedica</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="listado-container">
        <textarea id="datos"
                  class="listado-textarea"
                  placeholder="Pegue el listado tabulado aquí...">
        </textarea>
    </div>

    <div class="botones-accion">
        <button type="button" id="formatearLista" class="btn btn-info">
            Formatear lista
        </button>
        <button type="button" id="guardarListado" class="btn btn-warning">
            Guardar listado en memoria
        </button>
    </div>

    <div class="navegacion-pacientes">
        <button type="button" id="anteriorPaciente" class="btn btn-secondary">
            Anterior
        </button>
        <span id="pacienteActual" class="paciente-actual">
            Paciente 1 de 1
        </span>
        <button type="button" id="siguientePaciente" class="btn btn-secondary">
            Siguiente
        </button>
        <input type="number"
               id="irPaciente"
               class="ir-paciente-input"
               min="1"
               value="1"
               title="Ir al paciente">
        <button type="button" id="btnIrPaciente" class="btn btn-primary">
            Ir
        </button>
        <span id="totalPacientes"></span>
    </div>

    <form id="datosForm" class="formulario">
        <button type="button" id="cargarCampos" class="btn btn-success">
            Cargar campos
        </button>

        <label for="codigo">Código:</label>
        <input type="text" id="codigo" name="codigo" required>

        <label for="dni">DNI:</label>
        <input type="text" id="dni" name="dni" required>

        <label for="nombre">Nombre completo:</label>
        <input type="text" id="nombre" name="nombre" required>

        <label for="afiliado">N° Afiliado:</label>
        <input type="text" id="afiliado" name="afiliado" required>

        <button type="submit" class="btn btn-primary">
            Rellenar
        </button>
    </form>

    <script src="config.js"></script>
    <script src="validators.js"></script>
    <script src="popup.js"></script>
</body>
</html>
```

---

## Plan de Implementación de Mejoras

### Fase 1: Fundamentos (1-2 semanas)
**Objetivo**: Establecer base sólida y reducir deuda técnica

1. **Semana 1**
   - [ ] Crear `config.py` con configuración centralizada
   - [ ] Implementar `validators.py` con validación de datos
   - [ ] Agregar manejo de errores básico a todos los scripts
   - [ ] Crear archivo `requirements.txt` actualizado
   - [ ] Eliminar código duplicado en `extractor_datos_paso1.py`

2. **Semana 2**
   - [ ] Crear `config.js` para frontend
   - [ ] Implementar `validators.js`
   - [ ] Extraer estilos a `styles.css`
   - [ ] Agregar manejo de errores a popup.js y content.js
   - [ ] Documentar estructura del proyecto

### Fase 2: Robustez (2-3 semanas)
**Objetivo**: Mejorar confiabilidad y mantenibilidad

3. **Semana 3**
   - [ ] Implementar `DOMWaiter` para reemplazar timeouts
   - [ ] Refactorizar `content.js` con `AutoFillManager`
   - [ ] Agregar logging consistente en frontend
   - [ ] Implementar retry logic para operaciones críticas

4. **Semana 4-5**
   - [ ] Crear `pipeline.py` con sistema de pasos
   - [ ] Migrar scripts existentes a nuevo pipeline
   - [ ] Agregar tests unitarios básicos (cobertura >50%)
   - [ ] Implementar sistema de logging robusto

### Fase 3: Optimización (1-2 semanas)
**Objetivo**: Mejorar experiencia de usuario y performance

5. **Semana 6**
   - [ ] Optimizar parsing de datos (eliminar código ineficiente)
   - [ ] Agregar indicadores de progreso en popup
   - [ ] Implementar caché para evitar reprocesamiento
   - [ ] Mejorar feedback visual al usuario

6. **Semana 7**
   - [ ] Testing end-to-end
   - [ ] Optimización de performance
   - [ ] Documentación completa de usuario
   - [ ] Preparar release v2.0

### Fase 4: Extras (Opcional)
**Objetivo**: Funcionalidades avanzadas

7. **Futuro**
   - [ ] Interfaz web para configuración
   - [ ] Exportación a múltiples formatos
   - [ ] Dashboard de estadísticas
   - [ ] Notificaciones push
   - [ ] Sincronización en la nube

---

## Métricas de Código Actual

### Backend
- **Líneas de código**: ~500 líneas
- **Archivos Python**: 8 scripts
- **Cobertura de tests**: 0%
- **Documentación**: Baja (solo README básico)
- **Duplicación de código**: ~15%
- **Deuda técnica**: Media-Alta

### Frontend
- **Líneas de código**: ~450 líneas
- **Archivos JS**: 3 archivos
- **Cobertura de tests**: 0%
- **Documentación**: Baja
- **Duplicación de código**: ~10%
- **Deuda técnica**: Media

### Mejoras Esperadas Post-Refactor
- **Cobertura de tests**: >70%
- **Duplicación de código**: <5%
- **Documentación**: Alta
- **Deuda técnica**: Baja
- **Tiempo de procesamiento**: -30%
- **Tasa de errores**: -80%

---

## Conclusión

Este proyecto tiene una **arquitectura sólida** pero necesita **refactorización** para ser mantenible a largo plazo. Las principales áreas de mejora son:

1. **Manejo de errores** (crítico)
2. **Configuración centralizada** (crítico)
3. **Eliminación de código duplicado** (alto)
4. **Validación de datos** (alto)
5. **Sistema de timeouts** (alto)
6. **Tests unitarios** (medio)
7. **Documentación** (medio)

Con las mejoras propuestas, el proyecto será:
- Más robusto y confiable
- Más fácil de mantener y extender
- Mejor documentado
- Con menor tasa de errores
- Más rápido y eficiente

**Recomendación**: Comenzar con las mejoras de **Prioridad CRÍTICA** ya que impactan directamente en la estabilidad del sistema.
