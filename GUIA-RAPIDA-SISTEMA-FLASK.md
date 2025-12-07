# 🚀 Guía Rápida - Sistema Flask INSSSEP

## ¿Por qué este nuevo sistema?

### Problema Anterior
```
❌ 6 scripts Python separados
❌ Ejecución manual de cada paso
❌ Rutas hardcodeadas
❌ Código duplicado
❌ Sin validación de reglas de negocio
❌ Difícil de usar
```

### Solución Nueva
```
✅ 1 interfaz web unificada
✅ Procesamiento automático en 1 clic
✅ Detección automática de formato
✅ Validación de consultas (máx 3, hasta 4 por excepción)
✅ Múltiples formatos de exportación
✅ Fácil de usar
```

## Inicio Rápido (3 pasos)

### 1. Instalar Dependencias
```bash
cd Backend/app
pip install -r requirements.txt
```

### 2. Iniciar Aplicación

**Windows:**
```bash
iniciar.bat
```

**Manual:**
```bash
python app.py
```

### 3. Abrir Navegador
```
http://localhost:5000
```

## Cómo Usar

### Tu Flujo Actual → Nuevo Flujo

#### ANTES (6 pasos manuales):
```
1. Ejecutar extractor_datos_paso1.py
   ↓
2. Ejecutar extractor_datos_paso2.py
   ↓
3. Ejecutar ordenar_por_frecuencia_paso3.py
   ↓
4. Ejecutar contabilizar_ordenes_cheking_paso4.py
   ↓
5. Revisar archivos manualmente
   ↓
6. Ejecutar formatear_lista_final_para_extension_paso6.py
```

#### AHORA (1 paso):
```
1. Subir archivo o pegar texto
   ↓
   Sistema hace TODO automáticamente
   ↓
   Descargar resultado en el formato que necesites
```

## Ejemplos Prácticos

### Ejemplo 1: Procesar Recetas INSSSEP

**Tu entrada:**
```
INSSSEP AMB
Dispensada

Afiliado: KOBLUK SAMUEL EMILIO

D.N.I.: 17037705 Credencial: 8000576655

Recetario: 2528947335282

Fecha Receta: 16/10/2025

[... más recetas ...]
```

**Pasos:**
1. Copia todo el contenido
2. Pega en la pestaña "📝 Pegar Texto"
3. Clic en "⚡ Procesar Texto"
4. Sistema detecta formato automáticamente
5. Muestra resultados con estadísticas
6. Exporta en el formato que necesites

**Resultado automático:**
- Extrae todos los afiliados
- Cuenta recetas por persona
- Ordena de mayor a menor frecuencia
- Aplica código diagnóstico (B349 por defecto)
- Valida límites de consultas

### Ejemplo 2: Procesar Lista Formateada

**Tu entrada:**
```
B349 37762110    HORKI VALERIA MARIEL    Titular    37762110    27377621102
B349 37762110    HORKI VALERIA MARIEL    Titular    37762110    27377621102
J029 12345678    PEREZ JUAN CARLOS       Beneficiario    8000123456
J029 12345678    PEREZ JUAN CARLOS       Beneficiario    8000123456
J029 12345678    PEREZ JUAN CARLOS       Beneficiario    8000123456
J029 12345678    PEREZ JUAN CARLOS       Beneficiario    8000123456
```

**Pasos:**
1. Pega el texto en la aplicación
2. Clic en "⚡ Procesar Texto"

**Sistema detecta automáticamente:**
- HORKI VALERIA: 2 consultas → ✅ VÁLIDO
- PEREZ JUAN: 4 consultas → 🔔 EXCEPCIÓN (permitido)

Si hubiera 5 consultas → ❌ ERROR (excedido)

### Ejemplo 3: Validar Reglas de Consultas

El sistema aplica automáticamente:

| Consultas | Estado | Descripción |
|-----------|--------|-------------|
| 0-2 | ✅ **VÁLIDO** | Dentro del límite |
| 3 | ⚠️ **ADVERTENCIA** | Límite estándar alcanzado |
| 4 | 🔔 **EXCEPCIÓN** | Permitido por excepción |
| 5+ | ❌ **ERROR** | Excedido (no permitido) |

**Filtrado rápido:**
- Clic en "❌ Errores" → Ves solo los que exceden el límite
- Clic en "⚠️ Advertencias" → Ves los que están en el límite
- Clic en "✅ Válidos" → Ves los que están OK

## Formatos de Exportación

### 1. Para Extensión Chrome
**Usa este cuando:** Necesites cargar datos en la extensión

**Formato:**
```
B349,37762110,HORKI VALERIA MARIEL,37762110
J029,12345678,PEREZ JUAN CARLOS,8000123456
```

**Pasos:**
1. Procesa tus datos
2. Clic en "📱 Exportar para Extensión"
3. Abre el archivo
4. Copia todo
5. Pega en la extensión Chrome

### 2. CSV Completo
**Usa este cuando:** Necesites análisis en Excel

**Incluye:**
- Código diagnóstico
- DNI
- Nombre completo
- Tipo (Titular/Beneficiario)
- Credencial
- CUIL
- Cantidad de consultas
- Cantidad de recetas
- Estado de validación
- Mensaje de validación

### 3. Reporte Detallado
**Usa este cuando:** Necesites un informe para revisión

**Formato:**
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

