"""
Test detallado: muestra afiliados y cuántas líneas generará cada uno.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from processors.data_processor import ProcesadorUnificado


def test_archivo_real_detallado():
    """Procesa el archivo real y muestra detalle de cada afiliado."""
    
    archivo_recetas = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'archivos-recetas.txt'
    )
    
    if not os.path.exists(archivo_recetas):
        print(f"⚠️ No se encontró el archivo: {archivo_recetas}")
        return
    
    print()
    print("=" * 100)
    print("ANÁLISIS DETALLADO: Conversión de Recetas a Consultas (4→1)")
    print("=" * 100)
    print()
    
    with open(archivo_recetas, 'r', encoding='utf-8') as f:
        texto = f.read()
    
    # Procesar
    procesador = ProcesadorUnificado()
    resultado = procesador.procesar_archivo(texto)
    
    if not resultado['success']:
        print(f"❌ ERROR: {resultado['error']}")
        return
    
    # Mostrar estadísticas generales
    stats = resultado['estadisticas']
    print(f"📊 ESTADÍSTICAS GENERALES:")
    print(f"   Total afiliados únicos: {stats['total_afiliados']}")
    print(f"   Total recetas INSSSEP: {stats['total_recetas']}")
    print()
    
    # Calcular total de líneas que se generarán
    total_lineas = 0
    afiliados_ordenados = procesador.ordenar_por_frecuencia()
    
    print("=" * 100)
    print("DETALLE POR AFILIADO (ordenados por mayor cantidad de recetas)")
    print("=" * 100)
    print()
    print(f"{'#':<5} {'NOMBRE':<30} {'DNI':<12} {'RECETAS':<10} {'CONSULTAS':<12} {'LÍNEAS':<10}")
    print("-" * 100)
    
    for i, afiliado in enumerate(afiliados_ordenados, 1):
        # Calcular consultas de recetas según nueva fórmula: cada 4 recetas = 1 consulta
        consultas_de_recetas = (afiliado.recetas + 3) // 4 if afiliado.recetas > 0 else 0
        total_consultas = afiliado.consultas + consultas_de_recetas
        
        if total_consultas == 0:
            total_consultas = 1
        
        total_lineas += total_consultas
        
        # Mostrar fila
        nombre_corto = afiliado.nombre[:28] if len(afiliado.nombre) > 28 else afiliado.nombre
        print(f"{i:<5} {nombre_corto:<30} {afiliado.dni:<12} {afiliado.recetas:<10} {consultas_de_recetas:<12} {total_consultas:<10}")
    
    print("-" * 100)
    print(f"{'TOTAL':<5} {'':<30} {'':<12} {stats['total_recetas']:<10} {'':<12} {total_lineas:<10}")
    print("=" * 100)
    print()
    
    print("📝 RESUMEN:")
    print(f"   • Afiliados únicos: {stats['total_afiliados']}")
    print(f"   • Total de recetas INSSSEP: {stats['total_recetas']}")
    print(f"   • Total de líneas en archivo final: {total_lineas}")
    print()
    print(f"   💡 Fórmula aplicada: consultas = (recetas + 3) // 4")
    print(f"      → Cada 4 recetas = 1 consulta")
    print(f"      → 1-4 recetas = 1 línea")
    print(f"      → 5-8 recetas = 2 líneas")
    print(f"      → 9-12 recetas = 3 líneas")
    print()
    print("=" * 100)
    print()


if __name__ == "__main__":
    test_archivo_real_detallado()
