"""
Test del cruce corregido: solo afiliados con recetas.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado

# Simular archivo de afiliados (lista formateada)
texto_afiliados = """
Z000   37762110   HORKI VALERIA MARIEL      Titular   37762110      27377621102
A099   26117544   TESTATONDA ETHEL NOEMI    Titular   26117544      23261175444
Z000   38503705   GAN MELANI DESIREE        Titular   38503705      27385037059
J040   22343363   RADLOVACKI ESTELA ALICI   Titular   22343363      27223433639
B349   26307366   SOTELO PABLO TEOFILO      Titular   26307366      27263073669
Z000   20091007   JUAREZ MARISA LEONOR      Titular   20091007      27200910074
"""

# Simular archivo de recetas INSSSEP
texto_recetas = """
INSSSEP AMB 123
Afiliado: TESTATONDA ETHEL NOEMI
D.N.I.: 26117544   Credencial: 12345678

INSSSEP AMB 124
Afiliado: TESTATONDA ETHEL NOEMI
D.N.I.: 26117544   Credencial: 12345678

INSSSEP AMB 125
Afiliado: TESTATONDA ETHEL NOEMI
D.N.I.: 26117544   Credencial: 12345678

INSSSEP AMB 126
Afiliado: HORKI VALERIA MARIEL
D.N.I.: 37762110   Credencial: 87654321

INSSSEP AMB 127
Afiliado: SOTELO PABLO TEOFILO
D.N.I.: 26307366   Credencial: 99999999

INSSSEP AMB 128
Afiliado: SOTELO PABLO TEOFILO
D.N.I.: 26307366   Credencial: 99999999

INSSSEP AMB 129
Afiliado: MENDOZA HECTOR RAUL
D.N.I.: 16945545   Credencial: 20169455458
"""

# Procesar
procesador = ProcesadorUnificado()
resultado = procesador.procesar_ambos_archivos(texto_afiliados, texto_recetas, "B349")

print("="*80)
print("RESULTADO DEL CRUCE (solo afiliados con recetas):")
print("="*80)

for dni, afiliado in procesador.afiliados.items():
    print(f"{afiliado.nombre:30} | DNI: {dni:8} | Recetas: {afiliado.recetas} | Consultas: {afiliado.consultas}")

print("\n" + "="*80)
print("EXPORTACIÓN CSV (con duplicación):")
print("="*80)
csv = procesador.exportar_formato_final()
print(csv)

print("\n" + "="*80)
print("VERIFICACIÓN:")
print("="*80)
lineas = csv.split('\n')
print(f"Total líneas: {len(lineas)}")
print(f"TESTATONDA (3 recetas): {sum(1 for l in lineas if '26117544' in l)} líneas")
print(f"HORKI (1 receta): {sum(1 for l in lineas if '37762110' in l)} líneas")
print(f"SOTELO (2 recetas): {sum(1 for l in lineas if '26307366' in l)} líneas")
print(f"MENDOZA/Familiar (1 receta): {sum(1 for l in lineas if '16945545' in l)} líneas")
print(f"\nGAN y RADLOVACKI NO deben aparecer (sin recetas): {sum(1 for l in lineas if '38503705' in l or '22343363' in l)} líneas")
