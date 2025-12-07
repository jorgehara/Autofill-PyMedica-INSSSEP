"""
Script de prueba para verificar el formato de exportación final.
"""

from processors.data_processor import ProcesadorUnificado

# Texto de ejemplo de afiliados (lista formateada)
texto_afiliados = """K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949
J009   36108050   AGUIRRE ANTONELLA BELEN    Titular   36108050      27361080509"""

# Texto de ejemplo de recetas
texto_recetas = """INSSSEP AMB
Afiliado: SOSA CRISTINA CEFERINA
D.N.I.: 22236114 Credencial: 22236114

INSSSEP AMB
Afiliado: NIKITIUK NATALIA
D.N.I.: 14137494 Credencial: 14137494

INSSSEP AMB
Afiliado: AGUIRRE ANTONELLA BELEN
D.N.I.: 36108050 Credencial: 36108050"""

# Crear procesador y procesar ambos archivos
procesador = ProcesadorUnificado()
resultado = procesador.procesar_ambos_archivos(
    texto_afiliados,
    texto_recetas,
    codigo_diagnostico="B349"
)

if resultado['success']:
    print("✓ Procesamiento exitoso!")
    print(f"\nFormato detectado: {resultado['formato']}")
    print(f"\nEstadísticas:")
    for key, value in resultado['estadisticas'].items():
        print(f"  {key}: {value}")
    
    print("\n" + "="*80)
    print("FORMATO FINAL DE EXPORTACIÓN")
    print("="*80)
    
    # Exportar en formato final
    formato_final = procesador.exportar_formato_final()
    print(formato_final)
    
    print("\n" + "="*80)
    print("FORMATO PARA EXTENSIÓN")
    print("="*80)
    
    # Exportar para extensión
    formato_extension = procesador.exportar_para_extension()
    print(formato_extension)
    
else:
    print(f"✗ Error: {resultado['error']}")
