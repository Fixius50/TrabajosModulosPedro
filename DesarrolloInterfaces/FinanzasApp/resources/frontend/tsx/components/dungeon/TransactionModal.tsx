import React from 'react';
import { DungeonInput } from './DungeonInput';
import { DungeonButton } from './DungeonButton';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Modal Container (Parchment Overlay) */}
            <div className="relative w-full max-w-md bg-parchment-texture p-6 rounded-lg shadow-2xl border-4 border-iron-border transform transition-all scale-100 rotate-1">

                {/* Close Button (X in corner) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-ink/50 hover:text-ruby-expense font-dungeon-header text-xl font-bold"
                >
                    ✕
                </button>

                <h2 className="font-dungeon-header text-2xl text-center mb-6 text-ink border-b-2 border-iron-border pb-2">
                    Inscribe Transaction
                </h2>

                <div className="space-y-4">
                    <DungeonInput label="Amount (GP)" type="number" placeholder="0.00" />

                    <DungeonInput label="Description" type="text" placeholder="e.g. Iron Sword repair" />

                    {/* Rune Slots for Category */}
                    <div className="flex flex-col gap-2 mb-4">
                        <label className="font-dungeon-header text-ink text-sm font-bold uppercase">Mark Category</label>
                        <div className="flex justify-between gap-2">
                            {['Food', 'Travel', 'Gear', 'Tithe'].map(cat => (
                                <div key={cat} className="flex-1 aspect-square rounded-full border-2 border-iron-border bg-dungeon-bg/10 flex items-center justify-center hover:border-gold-coin hover:bg-gold-coin/20 cursor-pointer transition-all group">
                                    <span className="text-xs font-dungeon-header text-ink/70 group-hover:text-ink">{cat[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <DungeonButton variant="secondary" onClick={onClose}>Discard</DungeonButton>
                        <DungeonButton variant="primary" onClick={() => onSave({})}> Seal & Save</DungeonButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
