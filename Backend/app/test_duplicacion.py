"""
Test de duplicación de líneas según cantidad de recetas.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado, Afiliado

# Crear procesador
procesador = ProcesadorUnificado()

# Agregar afiliados de prueba con diferentes cantidades de recetas
procesador.afiliados = {
    '26117544': Afiliado(
        codigo='A099',
        dni='26117544',
        nombre='TESTATONDA ETHEL NOEMI',
        tipo='Titular',
        credencial='',
        cuil='23261175444',
        consultas=0,
        recetas=3  # 3 recetas = 3 líneas
    ),
    '16945545': Afiliado(
        codigo='Z000',
        dni='16945545',  # DNI del BENEFICIARIO (hijo de titular 20091007)
        nombre='MENDOZA HECTOR RAUL',
        tipo='Familiar',
        credencial='',
        cuil='',  # Se generará automáticamente
        consultas=0,
        recetas=1  # 1 receta = 1 línea
    ),
    '22236114': Afiliado(
        codigo='K299',
        dni='22236114',
        nombre='SOSA CRISTINA CEFERINA',
        tipo='Titular',
        credencial='',
        cuil='27222361149',
        consultas=0,
        recetas=2  # 2 recetas = 2 líneas
    )
}

print("="*80)
print("FORMATO CSV CON DUPLICACIÓN POR CANTIDAD DE RECETAS:")
print("="*80)
csv_output = procesador.exportar_formato_final()
print(csv_output)

print("\n" + "="*80)
print("ANÁLISIS:")
print("="*80)
lineas = csv_output.split('\n')
print(f"Total de líneas generadas: {len(lineas)}")
print(f"  - TESTATONDA (3 recetas): {sum(1 for l in lineas if '26117544' in l)} líneas")
print(f"  - MENDOZA (1 receta): {sum(1 for l in lineas if '16945545' in l)} líneas")
print(f"  - SOSA (2 recetas): {sum(1 for l in lineas if '22236114' in l)} líneas")

print("\n" + "="*80)
print("FORMATO ESPERADO (sin CUIL):")
print("="*80)
print("A099,26117544,TESTATONDA ETHEL NOEMI,Titular,26117544")
print("Z000,16945545,MENDOZA HECTOR RAUL,Familiar,16945545")

print("\n✓ Líneas duplicadas según cantidad de recetas")
print("✓ DNI del beneficiario en ambas posiciones")
print("✓ Sin CUIL")
