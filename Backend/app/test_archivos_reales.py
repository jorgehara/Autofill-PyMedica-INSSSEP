"""
Test con los archivos reales del usuario.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado

# Leer archivos reales
with open(r'C:\Users\JorgeHaraDevs\Desktop\AutoFill-PyMedica-INSSSSEP\Backend\Nuevo Listado a partir de 03 de Dic.txt', 'r', encoding='utf-8') as f:
    texto_afiliados = f.read()

with open(r'C:\Users\JorgeHaraDevs\Desktop\AutoFill-PyMedica-INSSSSEP\Backend\archivos-recetas - copia.txt', 'r', encoding='utf-8') as f:
    texto_recetas = f.read()

# Crear procesador
procesador = ProcesadorUnificado()

# Procesar ambos archivos
resultado = procesador.procesar_ambos_archivos(
    texto_afiliados,
    texto_recetas,
    'B349'
)

print("="*80)
print("RESULTADO DEL PROCESAMIENTO:")
print("="*80)
print(f"Success: {resultado['success']}")
print(f"Formato: {resultado['formato']}")
print(f"\nEstadísticas:")
for key, value in resultado['estadisticas'].items():
    print(f"  {key}: {value}")

print("\n" + "="*80)
print("AFILIADOS PROCESADOS (primeros 5):")
print("="*80)
for i, afiliado in enumerate(list(procesador.afiliados.values())[:5], 1):
    print(f"{i}. {afiliado.nombre}")
    print(f"   DNI: {afiliado.dni}")
    print(f"   Código: {afiliado.codigo}")
    print(f"   Credencial: {afiliado.credencial}")
    print(f"   Consultas: {afiliado.consultas}")
    print(f"   Recetas: {afiliado.recetas}")
    print()

print("="*80)
print("EXPORTACIÓN CSV (primeras 15 líneas):")
print("="*80)
csv_output = procesador.exportar_formato_final()
lineas = csv_output.split('\n')
for i, linea in enumerate(lineas[:15], 1):
    print(f"{i:2}. {linea}")

print(f"\n... (Total: {len(lineas)} líneas)")

print("\n" + "="*80)
print("VERIFICACIÓN DE DUPLICACIÓN:")
print("="*80)

# Contar líneas por DNI
from collections import Counter
dnis = [l.split(',')[1] for l in lineas if l.strip()]
contador = Counter(dnis)

print("Líneas por afiliado en el CSV:")
for dni, count in contador.most_common(10):
    afiliado = procesador.afiliados[dni]
    consultas_de_recetas = (afiliado.recetas + 2) // 3 if afiliado.recetas > 0 else 0
    total_esperado = afiliado.consultas + consultas_de_recetas
    if total_esperado == 0:
        total_esperado = 1
    status = "✓" if count == total_esperado else "✗"
    print(f"  {status} DNI {dni}: {count} líneas (esperado: {total_esperado} = {afiliado.consultas} consultas + {afiliado.recetas} recetas → {consultas_de_recetas} consultas)")
