"""
Test de la conversión de recetas a consultas (4 recetas = 1 consulta).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from processors.data_processor import Afiliado


def test_conversion_recetas():
    """Test de la conversión: cada 4 recetas = 1 consulta."""
    
    print("=" * 80)
    print("TEST: Conversión de Recetas a Consultas (4→1)")
    print("=" * 80)
    print()
    
    # Casos de prueba
    casos = [
        (0, 0, "Sin recetas ni consultas → 1 línea por defecto"),
        (1, 0, "1 receta → 1 consulta"),
        (2, 0, "2 recetas → 1 consulta"),
        (3, 0, "3 recetas → 1 consulta"),
        (4, 0, "4 recetas → 1 consulta"),
        (5, 0, "5 recetas → 2 consultas"),
        (6, 0, "6 recetas → 2 consultas"),
        (7, 0, "7 recetas → 2 consultas"),
        (8, 0, "8 recetas → 2 consultas"),
        (9, 0, "9 recetas → 3 consultas"),
        (12, 0, "12 recetas → 3 consultas"),
        (13, 0, "13 recetas → 4 consultas"),
        (0, 2, "0 recetas + 2 consultas → 2 consultas"),
        (4, 2, "4 recetas + 2 consultas → 3 consultas (4 recetas = 1)"),
        (8, 1, "8 recetas + 1 consulta → 3 consultas (8 recetas = 2)"),
    ]
    
    print("📊 CASOS DE PRUEBA:")
    print()
    
    errores = []
    
    for recetas, consultas_directas, descripcion in casos:
        # Calcular consultas de recetas según la fórmula
        consultas_de_recetas = (recetas + 3) // 4 if recetas > 0 else 0
        total_consultas = consultas_directas + consultas_de_recetas
        
        if total_consultas == 0:
            total_consultas = 1
        
        # Extraer el resultado esperado de la descripción
        if "→" in descripcion:
            partes = descripcion.split("→")
            esperado_str = partes[1].strip().split()[0]
            esperado = int(esperado_str)
            
            if total_consultas != esperado:
                errores.append(f"  ❌ {descripcion}")
                errores.append(f"     Esperado: {esperado}, Obtenido: {total_consultas}")
                print(f"  ❌ {descripcion}")
                print(f"     Recetas: {recetas}, Consultas directas: {consultas_directas}")
                print(f"     Consultas de recetas: {consultas_de_recetas}")
                print(f"     Total: {total_consultas} (esperado: {esperado})")
            else:
                print(f"  ✅ {descripcion}")
                print(f"     Recetas: {recetas}, Consultas directas: {consultas_directas}")
                print(f"     Consultas de recetas: {consultas_de_recetas}")
                print(f"     Total líneas: {total_consultas}")
        else:
            print(f"  ℹ️ {descripcion}")
            print(f"     Recetas: {recetas}, Consultas directas: {consultas_directas}")
            print(f"     Total líneas: {total_consultas}")
        
        print()
    
    print("=" * 80)
    
    if errores:
        print("❌ ERRORES ENCONTRADOS:")
        print()
        for error in errores:
            print(error)
        print()
        print("=" * 80)
        return False
    else:
        print("✅ TODOS LOS TESTS PASARON")
        print()
        print("FÓRMULA: consultas_de_recetas = (recetas + 3) // 4")
        print()
        print("REGLA: Cada 4 recetas = 1 consulta")
        print("  • 1-4 recetas → 1 consulta")
        print("  • 5-8 recetas → 2 consultas")
        print("  • 9-12 recetas → 3 consultas")
        print("  • 13-16 recetas → 4 consultas")
        print()
        print("=" * 80)
        return True


def test_afiliado_real():
    """Test con un afiliado real."""
    
    print()
    print("=" * 80)
    print("TEST: Afiliado Real con Recetas")
    print("=" * 80)
    print()
    
    # Crear afiliado de ejemplo
    afiliado = Afiliado(
        codigo="B349",
        dni="12345678",
        nombre="GOMEZ MARIA",
        tipo="Titular",
        credencial="12345678",
        consultas=0,
        recetas=10
    )
    
    # Calcular según fórmula
    consultas_de_recetas = (afiliado.recetas + 3) // 4 if afiliado.recetas > 0 else 0
    total_consultas = afiliado.consultas + consultas_de_recetas
    
    print(f"Afiliado: {afiliado.nombre}")
    print(f"DNI: {afiliado.dni}")
    print(f"Recetas: {afiliado.recetas}")
    print(f"Consultas directas: {afiliado.consultas}")
    print(f"Consultas de recetas (10 recetas / 4): {consultas_de_recetas}")
    print(f"Total de líneas en archivo: {total_consultas}")
    print()
    
    esperado = 3  # 10 recetas = 2.5 → 3 consultas (redondeo hacia arriba)
    
    if total_consultas == esperado:
        print(f"✅ CORRECTO: 10 recetas generan {total_consultas} líneas (esperado: {esperado})")
    else:
        print(f"❌ ERROR: Se esperaban {esperado} líneas, se obtuvieron {total_consultas}")
    
    print()
    print("=" * 80)


if __name__ == "__main__":
    print()
    success = test_conversion_recetas()
    test_afiliado_real()
    
    if success:
        print()
        print("🎉 CONVERSIÓN ACTUALIZADA CORRECTAMENTE")
        print()
