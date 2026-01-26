"use client";

import { Card, Title, Text, Metric, Grid, Badge, Button, Flex, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Activity, Server, Radio, Zap, Play, Square, RefreshCw, HardDrive, Network, Clock, MapPin } from "lucide-react";
import TerminalComponent from "./Terminal";

type ServerStatus = "checking" | "online" | "offline";
type Container = {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    cpu_usage: number;
};

type GeoData = {
    country?: string;
    isp?: string;
    city?: string;
    query?: string; // IP
};

export default function Dashboard() {
    const [status, setStatus] = useState<ServerStatus>("checking");
    const [containers, setContainers] = useState<Container[]>([]);
    const [hostMetrics, setHostMetrics] = useState<any>(null); // Última métrica del host
    const [geo, setGeo] = useState<GeoData | null>(null);

    useEffect(() => {
        fetchGeo();

        // 1. Suscripción a Contenedores
        const channelContainers = supabase
            .channel('public:sm_containers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sm_containers' }, (payload) => {
                fetchContainers(); // Recargar lista completa para simplificar
            })
            .subscribe();

        // 2. Suscripción a Métricas de Host (solo necesitamos la última)
        const channelMetrics = supabase
            .channel('public:sm_metrics')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sm_metrics' }, (payload) => {
                setHostMetrics(payload.new);
                setStatus("online"); // Si llegan métricas, el agente está vivo
            })
            .subscribe();

        // Carga inicial
        fetchContainers();
        fetchLatestMetrics();

        return () => {
            supabase.removeChannel(channelContainers);
            supabase.removeChannel(channelMetrics);
        };
    }, []);

    const fetchContainers = async () => {
        const { data } = await supabase.from("sm_containers").select("*").order("name");
        if (data) setContainers(data);
    };

    const fetchLatestMetrics = async () => {
        const { data } = await supabase.from("sm_metrics").select("*").order("created_at", { ascending: false }).limit(1).single();
        if (data) {
            setHostMetrics(data);
            setStatus("online");
        }
    };

    const fetchGeo = async () => {
        try {
            // Using ipapi.co (HTTPS supported)
            const res = await fetch("https://ipapi.co/json/");
            if (!res.ok) throw new Error("Geo API Error");
            const data = await res.json();

            setGeo({
                country: data.country_name,
                city: data.city,
                isp: data.org,
                query: data.ip
            });
        } catch (e) {
            console.error("Geo fetch failed:", e);
            // Fallback or empty state is handled by null geo
        }
    }

    const sendCommand = async (command: string, containerId?: string) => {
        await supabase.from("sm_commands").insert({
            command,
            target_container_id: containerId
        });
        // El agente lo leerá y ejecutará
    };

    return (
        <div className="p-6 md:p-10 bg-slate-950 min-h-screen text-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        ServerMonitor
                    </Title>
                    <Text className="text-slate-400 mt-1">Panel de Control en Tiempo Real</Text>
                </div>
                <Badge
                    icon={Activity}
                    color={status === "online" ? "emerald" : "rose"}
                    size="xl"
                    className="animate-pulse"
                >
                    {status === "online" ? "AGENTE CONECTADO" : "ONLINE"}
                </Badge>
            </div>

            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
                <Card decoration="top" decorationColor="indigo" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">CPU Host</Text>
                            <Metric className="text-slate-100">{hostMetrics?.cpu_usage || 0}%</Metric>
                        </div>
                        <Activity className="text-indigo-500 w-5 h-5" />
                    </Flex>
                </Card>
                <Card decoration="top" decorationColor="purple" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">RAM Host</Text>
                            <Metric className="text-slate-100">{hostMetrics?.ram_usage || 0}%</Metric>
                            <Text className="text-xs text-slate-500 mt-1">{hostMetrics?.memory_usage}</Text>
                        </div>
                        <Server className="text-purple-500 w-5 h-5" />
                    </Flex>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">Disco Principal</Text>
                            <Metric className="text-slate-100 truncate text-xl">{hostMetrics?.disk_usage_gb || "N/A"}</Metric>
                            <Text className="text-xs text-slate-500 mt-1">Usado / Total</Text>
                        </div>
                        <HardDrive className="text-cyan-500 w-5 h-5" />
                    </Flex>
                </Card>
                <Card decoration="top" decorationColor="amber" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">Red (Rx / Tx)</Text>
                            <div className="flex gap-2 items-baseline">
                                <Metric className="text-slate-100 text-xl">⬇ {hostMetrics?.net_rx_mb || 0}</Metric>
                                <Text className="text-xs text-slate-500">MB/s</Text>
                            </div>
                            <div className="flex gap-2 items-baseline">
                                <Metric className="text-slate-100 text-xl">⬆ {hostMetrics?.net_tx_mb || 0}</Metric>
                                <Text className="text-xs text-slate-500">MB/s</Text>
                            </div>
                        </div>
                        <Network className="text-amber-500 w-5 h-5" />
                    </Flex>
                </Card>
                <Card decoration="top" decorationColor="rose" className="bg-slate-900 border-slate-800 ring-0">
                    <Text className="text-slate-400">Acciones Globales</Text>
                    <Flex className="mt-3 space-x-2">
                        <Button size="xs" color="emerald" icon={Play} onClick={() => sendCommand('start_all')} variant="secondary">Start All</Button>
                        <Button size="xs" color="rose" icon={Square} onClick={() => sendCommand('stop_all')} variant="secondary">Stop All</Button>
                    </Flex>
                </Card>

                {/* Geolocation Card */}
                <Card decoration="top" decorationColor="orange" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">Ubicación</Text>
                            <Metric className="text-slate-100 text-xl truncate" title={geo ? `${geo.city}, ${geo.country}` : "Cargando..."}>
                                {geo ? `${geo.city}` : "Localizando..."}
                            </Metric>
                            <Text className="text-xs text-slate-500 mt-1 truncate" title={geo?.isp}>
                                {geo ? geo.country : "-"}
                            </Text>
                            {geo?.isp && <Text className="text-xs text-slate-600 mt-0.5 truncate">{geo.isp}</Text>}
                        </div>
                        <MapPin className="text-orange-500 w-5 h-5" />
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="emerald" className="bg-slate-900 border-slate-800 ring-0">
                    <Flex alignItems="start">
                        <div>
                            <Text className="text-slate-400">Uptime</Text>
                            <Metric className="text-slate-100 text-xl">{hostMetrics?.uptime || "00:00:00"}</Metric>
                            <Text className="text-xs text-slate-500 mt-1">Tiempo encendido</Text>
                        </div>
                        <Clock className="text-emerald-500 w-5 h-5" />
                    </Flex>
                </Card>
            </Grid>

            <Card className="bg-slate-900 border-slate-800 ring-0 mt-6">
                <Title className="text-slate-100 mb-4">Gestión de Contenedores (Docker)</Title>
                <Table className="mt-5">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell className="text-slate-400">Nombre</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Imagen</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Estado</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400 text-right">Acciones</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {containers.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-slate-200 font-medium">{item.name}</TableCell>
                                <TableCell className="text-slate-400">{item.image}</TableCell>
                                <TableCell>
                                    <Badge color={item.state === "running" ? "emerald" : "rose"} size="xs">
                                        {item.state.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Flex justifyContent="end" className="space-x-2">
                                        <Button size="xs" variant="secondary" color="emerald" icon={Play} onClick={() => sendCommand('start', item.id)} disabled={item.state === 'running'}>
                                            Start
                                        </Button>
                                        <Button size="xs" variant="secondary" color="amber" icon={RefreshCw} onClick={() => sendCommand('restart', item.id)}>
                                            Restart
                                        </Button>
                                        <Button size="xs" variant="secondary" color="rose" icon={Square} onClick={() => sendCommand('stop', item.id)} disabled={item.state !== 'running'}>
                                            Stop
                                        </Button>
                                    </Flex>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <TerminalComponent />
        </div>
    );
}
