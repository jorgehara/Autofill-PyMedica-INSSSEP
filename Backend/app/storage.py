"""
Módulo de almacenamiento persistente para listados INSSSEP.

Usa SQLite3 (incluido en Python) para guardar los listados procesados
y poder recuperarlos posteriormente.
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Path a la base de datos (en el mismo directorio que app.py)
DB_PATH = Path(__file__).parent / 'listados.db'


def _get_connection() -> sqlite3.Connection:
    """Obtiene una conexión a la base de datos."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Inicializa la base de datos creando las tablas necesarias."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS listados (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                contenido TEXT NOT NULL,
                afiliados_count INTEGER DEFAULT 0,
                metadata TEXT,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        logger.info(f"Base de datos inicializada en {DB_PATH}")
    except Exception as e:
        logger.error(f"Error inicializando DB: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def guardar_listado(
    nombre: str,
    contenido: str,
    afiliados_count: int = 0,
    metadata: Optional[Dict[str, Any]] = None
) -> int:
    """Guarda un nuevo listado."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO listados (nombre, contenido, afiliados_count, metadata)
            VALUES (?, ?, ?, ?)
        ''', (
            nombre,
            contenido,
            afiliados_count,
            json.dumps(metadata) if metadata else None
        ))
        conn.commit()
        listado_id = cursor.lastrowid
        logger.info(f"Listado '{nombre}' guardado con ID {listado_id}")
        return listado_id
    except Exception as e:
        logger.error(f"Error guardando listado: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def actualizar_listado(
    listado_id: int,
    nombre: Optional[str] = None,
    contenido: Optional[str] = None,
    afiliados_count: Optional[int] = None
) -> bool:
    """Actualiza un listado existente."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if nombre is not None:
            updates.append("nombre = ?")
            params.append(nombre)
        if contenido is not None:
            updates.append("contenido = ?")
            params.append(contenido)
        if afiliados_count is not None:
            updates.append("afiliados_count = ?")
            params.append(afiliados_count)
        
        if not updates:
            return False
        
        updates.append("actualizado_en = CURRENT_TIMESTAMP")
        params.append(listado_id)
        
        query = f"UPDATE listados SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error actualizando listado {listado_id}: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def obtener_listado(listado_id: int) -> Optional[Dict[str, Any]]:
    """Obtiene un listado por su ID."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, nombre, contenido, afiliados_count, metadata,
                   creado_en, actualizado_en
            FROM listados
            WHERE id = ?
        ''', (listado_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            'id': row['id'],
            'nombre': row['nombre'],
            'contenido': row['contenido'],
            'afiliados_count': row['afiliados_count'],
            'metadata': json.loads(row['metadata']) if row['metadata'] else None,
            'creado_en': row['creado_en'],
            'actualizado_en': row['actualizado_en']
        }
    except Exception as e:
        logger.error(f"Error obteniendo listado {listado_id}: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def listar_listados(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Lista todos los listados guardados (sin el contenido completo)."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, nombre, afiliados_count, metadata,
                   creado_en, actualizado_en
            FROM listados
            ORDER BY actualizado_en DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'nombre': row['nombre'],
                'afiliados_count': row['afiliados_count'],
                'metadata': json.loads(row['metadata']) if row['metadata'] else None,
                'creado_en': row['creado_en'],
                'actualizado_en': row['actualizado_en']
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error listando listados: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def eliminar_listado(listado_id: int) -> bool:
    """Elimina un listado por su ID."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM listados WHERE id = ?", (listado_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        if deleted:
            logger.info(f"Listado {listado_id} eliminado")
        return deleted
    except Exception as e:
        logger.error(f"Error eliminando listado {listado_id}: {e}", exc_info=True)
        raise
    finally:
        conn.close()


def buscar_listados(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Busca listados por nombre."""
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, nombre, afiliados_count, metadata,
                   creado_en, actualizado_en
            FROM listados
            WHERE nombre LIKE ?
            ORDER BY actualizado_en DESC
            LIMIT ?
        ''', (f"%{query}%", limit))
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'nombre': row['nombre'],
                'afiliados_count': row['afiliados_count'],
                'metadata': json.loads(row['metadata']) if row['metadata'] else None,
                'creado_en': row['creado_en'],
                'actualizado_en': row['actualizado_en']
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error buscando listados: {e}", exc_info=True)
        raise
    finally:
        conn.close()
