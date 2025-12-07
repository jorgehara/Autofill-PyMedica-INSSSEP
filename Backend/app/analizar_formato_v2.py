"""
Análisis preciso del formato del archivo real.
"""

# Leer varias líneas del archivo original para encontrar el patrón exacto
lineas_ejemplo = [
    "Z000   37762102   AGUILAR FIAMA ANTONELLA      Titular   37762102      27377621029",
    "J009   36108050   AGUIRRE ANTONELLA BELEN        Titular   36108050      27361080509",
    "N300   27410720   CENTURION SILVANA ANDRE        Titular   27410720      27274107209",
    "Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949",
    "N300   5962452    CONTRERAS PETRONA          Titular   5962452       27059624529"
]

print("="*100)
print("ANÁLISIS DETALLADO DEL FORMATO")
print("="*100)

for i, linea in enumerate(lineas_ejemplo, 1):
    print(f"\n{i}. Línea ({len(linea)} chars): {linea}")
    
    # Separar manualmente
    codigo = linea[0:4]
    espacio1 = linea[4:7]
    dni1 = linea[7:15]
    espacio2 = linea[15:18]
    nombre = linea[18:45]
    resto = linea[45:]
    
    print(f"   Código: '{codigo}' (4 chars)")
    print(f"   Espacio: '{espacio1}' ({len(espacio1)} espacios)")
    print(f"   DNI: '{dni1}' (8 chars, valor: {dni1.strip()})")
    print(f"   Espacio: '{espacio2}' ({len(espacio2)} espacios)")
    print(f"   Nombre: '{nombre}' (27 chars)")
    print(f"   Resto: '{resto}'")
    
    # Analizar resto
    partes_resto = resto.split()
    if len(partes_resto) >= 3:
        tipo = partes_resto[0]
        dni2 = partes_resto[1]
        cuil = partes_resto[2] if len(partes_resto) > 2 else ""
        print(f"   - Tipo: '{tipo}'")
        print(f"   - DNI2: '{dni2}'")
        print(f"   - CUIL: '{cuil}'")

# Ahora recrear el formato exacto
print("\n" + "="*100)
print("FORMATO EXACTO IDENTIFICADO")
print("="*100)

def formatear_linea(codigo, dni, nombre, tipo, cuil):
    """Formatea una línea con el formato exacto del archivo."""
    # Columna 1: Código (4 chars fijos)
    codigo_fmt = codigo.ljust(4)
    
    # Columna 2: DNI (alineado a la izquierda, 8 chars de espacio)
    dni_fmt = dni.ljust(8)
    
    # Columna 3: Nombre (exactamente 27 caracteres)
    nombre_fmt = nombre[:27].ljust(27)
    
    # Columna 4: Tipo (sin padding fijo, solo el texto)
    tipo_fmt = tipo
    
    # Formato completo: CODIGO + 3esp + DNI + 3esp + NOMBRE(27) + 3esp + TIPO + 3esp + DNI + 6esp + CUIL
    linea = f"{codigo_fmt}   {dni_fmt}   {nombre_fmt}   {tipo_fmt}   {dni}      {cuil}"
    return linea

# Probar con los datos de ejemplo
print("\nRecreando líneas:")
datos_prueba = [
    ("Z000", "37762102", "AGUILAR FIAMA ANTONELLA", "Titular", "27377621029"),
    ("J009", "36108050", "AGUIRRE ANTONELLA BELEN", "Titular", "27361080509"),
    ("Z000", "14137494", "NIKITIUK NATALIA", "Titular", "27141374949"),
    ("N300", "5962452", "CONTRERAS PETRONA", "Titular", "27059624529"),
]

for codigo, dni, nombre, tipo, cuil in datos_prueba:
    linea_recreada = formatear_linea(codigo, dni, nombre, tipo, cuil)
    print(f"{linea_recreada}")

print("\n" + "="*100)
print("VERIFICACIÓN DE COINCIDENCIA")
print("="*100)

# Verificar coincidencia exacta
for original, (codigo, dni, nombre, tipo, cuil) in zip(lineas_ejemplo, datos_prueba):
    recreada = formatear_linea(codigo, dni, nombre, tipo, cuil)
    coincide = original == recreada
    print(f"\n{'✓' if coincide else '✗'} Coincide: {coincide}")
    print(f"Original:  '{original}'")
    print(f"Recreada:  '{recreada}'")
    if not coincide:
        print(f"Longitudes: {len(original)} vs {len(recreada)}")
