"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, Title, Text, Metric, Flex, ProgressBar, Badge, Button, Grid, Col, DonutChart, List, ListItem } from "@tremor/react";
import { Play, Square, RefreshCw, ArrowLeft, Terminal, Cpu, HardDrive } from "lucide-react";
import { useRouter } from "next/navigation";

// Definimos la interfaz localmente o importamos si existe una compartida
// (Por ahora duplicamos para asegurar encapsulamiento rápido)
interface Container {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    cpu_usage: number;
    memory_usage: string; // Ej: "50MB / 1GB"
    ports: string;
    last_updated: string;
}

interface ContainerDetailProps {
    containerId: string;
}

export default function ContainerDetail({ containerId }: ContainerDetailProps) {
    const router = useRouter();
    const [container, setContainer] = useState<Container | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        // Fetch inicial
        const fetchContainer = async () => {
            const { data, error } = await supabase
                .from('sm_containers')
                .select('*')
                .eq('id', containerId)
                .single();

            if (data) setContainer(data);
            setLoading(false);
        };

        fetchContainer();

        // Suscripción Realtime
        const channel = supabase
            .channel(`container-${containerId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sm_containers',
                filter: `id=eq.${containerId}`
            }, (payload) => {
                setContainer(payload.new as Container);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [containerId]);

    const sendCommand = async (action: string) => {
        if (!container) return;

        const cmdMap: Record<string, string> = {
            'start': `docker start ${container.id}`,
            'stop': `docker stop ${container.id}`,
            'restart': `docker restart ${container.id}`
        };

        const command = cmdMap[action];
        if (!command) return;

        setActionLoading(action);

        // Insertamos en la tabla de comandos que el Agente escucha
        await supabase
            .from('sm_commands')
            .insert({ command: command, status: 'pending' });

        // Simulamos un delay de UI para feedback, aunque el estado real vendrá del socket
        setTimeout(() => setActionLoading(null), 2000);
    };

    if (loading) return <div className="p-10 text-slate-500">Cargando detalles del contenedor...</div>;
    if (!container) return <div className="p-10 text-red-500">Contenedor no encontrado (ID: {containerId})</div>;

    const isRunning = container.state === 'running';

    // Parsear uso de memoria para gráfica (Ej: "45MB" -> 45)
    const memVal = parseInt(container.memory_usage.replace(/[^\d]/g, '')) || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header y Navegación */}
            <div className="flex items-center justify-between">
                <Button
                    variant="light"
                    icon={ArrowLeft}
                    onClick={() => router.push('/')}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    Volver al Dashboard
                </Button>
                <Badge size="lg" color={isRunning ? "emerald" : "rose"}>
                    {container.state.toUpperCase()}
                </Badge>
            </div>

            <Grid numItems={1} numItemsLg={3} className="gap-6">
                {/* Panel Principal: Info Básica */}
                <Col numColSpan={1} numColSpanLg={2}>
                    <Card className="h-full decoration-t-4 decoration-emerald-500">
                        <Flex alignItems="start" className="mb-4">
                            <div>
                                <Title className="text-2xl font-bold font-mono">{container.name}</Title>
                                <Text className="font-mono text-slate-500">{container.image}</Text>
                            </div>
                            <Terminal className="w-8 h-8 text-slate-400 opacity-20" />
                        </Flex>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <Text>ID del Contenedor</Text>
                                <div className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs mt-1">
                                    {container.id}
                                </div>
                            </div>
                            <div>
                                <Text>Estado</Text>
                                <div className="font-mono text-sm mt-1">{container.status}</div>
                            </div>
                            <div className="col-span-2">
                                <Text>Puertos Expuestos</Text>
                                <div className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1 break-all">
                                    {container.ports || "Sin puertos expuestos"}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Panel de Control */}
                <Card>
                    <Title className="mb-4">Acciones</Title>
                    <div className="space-y-3">
                        <Button
                            className="w-full justify-start"
                            size="lg"
                            variant={isRunning ? "secondary" : "primary"}
                            color="emerald"
                            icon={Play}
                            disabled={isRunning || !!actionLoading}
                            loading={actionLoading === 'start'}
                            onClick={() => sendCommand('start')}
                        >
                            Iniciar Contenedor
                        </Button>
                        <Button
                            className="w-full justify-start"
                            size="lg"
                            variant="secondary"
                            color="amber"
                            icon={RefreshCw}
                            disabled={!!actionLoading}
                            loading={actionLoading === 'restart'}
                            onClick={() => sendCommand('restart')}
                        >
                            Reiniciar
                        </Button>
                        <Button
                            className="w-full justify-start"
                            size="lg"
                            variant={!isRunning ? "secondary" : "primary"}
                            color="rose"
                            icon={Square}
                            disabled={!isRunning || !!actionLoading}
                            loading={actionLoading === 'stop'}
                            onClick={() => sendCommand('stop')}
                        >
                            Detener
                        </Button>
                    </div>
                </Card>
            </Grid>

            {/* Panel de Métricas */}
            <Title>Métricas en Tiempo Real</Title>
            <Grid numItems={1} numItemsSm={2} className="gap-6">
                <Card decoration="left" decorationColor="blue">
                    <Flex className="mb-4">
                        <Title>Uso de CPU</Title>
                        <Cpu className="w-5 h-5 text-blue-500" />
                    </Flex>
                    <Metric>{container.cpu_usage.toFixed(1)}%</Metric>
                    <ProgressBar value={container.cpu_usage} color="blue" className="mt-4" />
                </Card>
                <Card decoration="left" decorationColor="violet">
                    <Flex className="mb-4">
                        <Title>Uso de Memoria (Est.)</Title>
                        <HardDrive className="w-5 h-5 text-violet-500" />
                    </Flex>
                    <Metric>{container.memory_usage}</Metric>
                    <ProgressBar value={(Math.min(memVal, 500) / 500) * 100} color="violet" className="mt-4" />
                    <Text className="text-xs mt-2 text-right">Escala ref: 500MB</Text>
                </Card>
            </Grid>
        </div>
    );
}
