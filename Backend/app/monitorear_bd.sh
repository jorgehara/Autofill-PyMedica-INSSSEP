#!/bin/bash
# Script para monitorear la base de datos en tiempo real (cada 2 segundos)
# Uso: ./monitorear_bd.sh

cd "$(dirname "$0")"

echo "🔍 Monitoreando base de datos SQLite..."
echo "Presiona Ctrl+C para salir"
echo ""

while true; do
    clear
    python ver_bd.py
    echo "⏱️  Actualizando cada 2 segundos..."
    sleep 2
done
