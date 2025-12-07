"""
Aplicación Flask para procesamiento de datos INSSSEP.
Interfaz web moderna y fácil de usar.
"""

from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from pathlib import Path
import logging

from processors.data_processor import (
    ProcesadorUnificado,
    FormatoEntrada,
    EstadoValidacion
)

# Configuración
app = Flask(__name__)
app.config['SECRET_KEY'] = 'insssep-autofill-secret-key-2024'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['UPLOAD_FOLDER'] = Path(__file__).parent / 'uploads'
app.config['EXPORT_FOLDER'] = Path(__file__).parent / 'exports'

CORS(app)

# Crear directorios necesarios
app.config['UPLOAD_FOLDER'].mkdir(exist_ok=True)
app.config['EXPORT_FOLDER'].mkdir(exist_ok=True)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Extensiones permitidas
ALLOWED_EXTENSIONS = {'txt', 'csv'}

# Procesador global (se mantiene en sesión)
procesador_actual = None


def archivo_permitido(filename):
    """Verifica si la extensión del archivo está permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Página principal."""
    return render_template('index.html')


@app.route('/api/procesar', methods=['POST'])
def procesar_archivo():
    """
    Procesa archivos subidos.

    Acepta:
        - Un solo archivo (recetas o lista formateada)
        - Dos archivos (afiliados + recetas) para cruce de información

    Returns:
        JSON con resultados del procesamiento
    """
    global procesador_actual

    try:
        # Verificar si hay archivos
        if 'archivo' not in request.files and 'archivo_afiliados' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se envió ningún archivo'
            }), 400

        # Obtener parámetros opcionales
        codigo_diagnostico = request.form.get('codigo_diagnostico', 'B349')
        formato_forzado = request.form.get('formato', None)

        procesador_actual = ProcesadorUnificado()

        # Caso 1: Dos archivos (afiliados + recetas)
        if 'archivo_afiliados' in request.files and 'archivo_recetas' in request.files:
            archivo_afiliados = request.files['archivo_afiliados']
            archivo_recetas = request.files['archivo_recetas']

            if archivo_afiliados.filename == '' or archivo_recetas.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'Debe seleccionar ambos archivos'
                }), 400

            if not archivo_permitido(archivo_afiliados.filename) or not archivo_permitido(archivo_recetas.filename):
                return jsonify({
                    'success': False,
                    'error': 'Tipo de archivo no permitido. Use .txt o .csv'
                }), 400

            # Guardar archivos
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            filename_afiliados = secure_filename(archivo_afiliados.filename)
            filepath_afiliados = app.config['UPLOAD_FOLDER'] / f"{timestamp}_afiliados_{filename_afiliados}"
            archivo_afiliados.save(str(filepath_afiliados))
            
            filename_recetas = secure_filename(archivo_recetas.filename)
            filepath_recetas = app.config['UPLOAD_FOLDER'] / f"{timestamp}_recetas_{filename_recetas}"
            archivo_recetas.save(str(filepath_recetas))

            logger.info(f"Archivos guardados: {filepath_afiliados}, {filepath_recetas}")

            # Leer contenidos
            with open(filepath_afiliados, 'r', encoding='utf-8') as f:
                contenido_afiliados = f.read()
            
            with open(filepath_recetas, 'r', encoding='utf-8') as f:
                contenido_recetas = f.read()

            # Procesar ambos archivos
            resultado = procesador_actual.procesar_ambos_archivos(
                contenido_afiliados,
                contenido_recetas,
                codigo_diagnostico
            )

        # Caso 2: Un solo archivo (comportamiento anterior)
        else:
            archivo = request.files.get('archivo')

            if archivo.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No se seleccionó ningún archivo'
                }), 400

            if not archivo_permitido(archivo.filename):
                return jsonify({
                    'success': False,
                    'error': 'Tipo de archivo no permitido. Use .txt o .csv'
                }), 400

            # Guardar archivo
            filename = secure_filename(archivo.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename_with_timestamp = f"{timestamp}_{filename}"
            filepath = app.config['UPLOAD_FOLDER'] / filename_with_timestamp

            archivo.save(str(filepath))
            logger.info(f"Archivo guardado: {filepath}")

            # Leer contenido
            with open(filepath, 'r', encoding='utf-8') as f:
                contenido = f.read()

            # Forzar formato si se especificó
            formato = None
            if formato_forzado:
                try:
                    formato = FormatoEntrada(formato_forzado)
                except ValueError:
                    pass

            resultado = procesador_actual.procesar_archivo(
                contenido,
                codigo_diagnostico,
                formato
            )

        if not resultado['success']:
            return jsonify(resultado), 400

        # Preparar respuesta
        afiliados_lista = []
        for afiliado in procesador_actual.ordenar_por_frecuencia():
            estado, mensaje = afiliado.validar_consultas()
            afiliados_lista.append({
                'codigo': afiliado.codigo,
                'dni': afiliado.dni,
                'nombre': afiliado.nombre,
                'tipo': afiliado.tipo,
                'credencial': afiliado.credencial,
                'cuil': afiliado.cuil,
                'consultas': afiliado.consultas,
                'recetas': afiliado.recetas,
                'estado': estado.value,
                'mensaje': mensaje
            })

        return jsonify({
            'success': True,
            'formato': resultado['formato'],
            'estadisticas': resultado['estadisticas'],
            'afiliados': afiliados_lista,
            'archivo_original': 'multiple' if 'archivo_afiliados' in request.files else filename
        })

    except Exception as e:
        logger.error(f"Error procesando archivo: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error al procesar archivo: {str(e)}'
        }), 500


