# Script para detectar afiliados con 3 apariciones en el listado por hojas
# Procesa el archivo de texto con formato tipo HOJA y extrae nombre completo

from collections import Counter, defaultdict
import re

input_file = 'untitled:Untitled-1'  # Cambia por la ruta si lo guardas
output_file = 'afiliados_3_apariciones_desde_txt.txt'

nombre_counter = Counter()
nombre_to_lines = defaultdict(list)

# Expresión regular para extraer nombre completo
line_regex = re.compile(r'^[A-Z0-9]+\s+\d+\s+([A-ZÁÉÍÓÚÑ, ]{5,})\s+Titular')

with open('c:/Users/JorgeHaraDevs/Desktop/AutoFill-PyMedica-INSSSSEP/Backend/test.txt', encoding='utf-8') as f:
    for line in f:
        match = line_regex.match(line)
        if match:
            nombre = ' '.join(match.group(1).strip().upper().split())
            nombre_counter[nombre] += 1
            nombre_to_lines[nombre].append(line.strip())

with open('c:/Users/JorgeHaraDevs/Desktop/AutoFill-PyMedica-INSSSSEP/Backend/afiliados_3_apariciones_desde_txt.txt', 'w', encoding='utf-8') as f:
    f.write('Afiliados con 3 apariciones (línea original):\n\n')
    for nombre, count in sorted(nombre_counter.items()):
        if count == 3:
            for linea in nombre_to_lines[nombre]:
                f.write(f'{linea}\n')
