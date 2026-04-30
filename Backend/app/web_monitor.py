"""
Servidor web simple para ver la base de datos en el navegador.
Accede a: http://localhost:5001
"""

from flask import Flask, render_template_string
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / 'listados.db'
app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Monitor BD INSSSEP</title>
    <meta http-equiv="refresh" content="3">
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
        h1 { color: #4ec9b0; }
        .listado { background: #252526; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #007acc; }
        .meta { color: #858585; font-size: 0.9em; margin-top: 5px; }
        .contenido { background: #1e1e1e; padding: 10px; margin-top: 10px; border-radius: 4px; }
        .badge { background: #007acc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
        .empty { color: #858585; font-style: italic; padding: 40px; text-align: center; }
    </style>
</head>
<body>
    <h1>📊 Monitor de Base de Datos INSSSEP</h1>
    <p>Actualiza automaticamente cada 3 segundos</p>
    <hr>
    {{ content|safe }}
    <hr>
    <p style="color: #858585; font-size: 0.9em;">
        📁 Base de datos: {{ db_path }}<br>
        ⏱️ Ultima actualizacion: {{ timestamp }}
    </p>
</body>
</html>
"""

def get_listados_html():
    if not DB_PATH.exists():
        return '<div class="empty">Base de datos no encontrada</div>'
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM listados')
    total = cursor.fetchone()[0]
    
    if total == 0:
        conn.close()
        return '<div class="empty">No hay listados guardados</div>'
    
    cursor.execute('''
        SELECT id, nombre, contenido, afiliados_count, creado_en, actualizado_en
        FROM listados
        ORDER BY actualizado_en DESC
    ''')
    
    html_parts = [f'<p>Total de listados: <span class="badge">{total}</span></p>']
    
    for row in cursor.fetchall():
        lineas = row['contenido'].strip().split('\n') if row['contenido'] else []
        contenido_html = '<div class="contenido">'
        for i, linea in enumerate(lineas[:5], 1):
            contenido_html += f'<div>{linea[:80]}</div>'
        if len(lineas) > 5:
            contenido_html += f'<div style="color: #858585;">... y {len(lineas)-5} mas</div>'
        contenido_html += '</div>'
        
        html_parts.append(f"""
        <div class="listado">
            <strong>#{row['id']} - {row['nombre']}</strong>
            <div class="meta">
                📝 {row['afiliados_count']} afiliados | 
                🕐 {row['creado_en']} |
                🔄 {row['actualizado_en']}
            </div>
            {contenido_html}
        </div>
        """)
    
    conn.close()
    return '\n'.join(html_parts)

@app.route('/')
def index():
    return render_template_string(
        HTML,
        content=get_listados_html(),
        db_path=str(DB_PATH),
        timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )

if __name__ == '__main__':
    print("="*50)
    print("🌐 Monitor Web de Base de Datos")
    print("="*50)
    print("\nAbri tu navegador en:")
    print("   http://localhost:5001")
    print("\nPresiona Ctrl+C para salir\n")
    app.run(host='0.0.0.0', port=5001, debug=False)
