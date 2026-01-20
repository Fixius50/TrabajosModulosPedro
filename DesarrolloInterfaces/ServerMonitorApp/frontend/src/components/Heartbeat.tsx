"use client";

import { Card, Metric, Text, Flex, Badge, ProgressBar } from "@tremor/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Heartbeat() {
    const [status, setStatus] = useState<"online" | "offline" | "checking">("checking");
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            const start = Date.now();
            try {
                // Hacemos una petición simple a la raíz del túnel (Supabase welcome JSON)
                // Usamos fetch directamente porque queremos probar la conectividad HTTP del túnel
                const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL || "", {
                    method: 'GET',
                    mode: 'cors', // Importante si el túnel lo soporta
                });

                if (res.ok) {
                    const end = Date.now();
                    setLatency(end - start);
                    setStatus("online");
                } else {
                    // Si responde pero con error (ej 404), al menos hay conexión
                    setStatus("online");
                    setLatency(Date.now() - start);
                }
            } catch (error) {
                console.error("Error heartbeat:", error);
                setStatus("offline");
                setLatency(null);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 10000); // Check cada 10s

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="max-w-xs mx-auto decoration-top decoration-blue-500">
            <Flex alignItems="start">
                <div>
                    <Text>Estado del Monitor</Text>
                    <Metric>{status === "online" ? "Conectado" : status === "checking" ? "Verificando..." : "Desconectado"}</Metric>
                </div>
                <Badge color={status === "online" ? "emerald" : status === "checking" ? "yellow" : "rose"}>
                    {status === "online" ? "Online" : status === "checking" ? "..." : "Offline"}
                </Badge>
            </Flex>
            <Flex className="mt-4">
                <Text className="truncate">Latencia: {latency ? `${latency}ms` : "-"}</Text>
            </Flex>
            {status === "checking" && <ProgressBar value={50} color="yellow" className="mt-2" />}
        </Card>
    );
}
