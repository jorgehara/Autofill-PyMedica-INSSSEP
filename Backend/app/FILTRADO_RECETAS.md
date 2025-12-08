# Filtrado de Recetas INSSSEP

## 📋 Descripción

Se ha implementado un sistema de **filtrado automático** en el procesador de recetas que garantiza que solo se procesen recetas pertenecientes a **INSSSEP AMB**, descartando recetas de otras obras sociales.

## 🎯 Funcionalidad

### Antes del Filtrado
El sistema procesaba todas las recetas del archivo sin distinción, lo que podría incluir:
- OSEP
- PAMI
- IOSPER
- Otras obras sociales

### Después del Filtrado
El sistema ahora:
1. **Identifica** todas las recetas en el archivo
2. **Filtra** solo las que pertenecen a INSSSEP AMB
3. **Descarta** automáticamente las recetas de otras obras sociales
4. **Reporta** cuántas recetas se encontraron y cuántas se filtraron

## 🔧 Implementación Técnica

### Clase: `ProcesadorRecetasINSSSEP`

#### Método: `filtrar_recetas_insssep(texto: str)`

```python
@staticmethod
def filtrar_recetas_insssep(texto: str) -> Tuple[str, int, int]:
    """
    Filtra el texto para extraer solo las recetas que pertenecen a INSSSEP AMB.
    
    Args:
        texto: Texto completo que puede contener recetas de múltiples obras sociales
        
    Returns:
        Tuple[str, int, int]: (texto_filtrado, total_recetas, recetas_insssep)
    """
```

**Retorna:**
- `texto_filtrado`: Texto que contiene solo recetas INSSSEP
- `total_recetas`: Total de recetas encontradas en el archivo
- `recetas_insssep`: Cantidad de recetas INSSSEP filtradas

### Patrones de Detección

El sistema utiliza expresiones regulares robustas para identificar:

1. **Recetas INSSSEP** (principal):
   ```
   INSSSEP AMB
   [Dispensada/Consultada (opcional)]
   Afiliado: [NOMBRE]
   D.N.I.: [DNI] Credencial: [CREDENCIAL]
   ```

2. **Cualquier receta** (para estadísticas):
   ```
   [OBRA_SOCIAL] AMB
   [Dispensada/Consultada (opcional)]
   Afiliado: ...
   ```

## 📊 Información Reportada

Cuando se procesa un archivo con recetas mixtas, el sistema muestra:

```
ℹ️ FILTRADO APLICADO:
   Total de recetas en archivo: 260
   Recetas INSSSEP filtradas: 234
   Recetas de otras obras sociales descartadas: 26
```

## ✅ Ejemplo de Uso

### Caso 1: Archivo con Recetas Mixtas

**Entrada:**
```
OSEP AMB
Afiliado: PEREZ JUAN
D.N.I.: 12345678 Credencial: 987654

INSSSEP AMB
Afiliado: GOMEZ MARIA
D.N.I.: 23456789 Credencial: 876543

PAMI AMB
Afiliado: RODRIGUEZ CARLOS
D.N.I.: 34567890 Credencial: 765432
```

**Resultado:**
- ✅ Se procesa solo: GOMEZ MARIA (INSSSEP)
- ❌ Se descartan: PEREZ JUAN (OSEP) y RODRIGUEZ CARLOS (PAMI)

### Caso 2: Archivo Solo INSSSEP

**Entrada:**
```
INSSSEP AMB
Afiliado: GOMEZ MARIA
D.N.I.: 23456789 Credencial: 876543

INSSSEP AMB
Afiliado: LOPEZ SOFIA
D.N.I.: 45678901 Credencial: 654321
```

**Resultado:**
- ✅ Se procesan ambos afiliados
- ℹ️ No hay recetas descartadas

### Caso 3: Archivo Sin Recetas INSSSEP

**Entrada:**
```
OSEP AMB
Afiliado: PEREZ JUAN
D.N.I.: 12345678 Credencial: 987654

PAMI AMB
Afiliado: RODRIGUEZ CARLOS
D.N.I.: 34567890 Credencial: 765432
```

**Resultado:**
```
⚠️ ADVERTENCIA: No se encontraron recetas INSSSEP AMB en el archivo
   Total de recetas encontradas: 2
   Recetas INSSSEP: 0
```

## 🧪 Tests

Se ha creado `test_filtrado_insssep.py` que verifica:

1. **Test básico**: Archivo con recetas mixtas
   - Verifica que solo se procesen recetas INSSSEP
   - Valida el conteo correcto de recetas totales vs filtradas

2. **Test con archivo real**: `archivos-recetas.txt`
   - Procesa el archivo real de producción
   - Reporta estadísticas de filtrado

### Ejecutar Tests

```bash
cd Backend/app
python test_filtrado_insssep.py
```

## 🔄 Integración con el Sistema

El filtrado se aplica automáticamente en:

1. **`ProcesadorRecetasINSSSEP.procesar()`**
   - Filtra recetas antes de procesarlas
   - Reporta estadísticas de filtrado

2. **`ProcesadorUnificado.procesar_archivo()`**
   - Detecta formato automáticamente
   - Aplica filtrado si es formato de recetas

3. **`ProcesadorUnificado.procesar_ambos_archivos()`**
   - Filtra recetas al cruzar con lista de afiliados
   - Mantiene la lógica de cruce intacta

## 📝 Notas Importantes

- ✅ El filtrado es **automático** y transparente
- ✅ No requiere configuración adicional
- ✅ Funciona con todos los formatos de recetas INSSSEP soportados
- ✅ Mantiene compatibilidad con código existente
- ✅ Reporta información detallada para auditoría

## 🚀 Beneficios

1. **Precisión**: Solo procesa recetas INSSSEP
2. **Transparencia**: Reporta qué se filtró y por qué
3. **Flexibilidad**: Maneja archivos con recetas mixtas
4. **Seguridad**: Evita procesar recetas de otras obras sociales por error
5. **Auditoría**: Permite verificar el filtrado aplicado
