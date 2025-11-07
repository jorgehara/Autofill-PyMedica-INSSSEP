# contabilizar_ordenes_cheking_paso4.py
from collections import defaultdict
import re

def analizar_afiliados(archivo):
    # Diccionarios para almacenar información
    afiliados = defaultdict(lambda: {
        'nombre': '',
        'dni': '',
        'credencial': '',
        'apariciones': 0,
        'diagnosticos': set(),
        'titular_beneficiario': set()
    })
    
    # Contadores generales
    total_registros = 0
    diagnosticos_totales = defaultdict(int)
    
    with open(archivo, 'r', encoding='utf-8') as f:
        for linea in f:
            if linea.strip():
                total_registros += 1
                partes = linea.split()
                
                # Extraer información básica
                if len(partes) >= 4:
                    diagnostico = partes[0]
                    dni = partes[1]
                    
                    # Extraer nombre (puede contener espacios)
                    nombre_idx = 2
                    nombre = []
                    while nombre_idx < len(partes) and not partes[nombre_idx].lower() in ['titular', 'beneficiario']:
                        nombre.append(partes[nombre_idx])
                        nombre_idx += 1
                    nombre = ' '.join(nombre)
                    
                    # Actualizar información del afiliado
                    afiliados[dni]['nombre'] = nombre
                    afiliados[dni]['apariciones'] += 1
                    afiliados[dni]['diagnosticos'].add(diagnostico)
                    
                    # Verificar si es titular o beneficiario
                    for parte in partes:
                        if parte.lower() in ['titular', 'beneficiario']:
                            afiliados[dni]['titular_beneficiario'].add(parte.lower())
                    
                    # Contar diagnósticos
                    diagnosticos_totales[diagnostico] += 1

    # Generar reporte
    with open('reporte_analisis_afiliados.txt', 'w', encoding='utf-8') as f:
        f.write("=== REPORTE DE ANÁLISIS DE AFILIADOS ===\n\n")
        
        f.write("ESTADÍSTICAS GENERALES:\n")
        f.write(f"Total de registros procesados: {total_registros}\n")
        f.write(f"Total de afiliados únicos: {len(afiliados)}\n\n")
        
        f.write("DIAGNÓSTICOS MÁS FRECUENTES:\n")
        for diag, count in sorted(diagnosticos_totales.items(), key=lambda x: x[1], reverse=True):
            f.write(f"{diag}: {count} veces\n")
        f.write("\n")
        
        f.write("AFILIADOS CON MÁS APARICIONES:\n")
        for dni, data in sorted(afiliados.items(), key=lambda x: x[1]['apariciones'], reverse=True):
            f.write(f"\nAfiliado: {data['nombre']}\n")
            f.write(f"DNI: {dni}\n")
            f.write(f"Cantidad de apariciones: {data['apariciones']}\n")
            f.write(f"Diagnósticos diferentes: {', '.join(data['diagnosticos'])}\n")
            f.write(f"Tipo: {', '.join(data['titular_beneficiario']) if data['titular_beneficiario'] else 'No especificado'}\n")
            f.write("-" * 50 + "\n")
        
        f.write("\nPOSIBLES INCONSISTENCIAS:\n")
        for dni, data in afiliados.items():
            if len(data['titular_beneficiario']) > 1:
                f.write(f"ALERTA: {data['nombre']} (DNI: {dni}) aparece como {' y '.join(data['titular_beneficiario'])}\n")
            if data['apariciones'] > 10:
                f.write(f"ALERTA: {data['nombre']} (DNI: {dni}) tiene un número alto de apariciones: {data['apariciones']}\n")

    print(f"Reporte generado en: reporte_analisis_afiliados.txt")
    return total_registros, len(afiliados)

if __name__ == "__main__":
    archivo_entrada = 'Filtrados de menor a mayor.txt'
    total_registros, total_afiliados = analizar_afiliados(archivo_entrada)
    print(f"\nResumen rápido:")
    print(f"Total de registros procesados: {total_registros}")
    print(f"Total de afiliados únicos: {total_afiliados}")