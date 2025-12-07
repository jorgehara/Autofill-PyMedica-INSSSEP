# 📝 Registro de Cambios (CHANGELOG)

## [2.0.0] - 2024-12-07

### ✨ Nuevas Características Principales

#### Modo Dual de Procesamiento
- **Procesamiento de dos archivos simultáneamente**
  - Archivo de afiliados (lista formateada)
  - Archivo de recetas INSSSEP
  - Cruce automático de información entre ambos

- **Procesamiento de dos textos pegados**
  - Área de texto para afiliados
  - Área de texto para recetas
  - Procesamiento independiente y cruce de datos

#### Nuevo Formato de Exportación: "Formato Final"
- **Exportación con formato específico del sistema**
  - Estructura: `CODIGO   DNI   NOMBRE   TIPO   DNI   CUIL`
  - Nombres ajustados a 25 caracteres exactos
  - Espaciado preciso para compatibilidad
  - Generación automática de CUIL si no existe (27 + DNI + 9)

Ejemplo de salida:
```
K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949
```

### 🔧 Mejoras en Backend

#### data_processor.py
- Nuevo método `procesar_ambos_archivos()` para cruce de datos
- Nuevo método `exportar_formato_final()` para formato específico
- Flags `tiene_afiliados` y `tiene_recetas` para control de estado
- Mejor manejo de datos cruzados entre afiliados y recetas

#### app.py
- Endpoint `/api/procesar` ahora acepta dos archivos:
  - `archivo_afiliados`
  - `archivo_recetas`
- Endpoint `/api/procesar/texto` ahora acepta dos textos:
  - `texto_afiliados`
  - `texto_recetas`
- Nuevo formato de exportación: `final`
- Mantenimiento de compatibilidad con modo individual

### 🎨 Mejoras en Frontend

#### HTML (index.html)
- Radio buttons para seleccionar modo (individual/dual)
- Áreas de upload separadas para afiliados y recetas
- Áreas de texto separadas para modo dual
- Nuevo botón "⭐ Exportar Formato Final" destacado

#### CSS (style.css)
- Estilos para `.upload-mode` y `.text-mode`
- Estilos para `.dual-upload` y `.dual-text`
- Grillas responsivas para doble entrada
- Clase `.btn-success` para botón de exportación final
- Estilos para `.upload-area-small` y `.file-info-small`

#### JavaScript (app.js)
- Función `configurarUploadModes()` para cambio de modo
- Función `configurarTextModes()` para cambio de modo de texto
- Función `configurarUploadDual()` con lógica de dos archivos
- Función `configurarProcesarTextoDual()` para dos textos
- Validación de archivos completos antes de procesar
- Nuevo handler para exportación de formato final

### 📚 Documentación

- **EJEMPLO_USO.md**: Guía completa de uso del sistema
- **test_formato.py**: Script de prueba del formato de exportación
- Ejemplos de uso para ambos modos
- Documentación de formatos de entrada y salida

### 🔄 Compatibilidad

- **100% compatible con versión anterior**
- Modo individual sigue funcionando exactamente igual
- Modo dual es completamente opcional
- Todos los formatos de exportación anteriores se mantienen

### 🐛 Correcciones

- Mejor manejo de errores en procesamiento dual
- Validación mejorada de tipos de archivo
- Mensajes de error más descriptivos

---

## [1.0.0] - 2024-11-XX

### Características Iniciales

- Procesamiento individual de archivos
- Detección automática de formato
- Validación de consultas por afiliado
- Exportación en 3 formatos:
  - Extensión Chrome
  - CSV completo
  - Reporte detallado
- Interfaz web moderna
- Filtrado por estado de validación
- Estadísticas en tiempo real
