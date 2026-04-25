# INSSSEP AutoFill - Script de acceso rápido
# Ejecutar: powershell -ExecutionPolicy Bypass -File "Abrir-INSSSEP.ps1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   INSSSEP AutoFill - Abrir Portal" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Función para crear acceso directo en el escritorio
function Crear-AccesoDirecto {
    $WshShell = New-Object -ComObject WScript.Shell
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktop "INSSSEP AutoFill.lnk"
    
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "chrome.exe"
    $Shortcut.Arguments = "https://online.insssep.gob.ar/INSSSEP/init.do"
    $Shortcut.WorkingDirectory = "$env:LOCALAPPDATA\Google\Chrome\Application"
    $Shortcut.Description = "Portal INSSSEP con AutoFill"
    $Shortcut.IconLocation = "chrome.exe,0"
    
    # Crear icono personalizado si existe
    $Shortcut.Save()
    
    Write-Host "✓ Acceso directo creado en el escritorio: INSSSEP AutoFill.lnk" -ForegroundColor Green
    return $shortcutPath
}

# Menú principal
Write-Host "Opciones:" -ForegroundColor Yellow
Write-Host "  1. Abrir INSSSEP ahora" -ForegroundColor White
Write-Host "  2. Crear acceso directo en el escritorio" -ForegroundColor White
Write-Host "  3. Mostrar atajos de teclado" -ForegroundColor White
Write-Host "  4. Todo (Abrir + Crear acceso directo)" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opción (1-4)"

switch ($opcion) {
    "1" {
        Write-Host "Abriendo Chrome con INSSSEP..." -ForegroundColor Green
        Start-Process "chrome" "https://online.insssep.gob.ar/INSSSEP/init.do"
    }
    "2" {
        Crear-AccesoDirecto
    }
    "3" {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "   Atajos de teclado disponibles:" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Ctrl + Shift + I  → Mostrar/Ocultar overlay" -ForegroundColor Yellow
        Write-Host "  Ctrl + Shift + R  → Rellenar formulario" -ForegroundColor Yellow
        Write-Host "  Ctrl + Shift + →  → Siguiente paciente" -ForegroundColor Yellow
        Write-Host "  Ctrl + Shift + ←  → Paciente anterior" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  (Solo funcionan dentro del portal INSSSEP)" -ForegroundColor Gray
        Write-Host ""
        pause
    }
    "4" {
        Write-Host "Abriendo Chrome con INSSSEP..." -ForegroundColor Green
        Start-Process "chrome" "https://online.insssep.gob.ar/INSSSEP/init.do"
        Write-Host ""
        Crear-AccesoDirecto
    }
    default {
        Write-Host "Opción no válida. Abriendo INSSSEP por defecto..." -ForegroundColor Green
        Start-Process "chrome" "https://online.insssep.gob.ar/INSSSEP/init.do"
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Tips:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• El overlay aparece automáticamente al entrar" -ForegroundColor Gray
Write-Host "• Si no aparece, presiona Ctrl+Shift+I" -ForegroundColor Gray
Write-Host "• Usa Ctrl+Shift+R para rellenar el formulario" -ForegroundColor Gray
Write-Host "• Usa Ctrl+Flechas para cambiar de paciente" -ForegroundColor Gray
Write-Host ""

if ($opcion -ne "3") {
    Read-Host "Presiona ENTER para cerrar"
}
