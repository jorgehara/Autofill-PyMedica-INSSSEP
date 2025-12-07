"""
Encontrar el patrón exacto del archivo.
"""

# Leer archivo real
with open(r"..\Resultados\afiliados_formateados_para_app1.txt", 'r', encoding='utf-8') as f:
    lineas = f.readlines()

print(f"Total de líneas: {len(lineas)}")
print("\nAnálisis de las primeras 20 líneas:")
print("="*100)

for i, linea in enumerate(lineas[:20], 1):
    linea = linea.rstrip('\n')
    if not linea.strip():
        continue
        
    # Encontrar índice de "Titular"
    idx_titular = linea.find("Titular")
    
    if idx_titular > 0:
        codigo = linea[0:4]
        parte_antes_titular = linea[0:idx_titular]
        print(f"{i:2}. Pos Titular: {idx_titular:2} | {linea}")
    else:
        print(f"{i:2}. Sin 'Titular' | {linea}")

# Encontrar el patrón común
print("\n" + "="*100)
print("PATRÓN IDENTIFICADO:")
print("="*100)

indices_titular = []
for linea in lineas[:60]:
    linea = linea.rstrip('\n')
    idx = linea.find("Titular")
    if idx > 0:
        indices_titular.append(idx)

if indices_titular:
    min_idx = min(indices_titular)
    max_idx = max(indices_titular)
    from collections import Counter
    contador = Counter(indices_titular)
    
    print(f"Posición mínima de 'Titular': {min_idx}")
    print(f"Posición máxima de 'Titular': {max_idx}")
    print(f"\nDistribución de posiciones:")
    for pos, count in sorted(contador.items()):
        print(f"  Posición {pos}: {count} veces")
