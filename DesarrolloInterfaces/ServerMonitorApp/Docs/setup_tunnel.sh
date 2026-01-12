#!/bin/bash

# setup_tunnel.sh - Configuración de Cloudflare Tunnel

echo ">>> Iniciando configuración de Cloudflare Tunnel..."

# 1. Descargar e instalar cloudflared
echo ">>> Descargando cloudflared..."
# Detectar arquitectura para descargar el binario correcto (Oracle Cloud ARM vs AMD64)
ARCH=$(dpkg --print-architecture)
if [ "$ARCH" = "arm64" ]; then
    echo ">>> Detectada arquitectura ARM64 (Oracle Cloud Ampere)."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
elif [ "$ARCH" = "amd64" ]; then
    echo ">>> Detectada arquitectura AMD64."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
else
    echo "!!! Arquitectura no soportada automáticamente por este script: $ARCH"
    exit 1
fi

sudo dpkg -i cloudflared.deb
rm cloudflared.deb

echo ">>> cloudflared instalado."

# 2. Instrucciones de login
echo ""
echo "========================================================"
echo "PASO MANUAL REQUERIDO:"
echo "1. Ejecuta: cloudflared tunnel login"
echo "2. Copia la URL que aparece y ábrela en tu navegador para autorizar."
echo "3. Una vez autorizado, selecciona tu dominio."
echo "4. Luego ejecuta este comando para crear el túnel:"
echo "   cloudflared tunnel create server-monitor"
echo "5. Configura el enrutamiento DNS:"
echo "   cloudflared tunnel route dns server-monitor <tu-subdominio.tu-dominio.com>"
echo "6. Ejecuta el túnel mapeando al puerto de Supabase (por defecto 54321, 8000, o el que uses):"
echo "   cloudflared tunnel run --url http://localhost:54321 server-monitor"
echo "========================================================"
