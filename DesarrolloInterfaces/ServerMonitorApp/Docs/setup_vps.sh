#!/bin/bash

# setup_vps.sh - Script de Preparación del Host (Oracle Cloud / Ubuntu 24.04)

echo ">>> Iniciando configuración del VPS para ServerMonitorApp..."

# 1. Actualizar sistema
echo ">>> Actualizando paquetes..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Docker y Docker Compose
echo ">>> Instalando Docker..."
if ! command -v docker &> /dev/null
then
    curl -fsSL https://get.docker.com | sh
    echo ">>> Docker instalado correctamente."
else
    echo ">>> Docker ya está instalado."
fi

# 3. Configurar permisos de Docker
echo ">>> Configurando permisos..."
sudo usermod -aG docker $USER
# Aplicar cambios de grupo a la sesión actual (truco para no tener que reloguear en scripts desatendidos)
newgrp docker <<EONG

# 4. Configurar Socket de Docker (Crucial para Portainer/Supabase/Monitorización)
echo ">>> Ajustando permisos del socket Docker..."
sudo chmod 666 /var/run/docker.sock

# 5. Instalar Node.js y NPM (necesario para Supabase CLI si se usara, aunque aquí usaremos Docker directo mayormente)
# Instalamos fnm (Fast Node Manager) o nvm, pero para simplificar en VPS usaremos apt para versiones estables recientes o nvm.
# Usaremos nvm para flexibilidad.
echo ">>> Instalando NVM y Node.js LTS..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

echo ">>> Verificando versiones..."
docker --version
node -v
npm -v

echo ">>> ¡Preparación del Host Completada! Por favor, cierra sesión y vuelve a entrar para asegurar que los permisos de grupo se apliquen totalmente."
EONG
