# Guia de Agentes - AutoFill-PyMedica-INSSSSEP

Este documento permite a los agentes de Claude Code entender rapidamente el proyecto y trabajar de manera eficiente.

**LEER SIEMPRE PRIMERO**: `CLAUDE.md` - contiene el protocolo obligatorio de trabajo.

---

## Vision General

**AutoFill-PyMedica-INSSSSEP** automatiza el proceso de carga de datos de afiliados INSSSEP en el sistema online de la obra social. Consta de dos partes:

1. **App Web Flask** (Backend/app/): Procesa listas de afiliados y recetas, exporta datos
2. **Extension Chrome** (raiz/): Consume los datos exportados para autofill en el portal INSSSEP

```
┌─────────────────────────────────────────┐
│  Archivos de entrada                    │
│  - Lista de afiliados (.txt)            │
│  - Archivo de recetas INSSSEP (.txt)    │
└──────────┬──────────────────────────────┘
           │
           v
┌─────────────────────────────────────────┐
│  App Flask (localhost:5000)             │
│  - Detecta formato automaticamente      │
│  - Cruza afiliados con recetas          │
│  - Valida segun reglas de negocio       │
│  - Exporta lista para extension         │
└──────────┬──────────────────────────────┘
           │ lista_extension.txt
           │ CODIGO,DNI,NOMBRE,DNI
           v
┌─────────────────────────────────────────┐
│  Extension Chrome                       │
│  - Usuario pega lista en popup          │
│  - Abre portal INSSSEP online           │
│  - Autofill de formulario de consultas  │
└──────────┬──────────────────────────────┘
           │
           v
┌─────────────────────────────────────────┐
│  Portal INSSSEP                         │
│  https://online.insssep.gob.ar/INSSSEP/ │
└─────────────────────────────────────────┘
```

---

## Estructura de Archivos Clave

```
AutoFill-PyMedica-INSSSSEP/
│
│   [EXTENSION CHROME - en raiz]
├── manifest.json      # Config extension (Manifest v3)
├── popup.html         # UI del popup de la extension
├── popup.js           # Logica del popup
├── content.js         # Script inyectado en portal INSSSEP
├── background.js      # Service worker
│
│   [BACKEND FLASK]
├── Backend/app/
│   ├── app.py                 # Entry point Flask + todas las rutas API
│   ├── processors/
│   │   └── data_processor.py  # NUCLEO: toda la logica de negocio
│   ├── static/
│   │   ├── css/style.css      # Estilos de la app web
│   │   └── js/app.js          # Frontend vanilla JS
│   ├── templates/
│   │   └── index.html         # Unica pagina HTML
│   ├── requirements.txt       # Flask, flask-cors, gunicorn, python-dotenv
│   └── gunicorn_config.py     # Config para produccion
│
│   [PYTHON ENV]
└── venv/              # Entorno virtual Python
```

---

## Archivos Mas Importantes

Para entender el sistema, leer en este orden:

1. **`CLAUDE.md`** - Protocolo de trabajo y vision completa
2. **`Backend/app/processors/data_processor.py`** - Toda la logica de negocio
3. **`Backend/app/app.py`** - Rutas Flask y orquestacion
4. **`Backend/app/static/js/app.js`** - Frontend: como el usuario interactua
5. **`content.js`** - Como la extension hace el autofill
6. **`popup.js`** - Como la extension recibe los datos del usuario

---

## Clases y Responsabilidades

### `data_processor.py`

| Clase | Responsabilidad |
|-------|-----------------|
| `FormatoEntrada` | Enum: RECETAS_INSSSEP, LISTA_FORMATEADA, DESCONOCIDO |
| `EstadoValidacion` | Enum: VALIDO, ADVERTENCIA, EXCEPCION, ERROR |
| `Afiliado` | Dataclass con todos los datos de un afiliado |
| `DetectorFormato` | Detecta automaticamente el tipo de archivo |
| `ProcesadorRecetasINSSSEP` | Parsea archivos de recetas del sistema INSSSEP |
| `ProcesadorListaFormateada` | Parsea listas de afiliados formateadas |
| `ProcesadorUnificado` | Orquesta procesamiento + exportacion |

### `app.py`

| Ruta | Responsabilidad |
|------|-----------------|
| `POST /api/procesar` | Recibe archivo(s), llama a ProcesadorUnificado |
| `POST /api/procesar/texto` | Recibe texto pegado, misma logica |
| `GET /api/exportar/<formato>` | extension/csv/detallado/final |
| `GET /api/filtrar/<estado>` | Filtra por valido/advertencia/excepcion/error |
| `GET /api/estadisticas` | Estadisticas del procesamiento actual |

