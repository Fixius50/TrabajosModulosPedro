"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Terminal as TerminalIcon, Send } from "lucide-react";
import { Card, Title, TextInput, Button } from "@tremor/react";

type CommandLog = {
    id: string;
    command: string;
    result: string | null;
    status: string;
    created_at: string;
};

export default function TerminalComponent() {
    const [history, setHistory] = useState<CommandLog[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Suscribirse a actualizaciones de comandos para ver respuestas
        const channel = supabase
            .channel('terminal-results')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sm_commands' }, (payload) => {
                const updatedCmd = payload.new as CommandLog;
                setHistory(prev => prev.map(cmd => cmd.id === updatedCmd.id ? updatedCmd : cmd));
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;
        const cmd = input.trim();
        setInput("");
        setLoading(true);

        // 1. Insertar comando
        const { data, error } = await supabase
            .from('sm_commands')
            .insert({ command: cmd, status: 'pending' })
            .select()
            .single();

        if (data) {
            setHistory(prev => [...prev, data]);
            setLoading(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 ring-0 p-0 overflow-hidden h-full flex flex-col transition-colors">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0">
                <TerminalIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <Title className="text-slate-700 dark:text-slate-300 text-sm font-mono">Terminal</Title>
            </div>

            <div className="flex-grow overflow-y-auto p-4 font-mono text-sm space-y-4 bg-slate-100 dark:bg-black/40 h-0 min-h-0">
                {history.map((entry) => (
                    <div key={entry.id}>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <span className="text-emerald-600 dark:text-emerald-500 mr-2">$</span>
                            {entry.command}
                        </div>
                        {entry.result && (
                            <pre className="mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                                {entry.result}
                            </pre>
                        )}
                        {entry.status === 'pending' && (
                            <div className="ml-4 text-amber-500 text-xs animate-pulse">Ejecutando...</div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
                <TextInput
                    placeholder="Comando (ej: docker ps)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="font-mono bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
                <Button size="xs" variant="secondary" color="emerald" icon={Send} onClick={handleSend} loading={loading}>
                    Enviar
                </Button>
            </div>
        </Card>
    );
}
