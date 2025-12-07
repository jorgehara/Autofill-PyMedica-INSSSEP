"""
Test de conversión de recetas a consultas.
Regla: 1-3 recetas = 1 consulta, 4-6 = 2 consultas, 7-9 = 3 consultas
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado, Afiliado

# Crear procesador
procesador = ProcesadorUnificado()

# Casos de prueba
procesador.afiliados = {
    '26117544': Afiliado(
        codigo='A099',
        dni='26117544',
        nombre='TESTATONDA ETHEL NOEMI',
        tipo='Titular',
        credencial='',
        cuil='23261175444',
        consultas=3,  # 3 consultas de la lista
        recetas=0     # 0 recetas
    ),
    '17037705': Afiliado(
        codigo='B349',
        dni='17037705',
        nombre='KOBLUK SAMUEL EMILIO',
        tipo='Titular',
        credencial='',
        cuil='',
        consultas=0,  # 0 consultas de la lista
        recetas=4     # 4 recetas = 2 consultas
    ),
    '38503705': Afiliado(
        codigo='Z000',
        dni='38503705',
        nombre='GAN MELANI DESIREE',
        tipo='Titular',
        credencial='',
        cuil='',
        consultas=1,  # 1 consulta de la lista
        recetas=3     # 3 recetas = 1 consulta → total 2
    ),
    '16945545': Afiliado(
        codigo='Z000',
        dni='16945545',
        nombre='MENDOZA HECTOR RAUL',
        tipo='Familiar',
        credencial='',
        cuil='',
        consultas=0,
        recetas=1     # 1 receta = 1 consulta
    ),
    '12345678': Afiliado(
        codigo='B349',
        dni='12345678',
        nombre='PRUEBA SIETE RECETAS',
        tipo='Titular',
        credencial='',
        cuil='',
        consultas=0,
        recetas=7     # 7 recetas = 3 consultas
    )
}

print("="*80)
print("CONVERSIÓN DE RECETAS A CONSULTAS:")
print("="*80)
for dni, afiliado in procesador.afiliados.items():
    consultas_de_recetas = (afiliado.recetas + 2) // 3 if afiliado.recetas > 0 else 0
    total = afiliado.consultas + consultas_de_recetas
    print(f"{afiliado.nombre:30} | Consultas: {afiliado.consultas} | Recetas: {afiliado.recetas} | "
          f"Recetas→Consultas: {consultas_de_recetas} | TOTAL: {total}")

print("\n" + "="*80)
print("EXPORTACIÓN CSV:")
print("="*80)
csv = procesador.exportar_formato_final()
print(csv)

print("\n" + "="*80)
print("VERIFICACIÓN:")
print("="*80)
lineas = csv.split('\n')
print(f"Total líneas: {len(lineas)}")
print(f"  - TESTATONDA (3 consultas + 0 recetas): {sum(1 for l in lineas if '26117544' in l)} líneas → esperado: 3")
print(f"  - KOBLUK (0 consultas + 4 recetas→2): {sum(1 for l in lineas if '17037705' in l)} líneas → esperado: 2")
print(f"  - GAN (1 consulta + 3 recetas→1): {sum(1 for l in lineas if '38503705' in l)} líneas → esperado: 2")
print(f"  - MENDOZA (0 consultas + 1 receta→1): {sum(1 for l in lineas if '16945545' in l)} líneas → esperado: 1")
print(f"  - PRUEBA (0 consultas + 7 recetas→3): {sum(1 for l in lineas if '12345678' in l)} líneas → esperado: 3")

print("\n✓ Regla aplicada: 1-3 recetas=1, 4-6=2, 7-9=3 consultas")
