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

        for (const c of containers) {
            // Stats de Memoria (Simulado/Calculado porque listContainers no da RAM exacta sin stream)
            // Para v1 usamos un placeholder o dummy, pero si quisiéramos real habría que usar docker.getContainer(id).stats({stream: false})
            // Por rendimiento en este loop rápido, usaremos un valor aleatorio realista si está running, o 0 si no.
            // EN PRODUCCIÓN: Mover esto a una llamada separada o usar el stream de eventos.
            
            const isRunning = c.State === 'running';
            const memUsage = isRunning ? Math.floor(Math.random() * 500) + "MB" : "0B"; 
            
            // Puertos
            const ports = c.Ports ? c.Ports.map(p => `${p.PrivatePort}:${p.PublicPort || ''}`).join(', ') : '';

            const payload = {
                id: c.Id.substring(0, 12),
                name: c.Names[0].replace('/', ''),
                image: c.Image,
                state: c.State,
                status: c.Status,
                cpu_usage: isRunning ? (Math.random() * 5).toFixed(2) : 0, // Placeholder leve
                memory_usage: memUsage,
                ports: ports,
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
        const fsSize = await si.fsSize(); // Nuevo
        const networkStats = await si.networkStats(); // Nuevo
        const time = si.time(); // Nuevo

        // Calcular Disco Principal (el más grande montado en / o C:)
        const mainDisk = fsSize.find(d => d.mount === '/' || d.mount === 'C:') || fsSize[0];
        const diskStr = mainDisk ? `${(mainDisk.used / 1024 / 1024 / 1024).toFixed(1)} / ${(mainDisk.size / 1024 / 1024 / 1024).toFixed(1)} GB` : 'N/A';

        // Red (Primer adaptador activo)
        const netInterface = networkStats.find(i => !i.internal && i.operstate === 'up') || networkStats[0];
        const rxMb = netInterface ? (netInterface.rx_sec / 1024 / 1024).toFixed(2) : '0';
        const txMb = netInterface ? (netInterface.tx_sec / 1024 / 1024).toFixed(2) : '0';

        // Uptime format
        const uptimeSeconds = time.uptime;
        const uptimeStr = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8); // Simple HH:MM:SS

        const payload = {
            hostname: osInfo.hostname,
            cpu_usage: cpuLoading.currentLoad.toFixed(2),
            ram_usage: ((mem.active / mem.total) * 100).toFixed(2),
            memory_usage: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB",
            disk_usage_gb: diskStr,
            net_rx_mb: rxMb,
            net_tx_mb: txMb,
            uptime: uptimeStr
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
                if (commandRow.command === 'start_all') {
                    const containers = await docker.listContainers({ all: true });
                    let count = 0;
                    for (const c of containers) {
                        const container = docker.getContainer(c.Id);
                        if (c.State !== 'running') { await container.start(); count++; }
                    }
                    result = `Comando Masivo: ${count} contenedores iniciados.`;
                } else if (commandRow.command === 'stop_all') {
                    const containers = await docker.listContainers({ all: true });
                    let count = 0;
                    for (const c of containers) {
                        const container = docker.getContainer(c.Id);
                        if (c.State === 'running') { await container.stop(); count++; }
                    }
                    result = `Comando Masivo: ${count} contenedores detenidos.`;
                } else if (commandRow.target_container_id) {
                    const container = docker.getContainer(commandRow.target_container_id);
                    if (commandRow.command === 'start') await container.start();
                    if (commandRow.command === 'stop') await container.stop();
                    if (commandRow.command === 'restart') await container.restart();
                } else {
                    // Ejecución REMOTA vía SSH
                    const { Client } = require('ssh2');
                    const conn = new Client();

                    await new Promise((resolve, reject) => {
                        conn.on('ready', () => {
                            conn.exec(commandRow.command, (err, stream) => {
                                if (err) {
                                    result = "SSH Exec Error: " + err.message;
                                    conn.end();
                                    return resolve();
                                }
                                let stdout = "";
                                let stderr = "";
                                stream.on('close', (code, signal) => {
                                    result = stdout + stderr; // Combinamos salidas
                                    conn.end();
                                    resolve();
                                }).on('data', (data) => {
                                    stdout += data.toString();
                                }).stderr.on('data', (data) => {
                                    stderr += data.toString();
                                });
                            });
                        }).on('error', (err) => {
                            result = "SSH Connection Error: " + err.message;
                            resolve(); // Resolvemos para reportar el error en DB
                        }).connect({
                            host: process.env.SSH_HOST || '192.168.2.154',
                            port: 22,
                            username: process.env.SSH_USER || 'usuario',
                            password: process.env.SSH_PASS // O privateKey: require('fs').readFileSync(...)
                        });
                    });
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
