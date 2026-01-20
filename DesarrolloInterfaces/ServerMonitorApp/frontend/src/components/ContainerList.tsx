"use client";

import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Title,
    Badge,
    Button,
} from "@tremor/react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Container {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
}

export default function ContainerList() {
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchContainers = async () => {
        setLoading(true);
        try {
            // Invocamos la función 'docker-vps' (nombre hipotético, ajustable)
            const { data, error } = await supabase.functions.invoke('docker-vps', {
                body: { action: 'list' },
            });

            if (error) {
                console.error("Error fetching containers:", error);
                // Fallback data for demo purposes if backend isn't ready
                setContainers([
                    { Id: "1", Names: ["/web-test"], Image: "nginx:latest", State: "running", Status: "Up 2 hours" },
                    { Id: "2", Names: ["/db-service"], Image: "postgres:14", State: "exited", Status: "Exited (0) 5 mins ago" },
                ]);
            } else {
                setContainers(data || []);
            }
        } catch (err) {
            console.error("Connection error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (containerId: string, action: 'start' | 'stop') => {
        console.log(`${action} container ${containerId}`);
        // Aquí iría la llamada real a la función
        await supabase.functions.invoke('docker-vps', {
            body: { action, containerId },
        });
        // Recargamos lista
        fetchContainers();
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    return (
        <Card>
            <Title>Contenedores Docker</Title>
            <Table className="mt-5">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Nombre</TableHeaderCell>
                        <TableHeaderCell>Imagen</TableHeaderCell>
                        <TableHeaderCell>Estado</TableHeaderCell>
                        <TableHeaderCell>Acciones</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {containers.map((item) => (
                        <TableRow key={item.Id}>
                            <TableCell>{item.Names[0]?.replace("/", "") || item.Id.substring(0, 12)}</TableCell>
                            <TableCell>
                                <Text>{item.Image}</Text>
                            </TableCell>
                            <TableCell>
                                <Badge color={item.State === "running" ? "emerald" : "gray"}>
                                    {item.State}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="xs"
                                    variant={item.State === "running" ? "secondary" : "primary"}
                                    color={item.State === "running" ? "rose" : "emerald"}
                                    onClick={() => handleAction(item.Id, item.State === "running" ? "stop" : "start")}
                                >
                                    {item.State === "running" ? "Detener" : "Iniciar"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
