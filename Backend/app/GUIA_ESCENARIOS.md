# 🎯 GUÍA RÁPIDA - Procesamiento de Afiliados y Recetas

## 📋 Escenarios de Uso

### Escenario 1: Cruce Completo (RECOMENDADO)

**Objetivo**: Cruzar información de afiliados con sus recetas

**Archivos necesarios**:
1. **Lista de Afiliados Formateada** (`afiliados_formateados_para_app1.txt`)
   - Contiene: Códigos, DNIs, Nombres, Tipos, Credenciales, CUILs
   
2. **Archivo de Recetas INSSSEP** (`archivos-recetas.txt`)
   - Contiene: Recetas médicas con formato INSSSEP AMB

**Pasos**:
1. Inicia el servidor: `cd Backend\app && iniciar.bat`
2. Abre: `http://localhost:5000`
3. Selecciona: **"📄📄 Dos archivos (Afiliados + Recetas)"**
4. Carga:
   - Archivo de Afiliados: `afiliados_formateados_para_app1.txt`
   - Archivo de Recetas: `archivos-recetas.txt`
5. Clic en: **"⚡ Procesar Ambos Archivos"**
6. Exporta con: **"⭐ Exportar Formato Final"**

**Resultado**: Archivo TXT con formato exacto que incluye:
- Afiliados de la lista base con sus datos completos (código específico, CUIL, etc.)
- Contador de recetas para cada afiliado (extraído del archivo de recetas)
- Afiliados que SOLO están en recetas (si los hay)

**Formato de salida**:
```
K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949
```

---

### Escenario 2: Solo Recetas

**Objetivo**: Extraer afiliados SOLO del archivo de recetas

**Archivo necesario**:
- **Archivo de Recetas INSSSEP** (`archivos-recetas.txt`)

**Pasos**:
1. Inicia el servidor
2. Selecciona: **"📄 Archivo único (auto-detectar)"**
3. Carga: `archivos-recetas.txt`
4. El sistema detectará automáticamente el formato INSSSEP
5. Exporta con: **"⭐ Exportar Formato Final"**

**Resultado**: Todos los afiliados extraídos de las recetas con:
- Código diagnóstico por defecto (B349 o el que configures)
- Contador de recetas por afiliado
- CUIL generado automáticamente

---

### Escenario 3: Solo Lista de Afiliados

**Objetivo**: Formatear lista de afiliados existente

**Archivo necesario**:
- **Lista de Afiliados Formateada** (`afiliados_formateados_para_app1.txt`)

**Pasos**:
1. Inicia el servidor
2. Selecciona: **"📄 Archivo único (auto-detectar)"**
3. Carga: `afiliados_formateados_para_app1.txt`
4. Exporta con: **"⭐ Exportar Formato Final"**

**Resultado**: Lista formateada con estructura estándar

---

## 🔄 Lógica de Procesamiento de Recetas

Cuando cargas el archivo de recetas, el sistema:

1. **Extrae datos** usando patrones regex (como `extractor_datos_paso1.py`)
   - Busca: `INSSSEP AMB`
   - Extrae: Nombre, DNI, Credencial
   - Maneja variaciones: "Dispensada", "Consultada", etc.

2. **Cuenta recetas por afiliado** (como `extractor_datos_paso2.py`)
   - Agrupa por DNI
   - Cuenta apariciones
   - Genera lista desestructurada

3. **Formatea salida**
   - Aplica formato final requerido
   - Genera CUILs automáticamente si faltan
   - Ajusta nombres a 25 caracteres

---

## 📊 Diferencias entre Escenarios

| Característica | Solo Recetas | Solo Afiliados | Cruce Completo |
|---------------|--------------|----------------|----------------|
| Códigos diagnóstico | Por defecto (B349) | Específicos de lista | De lista base |
| CUILs | Generados | De lista | De lista base |
| Contador recetas | ✅ Extraído | ❌ No | ✅ Extraído |
| Contador consultas | ❌ No | ✅ De lista | ✅ De lista |
| Afiliados nuevos | ✅ Todos | ❌ No | ✅ Los de recetas |

---

## 🎯 Formato de Salida Final

**Estructura**:
```
CODIGO   DNI      NOMBRE(25chars)            TIPO      DNI      CUIL
```

**Características**:
- Nombres ajustados exactamente a 25 caracteres
- Tipo ajustado a 8 caracteres
- Espaciado preciso entre columnas
- Compatible con sistema de importación

**Ejemplo real**:
```
K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949
J009   36108050   AGUIRRE ANTONELLA BELEN    Titular   36108050      27361080509
```

---

## 💡 Recomendaciones

### Para Producción
- **Usar Escenario 1** (Cruce Completo) para tener datos completos
- Mantener archivos actualizados
- Verificar resultados antes de importar

### Para Testing
- Usa el script `test_cruce_completo.py` para verificar
- Revisa estadísticas en la interfaz web
- Compara con resultados esperados

### Configuración
- **Código Diagnóstico**: Ajustar según necesidad (B349, J029, etc.)
- **Formato de Entrada**: Normalmente dejar en "Auto-detectar"

---

## 🚨 Solución de Problemas

### No se extraen recetas
- Verifica que el archivo tenga formato INSSSEP AMB
- Revisa que tenga líneas completas: Afiliado, DNI, Credencial
- Prueba con el patrón en test_cruce_completo.py

### Los códigos son todos iguales
- Si usas "Solo Recetas", todos tendrán el código por defecto
- Usa "Cruce Completo" para mantener códigos específicos

### Faltan CUILs
- En modo "Solo Recetas" se generan automáticamente
- En "Cruce Completo" usa los de la lista base
- Formato generado: 27 + DNI + 9

---

## 📝 Archivos del Sistema

### Backend
- `extractor_datos_paso1.py` - Lógica de extracción integrada en `ProcesadorRecetasINSSSEP`
- `extractor_datos_paso2.py` - Lógica de conteo integrada en el procesador
- `app/processors/data_processor.py` - Procesador unificado
- `app/app.py` - API Flask

### Frontend
- `app/templates/index.html` - Interfaz web
- `app/static/js/app.js` - Lógica JavaScript

### Tests
- `app/test_cruce_completo.py` - Test completo del sistema
- `app/test_formato.py` - Test de formato de salida

---

## ✅ Checklist Pre-Procesamiento

- [ ] Archivos en formato correcto (UTF-8)
- [ ] Verificar que no excedan 16MB
- [ ] Servidor Flask iniciado
- [ ] Navegador abierto en http://localhost:5000
- [ ] Modo seleccionado correctamente
- [ ] Código diagnóstico configurado (si es necesario)

## ✅ Checklist Post-Procesamiento

- [ ] Verificar estadísticas mostradas
- [ ] Revisar tabla de resultados
- [ ] Comprobar filtros por estado
- [ ] Exportar formato final
- [ ] Validar archivo exportado
- [ ] Backup del archivo exportado

---

**Última actualización**: Diciembre 2024  
**Versión**: 2.0
