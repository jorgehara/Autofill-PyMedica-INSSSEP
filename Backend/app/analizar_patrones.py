"""
Analizar el patrón exacto del formato.
"""

# Leer archivo real
with open(r"..\Resultados\afiliados_formateados_para_app1.txt", 'r', encoding='utf-8') as f:
    lineas = f.readlines()

print("ANÁLISIS DETALLADO DE ESTRUCTURA:")
print("="*120)

for i, linea in enumerate(lineas[:10], 1):
    linea = linea.rstrip('\n')
    if not linea.strip():
        continue
    
    # Extraer partes
    codigo = linea[0:4]
    espacios1 = linea[4:7]
    dni = linea[7:15]
    espacios2 = linea[15:18]
    resto = linea[18:]
    
    # Encontrar "Titular"
    idx_titular = resto.find("Titular")
    if idx_titular >= 0:
        nombre_y_espacios = resto[:idx_titular]
        desde_titular = resto[idx_titular:]
        
        # Separar nombre de espacios trailing
        nombre = nombre_y_espacios.rstrip()
        espacios_despues_nombre = nombre_y_espacios[len(nombre):]
        
        print(f"\nLínea {i}:")
        print(f"  Código: '{codigo}' (len={len(codigo)})")
        print(f"  Esp1:   '{espacios1}' (len={len(espacios1)})")
        print(f"  DNI:    '{dni}' (len={len(dni)})")
        print(f"  Esp2:   '{espacios2}' (len={len(espacios2)})")
        print(f"  Nombre: '{nombre}' (len={len(nombre)})")
        print(f"  EspN:   '{espacios_despues_nombre}' (len={len(espacios_despues_nombre)})")
        print(f"  Desde Titular: '{desde_titular}'")
        print(f"  Pos absoluta de Titular: {18 + idx_titular}")

print("\n" + "="*120)
print("RESUMEN DE LONGITUDES DE NOMBRE:")
print("="*120)

longitudes_nombre = []
for linea in lineas:
    linea = linea.rstrip('\n')
    if not linea.strip():
        continue
    resto = linea[18:]
    idx_titular = resto.find("Titular")
    if idx_titular >= 0:
        nombre_y_espacios = resto[:idx_titular]
        nombre = nombre_y_espacios.rstrip()
        longitudes_nombre.append(len(nombre))

from collections import Counter
contador = Counter(longitudes_nombre)
print(f"\nDistribución de longitudes de nombre (sin espacios trailing):")
for longitud, count in sorted(contador.items()):
    print(f"  {longitud} caracteres: {count} veces")

print(f"\nLongitud mínima: {min(longitudes_nombre)}")
print(f"Longitud máxima: {max(longitudes_nombre)}")
