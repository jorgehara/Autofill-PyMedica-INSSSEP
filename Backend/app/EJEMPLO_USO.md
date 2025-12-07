# 📋 Guía de Uso - Sistema Procesador INSSSEP

## 🎯 Características Principales

El sistema ahora soporta **DOS MODOS** de procesamiento:

### 1️⃣ Modo Individual
- Subir/pegar **UN SOLO ARCHIVO** (recetas o lista formateada)
- El sistema detecta automáticamente el formato

### 2️⃣ Modo Dual (⭐ NUEVO)
- Subir/pegar **DOS ARCHIVOS**:
  - 📋 **Archivo de Afiliados** (lista formateada con códigos, DNI, nombres, etc.)
  - 💊 **Archivo de Recetas INSSSEP** (recetas del sistema)
- El sistema **CRUZA** la información entre ambos archivos

## 📤 Formatos de Exportación

### ⭐ Formato Final (NUEVO)
Exporta en el formato específico requerido:
```
K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949
```

Estructura: `CODIGO   DNI   NOMBRE   TIPO   DNI   CUIL`

### 📱 Formato para Extensión
CSV simple para la extensión Chrome:
```
codigo,dni,nombre,credencial
```

### 📊 CSV Completo
Incluye todas las columnas con estadísticas

### 📄 Reporte Detallado
Reporte de texto con información completa de cada afiliado

## 🚀 Cómo Usar - Modo Dual

### Opción A: Subir Archivos

1. Ve a la pestaña **"📁 Subir Archivo"**
2. Selecciona **"📄📄 Dos archivos (Afiliados + Recetas)"**
3. Arrastra o selecciona:
   - **Archivo de Afiliados**: Tu lista formateada (ejemplo: `afiliados_formateados_para_app1.txt`)
   - **Archivo de Recetas**: El archivo de recetas INSSSEP
4. Haz clic en **"⚡ Procesar Ambos Archivos"**
5. Revisa los resultados en la tabla
6. Haz clic en **"⭐ Exportar Formato Final"** para descargar

### Opción B: Pegar Texto

1. Ve a la pestaña **"📝 Pegar Texto"**
2. Selecciona **"📝📝 Dos textos (Afiliados + Recetas)"**
3. Pega:
   - **Texto de Afiliados**: En el área izquierda
   - **Texto de Recetas**: En el área derecha
4. Haz clic en **"⚡ Procesar Ambos Textos"**
5. Exporta con el formato deseado

## 📝 Formato de Entrada

### Archivo de Afiliados (Lista Formateada)
```
CODIGO   DNI      NOMBRE                     TIPO        CREDENCIAL  CUIL
Z000     37762102 AGUILAR FIAMA ANTONELLA    Titular     37762102    27377621029
J009     36108050 AGUIRRE ANTONELLA BELEN    Titular     36108050    27361080509
```

### Archivo de Recetas INSSSEP
```
INSSSEP AMB
Afiliado: SOSA CRISTINA CEFERINA
D.N.I.: 22236114 Credencial: 22236114
...
```

## ⚙️ Configuración

- **Código Diagnóstico**: Por defecto `B349`, puedes cambiarlo
- **Formato de Entrada**: Auto-detectar o forzar un formato específico

## 📊 Resultados

El sistema muestra:
- ✅ **Afiliados procesados**
- 📋 **Total de consultas**
- 💊 **Total de recetas**
- ⚠️ **Advertencias** (3 consultas)
- ✗ **Errores** (más de 4 consultas)

## 🎯 Ventajas del Modo Dual

1. **Cruce automático** entre afiliados y recetas
2. **Datos completos**: Códigos, nombres, credenciales, CUILs
3. **Exportación exacta** en el formato requerido
4. **Validación** de consultas y recetas por afiliado

## 🔧 Iniciar el Sistema

### Windows
```batch
cd Backend\app
iniciar.bat
```

### Manual
```bash
cd Backend/app
python app.py
```

Abre tu navegador en: `http://localhost:5000`

## 💡 Tips

- El sistema genera automáticamente el CUIL si no está presente
- Los nombres se ajustan a 25 caracteres
- El formato final incluye espaciado exacto para compatibilidad
- Puedes procesar archivos de hasta 16MB

## 📞 Soporte

Si encuentras algún problema, revisa los logs en la consola del servidor.
