@echo off
chcp 65001 >nul
cls

echo ╔══════════════════════════════════════════════════════════════╗
echo ║         Sistema de Procesamiento INSSSEP - v2.0            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en el PATH
    echo.
    echo Por favor, instala Python 3.8 o superior desde:
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [✓] Python detectado
echo.

REM Verificar si existe el entorno virtual
if not exist "venv" (
    echo [!] Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual
        pause
        exit /b 1
    )
    echo [✓] Entorno virtual creado
    echo.
)

REM Activar entorno virtual
echo [!] Activando entorno virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] No se pudo activar el entorno virtual
    pause
    exit /b 1
)
echo [✓] Entorno virtual activado
echo.

REM Instalar/actualizar dependencias
echo [!] Verificando dependencias...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)
echo [✓] Dependencias instaladas
echo.

REM Crear directorios necesarios
if not exist "uploads" mkdir uploads
if not exist "exports" mkdir exports
echo [✓] Directorios creados
echo.

REM Limpiar caché de Python
echo [!] Limpiando caché de Python...
if exist "__pycache__" rd /s /q "__pycache__"
if exist "processors\__pycache__" rd /s /q "processors\__pycache__"
echo [✓] Caché limpiado
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 INICIANDO SERVIDOR...                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo    Accede a la aplicación en:
echo    ► http://localhost:5000
echo.
echo    Presiona Ctrl+C para detener el servidor
echo.
echo ══════════════════════════════════════════════════════════════
echo.

REM Iniciar aplicación con variables para forzar recarga
set PYTHONDONTWRITEBYTECODE=1
python app.py

pause
