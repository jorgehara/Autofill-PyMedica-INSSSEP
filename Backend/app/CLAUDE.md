# CLAUDE.md - Backend/app

Este directorio es el backend Flask del proyecto AutoFill-PyMedica-INSSSSEP.

**Ver el CLAUDE.md principal en la raiz del proyecto para el protocolo completo:**
`C:/Users/JorgeHaraDevs/Desktop/AutoFill-PyMedica-INSSSSEP/CLAUDE.md`

---

## Contexto rapido de este directorio

**Entry point**: `app.py` (Flask)
**Logica de negocio**: `processors/data_processor.py`
**Frontend**: `static/js/app.js` + `static/css/style.css` + `templates/index.html`
**Puerto**: 5000 (desarrollo), gunicorn (produccion)

## Comandos

```bash
# Desarrollo (desde este directorio)
python app.py

# Produccion
gunicorn -c gunicorn_config.py app:app
```

## Protocolo de trabajo obligatorio

1. FASE 1: Leer el codigo relacionado antes de tocar nada
2. FASE 2: Presentar plan y esperar aprobacion
3. FASE 3: Implementar solo lo aprobado, un archivo a la vez

**NUNCA** modificar el formato de exportacion para extension sin confirmar con el usuario.
**NUNCA** cambiar la logica de conversion recetas->consultas sin confirmar.
