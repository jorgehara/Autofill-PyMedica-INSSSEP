# extractor_datos_paso2.py
# Este script toma la salida de lista_afiliados_recetas.txt y genera un CSV con nombre, DNI y cantidad de recetas

input_file = 'Resultados/lista_afiliados_recetas.txt'
output_file = 'Resultados/lista_afiliados_recetas_desestructurado.csv'

with open(input_file, encoding='utf-8') as f:
    lines = f.readlines()

# Variables para almacenar los datos
registros = []
nombre = ''
dni = ''
cant_recetas = ''

for line in lines:
    line = line.strip()
    if line and line[0].isdigit() and '.' in line:
        # Ejemplo: 1. NOMBRE
        nombre = line.split('.', 1)[1].strip()
    elif line.startswith('DNI:'):
        dni = line.split(':', 1)[1].strip()
    elif line.startswith('Recetas:'):
        cant_recetas = line.split(':', 1)[1].strip()
        registros.append((nombre, dni, cant_recetas))

# Escribir el CSV
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('Nombre,DNI,Recetas\n')
    for nombre, dni, recetas in registros:
        f.write(f'"{nombre}",{dni},{recetas}\n')

print(f'Archivo generado: {output_file}')