@app.route('/api/procesar/texto', methods=['POST'])
def procesar_texto():
    """
    Procesa texto pegado directamente.
    Soporta un texto o dos textos (afiliados + recetas).

    Returns:
        JSON con resultados del procesamiento
    """
    global procesador_actual

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'No se enviaron datos'
            }), 400

        codigo_diagnostico = data.get('codigo_diagnostico', 'B349')
        formato_forzado = data.get('formato', None)

        procesador_actual = ProcesadorUnificado()

        # Caso 1: Dos textos (afiliados + recetas)
        if 'texto_afiliados' in data and 'texto_recetas' in data:
            texto_afiliados = data['texto_afiliados']
            texto_recetas = data['texto_recetas']

            if not texto_afiliados or not texto_recetas:
                return jsonify({
                    'success': False,
                    'error': 'Debe proporcionar ambos textos'
                }), 400

            # Procesar ambos textos
            resultado = procesador_actual.procesar_ambos_archivos(
                texto_afiliados,
                texto_recetas,
                codigo_diagnostico
            )

        # Caso 2: Un solo texto (comportamiento anterior)
        elif 'texto' in data:
            texto = data['texto']

            if not texto:
                return jsonify({
                    'success': False,
                    'error': 'No se envió texto para procesar'
                }), 400

            formato = None
            if formato_forzado:
                try:
                    formato = FormatoEntrada(formato_forzado)
                except ValueError:
                    pass

            resultado = procesador_actual.procesar_archivo(
                texto,
                codigo_diagnostico,
                formato
            )

        else:
            return jsonify({
                'success': False,
                'error': 'Debe proporcionar texto o texto_afiliados + texto_recetas'
            }), 400

        if not resultado['success']:
            return jsonify(resultado), 400

        # Preparar respuesta
        afiliados_lista = []
        for afiliado in procesador_actual.ordenar_por_frecuencia():
            estado, mensaje = afiliado.validar_consultas()
            afiliados_lista.append({
                'codigo': afiliado.codigo,
                'dni': afiliado.dni,
                'nombre': afiliado.nombre,
                'tipo': afiliado.tipo,
                'credencial': afiliado.credencial,
                'cuil': afiliado.cuil,
                'consultas': afiliado.consultas,
                'recetas': afiliado.recetas,
                'estado': estado.value,
                'mensaje': mensaje
            })

        return jsonify({
            'success': True,
            'formato': resultado['formato'],
            'estadisticas': resultado['estadisticas'],
            'afiliados': afiliados_lista
        })

    except Exception as e:
        logger.error(f"Error procesando texto: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error al procesar texto: {str(e)}'
        }), 500


