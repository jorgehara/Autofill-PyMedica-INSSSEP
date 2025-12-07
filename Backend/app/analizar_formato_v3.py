"""
Análisis preciso caracter por caracter.
"""

lineas = [
    "Z000   37762102   AGUILAR FIAMA ANTONELLA      Titular   37762102      27377621029",
    "Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949",
]

for linea in lineas:
    print(f"\nLínea ({len(linea)} chars):")
    print(linea)
    print("Posiciones:")
    
    # Analizar posición por posición
    pos = 0
    
    # Código
    codigo = linea[0:4]
    print(f"  [0-3] Código: '{codigo}'")
    pos = 4
    
    # Espacios
    espacios1 = ""
    while pos < len(linea) and linea[pos] == ' ':
        espacios1 += ' '
        pos += 1
    print(f"  [{4}-{pos-1}] Espacios: {len(espacios1)}")
    
    # DNI
    dni_start = pos
    dni = ""
    while pos < len(linea) and linea[pos] != ' ':
        dni += linea[pos]
        pos += 1
    print(f"  [{dni_start}-{pos-1}] DNI: '{dni}'")
    
    # Espacios
    espacios2 = ""
    while pos < len(linea) and linea[pos] == ' ':
        espacios2 += ' '
        pos += 1
    print(f"  [{pos-len(espacios2)}-{pos-1}] Espacios: {len(espacios2)}")
    
    # Nombre (hasta encontrar "Titular")
    nombre_start = pos
    idx_titular = linea.find("Titular", pos)
    nombre_completo = linea[pos:idx_titular]
    print(f"  [{pos}-{idx_titular-1}] Nombre+espacios: '{nombre_completo}' ({len(nombre_completo)} chars)")
    print(f"       Nombre trimmed: '{nombre_completo.rstrip()}'")
    
    # Resto
    resto = linea[idx_titular:]
    print(f"  [{idx_titular}-fin] Resto: '{resto}'")
    
    partes_resto = resto.split()
    print(f"       Tipo: {partes_resto[0]}")
    print(f"       DNI2: {partes_resto[1]}")
    print(f"       CUIL: {partes_resto[2]}")
