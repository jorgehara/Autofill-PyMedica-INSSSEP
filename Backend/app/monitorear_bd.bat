@echo off
REM Script para monitorear la base de datos en tiempo real (cada 2 segundos)
REM Uso: monitorear_bd.bat

cd /d "%~dp0"

echo 🔍 Monitoreando base de datos SQLite...
echo Presiona Ctrl+C para salir
echo.

:loop
cls
python ver_bd.py
echo.
echo ⏱️  Actualizando cada 2 segundos...
timeout /t 2 /nobreak > nul
goto loop
