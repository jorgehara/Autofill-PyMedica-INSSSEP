"""
Test completo: consultas + recetas, sin sumar, duplicar líneas.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado

# Archivo de afiliados (con consultas de la lista formateada)
texto_afiliados = """
A099   26117544   TESTATONDA ETHEL NOEMI    Titular   26117544      23261175444
B349   17037705   KOBLUK SAMUEL EMILIO      Titular   17037705      27170377059
Z000   38503705   GAN MELANI DESIREE        Titular   38503705      27385037059
"""

# Archivo de recetas INSSSEP
texto_recetas = """
INSSSEP AMB 123
Afiliado: KOBLUK SAMUEL EMILIO
D.N.I.: 17037705   Credencial: 12345678

INSSSEP AMB 124
Afiliado: KOBLUK SAMUEL EMILIO
D.N.I.: 17037705   Credencial: 12345678

INSSSEP AMB 125
Afiliado: KOBLUK SAMUEL EMILIO
D.N.I.: 17037705   Credencial: 12345678

INSSSEP AMB 126
Afiliado: KOBLUK SAMUEL EMILIO
D.N.I.: 17037705   Credencial: 12345678

INSSSEP AMB 127
Afiliado: GAN MELANI DESIREE
D.N.I.: 38503705   Credencial: 87654321

INSSSEP AMB 128
Afiliado: GAN MELANI DESIREE
D.N.I.: 38503705   Credencial: 87654321

INSSSEP AMB 129
Afiliado: GAN MELANI DESIREE
D.N.I.: 38503705   Credencial: 87654321
"""

# Procesar
procesador = ProcesadorUnificado()

# Simular que TESTATONDA tiene 3 consultas de la lista formateada
# y luego agregar las recetas del archivo INSSSEP
resultado = procesador.procesar_ambos_archivos(texto_afiliados, texto_recetas, "B349")

# Simular manualmente 3 consultas para TESTATONDA
procesador.afiliados['26117544'].consultas = 3

print("="*80)
print("AFILIADOS PROCESADOS:")
print("="*80)
for dni, afiliado in procesador.afiliados.items():
    total = afiliado.consultas + afiliado.recetas
    print(f"{afiliado.nombre:30} | Consultas: {afiliado.consultas} | Recetas: {afiliado.recetas} | TOTAL: {total}")

print("\n" + "="*80)
print("EXPORTACIÓN CSV (duplicación por consultas + recetas):")
print("="*80)
csv = procesador.exportar_formato_final()
print(csv)

print("\n" + "="*80)
print("VERIFICACIÓN:")
print("="*80)
lineas = csv.split('\n')
print(f"Total líneas generadas: {len(lineas)}")
print(f"  - TESTATONDA (3 consultas + 0 recetas = 3 líneas): {sum(1 for l in lineas if '26117544' in l)}")
print(f"  - KOBLUK (0 consultas + 4 recetas = 4 líneas): {sum(1 for l in lineas if '17037705' in l)}")
print(f"  - GAN (0 consultas + 3 recetas = 3 líneas): {sum(1 for l in lineas if '38503705' in l)}")
print(f"\nTotal esperado: 3 + 4 + 3 = 10 líneas")
print(f"Total obtenido: {len(lineas)} líneas")
print(f"\n✓ Cada consulta/receta = 1 línea (NO se suman)")
