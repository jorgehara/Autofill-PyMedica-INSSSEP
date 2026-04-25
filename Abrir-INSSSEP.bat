@echo off
chcp 65001 >nul
echo ==========================================
echo   INSSSEP AutoFill - Abrir Portal
echo ==========================================
echo.

:: Abrir Chrome con INSSSEP
echo Abriendo portal INSSSEP...
start chrome "https://online.insssep.gob.ar/INSSSEP/init.do"

echo.
echo ==========================================
echo   Atajos de teclado disponibles:
echo ==========================================
echo.
echo   Ctrl + Shift + I  → Mostrar/Ocultar overlay
echo   Ctrl + Shift + R  → Rellenar formulario (doble clic)
echo   Ctrl + Shift + →  → Siguiente paciente
echo   Ctrl + Shift + ←  → Paciente anterior
echo.
echo   (Dentro del portal INSSSEP)
echo.
echo ==========================================
echo.
echo Portal abierto. Espera que cargue y presiona
echo Ctrl+Shift+I para mostrar el overlay.
echo.
pause
