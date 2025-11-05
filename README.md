# INSSSEP-Autofill-PyMedica

## Guía para extraer el listado de afiliados INSSSEP AMB desde recetas

Este proyecto incluye un script que permite automatizar la extracción de datos de afiliados de INSSSEP AMB desde archivos de recetas en formato texto. El objetivo es generar un listado ordenado de pacientes, mostrando cuántas recetas tiene cada uno, listo para usar en la app de consultas.

### ¿Qué hace el script?

El script `extractor_datos.py` busca en el archivo de recetas los datos principales de cada paciente:
- Nombre completo
- DNI
- Credencial
- Cantidad de recetas

Agrupa los datos por DNI, suma la cantidad de recetas por paciente y evita duplicados. El resultado se guarda en la carpeta `resultados` como `lista_afiliados_recetas.txt`.

### ¿Cómo usarlo?

1. Coloca el archivo de recetas en la carpeta `Backend` y asegúrate de que se llame igual que el que espera el script (puedes modificar el nombre en el código si es necesario).
2. Ejecuta el script desde la terminal (PowerShell):
	```pwsh
	python extractor_datos.py
	```
3. El resultado se guardará en la carpeta `resultados` como `lista_afiliados_recetas.txt`.

### Ejemplo de salida

```
1. NOVIK NILDA
	DNI: 4941385
	Credencial: 8000012214
	Obra social: INSSSEP AMB
	Consultas: 0
	Recetas: 7
	Diagnóstico: B349, J029, Z000, J129, T784
--------------------------------------------------
```

### Personalización

- Puedes modificar el script para cambiar el formato de salida, agregar más campos o adaptar los diagnósticos.
- Si el archivo de recetas tiene otro formato, ajusta la expresión regular en el script.

### Recomendaciones

- Revisa que el archivo de recetas esté bien formateado y que no falten datos.
- Si tienes dudas sobre cómo modificar el script, consulta la función `extraer_datos` dentro de `extractor_datos.py`.

---

¿Necesitás adaptar el script a otros formatos o automatizar la ejecución? ¡Podés pedir ayuda o modificar el código según tus necesidades!