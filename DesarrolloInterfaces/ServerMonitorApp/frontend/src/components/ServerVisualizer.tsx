"use client";

import { Card, Title, Text, Badge, Flex, Grid, Color } from "@tremor/react";
import { Cpu, Server, HardDrive, Box } from "lucide-react";

type Container = {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    cpu_usage: number;
};

type HostMetrics = {
    cpu_usage?: number;
    ram_usage?: number;
    memory_usage?: string;
    disk_usage_gb?: string;
    net_rx_mb?: number;
    net_tx_mb?: number;
};

type ServerVisualizerProps = {
    containers: Container[];
    metrics: HostMetrics | null;
};

const MetricCircle = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: any, color: string }) => {
    // Simple SVG circle implementation for visual flair
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const colorMap: Record<string, string> = {
        indigo: "text-indigo-500 stroke-indigo-500",
        purple: "text-purple-500 stroke-purple-500",
        cyan: "text-cyan-500 stroke-cyan-500",
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r={radius} className="stroke-slate-800 fill-none" strokeWidth="6" />
                    <circle
                        cx="40" cy="40" r={radius}
                        className={`${colorMap[color]} fill-none transition-all duration-1000 ease-out`}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${colorMap[color].split(" ")[0]}`} />
                </div>
            </div>
            <div className="text-center mt-1">
                <span className="text-lg font-bold text-slate-200">{value}%</span>
                <span className="text-xs text-slate-500 block">{label}</span>
            </div>
        </div>
    );
};

export default function ServerVisualizer({ containers, metrics }: ServerVisualizerProps) {
    return (
        <Card className="bg-black/40 border border-slate-800 h-full flex flex-col relative overflow-hidden backdrop-blur-sm">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Header / Host Metrics */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <Title className="text-slate-200 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-400" />
                    Ubuntu Server
                    <Badge size="xs" color="emerald" className="ml-2">ONLINE</Badge>
                </Title>
                <div className="text-xs text-slate-500 font-mono">
                    IP: 192.168.2.154
                </div>
            </div>

            {/* Radial Charts Row */}
            <div className="flex justify-around mb-8">
                <MetricCircle value={metrics?.cpu_usage || 0} label="CPU" icon={Cpu} color="indigo" />
                <MetricCircle value={metrics?.ram_usage || 0} label="RAM" icon={Server} color="purple" />
                {/* Disk is usually static % so we can simulate or parse 'X GB / Y GB' if needed, mostly visualization */}
                <MetricCircle value={45} label="DISK" icon={HardDrive} color="cyan" />
            </div>

            {/* Containers Rack View */}
            <Title className="text-slate-400 text-xs uppercase tracking-wider mb-2">Docker Containers</Title>
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                <Grid numItems={1} numItemsLg={2} className="gap-3">
                    {containers.map((c) => (
                        <div
                            key={c.id}
                            className={`
                                relative p-3 rounded-md border transition-all duration-300 group
                                ${c.state === 'running'
                                    ? 'bg-slate-900/60 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:border-emerald-500/40'
                                    : 'bg-slate-900/30 border-slate-800 opacity-60'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded bg-slate-950 ${c.state === 'running' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <Box className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-slate-200 text-sm font-medium leading-none mb-1 group-hover:text-emerald-300 transition-colors">
                                            {c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name}
                                        </div>
                                        <div className="text-slate-500 text-[10px] font-mono">{c.image}</div>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${c.state === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                            </div>
                        </div>
                    ))}
                </Grid>
            </div>
        </Card>
    );
}