@app.route('/api/exportar/<formato>', methods=['GET'])
def exportar(formato):
    """
    Exporta los datos procesados en el formato especificado.

    Args:
        formato: 'extension', 'detallado', 'csv', o 'final'

    Returns:
        Archivo para descargar
    """
    global procesador_actual

    if not procesador_actual:
        return jsonify({
            'success': False,
            'error': 'No hay datos procesados para exportar'
        }), 400

    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if formato == 'extension':
            contenido = procesador_actual.exportar_para_extension()
            filename = f"lista_extension_{timestamp}.txt"
            mimetype = 'text/plain'

        elif formato == 'detallado':
            contenido = procesador_actual.exportar_detallado()
            filename = f"reporte_detallado_{timestamp}.txt"
            mimetype = 'text/plain'

        elif formato == 'final':
            # Formato CSV: CODIGO,DNI,NOMBRE,TIPO,DNI (duplica líneas por recetas)
            contenido = procesador_actual.exportar_formato_final()
            filename = f"formato_final_{timestamp}.csv"
            mimetype = 'text/csv'

        elif formato == 'csv':
            # Exportar CSV duplicando líneas según consultas totales
            contenido = procesador_actual.exportar_formato_final()
            filename = f"datos_completos_{timestamp}.csv"
            mimetype = 'text/csv'

        else:
            return jsonify({
                'success': False,
                'error': 'Formato de exportación no válido'
            }), 400

        # Guardar archivo
        filepath = app.config['EXPORT_FOLDER'] / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(contenido)

        return send_file(
            str(filepath),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        logger.error(f"Error exportando: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error al exportar: {str(e)}'
        }), 500


@app.route('/api/filtrar/<estado>', methods=['GET'])
def filtrar_por_estado(estado):
    """
    Filtra afiliados por estado de validación.

    Args:
        estado: valido, advertencia, excepcion, error

    Returns:
        JSON con afiliados filtrados
    """
    global procesador_actual

    if not procesador_actual:
        return jsonify({
            'success': False,
            'error': 'No hay datos procesados'
        }), 400

    try:
        estado_enum = EstadoValidacion(estado)
        afiliados_filtrados = procesador_actual.obtener_por_estado(estado_enum)

        afiliados_lista = []
        for afiliado in afiliados_filtrados:
            estado_val, mensaje = afiliado.validar_consultas()
            afiliados_lista.append({
                'codigo': afiliado.codigo,
                'dni': afiliado.dni,
                'nombre': afiliado.nombre,
                'tipo': afiliado.tipo,
                'credencial': afiliado.credencial,
                'cuil': afiliado.cuil,
                'consultas': afiliado.consultas,
                'recetas': afiliado.recetas,
                'estado': estado_val.value,
                'mensaje': mensaje
            })

        return jsonify({
            'success': True,
            'estado': estado,
            'total': len(afiliados_lista),
            'afiliados': afiliados_lista
        })

    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Estado no válido'
        }), 400
    except Exception as e:
        logger.error(f"Error filtrando: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error al filtrar: {str(e)}'
        }), 500


@app.route('/api/estadisticas', methods=['GET'])
def obtener_estadisticas():
    """
    Obtiene estadísticas actuales.

    Returns:
        JSON con estadísticas
    """
    global procesador_actual

    if not procesador_actual:
        return jsonify({
            'success': False,
            'error': 'No hay datos procesados'
        }), 400

    return jsonify({
        'success': True,
        'estadisticas': procesador_actual._generar_estadisticas()
    })


@app.errorhandler(413)
def archivo_muy_grande(e):
    """Maneja errores de archivo muy grande."""
    return jsonify({
        'success': False,
        'error': 'Archivo muy grande. Tamaño máximo: 16MB'
    }), 413


@app.errorhandler(500)
def error_interno(e):
    """Maneja errores internos del servidor."""
    logger.error(f"Error interno: {e}", exc_info=True)
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("Sistema de Procesamiento INSSSEP")
    print("=" * 60)
    print("\nServidor iniciado en: http://localhost:5000")
    print("\nPresiona Ctrl+C para detener el servidor")
    print("=" * 60)

    app.run(debug=True, host='0.0.0.0', port=5000)
