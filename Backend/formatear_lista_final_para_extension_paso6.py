def leer_archivo(ruta_archivo):
    with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
        return archivo.readlines()

def formatear_linea(linea):
    # Dividir la línea en sus componentes
    partes = linea.strip().split()
    if len(partes) < 4:  # Si no hay suficientes partes, ignorar la línea
        return None
        
    codigo = partes[0]
    dni = partes[1]
    
    # Obtener el nombre completo
    nombre_completo = ' '.join(partes[2:-2])  # Todo excepto código, DNI y "Titular"
    
    # Manejar casos especiales donde hay números al principio del nombre
    palabras_nombre = nombre_completo.split()
    if palabras_nombre[0].isdigit():  # Si la primera palabra es un número
        palabras_nombre = palabras_nombre[1:]  # Eliminar el número
    
    # Unir todas las palabras del nombre sin "DE" o "DEL"
    nombre_final = []
    for palabra in palabras_nombre:
        if palabra != 'DE' and palabra != 'DEL':  # No agregar 'DE' o 'DEL'
            nombre_final.append(palabra)
    
    # Unir el nombre completo sin espacios
    nombre_completo_unido = ''.join(nombre_final)
    
    # Construir el formato requerido
    resultado = f"{codigo},{dni},{nombre_completo_unido},{dni}"
    
    return resultado
    
    return nombre_formateado

def procesar_archivo(ruta_entrada, ruta_salida):
    lineas = leer_archivo(ruta_entrada)
    lineas_formateadas = []
    
    # Procesar cada línea
    for linea in lineas:
        linea_formateada = formatear_linea(linea)
        if linea_formateada:  # Si la línea se formateó correctamente
            lineas_formateadas.append(linea_formateada)
    
    # Asegurar que el directorio de resultados existe
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    
    # Escribir el resultado en el archivo de salida
    with open(ruta_salida, 'w', encoding='utf-8') as archivo_salida:
        archivo_salida.write('\n'.join(lineas_formateadas))
    
    print(f"Archivo procesado correctamente. Resultado guardado en {ruta_salida}")

if __name__ == '__main__':
    import os
    ruta_base = os.path.dirname(os.path.abspath(__file__))
    ruta_entrada = os.path.join(ruta_base, 'lista_pacientes.txt')
    ruta_salida = os.path.join(ruta_base, 'Resultados', 'lista_formateada_final.txt')
    procesar_archivo(ruta_entrada, ruta_salida)
    procesar_archivo(ruta_entrada, ruta_salida)
    print(f"Archivo procesado correctamente. Resultado guardado en {ruta_salida}")