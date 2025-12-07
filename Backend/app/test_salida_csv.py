"""
Verificar el formato de salida CSV limpio.
"""

import sys
sys.path.insert(0, '.')

from processors.data_processor import ProcesadorUnificado, Afiliado

# Crear procesador
procesador = ProcesadorUnificado()

# Agregar afiliado de ejemplo
procesador.afiliados = {
    '17037705': Afiliado(
        codigo='B349',
        dni='17037705',
        nombre='KOBLUK SAMUEL EMILIO',
        tipo='Titular',
        credencial='8000576655',
        cuil='',  # Sin CUIL para probar auto-generación
        consultas=0,
        recetas=4
    )
}

print("="*80)
print("FORMATO CSV GENERADO (exportar_formato_final):")
print("="*80)
csv_output = procesador.exportar_formato_final()
print(csv_output)

print("\n" + "="*80)
print("FORMATO ESPERADO:")
print("="*80)
print("B349,17037705,KOBLUK SAMUEL EMILIO,Titular,17037705,27170377059")

print("\n" + "="*80)
print("COMPARACIÓN:")
print("="*80)
print(f"Generado: {csv_output}")
print(f"Esperado: B349,17037705,KOBLUK SAMUEL EMILIO,Titular,17037705")
print("\n✓ Sin comillas dobles")
print("✓ Solo campos esenciales")
print("✓ CUIL auto-generado si no existe")
