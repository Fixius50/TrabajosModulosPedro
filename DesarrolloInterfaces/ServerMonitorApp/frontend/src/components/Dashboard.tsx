"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TerminalComponent from "./Terminal";
import HeaderInfo from "./HeaderInfo";
import ActionPanel from "./ActionPanel";
import ServerVisualizer from "./ServerVisualizer";
import { Title, Text } from "@tremor/react";

type ServerStatus = "checking" | "online" | "offline";
type Container = {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    cpu_usage: number;
};

export default function Dashboard() {
    const [status, setStatus] = useState<ServerStatus>("checking");
    const [containers, setContainers] = useState<Container[]>([]);
    const [hostMetrics, setHostMetrics] = useState<any>(null); // Última métrica del host

    useEffect(() => {
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

    const sendCommand = async (command: string, containerId?: string) => {
        await supabase.from("sm_commands").insert({
            command,
            target_container_id: containerId
        });
        // El agente lo leerá y ejecutará
    };

    return (
        <div className="p-4 md:p-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4">
                <div>
                    <Title className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        NUCLEUS
                    </Title>
                    <Text className="text-slate-500 text-xs tracking-widest uppercase">Server Control Center</Text>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs text-slate-400 font-mono uppercase">
                        {status === 'online' ? 'System Online' : 'System Offline'}
                    </span>
                </div>
            </div>

            {/* Top Widgets */}
            <HeaderInfo />

            {/* Main Grid Layout (Left: Actions, Center: Visualizer, Right: Terminal) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-320px)] min-h-[600px]">
                {/* Left Panel: Actions (2 cols) */}
                <div className="lg:col-span-2 h-full">
                    <ActionPanel onCommand={sendCommand} />
                </div>

                {/* Center Panel: Visualizer (6 cols) */}
                <div className="lg:col-span-6 h-full">
                    <ServerVisualizer containers={containers} metrics={hostMetrics} />
                </div>

                {/* Right Panel: Terminal (4 cols) */}
                <div className="lg:col-span-4 h-full flex flex-col">
                    <TerminalComponent />
                </div>
            </div>
        </div>
    );
}
