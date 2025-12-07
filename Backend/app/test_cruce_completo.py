"""
Test completo del sistema con datos reales de afiliados y recetas.
"""

from processors.data_processor import ProcesadorUnificado

# Texto de afiliados (lista formateada) - ALGUNOS EJEMPLOS
texto_afiliados = """Z000   37762102   AGUILAR FIAMA ANTONELLA      Titular   37762102      27377621029
J009   36108050   AGUIRRE ANTONELLA BELEN        Titular   36108050      27361080509
B349   22343363   RADLOVACKI ESTELA ALICI        Titular   22343363      27223433639
K299   22236114   SOSA CRISTINA CEFERINA     Titular   22236114      27222361149
Z000   14137494   NIKITIUK NATALIA           Titular   14137494      27141374949"""

# Texto de recetas INSSSEP - SIMULANDO MÚLTIPLES RECETAS
texto_recetas = """INSSSEP AMB
Afiliado: SOSA CRISTINA CEFERINA
D.N.I.: 22236114 Credencial: 22236114
Fecha Receta: 16/10/2025
Emitida: 16/10/2025 18:49
Plan: Cardio

INSSSEP AMB
Afiliado: SOSA CRISTINA CEFERINA
D.N.I.: 22236114 Credencial: 22236114
Fecha Receta: 17/10/2025
Emitida: 17/10/2025 10:20
Plan: Cardio

INSSSEP AMB
Afiliado: NIKITIUK NATALIA
D.N.I.: 14137494 Credencial: 14137494
Fecha Receta: 18/10/2025
Emitida: 18/10/2025 14:30
Plan: General

INSSSEP AMB
Dispensada
Afiliado: AGUIRRE ANTONELLA BELEN
D.N.I.: 36108050 Credencial: 36108050
Fecha Receta: 19/10/2025
Emitida: 19/10/2025 09:15
Plan: General

INSSSEP AMB
Afiliado: GONZALEZ MARIA JOSE
D.N.I.: 12345678 Credencial: 12345678
Fecha Receta: 20/10/2025
Emitida: 20/10/2025 16:00
Plan: Cardio"""

print("="*80)
print("PRUEBA COMPLETA DEL SISTEMA")
print("="*80)

# Crear procesador
procesador = ProcesadorUnificado()

# Procesar ambos archivos
print("\n1. Procesando afiliados y recetas...")
resultado = procesador.procesar_ambos_archivos(
    texto_afiliados,
    texto_recetas,
    codigo_diagnostico="B349"
)

if resultado['success']:
    print("   ✓ Procesamiento exitoso!")
    
    print(f"\n2. Estadísticas:")
    for key, value in resultado['estadisticas'].items():
        print(f"   {key}: {value}")
    
    print("\n" + "="*80)
    print("3. FORMATO FINAL DE EXPORTACIÓN")
    print("="*80)
    formato_final = procesador.exportar_formato_final()
    print(formato_final)
    
    print("\n" + "="*80)
    print("4. DETALLE DE AFILIADOS PROCESADOS")
    print("="*80)
    
    for afiliado in procesador.ordenar_por_frecuencia():
        estado, mensaje = afiliado.validar_consultas()
        print(f"\nNombre: {afiliado.nombre}")
        print(f"  DNI: {afiliado.dni}")
        print(f"  Código: {afiliado.codigo}")
        print(f"  Credencial: {afiliado.credencial}")
        print(f"  CUIL: {afiliado.cuil or 'Generado automáticamente'}")
        print(f"  Consultas: {afiliado.consultas}")
        print(f"  Recetas: {afiliado.recetas}")
        print(f"  Estado: {estado.value} - {mensaje}")
    
    print("\n" + "="*80)
    print("5. ANÁLISIS DEL CRUCE")
    print("="*80)
    
    # Verificar el cruce
    print("\nAfiliados que estaban en AMBAS listas:")
    for afiliado in procesador.afiliados.values():
        if afiliado.recetas > 0 and afiliado.cuil:  # Tiene CUIL = estaba en lista base
            print(f"  • {afiliado.nombre} - {afiliado.recetas} receta(s)")
    
    print("\nAfiliados que SOLO están en recetas (no en lista base):")
    for afiliado in procesador.afiliados.values():
        if afiliado.recetas > 0 and not afiliado.cuil:  # No tiene CUIL = solo en recetas
            print(f"  • {afiliado.nombre} - {afiliado.recetas} receta(s)")
    
    print("\nAfiliados que SOLO están en lista base (sin recetas):")
    for afiliado in procesador.afiliados.values():
        if afiliado.recetas == 0:
            print(f"  • {afiliado.nombre}")
    
else:
    print(f"   ✗ Error: {resultado['error']}")

print("\n" + "="*80)
print("PRUEBA COMPLETADA")
print("="*80)
