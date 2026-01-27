#!/bin/bash

# ==========================================
# ServerMonitor: Script de Auto-Arranque y Utilidades
# ==========================================

echo "⚙️  Configurando entorno de auto-arranque..."

# 1. Asegurar que Docker arranca al inicio del sistema
echo "🐳 Habilitando Docker en el inicio..."
sudo systemctl enable docker
sudo systemctl start docker

# 2. Configurar Supabase para que arranque solo
# (Los contenedores de Supabase creados con el CLI suelen tener política 'restart: always' o 'unless-stopped')
# Pero por seguridad, vamos a asegurarnos que el CLI los levante si están caídos.
echo "database..."
cd ~/server-monitor
# Este truco añade reiniciar supabase al crontab si no existe (al reiniciar la máquina)
(crontab -l 2>/dev/null; echo "@reboot cd ~/server-monitor && npx supabase start") | crontab -

# 3. Configurar PM2 para el Agente (Node.js)
echo "🤖 Configurando Agente con PM2..."
cd ~/server-monitor/agent
# Guardar la lista actual de procesos
pm2 save
# Generar el script de startup (esto detecta el sistema y lo configura)
# NOTA: A veces requiere sudo manual, pero intentaremos automatizarlo
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# 4. Crear script de "Status" fácil
echo "📊 Creando alias 'monitor-status'..."
cat << 'EOF' > ~/monitor-status.sh
#!/bin/bash
echo "========================================"
echo "      SERVER MONITOR STATUS"
echo "========================================"
echo "1. DOCKER CONTAINERS:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "supabase|agent"
echo "----------------------------------------"
echo "2. AGENT LOGS (Last 5):"
pm2 logs agent --lines 5 --nostream
echo "----------------------------------------"
echo "3. SUPABASE INFO:"
cd ~/server-monitor && npx supabase status
echo "========================================"
EOF
chmod +x ~/monitor-status.sh

echo "✅ ¡Instalación Completada!"
echo "---------------------------------------------------"
echo "Prueba a reiniciar la máquina: sudo reboot"
echo "Al volver, ejecuta: ./monitor-status.sh para ver todo."
echo "---------------------------------------------------"
