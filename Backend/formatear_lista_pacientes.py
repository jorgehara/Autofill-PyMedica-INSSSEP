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
        import re
        for line in lines:
            # Separar por tabulaciones primero
            fields = [f.strip() for f in re.split(r'\t+', line.strip()) if f.strip()]
            if len(fields) >= 4:
                codigo = fields[0]
                afiliado = fields[1]
                # Buscar el índice de 'Titular' y reconstruir el nombre
                try:
                    idx_titular = fields.index('Titular')
                except ValueError:
                    continue
                nombre = ' '.join(fields[2:idx_titular]).strip()
                afiliado2 = fields[idx_titular+1] if len(fields) > idx_titular+1 else afiliado
                # Siempre poner la coma después del código
                if nombre:
                    formatted_line = f"{codigo},{afiliado},{nombre},{afiliado2}"
                else:
                    formatted_line = f"{codigo},{afiliado},{afiliado2}"
                # Si por error el código y el afiliado están juntos con espacio, reemplazar el primer espacio por coma
                formatted_line = re.sub(r"^([A-Z0-9]+) ([0-9]+)", r"\1,\2", formatted_line)
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
