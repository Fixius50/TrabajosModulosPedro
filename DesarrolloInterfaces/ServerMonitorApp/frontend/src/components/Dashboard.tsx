"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TerminalComponent from "./Terminal";
import HeaderInfo from "./HeaderInfo";
import ActionPanel from "./ActionPanel";
import ServerVisualizer from "./ServerVisualizer";
import { Title, Text, Button, Badge } from "@tremor/react";
import { ThemeToggle } from "./ThemeToggle";
import { Play, Database } from "lucide-react";
import { generateMockMetrics, generateMockContainers, type Container, type HostMetrics } from "@/lib/mockData";
import ExternalStatus from "./ExternalStatus";
import SecurityFeed from "./SecurityFeed";

type ServerStatus = "checking" | "online" | "offline";

export default function Dashboard() {
    const [status, setStatus] = useState<ServerStatus>("checking");
    const [containers, setContainers] = useState<Container[]>([]);
    const [hostMetrics, setHostMetrics] = useState<HostMetrics | null>(null);
    const [isSimulated, setIsSimulated] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSimulated) {
            // Simulation Loop
            setStatus("online");
            setContainers(generateMockContainers()); // Static list for now
            // Force immediate update
            setHostMetrics(generateMockMetrics());

            interval = setInterval(() => {
                setHostMetrics(generateMockMetrics());
            }, 2000);
        } else {
            // Real Supabase Logic
            setContainers([]); // Clear mock data immediately
            setHostMetrics(null);
            setStatus("checking");

            fetchContainers();
            fetchLatestMetrics();

            const channelContainers = supabase
                .channel('public:sm_containers')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'sm_containers' }, () => fetchContainers())
                .subscribe();

            const channelMetrics = supabase
                .channel('public:sm_metrics')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sm_metrics' }, (payload) => {
                    // Type assertion to fix build error
                    setHostMetrics(payload.new as unknown as HostMetrics);
                    setStatus("online");
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channelContainers);
                supabase.removeChannel(channelMetrics);
            };
        }

        return () => clearInterval(interval);
    }, [isSimulated]);

    const fetchContainers = async () => {
        const { data } = await supabase.from("sm_containers").select("*").order("name");
        if (data) setContainers(data);
    };

    const fetchLatestMetrics = async () => {
        const { data } = await supabase.from("sm_metrics").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (data) {
            setHostMetrics(data);
            setStatus("online");
        }
    };

    const sendCommand = async (command: string, containerId?: string) => {
        if (isSimulated) {
            console.log(`[SIMULATION] Command sent: ${command}`);
            return;
        }
        await supabase.from("sm_commands").insert({
            command,
            target_container_id: containerId
        });
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <Title className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                        NUCLEUS
                    </Title>
                    <Text className="text-slate-500 text-xs tracking-widest uppercase">Server Control Center</Text>
                </div>

                <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <Button
                        size="xs"
                        variant={isSimulated ? "primary" : "secondary"}
                        color="amber"
                        icon={Database}
                        onClick={() => setIsSimulated(!isSimulated)}
                    >
                        {isSimulated ? "Simulating" : "Live Data"}
                    </Button>

                    <ThemeToggle />

                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                        <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">
                            {status === 'online' ? 'System Online' : 'System Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Widgets */}
            <HeaderInfo />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                {/* Left Panel: Actions */}
                <div className="lg:col-span-2 h-[600px]">
                    <ActionPanel onCommand={sendCommand} />
                </div>

                {/* Center Panel: Visualizer */}
                <div className="lg:col-span-6 h-[600px]">
                    <ServerVisualizer containers={containers} metrics={hostMetrics} />
                </div>

                {/* Right Panel: Terminal */}
                <div className="lg:col-span-4 h-[600px] flex flex-col">
                    <TerminalComponent />
                </div>

                {/* New Footer Row: Status & Security */}
                <div className="lg:col-span-4 h-64">
                    <ExternalStatus />
                </div>
                <div className="lg:col-span-8 h-64">
                    <SecurityFeed />
                </div>
            </div>
        </div>
    );
}
