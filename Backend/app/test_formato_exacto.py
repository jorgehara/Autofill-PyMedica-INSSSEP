"""
Test para verificar el formato final exacto.
"""

from processors.data_processor import ProcesadorUnificado, Afiliado

# Crear afiliado de ejemplo exactamente como tu línea
procesador = ProcesadorUnificado()

# Agregar afiliado manualmente con los datos exactos
procesador.afiliados['14137494'] = Afiliado(
    codigo='Z000',
    dni='14137494',
    nombre='NIKITIUK NATALIA',
    tipo='Titular',
    credencial='14137494',
    cuil='27141374949',
    consultas=1,
    recetas=0
)

# Exportar formato final
resultado = procesador.exportar_formato_final()

print("="*80)
print("FORMATO ESPERADO:")
print("="*80)
print("Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949")

print("\n" + "="*80)
print("FORMATO GENERADO:")
print("="*80)
print(resultado)

print("\n" + "="*80)
print("COMPARACIÓN CARÁCTER POR CARÁCTER:")
print("="*80)

esperado = "Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949"
generado = resultado

print(f"Longitud esperado: {len(esperado)}")
print(f"Longitud generado: {len(generado)}")

if esperado == generado:
    print("\n✅ ¡FORMATO CORRECTO! Las líneas son idénticas.")
else:
    print("\n⚠️  Diferencias encontradas:")
    print("\nEsperado:")
    print(f"'{esperado}'")
    print("\nGenerado:")
    print(f"'{generado}'")
    
    # Mostrar diferencias posición por posición
    max_len = max(len(esperado), len(generado))
    for i in range(max_len):
        c1 = esperado[i] if i < len(esperado) else '·'
        c2 = generado[i] if i < len(generado) else '·'
        if c1 != c2:
            print(f"Posición {i}: esperado='{c1}' generado='{c2}'")
