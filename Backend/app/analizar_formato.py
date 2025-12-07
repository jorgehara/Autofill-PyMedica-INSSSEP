"""
Análisis del formato exacto del archivo de afiliados.
"""

# Línea de ejemplo de tu archivo
linea_ejemplo = "Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949"

# Análisis detallado
print("="*80)
print("ANÁLISIS DEL FORMATO")
print("="*80)
print(f"\nLínea completa ({len(linea_ejemplo)} caracteres):")
print(f"'{linea_ejemplo}'")

# Separar por componentes
partes = linea_ejemplo.split()
print(f"\nComponentes separados por espacios:")
for i, parte in enumerate(partes):
    print(f"  {i+1}. '{parte}'")

# Análisis posicional
codigo = linea_ejemplo[0:4]
print(f"\nCódigo (pos 0-3): '{codigo}' ({len(codigo)} chars)")

# Buscar DNI
dni_start = 7
dni = linea_ejemplo[dni_start:dni_start+8].strip()
print(f"DNI (pos {dni_start}-{dni_start+7}): '{dni}' ({len(dni)} chars)")

# Buscar nombre
nombre_start = 18
nombre_end = 45
nombre = linea_ejemplo[nombre_start:nombre_end]
print(f"Nombre (pos {nombre_start}-{nombre_end-1}): '{nombre}' ({len(nombre)} chars)")

# Buscar tipo
tipo_start = 48
tipo = linea_ejemplo[tipo_start:tipo_start+7].strip()
print(f"Tipo (pos {tipo_start}-{tipo_start+6}): '{tipo}' ({len(tipo)} chars)")

# Segundo DNI
dni2_start = 58
dni2 = linea_ejemplo[dni2_start:dni2_start+8].strip()
print(f"DNI2 (pos {dni2_start}-{dni2_start+7}): '{dni2}' ({len(dni2)} chars)")

# CUIL
cuil_start = 72
cuil = linea_ejemplo[cuil_start:].strip()
print(f"CUIL (pos {cuil_start}-fin): '{cuil}' ({len(cuil)} chars)")

# Recrear formato
print("\n" + "="*80)
print("RECREANDO FORMATO")
print("="*80)

codigo_fmt = "Z000"
dni_fmt = "14137494"
nombre_fmt = "NIKITIUK NATALIA"
tipo_fmt = "Titular"
cuil_fmt = "27141374949"

# Contar espacios entre componentes
print("\nEspacios entre componentes:")
print(f"  Después de código: {linea_ejemplo[4:7].count(' ')} espacios")
print(f"  Después de DNI: {linea_ejemplo[15:18].count(' ')} espacios")
print(f"  Después de nombre: {linea_ejemplo[45:48].count(' ')} espacios")
print(f"  Después de tipo: {linea_ejemplo[55:58].count(' ')} espacios")
print(f"  Después de DNI2: {linea_ejemplo[66:72].count(' ')} espacios")

# Ancho de nombre con espacios
nombre_con_espacios = linea_ejemplo[18:45]
print(f"\nNombre completo con espacios de relleno: '{nombre_con_espacios}' ({len(nombre_con_espacios)} chars)")

# Formato final propuesto
linea_recreada = f"{codigo_fmt}   {dni_fmt}   {nombre_fmt.ljust(27)}   {tipo_fmt}   {dni_fmt}      {cuil_fmt}"
print(f"\nLínea recreada ({len(linea_recreada)} chars):")
print(f"'{linea_recreada}'")

print(f"\n¿Coinciden? {linea_ejemplo == linea_recreada}")

if linea_ejemplo != linea_recreada:
    print("\nDiferencias:")
    for i, (c1, c2) in enumerate(zip(linea_ejemplo, linea_recreada)):
        if c1 != c2:
            print(f"  Posición {i}: esperado '{c1}' vs generado '{c2}'")
