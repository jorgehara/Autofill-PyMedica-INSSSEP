"""
Test del filtrado de recetas INSSSEP.
Verifica que solo se procesen recetas de INSSSEP AMB.
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from processors.data_processor import ProcesadorRecetasINSSSEP, ProcesadorUnificado


def test_filtrado_basico():
    """Test básico de filtrado de recetas INSSSEP."""
    
    # Texto de prueba con múltiples obras sociales
    texto_prueba = """
OSEP AMB
Dispensada
Afiliado: PEREZ JUAN
D.N.I.: 12345678 Credencial: 987654

INSSSEP AMB
Dispensada
Afiliado: GOMEZ MARIA
D.N.I.: 23456789 Credencial: 876543

PAMI AMB
Consultada
Afiliado: RODRIGUEZ CARLOS
D.N.I.: 34567890 Credencial: 765432

INSSSEP AMB
Afiliado: FERNANDEZ ANA
D.N.I.: 45678901 Credencial: 654321

IOSPER AMB
Afiliado: MARTINEZ LUIS
D.N.I.: 56789012 Credencial: 543210

INSSSEP AMB
Dispensada
Afiliado: LOPEZ SOFIA
D.N.I.: 67890123 Credencial: 432109
"""
    
    print("=" * 80)
    print("TEST: Filtrado de recetas INSSSEP")
    print("=" * 80)
    print()
    
    # Filtrar recetas
    texto_filtrado, total, insssep = ProcesadorRecetasINSSSEP.filtrar_recetas_insssep(texto_prueba)
    
    print(f"📊 RESULTADOS DEL FILTRADO:")
    print(f"   Total de recetas en el archivo: {total}")
    print(f"   Recetas INSSSEP filtradas: {insssep}")
    print(f"   Recetas de otras obras sociales: {total - insssep}")
    print()
    
    # Procesar con el procesador
    afiliados = ProcesadorRecetasINSSSEP.procesar(texto_prueba)
    
    print(f"✅ AFILIADOS PROCESADOS: {len(afiliados)}")
    print()
    
    for dni, afiliado in afiliados.items():
        print(f"   • {afiliado.nombre}")
        print(f"     DNI: {dni}")
        print(f"     Recetas: {afiliado.recetas}")
    
    print()
    print("=" * 80)
    
    # Verificaciones
    assert total == 6, f"Se esperaban 6 recetas totales, se encontraron {total}"
    assert insssep == 3, f"Se esperaban 3 recetas INSSSEP, se encontraron {insssep}"
    assert len(afiliados) == 3, f"Se esperaban 3 afiliados INSSSEP, se procesaron {len(afiliados)}"
    
    # Verificar que solo se procesaron afiliados INSSSEP
    nombres_esperados = {'GOMEZ MARIA', 'FERNANDEZ ANA', 'LOPEZ SOFIA'}
    nombres_procesados = {a.nombre for a in afiliados.values()}
    
    assert nombres_procesados == nombres_esperados, f"Los afiliados procesados no coinciden: {nombres_procesados}"
    
    print("✅ TODOS LOS TESTS PASARON")
    print()


def test_archivo_real():
    """Test con el archivo real de recetas."""
    
    archivo_recetas = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'archivos-recetas.txt'
    )
    
    if not os.path.exists(archivo_recetas):
        print(f"⚠️ No se encontró el archivo: {archivo_recetas}")
        return
    
    print("=" * 80)
    print("TEST: Archivo real de recetas")
    print("=" * 80)
    print()
    
    with open(archivo_recetas, 'r', encoding='utf-8') as f:
        texto = f.read()
    
    print(f"📁 Archivo: {archivo_recetas}")
    print(f"   Tamaño: {len(texto)} caracteres")
    print()
    
    # Procesar con el procesador unificado
    procesador = ProcesadorUnificado()
    resultado = procesador.procesar_archivo(texto)
    
    if resultado['success']:
        stats = resultado['estadisticas']
        print(f"✅ PROCESAMIENTO EXITOSO")
        print(f"   Formato detectado: {resultado['formato']}")
        print(f"   Total afiliados: {stats['total_afiliados']}")
        print(f"   Total recetas: {stats['total_recetas']}")
        print()
    else:
        print(f"❌ ERROR: {resultado['error']}")
        print()


if __name__ == "__main__":
    print()
    test_filtrado_basico()
    print()
    test_archivo_real()
