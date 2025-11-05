# Script para encontrar afiliados con 3 apariciones
# Uso: Modifica las rutas de entrada/salida según tu necesidad


# Script actualizado para formato CSV
from collections import Counter, defaultdict

input_file = 'c:/Users/JorgeHaraDevs/Desktop/AutoFill-PyMedica-INSSSSEP/Backend/lista_formateada.txt'
output_file = 'afiliados_3_apariciones.txt'

nombre_counter = Counter()
nombre_to_lines = defaultdict(list)

with open(input_file, encoding='utf-8') as f:
    for line in f:
        parts = line.strip().split(',')
        if len(parts) >= 3:
            codigo = parts[0].strip()
            dni = parts[1].strip()

            # Normalizar nombre: quitar espacios extra y pasar a mayúsculas
            nombre_normalizado = ' '.join(parts[2].strip().upper().split())
            nombre_counter[nombre_normalizado] += 1
            nombre_to_lines[nombre_normalizado].append((codigo, dni, parts[2].strip()))


# Listar solo los afiliados que aparecen exactamente 3 veces
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('Afiliados con 3 apariciones (código, DNI, nombre):\n\n')
    for nombre, count in sorted(nombre_counter.items()):
        if count == 3:
            for codigo, dni, nombre_completo in nombre_to_lines[nombre]:
                f.write(f'{codigo} {dni}\t{nombre_completo}\n')
