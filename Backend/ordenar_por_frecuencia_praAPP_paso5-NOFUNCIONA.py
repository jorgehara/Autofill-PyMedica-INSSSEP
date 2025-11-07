# ordenar_por_frecuencia_praAPP_paso5.py
from collections import defaultdict
import os

# Asegurarse de que la carpeta Resultados existe
os.makedirs('Backend/Resultados', exist_ok=True)

input_file = 'Backend/Filtrados de mayor a menorOK.txt'

# Configuración
TOTAL_CONSULTAS = 410  # Total de consultas a procesar
CONSULTAS_POR_PAGINA = 20

# Contadores para el análisis
total_consultas = 0
consultas_por_frecuencia = {
    'primeras': 0,
    'segundas': 0,
    'terceras': 0,
    'ultimas': 0
}

# Configuración de distribución de páginas y límites
DISTRIBUCION = {
    'primeras': {'paginas': (1, 10), 'max': 205},    # 50% - 205 consultas
    'segundas': {'paginas': (11, 15), 'max': 102},   # 25% - 102 consultas
    'terceras': {'paginas': (16, 18), 'max': 61},    # 15% - 61 consultas
    'ultimas': {'paginas': (19, 20), 'max': 42}      # 10% - 42 consultas
}

# Diccionarios para almacenar las consultas
consultas_por_paciente = defaultdict(list)
consultas_por_grupo = defaultdict(list)
total_consultas = 0

def obtener_rango_pagina(num_consulta):
    """
    Determina el rango de páginas según el número de consulta
    Distribución ajustada para manejar 410 consultas:
    - Primeras: 205 consultas (50%)
    - Segundas: 102 consultas (25%)
    - Terceras: 61 consultas (15%)
    - Últimas: 42 consultas (10%)
    """
    if num_consulta == 1:
        return DISTRIBUCION['primeras']['paginas']
    elif num_consulta == 2:
        return DISTRIBUCION['segundas']['paginas']
    elif num_consulta == 3:
        return DISTRIBUCION['terceras']['paginas']
    else:
        return DISTRIBUCION['ultimas']['paginas']

def obtener_grupo(num_consulta):
    """Determina el grupo según el número de consulta"""
    if num_consulta == 1:
        return "primeras"
    elif num_consulta == 2:
        return "segundas"
    elif num_consulta == 3:
        return "terceras"
    else:
        return "ultimas"

# Procesar el archivo y organizar las consultas
consultas_excedentes = []
consultas_por_paciente = defaultdict(list)
consultas_por_grupo = defaultdict(list)

print(f"Procesando archivo: {input_file}")

# Leer y organizar las consultas totales
total_consultas = 0

