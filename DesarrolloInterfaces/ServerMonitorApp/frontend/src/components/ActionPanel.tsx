"use client";

import { Card, Title, Button, Flex } from "@tremor/react";
import { Play, Square, RefreshCw, Power } from "lucide-react";

type ActionPanelProps = {
    onCommand: (cmd: string, id?: string) => void;
};

export default function ActionPanel({ onCommand }: ActionPanelProps) {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 h-full flex flex-col transition-colors">
            <Title className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Acciones Rápidas
            </Title>

            <div className="flex flex-col gap-3 flex-grow">
                <div className="space-y-2">
                    <span className="text-xs text-slate-500 block">Global</span>
                    <Button
                        size="sm"
                        variant="secondary"
                        color="emerald"
                        className="w-full justify-start hover:bg-emerald-950/30"
                        icon={Play}
                        onClick={() => onCommand('start_all')}
                    >
                        Iniciar Todo
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        color="rose"
                        className="w-full justify-start hover:bg-rose-950/30"
                        icon={Square}
                        onClick={() => onCommand('stop_all')}
                    >
                        Detener Todo
                    </Button>
                </div>

                <div className="space-y-2 mt-4">
                    <span className="text-xs text-slate-500 block">Mantenimiento</span>
                    <Button
                        size="sm"
                        variant="secondary"
                        color="amber"
                        className="w-full justify-start hover:bg-amber-950/30"
                        icon={RefreshCw}
                        onClick={() => onCommand('restart_service')}
                    >
                        Reiniciar Servicio
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        color="slate"
                        className="w-full justify-start hover:bg-slate-800"
                        icon={Power}
                    >
                        Apagar Host (WIP)
                    </Button>
                </div>
            </div>
        </Card>
    );
}
