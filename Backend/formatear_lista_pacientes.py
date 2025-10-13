def format_patient_list(input_file, output_file):
    """
    Lee una lista de pacientes de un archivo y la formatea según el formato requerido por el popup.
    Formato de entrada: codigo afiliado nombre Titular afiliado -
    Formato de salida: codigo,afiliado,nombre,afiliado
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        formatted_lines = []
        for line in lines:
            fields = line.strip().split('\t')
            if len(fields) >= 6:
                codigo = fields[0].strip()
                afiliado = fields[1].strip()
                nombre = fields[2].strip()
                # El campo afiliado se repite en la posición 4
                afiliado2 = fields[4].strip()
                formatted_line = f"{codigo},{afiliado},{nombre},{afiliado2}"
                formatted_lines.append(formatted_line)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(formatted_lines))
        print(f"Se han formateado {len(formatted_lines)} registros.")
        print(f"Lista formateada guardada en: {output_file}")
        if formatted_lines:
            print("\nEjemplo del formato:")
            print(formatted_lines[0])
    except Exception as e:
        print(f"Error al procesar el archivo: {str(e)}")

if __name__ == "__main__":
    input_file = "lista_pacientes.txt"
    output_file = "lista_formateada.txt"
    format_patient_list(input_file, output_file)
