export type Container = {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    cpu_usage: number;
};

export type HostMetrics = {
    cpu_usage: number;
    ram_usage: number;
    memory_usage: string;
    disk_usage_gb: string;
    net_rx_mb: number;
    net_tx_mb: number;
    uptime: string;
};

export const generateMockMetrics = (): HostMetrics => {
    // Generate realistic fluctuating data
    const cpu = Math.floor(Math.random() * 40) + 10; // 10-50%
    const ram = Math.floor(Math.random() * 30) + 20; // 20-50%

    return {
        cpu_usage: cpu,
        ram_usage: ram,
        memory_usage: `${(ram / 100 * 16).toFixed(1)} GB / 16 GB`,
        disk_usage_gb: "450 GB / 980 GB",
        net_rx_mb: parseFloat((Math.random() * 5).toFixed(2)),
        net_tx_mb: parseFloat((Math.random() * 2).toFixed(2)),
        uptime: "15d 4h 23m"
    };
};

export const generateMockContainers = (): Container[] => {
    return [
        { id: "1", name: "nginx-proxy", image: "nginx:latest", state: "running", status: "Up 15 days", cpu_usage: 2.5 },
        { id: "2", name: "postgres-db", image: "postgres:15-alpine", state: "running", status: "Up 15 days", cpu_usage: 5.1 },
        { id: "3", name: "redis-cache", image: "redis:7", state: "running", status: "Up 5 days", cpu_usage: 1.2 },
        { id: "4", name: "nextjs-app", image: "node:18", state: "running", status: "Up 2 hours", cpu_usage: 12.4 },
        { id: "5", name: "worker-bot", image: "python:3.9", state: "exited", status: "Exited (1) 4 hours ago", cpu_usage: 0 },
        { id: "6", name: "log-collector", image: "fluentd:latest", state: "running", status: "Up 15 days", cpu_usage: 3.8 },
    ];
};
