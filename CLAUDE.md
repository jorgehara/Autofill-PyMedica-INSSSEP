# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## PROTOCOLO OBLIGATORIO DE TRABAJO

**CONTEXTO CRITICO**: Esta es una herramienta de procesamiento medico en uso activo. Los cambios afectan la logica de negocio (calculos de consultas/recetas) y la extension Chrome. Un error en la logica de exportacion puede romper el autofill de formularios en el sistema INSSSEP.

**REGLA FUNDAMENTAL**: NUNCA escribir codigo sin completar las 3 FASES obligatorias.

---

### FASE 1: ENTENDIMIENTO (OBLIGATORIO)

Cuando recibas una tarea de modificacion, DEBES hacer PRIMERO:

1. **Leer el codigo existente** relacionado con la tarea
   - Usa Read, Grep, Glob para explorar
   - Entiende el contexto actual antes de proponer cambios

2. **Hacer preguntas especificas** para clarificar EXACTAMENTE que cambiar
   - Que funcionalidad especifica hay que modificar?
   - Hay algun comportamiento existente que deba preservarse?
   - Cual es el alcance exacto del cambio?

3. **Identificar el alcance minimo** (que tocar, que NO tocar)
   - Lista archivos que SI se modificaran
   - Lista archivos que NO deben tocarse
   - Codigo minimo necesario

4. **Detectar riesgos** (que podria romperse)
   - Dependencias entre backend y extension Chrome
   - Logica de negocio critica (formulas de conversion recetas->consultas)
   - Formato de exportacion que consume la extension

---

### FASE 2: PLAN (MOSTRAR Y ESPERAR APROBACION)

Antes de escribir UNA SOLA LINEA de codigo, DEBES presentar:

```
## PLAN DE IMPLEMENTACION

### RESUMEN (2-3 lineas):
[Que voy a cambiar exactamente]

### ARCHIVOS A MODIFICAR:
1. ruta/archivo1.ext - [Que cambio especifico]
2. ruta/archivo2.ext - [Que cambio especifico]

### CAMBIOS DETALLADOS:
[Descripcion especifica de cada cambio]

### RIESGOS IDENTIFICADOS:
- [Que podria fallar]
- [Mitigaciones]

### Procedo con este plan?
```

**STOP - Esperar aprobacion explicita del usuario antes de continuar**

---

### FASE 3: IMPLEMENTACION (PASO A PASO)

**SOLO despues de aprobacion explicita:**

1. **Un cambio a la vez**
   - Modificar un archivo
   - Explicar que estas haciendo
   - Mostrar el cambio

2. **Codigo minimo necesario**
   - No agregar funcionalidades extra
   - No refactorizar codigo que funciona
   - No "mejorar" cosas no solicitadas

3. **Verificar que funcione**
   - Revisar logica critica (calculos de consultas, formato de exportacion)
   - Sin errores de sintaxis Python

---

### PROHIBICIONES ABSOLUTAS

- NO escribir codigo sin pasar por FASE 1 y FASE 2
- NO agregar features no solicitadas
- NO refactorizar codigo existente que funciona
- NO tocar archivos fuera del alcance minimo
- NO asumir - SIEMPRE preguntar si hay duda
- NO cambiar el formato de exportacion (CODIGO,DNI,NOMBRE_SIN_ESPACIOS,DNI) sin confirmar

---

## Project Overview

**AutoFill-PyMedica-INSSSSEP** es un sistema en dos partes:
1. **Extension Chrome**: Autofill de formularios en https://online.insssep.gob.ar/INSSSEP/
2. **Flask Backend**: Procesamiento de listas de afiliados y archivos de recetas INSSSEP

**Tech Stack:**
- Backend: Python 3 + Flask + python-dotenv + flask-cors + gunicorn
- Frontend web: Vanilla JavaScript + CSS puro (sin frameworks)
- Extension: Chrome Extension Manifest v3 (JS puro)

## Estructura del Proyecto

```
AutoFill-PyMedica-INSSSSEP/
├── manifest.json         # Chrome Extension config
├── popup.html            # Extension popup UI
├── popup.js              # Extension popup logic
├── content.js            # Inyectado en INSSSEP web
├── background.js         # Service worker extension
├── Backend/
│   └── app/
│       ├── app.py                    # Flask entry point + rutas API
│       ├── processors/
│       │   ├── __init__.py
│       │   └── data_processor.py     # LOGICA DE NEGOCIO CRITICA
│       ├── static/
│       │   ├── css/style.css
│       │   └── js/app.js             # Frontend JS
│       ├── templates/
│       │   └── index.html            # HTML principal
│       ├── uploads/                  # Archivos subidos (timestamped)
│       ├── exports/                  # Archivos exportados (timestamped)
│       ├── requirements.txt
│       ├── gunicorn_config.py
│       └── .env.example
└── venv/                 # Python virtual environment
```

