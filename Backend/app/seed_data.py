"""
Script para crear datos iniciales de ejemplo en la base de datos.
Ejecutar una sola vez para tener un listado de prueba.
"""

import sys
from pathlib import Path

# Agregar el path de la app
sys.path.insert(0, str(Path(__file__).parent))

from storage import init_db, guardar_listado, listar_listados

def crear_datos_iniciales():
    """Crea un listado de ejemplo si no hay ninguno guardado."""
    init_db()
    
    # Verificar si ya hay listados
    listados = listar_listados(limit=1)
    if listados:
        print("[INFO] Ya existen listados en la base de datos:")
        for l in listados:
            print(f"   - {l['nombre']} ({l['afiliados_count']} afiliados)")
        return
    
    # Crear listado de ejemplo
    contenido_ejemplo = """B349,25123456,JUAN CARLOS PEREZ,25123456
B349,26876543,MARIA ELENA GARCIA,26876543
B349,30111222,ROBERTO CARLOS MARTINEZ,30111222
B349,28444555,LAURA BEATRIZ RODRIGUEZ,28444555
B349,31222333,ALEJANDRO DANIEL LOPEZ,31222333"""
    
    listado_id = guardar_listado(
        nombre="Ejemplo - Listado de Prueba",
        contenido=contenido_ejemplo,
        afiliados_count=5,
        metadata={
            "descripcion": "Listado de ejemplo para probar el sistema",
            "creado_por": "script_inicial",
            "es_ejemplo": True
        }
    )
    
    print(f"[OK] Listado de ejemplo creado con ID: {listado_id}")
    print("[INFO] Contenido:")
    for linea in contenido_ejemplo.strip().split('\n'):
        partes = linea.split(',')
        print(f"   - {partes[2]} (DNI: {partes[1]})")

if __name__ == '__main__':
    crear_datos_iniciales()
