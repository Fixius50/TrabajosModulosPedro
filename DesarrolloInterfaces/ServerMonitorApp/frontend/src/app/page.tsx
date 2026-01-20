import { Card, Text, Title, BarList, Grid } from "@tremor/react";
import Heartbeat from "@/components/Heartbeat";
import ContainerList from "@/components/ContainerList"; // Rebuild trigger

const chartdata = [
    { name: "Container A", value: 1230 },
    { name: "Container B", value: 751 },
    { name: "Container C", value: 471 },
    { name: "Container D", value: 280 },
    { name: "Container E", value: 78 },
];

export default function Home() {
    return (
        <main className="p-12">
            <Title>Server Monitor Dashboard</Title>
            <Text>Monitorización de contenedores en tiempo real</Text>

            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
                <Heartbeat />

                <Card className="col-span-1 lg:col-span-2">
                    <ContainerList />
                </Card>
            </Grid>

            <Card className="mt-6">
                <Title>Estado de Contenedores</Title>
                <BarList data={chartdata} className="mt-2" />
            </Card>
        </main>
    );
}