## Comandos de Desarrollo

```bash
# Desde Backend/app/
python app.py                         # Modo desarrollo (puerto 5000)
gunicorn -c gunicorn_config.py app:app  # Modo produccion
```

## API Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/procesar` | Procesar archivo(s) subidos |
| POST | `/api/procesar/texto` | Procesar texto pegado |
| GET | `/api/exportar/extension` | Exportar para extension Chrome |
| GET | `/api/exportar/csv` | Exportar CSV completo |
| GET | `/api/exportar/detallado` | Exportar reporte detallado |
| GET | `/api/filtrar/<estado>` | Filtrar por estado de validacion |
| GET | `/api/estadisticas` | Estadisticas actuales |

## Formatos Soportados

### Formato 1: Recetas INSSSEP
Patron: bloque con `INSSSEP AMB`, `Afiliado:`, `D.N.I.:`, `Credencial:`

### Formato 2: Lista Formateada
Patron: `CODIGO DNI NOMBRE Titular/Beneficiario CREDENCIAL [CUIL]`

### Modo Cruce (ambos archivos)
Lista formateada (afiliados base) + Archivo de recetas INSSSEP

## Logica de Negocio Critica

### Reglas de Validacion
```python
<= 2 consultas  -> VALIDO
== 3 consultas  -> ADVERTENCIA
== 4 consultas  -> EXCEPCION
>  4 consultas  -> ERROR
```

### Conversion Recetas -> Consultas
```python
# Cada 4 recetas = 1 consulta (redondeo hacia arriba)
consultas_de_recetas = (recetas + 3) // 4
total = consultas_directas + consultas_de_recetas
```

### Formato de Exportacion para Extension
```
CODIGO,DNI,NOMBRE_SIN_ESPACIOS,DNI
# Nota: el 4to campo es SIEMPRE el DNI (no la credencial del archivo)
# Las lineas se DUPLICAN segun total de consultas
```

## Clases Principales (data_processor.py)

```python
FormatoEntrada(Enum)      # RECETAS_INSSSEP | LISTA_FORMATEADA | DESCONOCIDO
EstadoValidacion(Enum)    # VALIDO | ADVERTENCIA | EXCEPCION | ERROR
Afiliado(dataclass)       # codigo, dni, nombre, tipo, credencial, cuil, consultas, recetas
DetectorFormato           # .detectar(texto) -> FormatoEntrada
ProcesadorRecetasINSSSEP  # .procesar(texto, codigo_diagnostico) -> Dict[DNI, Afiliado]
ProcesadorListaFormateada # .procesar(texto) -> Dict[DNI, Afiliado]
ProcesadorUnificado       # Orquesta todo, metodos de exportacion
```

## Extension Chrome

### Flujo de uso
1. Usuario procesa lista en la app Flask (localhost:5000)
2. Exporta en formato "extension" -> archivo `lista_extension_*.txt`
3. Pega el contenido en el popup de la extension
4. Abre el sistema INSSSEP online
5. La extension autocompleta los campos del formulario

### Formato del textarea del popup
```
CODIGO DNI NOMBRE CREDENCIAL
# Una linea por consulta (duplicadas segun frecuencia)
```

## Patrones y Convenciones

### Backend Python
- Logging con `logger.info/error/warning` (prefijo de modulo automatico)
- `global procesador_actual` mantiene estado entre requests en la sesion
- Archivos guardados con timestamp: `YYYYMMDD_HHMMSS_nombre.ext`
- Siempre usar `encoding='utf-8'` al leer/escribir archivos

### Frontend JS
- Estado global en objeto `app = { datosActuales, filtroActivo }`
- Referencias DOM en objeto `elementos = {}`
- Funciones nombradas en camelCase descriptivo
- Sin frameworks, DOM puro

### Extension Chrome
- Manifest v3 (service worker, no background page)
- Comunicacion via `chrome.runtime.sendMessage` y `chrome.storage.local`
- Content script inyectado solo en `https://online.insssep.gob.ar/INSSSEP/*`

## Notas Importantes

1. **Estado de sesion**: `procesador_actual` es global en Flask - no es thread-safe para multiples usuarios simultaneos (uso single-user por diseno)
2. **Encoding**: Todos los archivos .txt usan UTF-8 (nombres con acentos)
3. **Archivos de uploads/exports**: No se limpian automaticamente - acumulan con el tiempo
4. **DNI como credencial**: En la exportacion para la extension, el 4to campo es SIEMPRE el DNI, nunca la credencial original del archivo de recetas
5. **Tipos de afiliado**: Titular, Beneficiario, Familiar - cada uno tiene logica de credencial diferente