---

## Logica de Negocio Critica

### Reglas de validacion de consultas
```
<= 2  -> VALIDO (verde)
== 3  -> ADVERTENCIA (amarillo) - limite estandar
== 4  -> EXCEPCION (naranja) - se puede justificar
>= 5  -> ERROR (rojo) - excedido
```

### Conversion recetas a consultas
```python
# Cada 4 recetas equivalen a 1 consulta, redondeo hacia arriba
consultas_de_recetas = (recetas + 3) // 4
```

### Duplicacion de lineas en exportacion
```
# El archivo para la extension repite cada afiliado N veces
# donde N = consultas_directas + consultas_de_recetas
# Si N == 0, genera al menos 1 linea
```

### Formato de exportacion para extension
```
CODIGO,DNI,NOMBRE_SIN_ESPACIOS,DNI
# El 4to campo es SIEMPRE DNI (nunca credencial del archivo)
# Nombre sin espacios: afiliado.nombre.replace(' ', '')
```

---

## Tipos de Procesamiento

### Modo 1: Archivo unico
- Recibe un archivo y detecta formato automaticamente
- Si es lista formateada: cuenta consultas por DNI
- Si son recetas: cuenta recetas por DNI

### Modo 2: Cruce (dos archivos)
- `archivo_afiliados`: Lista formateada (base de consultas)
- `archivo_recetas`: Archivo de recetas INSSSEP
- Cruza por DNI y suma ambas fuentes

### Modo texto
- Igual que los modos anteriores pero con texto pegado directamente

---

## Convenciones de Codigo

### Python (backend)
- Clases en PascalCase: `ProcesadorUnificado`, `FormatoEntrada`
- Metodos en snake_case: `procesar_archivo`, `exportar_para_extension`
- Variables en snake_case: `texto_afiliados`, `codigo_diagnostico`
- Logging: `logger.info(...)`, `logger.error(..., exc_info=True)`
- Siempre `encoding='utf-8'` al leer/escribir archivos
- Timestamps en nombres de archivo: `YYYYMMDD_HHMMSS`

### JavaScript (frontend y extension)
- camelCase para funciones y variables: `configurarTabs`, `datosActuales`
- Estado global en objeto `app = {}`
- Referencias DOM en objeto `elementos = {}`
- Fetch a la API Flask en `API_BASE = ''` (mismo origen)

---

## Flujo de Datos Completo

```
Usuario sube archivo(s)
  -> app.py recibe en /api/procesar
  -> Guarda en uploads/ con timestamp
  -> ProcesadorUnificado.procesar_archivo() o .procesar_ambos_archivos()
    -> DetectorFormato.detectar() (si archivo unico)
    -> ProcesadorListaFormateada.procesar() y/o ProcesadorRecetasINSSSEP.procesar()
    -> _validar_consultas() -> asigna EstadoValidacion a cada Afiliado
    -> _generar_estadisticas()
  -> app.py serializa afiliados a JSON
  -> Frontend muestra tabla con estados y estadisticas

Usuario hace click en "Exportar para extension"
  -> app.py /api/exportar/extension
  -> ProcesadorUnificado.exportar_para_extension()
    -> Itera afiliados ordenados por frecuencia
    -> Calcula total_consultas (directas + de recetas)
    -> Duplica linea N veces
  -> Devuelve archivo .txt para descargar

Usuario copia y pega en extension Chrome
  -> popup.js parsea el texto linea por linea
  -> Extrae CODIGO, DNI, NOMBRE, CREDENCIAL
  -> Al presionar "Cargar campos", autocompleta el formulario INSSSEP
```

---

## Notas para el Agente

1. **Estado de sesion**: `procesador_actual` en `app.py` es global - diseno single-user
2. **No hay base de datos**: Todo en memoria durante la sesion Flask
3. **Archivos acumulados**: `uploads/` y `exports/` no se limpian automaticamente
4. **Extension y backend son independientes**: La extension solo consume el archivo .txt exportado
5. **Patron de recetas**: Regex critico en `ProcesadorRecetasINSSSEP.PATRON_RECETA` - cambiar con extremo cuidado
6. **Codigos de diagnostico**: Por defecto `B349`, configurable por el usuario en la UI
7. **El servidor de desarrollo es suficiente**: Para uso local, `python app.py` es adecuado
