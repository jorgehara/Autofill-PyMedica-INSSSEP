"""
Script para ver el contenido de la base de datos SQLite en tiempo real.
Uso: python ver_bd.py
"""

import sqlite3
from pathlib import Path
from datetime import datetime
import sys

DB_PATH = Path(__file__).parent / 'listados.db'

def ver_listados():
    if not DB_PATH.exists():
        print("❌ Base de datos no encontrada")
        return
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Contar total
    cursor.execute("SELECT COUNT(*) FROM listados")
    total = cursor.fetchone()[0]
    print(f"\n{'='*60}")
    print(f"📊 BASE DE DATOS: {DB_PATH}")
    print(f"📋 Total de listados: {total}")
    print(f"{'='*60}\n")
    
    if total == 0:
        print("No hay listados guardados")
        conn.close()
        return
    
    # Mostrar todos los listados
    cursor.execute('''
        SELECT id, nombre, contenido, afiliados_count, metadata, creado_en, actualizado_en
        FROM listados
        ORDER BY actualizado_en DESC
    ''')
    
    for i, row in enumerate(cursor.fetchall(), 1):
        print(f"\n{'─'*60}")
        print(f"#{i} ID: {row['id']}")
        print(f"   Nombre: {row['nombre']}")
        print(f"   Afiliados: {row['afiliados_count']}")
        print(f"   Creado: {row['creado_en']}")
        print(f"   Actualizado: {row['actualizado_en']}")
        
        if row['metadata']:
            print(f"   Metadata: {row['metadata']}")
        
        # Mostrar primeras 3 líneas del contenido
        lineas = row['contenido'].strip().split('\n') if row['contenido'] else []
        print(f"   Contenido ({len(lineas)} líneas):")
        for j, linea in enumerate(lineas[:3], 1):
            print(f"      {j}. {linea[:60]}{'...' if len(linea) > 60 else ''}")
        if len(lineas) > 3:
            print(f"      ... y {len(lineas) - 3} más")
    
    print(f"\n{'='*60}\n")
    conn.close()

if __name__ == '__main__':
    ver_listados()
