# Sistema de Procesamiento INSSSEP - Versión 2.0

## Descripción

Sistema web unificado para procesar datos de afiliados INSSSEP. Detecta automáticamente el formato de entrada y aplica reglas de validación de consultas.

## Características Principales

### ✨ Detección Automática de Formato
- **Recetas INSSSEP**: Extrae datos desde archivos de recetas médicas
- **Lista Formateada**: Procesa listas ya estructuradas (código, DNI, nombre, tipo, credencial)

### 🔍 Validación Inteligente
- Máximo 3 consultas por afiliado (estándar)
- Hasta 4 consultas por excepción
- Detecta y marca afiliados que exceden el límite

### 📊 Múltiples Formatos de Exportación
- **Para Extensión Chrome**: Formato CSV simple (codigo,dni,nombre,credencial)
- **CSV Completo**: Todos los campos con estado de validación
- **Reporte Detallado**: Documento formateado con análisis completo

### 🎨 Interfaz Moderna
- Drag & Drop para archivos
- Procesamiento de texto pegado
- Visualización de estadísticas en tiempo real
- Filtrado por estado (válidos, advertencias, excepciones, errores)

## Instalación

### 1. Requisitos Previos
```bash
Python 3.8 o superior
pip (gestor de paquetes de Python)
```

### 2. Instalar Dependencias
```bash
cd Backend/app
pip install -r requirements.txt
```

### 3. Ejecutar la Aplicación
```bash
python app.py
```

O usando el script de inicio:
```bash
# Windows
iniciar.bat

# Linux/Mac
./iniciar.sh
```

La aplicación estará disponible en: **http://localhost:5000**

## Uso

### Método 1: Subir Archivo

1. Abre la aplicación en tu navegador
2. En la pestaña "📁 Subir Archivo":
   - Arrastra un archivo .txt o .csv
   - O haz clic para seleccionarlo
3. (Opcional) Configura:
   - Código diagnóstico (default: B349)
   - Formato de entrada (o déjalo en "Detectar automáticamente")
4. El archivo se procesará automáticamente
5. Revisa los resultados en el panel derecho

### Método 2: Pegar Texto

1. Abre la aplicación en tu navegador
2. Cambia a la pestaña "📝 Pegar Texto"
3. Pega el contenido de tus recetas o lista
4. Haz clic en "⚡ Procesar Texto"
5. Revisa los resultados

## Formatos de Entrada Soportados

### Formato 1: Recetas INSSSEP

```
INSSSEP AMB
Dispensada

Afiliado: KOBLUK SAMUEL EMILIO

D.N.I.: 17037705 Credencial: 8000576655

Recetario: 2528947335282

Fecha Receta: 16/10/2025
```

El sistema extraerá:
- Nombre del afiliado
- DNI
- Credencial
- Contará las recetas automáticamente

### Formato 2: Lista Formateada

```
B349 37762110    HORKI VALERIA MARIEL    Titular    37762110    27377621102
J029 12345678    PEREZ JUAN CARLOS       Beneficiario    8000123456
```

Formato: `CODIGO DNI NOMBRE TIPO CREDENCIAL [CUIL]`

El sistema:
- Detectará todas las columnas
- Contará las consultas por DNI
- Aplicará validación de límites

## Interpretación de Resultados

### Estados de Validación

| Estado | Icono | Descripción |
|--------|-------|-------------|
| **Válido** | ✓ | Afiliado con 0-2 consultas/recetas |
| **Advertencia** | ⚠️ | Afiliado con exactamente 3 consultas (límite estándar) |
| **Excepción** | 🔔 | Afiliado con 4 consultas (permitido por excepción) |
| **Error** | ✗ | Afiliado con más de 4 consultas (EXCEDIDO) |

### Estadísticas

El panel muestra:
- **Total de afiliados únicos**
- **Total de consultas**
- **Total de recetas**
- **Cantidad por estado** (válidos, advertencias, errores)

### Filtrado

Usa los botones de filtro para ver:
- **Todos**: Lista completa
- **✓ Válidos**: Solo afiliados dentro del límite
- **⚠️ Advertencias**: Afiliados en el límite (3 consultas)
- **🔔 Excepciones**: Afiliados con excepción (4 consultas)
- **✗ Errores**: Afiliados que exceden el máximo

## Exportación

### Para Extensión Chrome
Genera archivo con formato:
```
B349,37762110,HORKI VALERIA MARIEL,37762110
J029,12345678,PEREZ JUAN CARLOS,8000123456
```