with open(input_file, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
            
        total_consultas += 1
        
        parts = line.split('\t')
        if len(parts) >= 3:  # Verificar que tenga al menos código, nombre y tipo
            nombre = parts[1].strip().upper()
            dni = parts[3].strip() if len(parts) > 3 else ''
            clave = f'{nombre}|{dni}'
            consultas_por_paciente[clave].append(line)

# Actualizar contadores de frecuencia
for clave, consultas in consultas_por_paciente.items():
    num_consultas = len(consultas)
    for i in range(num_consultas):
        if i == 0:
            consultas_por_frecuencia['primeras'] += 1
        elif i == 1:
            consultas_por_frecuencia['segundas'] += 1
        elif i == 2:
            consultas_por_frecuencia['terceras'] += 1
        else:
            consultas_por_frecuencia['ultimas'] += 1

print(f"Total de consultas en el archivo: {total_consultas}")
print(f"Total de pacientes únicos: {len(consultas_por_paciente)}")
print("\nDistribución de consultas:")
print(f"Primeras consultas: {consultas_por_frecuencia['primeras']}")
print(f"Segundas consultas: {consultas_por_frecuencia['segundas']}")
print(f"Terceras consultas: {consultas_por_frecuencia['terceras']}")
print(f"Cuartas o más consultas: {consultas_por_frecuencia['ultimas']}")

# Variables para el seguimiento de las consultas
consultas_distribuidas = 0
consultas_por_grupo_count = {
    'primeras': 0,
    'segundas': 0,
    'terceras': 0,
    'ultimas': 0
}

# Organizar las consultas según su orden real de visita
for clave, consultas in sorted(consultas_por_paciente.items()):
    num_consultas = len(consultas)
    print(f"Procesando consultas de: {clave} - {num_consultas} consultas")

    # Distribuir cada consulta al grupo correspondiente
    for i, consulta in enumerate(consultas):
        if i == 0:  # Primera consulta
            if len(consultas_por_grupo["primeras"]) < DISTRIBUCION["primeras"]["max"]:
                consultas_por_grupo["primeras"].append(consulta)
                consultas_por_grupo_count["primeras"] += 1
                consultas_distribuidas += 1
            else:
                consultas_excedentes.append((clave, consulta, "primeras"))

        elif i == 1:  # Segunda consulta
            if len(consultas_por_grupo["segundas"]) < DISTRIBUCION["segundas"]["max"]:
                consultas_por_grupo["segundas"].append(consulta)
                consultas_por_grupo_count["segundas"] += 1
                consultas_distribuidas += 1
            else:
                consultas_excedentes.append((clave, consulta, "segundas"))

        elif i == 2:  # Tercera consulta
            if len(consultas_por_grupo["terceras"]) < DISTRIBUCION["terceras"]["max"]:
                consultas_por_grupo["terceras"].append(consulta)
                consultas_por_grupo_count["terceras"] += 1
                consultas_distribuidas += 1
            else:
                consultas_excedentes.append((clave, consulta, "terceras"))

        else:  # Cuarta consulta o más
            if len(consultas_por_grupo["ultimas"]) < DISTRIBUCION["ultimas"]["max"]:
                consultas_por_grupo["ultimas"].append(consulta)
                consultas_por_grupo_count["ultimas"] += 1
                consultas_distribuidas += 1
            else:
                consultas_excedentes.append((clave, consulta, "ultimas"))

print("\nResumen de distribución:")
for grupo in ["primeras", "segundas", "terceras", "ultimas"]:
    print(f"{grupo.capitalize()}: {consultas_por_grupo_count[grupo]}/{DISTRIBUCION[grupo]['max']} consultas")

print(f"\nResumen de distribución:")
for grupo, count in consultas_por_grupo_count.items():
    print(f"{grupo.capitalize()}: {count}/{DISTRIBUCION[grupo]['max']} consultas")
print(f"Total de consultas distribuidas: {consultas_distribuidas}")
print(f"Total de consultas excedentes: {len(consultas_excedentes)}")

# Generar un único archivo con todas las consultas organizadas
output_file = 'Backend/Resultados/consultas_ordenadas_para_app.txt'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("=== CONSULTAS ORDENADAS PARA LA APLICACIÓN ===\n")
    f.write(f"Total de consultas en el archivo: {total_consultas}\n")
    f.write(f"Total de consultas objetivo: {TOTAL_CONSULTAS}\n")
    f.write("\nDistribución de consultas:\n")
    f.write(f"Primeras consultas: {consultas_por_frecuencia['primeras']}\n")
    f.write(f"Segundas consultas: {consultas_por_frecuencia['segundas']}\n")
    f.write(f"Terceras consultas: {consultas_por_frecuencia['terceras']}\n")
    f.write(f"Cuartas o más consultas: {consultas_por_frecuencia['ultimas']}\n\n")
    f.write(f"Total de consultas distribuidas: {consultas_distribuidas}\n\n")
    
    for grupo in ["primeras", "segundas", "terceras", "ultimas"]:
        rango = DISTRIBUCION[grupo]['paginas']
        max_consultas = DISTRIBUCION[grupo]['max']
        
        # Escribir encabezado del grupo
        f.write(f"\n{grupo.upper()} CONSULTAS\n")
        f.write(f"Rango de páginas: {rango[0]}-{rango[1]}\n")
        f.write(f"Límite de consultas para este grupo: {max_consultas}\n")
        f.write("=" * 50 + "\n\n")
        
        # Escribir consultas ordenadas de este grupo
        for consulta in sorted(consultas_por_grupo[grupo]):
            f.write(consulta + '\n')
        
        # Agregar estadísticas del grupo
        f.write("\n" + "-" * 30 + "\n")
        f.write(f"Total en este grupo: {consultas_por_grupo_count[grupo]}/{max_consultas}\n")
        porcentaje = (consultas_por_grupo_count[grupo] / consultas_distribuidas) * 100 if consultas_distribuidas > 0 else 0
        f.write(f"Porcentaje del total distribuido: {porcentaje:.1f}%\n")
        f.write("-" * 30 + "\n\n")
    
    # Agregar estadísticas generales al final
    f.write("\n" + "=" * 50 + "\n")
    f.write("RESUMEN GENERAL\n")
    f.write("=" * 50 + "\n\n")
    
    for grupo in ["primeras", "segundas", "terceras", "ultimas"]:
        total_grupo = consultas_por_grupo_count[grupo]
        max_consultas = DISTRIBUCION[grupo]['max']
        porcentaje_objetivo = (total_grupo / TOTAL_CONSULTAS) * 100
        porcentaje_actual = (total_grupo / consultas_distribuidas) * 100 if consultas_distribuidas > 0 else 0
        f.write(f"{grupo.capitalize()}: {total_grupo}/{max_consultas} ")
        f.write(f"(Objetivo: {DISTRIBUCION[grupo]['max']} - {porcentaje_objetivo:.1f}%, ")
        f.write(f"Actual: {porcentaje_actual:.1f}%)\n")
    
    f.write(f"\nTotal de consultas distribuidas: {consultas_distribuidas}\n")
    
    # Agregar informe de consultas excedentes
    if consultas_excedentes:
        f.write("\n" + "=" * 50 + "\n")
        f.write("CONSULTAS EXCEDENTES (Para próxima liquidación)\n")
        f.write("=" * 50 + "\n\n")
        
        for clave, consulta, grupo_intentado in consultas_excedentes:
            f.write(f"{consulta} (Excede límite de {grupo_intentado})\n")
        
        f.write(f"\nTotal de consultas excedentes: {len(consultas_excedentes)}\n")

# Generar archivo separado para consultas excedentes
if consultas_excedentes:
    excedentes_file = 'Backend/Resultados/consultas_excedentes.txt'
    with open(excedentes_file, 'w', encoding='utf-8') as f:
        f.write("=== CONSULTAS EXCEDENTES PARA PRÓXIMA LIQUIDACIÓN ===\n\n")
        for clave, consulta, grupo in consultas_excedentes:
            f.write(f"{consulta} (Excede límite de {grupo})\n")
        f.write(f"\nTotal de consultas excedentes: {len(consultas_excedentes)}\n")
    print(f"- {excedentes_file}")