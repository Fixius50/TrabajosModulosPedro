const Docker = require('dockerode');
const { createClient } = require('@supabase/supabase-js');
const si = require('systeminformation');
require('dotenv').config();

// Configuración
const docker = new Docker({ socketPath: '/var/run/docker.sock' }); // Linux/Mac
// const docker = new Docker(); // Windows con Pipe
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // ¡Usar Service Role Key!

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Faltan credenciales de Supabase en .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("🚀 ServerMonitor Agent iniciado...");

// 1. Sincronización de Contenedores (Loop cada 5s)
async function syncContainers() {
    try {
        const containers = await docker.listContainers({ all: true });

        for (const containerInfo of containers) {
            // Obtenemos stats básicos (simulados por rapidez, o reales si usamos docker.getContainer(id).stats())
            // En una app real de alta frecuencia, usaríamos streams. Aquí haremos snapshot.

            const payload = {
                id: containerInfo.Id.substring(0, 12),
                name: containerInfo.Names[0].replace('/', ''),
                image: containerInfo.Image,
                state: containerInfo.State,
                status: containerInfo.Status,
                last_updated: new Date().toISOString()
            };

            const { error } = await supabase
                .from('sm_containers')
                .upsert(payload);

            if (error) console.error("Error syncing container:", error.message);
        }
    } catch (err) {
        console.error("Error Docker sync:", err.message);
    }
}

// 2. Reportar Métricas del Host (sm_metrics)
async function reportHostMetrics() {
    try {
        const cpuLoading = await si.currentLoad();
        const mem = await si.mem();
        const osInfo = await si.osInfo();

        const payload = {
            hostname: osInfo.hostname,
            cpu_usage: cpuLoading.currentLoad.toFixed(2),
            ram_usage: ((mem.active / mem.total) * 100).toFixed(2),
            memory_usage: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB"
        };

        const { error } = await supabase.from('sm_metrics').insert(payload);

        if (error) console.error("Error pushing metrics:", error.message);

    } catch (e) {
        console.error("Error Host Metrics:", e.message);
    }
}

// 2. Escuchar Comandos (Realtime)
function listenForCommands() {
    console.log("👂 Escuchando comandos en 'sm_commands'...");

    supabase
        .channel('agent-commands')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sm_commands' }, async (payload) => {
            const commandRow = payload.new;
            if (commandRow.status !== 'pending') return;

            console.log(`⚡ Comando recibido: ${commandRow.command} -> ${commandRow.target_container_id || 'Global'}`);

            // Procesar comando
            let result = "Ejecutado";
            let status = "completed";

            try {
                if (commandRow.command === 'start_all_buckets') {
                    // Lógica custom: Iniciar todos los que tengan cierto label o simplemente todos
                    // Aquí simulamos iniciar uno de prueba
                    result = "Simulación: Todos los buckets iniciados.";
                } else if (commandRow.target_container_id) {
                    const container = docker.getContainer(commandRow.target_container_id);
                    if (commandRow.command === 'start') await container.start();
                    if (commandRow.command === 'stop') await container.stop();
                    if (commandRow.command === 'restart') await container.restart();
                }
            } catch (e) {
                status = "failed";
                result = e.message;
                console.error("Falló la ejecución:", e.message);
            }

            // Actualizar resultado en DB
            await supabase.from('sm_commands').update({
                status,
                result,
                executed_at: new Date().toISOString()
            }).eq('id', commandRow.id);

        })
        .subscribe();
}

// Inicializar
setInterval(syncContainers, 5000); // Sync Contenedores cada 5s
setInterval(reportHostMetrics, 10000); // Sync Host Stats cada 10s
syncContainers();
reportHostMetrics();
listenForCommands();
