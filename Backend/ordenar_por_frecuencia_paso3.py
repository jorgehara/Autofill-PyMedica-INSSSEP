# ordenar_por_frecuencia.py
# Ordena las líneas de un archivo por la frecuencia de aparición de cada persona (por nombre y/o DNI)

from collections import Counter, defaultdict

input_file = 'Filtrados de menor a mayor.txt'
output_file = 'Filtrados de mayor a menorOK.txt'

# Leer todas las líneas
with open(input_file, encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]

# Usar el nombre y/o DNI como clave para contar
persona_counter = Counter()
line_map = defaultdict(list)

for line in lines:
    # Intentar extraer nombre y/o DNI (asumimos que el nombre está en la 3ra columna y el DNI en la 2da o 4ta)
    parts = line.split('\t')
    if len(parts) >= 3:
        nombre = parts[1].strip().upper()
        dni = parts[3].strip() if len(parts) > 3 else ''
        clave = f'{nombre}|{dni}'
        persona_counter[clave] += 1
        line_map[clave].append(line)
    else:
        # Si no tiene el formato esperado, igual lo agregamos
        line_map[line].append(line)
        persona_counter[line] += 1

# Ordenar claves por frecuencia (de mayor a menor)
claves_ordenadas = [k for k, _ in persona_counter.most_common()]

# Escribir el archivo ordenado
with open(output_file, 'w', encoding='utf-8') as f:
    for clave in claves_ordenadas:
        for line in line_map[clave]:
            f.write(line + '\n')

print(f'Archivo generado: {output_file}')