Ideal para copiar y pegar en la extensión de Chrome.

### CSV Completo
Genera archivo con todas las columnas:
```csv
Codigo,DNI,Nombre,Tipo,Credencial,CUIL,Consultas,Recetas,Estado,Mensaje
B349,37762110,"HORKI VALERIA MARIEL",Titular,37762110,27377621102,2,0,valido,"OK"
```

### Reporte Detallado
Genera documento de texto formateado:
```
==========================================
REPORTE DETALLADO DE AFILIADOS
==========================================

1. HORKI VALERIA MARIEL
   DNI: 37762110
   Credencial: 37762110
   Código: B349
   Tipo: Titular
   Consultas: 2
   Recetas: 0
   Estado: VALIDO - OK
------------------------------------------
```

## Casos de Uso

### Caso 1: Procesar Recetas Médicas
```
Entrada: Archivo con recetas INSSSEP
↓
Sistema detecta formato "recetas_insssep"
↓
Extrae datos de cada afiliado
↓
Cuenta recetas por DNI
↓
Valida límites
↓
Genera listado ordenado por frecuencia
```

### Caso 2: Validar Lista Existente
```
Entrada: Lista formateada con consultas
↓
Sistema detecta formato "lista_formateada"
↓
Cuenta consultas por DNI
↓
Aplica reglas de validación
↓
Marca afiliados que excedan límites
↓
Exporta reporte con estados
```

### Caso 3: Preparar Datos para Extensión
```
Entrada: Cualquier formato soportado
↓
Sistema procesa datos
↓
Usuario filtra por estado "Válido"
↓
Exporta formato extensión
↓
Copia y pega en extensión Chrome
```

## API REST

El sistema expone una API REST para integración:

### POST /api/procesar
Procesa archivo subido.

**Parámetros:**
- `archivo`: Archivo .txt o .csv
- `codigo_diagnostico`: Código por defecto (opcional)
- `formato`: Forzar formato (opcional)

**Respuesta:**
```json
{
  "success": true,
  "formato": "recetas_insssep",
  "estadisticas": {
    "total_afiliados": 150,
    "total_consultas": 300,
    "validos": 120,
    "advertencias": 20,
    "errores": 10
  },
  "afiliados": [...]
}
```

### POST /api/procesar/texto
Procesa texto enviado.

**Body:**
```json
{
  "texto": "contenido...",
  "codigo_diagnostico": "B349",
  "formato": null
}
```

### GET /api/exportar/{formato}
Exporta datos procesados.

**Formatos:** `extension`, `csv`, `detallado`

**Respuesta:** Archivo para descargar

### GET /api/filtrar/{estado}
Filtra afiliados por estado.

**Estados:** `valido`, `advertencia`, `excepcion`, `error`

## Estructura del Proyecto

```
app/
├── app.py                          # Aplicación Flask principal
├── templates/
│   └── index.html                 # Interfaz web
├── static/
│   ├── css/
│   │   └── style.css              # Estilos
│   └── js/
│       └── app.js                 # Lógica frontend
├── processors/
│   └── data_processor.py          # Procesador unificado
├── uploads/                        # Archivos subidos
├── exports/                        # Archivos exportados
└── README.md                       # Esta documentación
```

## Ventajas sobre el Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Nuevo |
|---------|------------------|---------------|
| **Pasos manuales** | 6 scripts separados | 1 interfaz unificada |
| **Detección de formato** | Manual | Automática |
| **Validación** | Limitada | Completa con reglas de negocio |
| **Interfaz** | Línea de comandos | Web moderna |
| **Visualización** | Archivos de texto | Tablas interactivas |
| **Exportación** | 1 formato | 3 formatos |
| **Filtrado** | No disponible | Por estado en tiempo real |
| **Estadísticas** | Básicas | Completas y visuales |

## Solución de Problemas

### Error: "Módulo no encontrado"
```bash
pip install -r requirements.txt
```

### Error: "Puerto 5000 en uso"
Edita `app.py` línea final:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Cambiar puerto
```

### Error: "Formato no reconocido"
- Verifica que el archivo tenga el formato correcto
- Intenta forzar el formato en la configuración
- Revisa los ejemplos de formato en esta documentación

### Archivos muy grandes
- El límite actual es 16MB
- Para archivos más grandes, divídelos en varios archivos

## Contacto y Soporte

Para reportar problemas o sugerir mejoras, consulta el archivo principal del proyecto.

## Licencia

Este proyecto es parte del sistema AutoFill-PyMedica-INSSSSEP.