2. PEREZ JUAN CARLOS
   DNI: 12345678
   Credencial: 8000123456
   Código: J029
   Tipo: Beneficiario
   Consultas: 4
   Recetas: 0
   Estado: EXCEPCION - Excepción aplicada (4 consultas)
------------------------------------------
```

## Estadísticas en Tiempo Real

La interfaz muestra automáticamente:

```
┌─────────────────────────────────────────────┐
│  👥 Afiliados: 150                          │
│  📋 Consultas: 300                          │
│  💊 Recetas: 450                            │
│  ✓ Válidos: 120                             │
│  ⚠️ Advertencias: 20                        │
│  ✗ Errores: 10                              │
└─────────────────────────────────────────────┘
```

## Comparación Directa

### Tus Casos de Uso Actuales

#### Caso 1: Formatear Recetas INSSSEP
**ANTES:**
```bash
python extractor_datos_paso1.py
# Esperar...
python extractor_datos_paso2.py
# Esperar...
python formatear_lista_final_para_extension_paso6.py
# Abrir archivos manualmente
```

**AHORA:**
1. Pega el texto de recetas
2. Clic en "Procesar"
3. Clic en "Exportar para Extensión"
✅ ¡Listo en 3 clics!

#### Caso 2: Validar Consultas
**ANTES:**
```bash
python contabilizar_ordenes_cheking_paso4.py
# Abrir reporte_analisis_afiliados.txt
# Buscar manualmente quién excede el límite
```

**AHORA:**
1. Procesa tu lista
2. Clic en filtro "✗ Errores"
✅ ¡Ves inmediatamente quién excede!

#### Caso 3: Ordenar por Frecuencia
**ANTES:**
```bash
python ordenar_por_frecuencia_paso3.py
# Configurar archivo de entrada manualmente
# Ejecutar
```

**AHORA:**
1. Sube tu archivo
✅ ¡Ya está ordenado automáticamente!

## Ventajas Técnicas

### Detección Automática de Formato

**Sistema antiguo:**
```python
# Tenías que saber qué script usar
archivo = 'recetas.txt'  # ¿Recetas o lista?
# Ejecutar el script correcto manualmente
```

**Sistema nuevo:**
```python
# Sistema detecta automáticamente
if "INSSSEP AMB" in texto:
    procesar_como_recetas()
elif "Titular" in texto:
    procesar_como_lista()
```

### Validación Inteligente

**Sistema antiguo:**
```python
# Solo contaba, no validaba
conteo_recetas[dni] += 1
```

**Sistema nuevo:**
```python
# Valida reglas de negocio
if consultas <= 2:
    estado = "VÁLIDO"
elif consultas == 3:
    estado = "ADVERTENCIA"  # Límite estándar
elif consultas == 4:
    estado = "EXCEPCIÓN"    # Permitido
else:
    estado = "ERROR"        # ¡Excedido!
```

## Solución a Problemas Comunes

### Problema: "¿Qué formato tiene mi archivo?"
**Solución:** ¡No importa! El sistema lo detecta automáticamente.

### Problema: "Tengo que ejecutar 6 scripts"
**Solución:** Ahora es 1 sola interfaz web.

### Problema: "No sé si alguien tiene muchas consultas"
**Solución:** Sistema valida automáticamente y marca en rojo.

### Problema: "El script tiene rutas de mi PC"
**Solución:** Sistema web sin rutas hardcodeadas.

### Problema: "Necesito varios formatos de salida"
**Solución:** Exporta en 3 formatos diferentes con 1 clic.

## Preguntas Frecuentes

### ¿Puedo seguir usando los scripts antiguos?
Sí, pero este sistema es mucho más fácil y rápido.

### ¿Necesito saber programar?
No, solo usar el navegador web.

### ¿Funciona con mis archivos actuales?
Sí, detecta automáticamente el formato.

### ¿Pierdo funcionalidad?
No, ganas más:
- Validación de consultas
- Filtrado por estado
- Múltiples exportaciones
- Interfaz visual

### ¿Qué hago con el código antiguo?
Puedes mantenerlo como respaldo, pero este sistema hace todo lo que hacían los 6 scripts y más.

## Próximos Pasos

1. **Prueba el sistema** con un archivo pequeño
2. **Compara** el resultado con tus scripts actuales
3. **Migra** a usar el sistema web para tu flujo diario
4. **Reporta** cualquier problema o sugerencia

## Soporte

Si encuentras algún problema:
1. Revisa la sección "Solución de Problemas" en `Backend/app/README.md`
2. Verifica que las dependencias estén instaladas: `pip install -r requirements.txt`
3. Comprueba que el puerto 5000 esté libre

## Resumen

### Este sistema reemplaza:
- ✅ extractor_datos_paso1.py
- ✅ extractor_datos_paso2.py
- ✅ ordenar_por_frecuencia_paso3.py
- ✅ contabilizar_ordenes_cheking_paso4.py
- ✅ formatear_lista_final_para_extension_paso6.py
- ✅ encontrar_afiliados_3_apariciones_txt.py

### Con una interfaz que:
- ✅ Detecta formato automáticamente
- ✅ Procesa en 1 clic
- ✅ Valida reglas de negocio
- ✅ Muestra estadísticas visuales
- ✅ Permite filtrado interactivo
- ✅ Exporta en múltiples formatos

**¡Simplifica tu trabajo de 6 pasos a 1 solo!** 🎉
