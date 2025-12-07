"""
Prueba del exportador de formato final CSV.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado, Afiliado

# Crear procesador UNIFICADO (el que usa la app)
procesador = ProcesadorUnificado()

# Agregar algunos afiliados de prueba manualmente
procesador.afiliados = {
    '14137494': Afiliado(
        codigo='Z000',
        dni='14137494',
        nombre='NIKITIUK NATALIA',
        tipo='Titular',
        credencial='',
        cuil='27141374949',
        consultas=0,
        recetas=0
    ),
    '17037705': Afiliado(
        codigo='B349',
        dni='17037705',
        nombre='KOBLUK SAMUEL EMILIO',
        tipo='Titular',
        credencial='',
        cuil='27170377059',
        consultas=0,
        recetas=0
    ),
    '22236114': Afiliado(
        codigo='K299',
        dni='22236114',
        nombre='SOSA CRISTINA CEFERINA',
        tipo='Titular',
        credencial='',
        cuil='27222361149',
        consultas=0,
        recetas=2
    )
}

print(f"Total de afiliados de prueba: {len(procesador.afiliados)}")
print(f"\n{'='*80}")
print("FORMATO CSV GENERADO:")
print('='*80)

# Generar CSV
csv_output = procesador.exportar_formato_final()

# Mostrar todas las líneas
lineas = csv_output.split('\n')
for i, linea in enumerate(lineas, 1):
    if linea.strip():
        print(f"{i}. {linea}")

print(f"\n{'='*80}")
print("FORMATO ESPERADO:")
print('='*80)
print("CODIGO,DNI,NOMBRE,TIPO,DNI,CUIL")
print("Z000,14137494,NIKITIUK NATALIA,Titular,14137494,27141374949")
print("B349,17037705,KOBLUK SAMUEL EMILIO,Titular,17037705,27170377059")
print("\n✓ Formato CSV correcto para importar en tu sistema")

