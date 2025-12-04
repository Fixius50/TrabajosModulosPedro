import React from 'react';
import { ListOrdered } from 'lucide-react';
import { clsx } from 'clsx';

const TableOfContents = ({ blocks }) => {
    const headers = blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.type));
    if (headers.length === 0) return null;

    return (
        <div className="fixed right-4 top-24 z-20 hidden xl:block">
            <div className="group flex flex-col items-end">
                <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 shadow-sm transition-all cursor-pointer">
                    <ListOrdered size={20} />
                </div>
                <div className="absolute top-0 right-0 pt-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white border border-zinc-200 rounded-lg shadow-xl p-3 w-64 max-h-[70vh] overflow-y-auto">
                        <div className="text-xs font-bold text-zinc-400 uppercase mb-2 px-2">Índice</div>
                        <div className="space-y-0.5">
                            {headers.map(h => (
                                <div
                                    key={h.id}
                                    onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className={clsx(
                                        "px-2 py-1.5 rounded text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer truncate transition-colors",
                                        h.type === 'h2' && "pl-4 text-xs",
                                        h.type === 'h3' && "pl-6 text-xs"
                                    )}
                                >
                                    {h.content || '(Sin título)'}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableOfContents;
