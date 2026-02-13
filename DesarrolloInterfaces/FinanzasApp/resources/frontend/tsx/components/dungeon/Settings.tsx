import React from 'react';
import { DungeonCard } from './DungeonCard';
import { DungeonButton } from './DungeonButton';

export const DungeonSettings: React.FC = () => {
    return (
        <div className="min-h-screen bg-dungeon-bg p-4 bg-wood-texture flex flex-col gap-6">
            <div className="mb-4 text-center border-b-2 border-iron-border pb-2">
                <h2 className="font-dungeon-header text-2xl text-gold-coin drop-shadow-md tracking-widest uppercase">
                    Guild Settings
                </h2>
            </div>

            <DungeonCard title="Adventurer Profile">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-parchment border-2 border-gold-coin flex items-center justify-center">
                        <span className="font-dungeon-header text-2xl font-bold">A</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Adventurer Name</h3>
                        <p className="text-sm opacity-70">Level 5 Merchant</p>
                    </div>
                </div>
            </DungeonCard>

            <DungeonCard title="System Preferences">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span>Notifications (Raven Messenger)</span>
                        <input type="checkbox" className="toggle toggle-warning" defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Dark Magic Mode (Theme)</span>
                        <input type="checkbox" className="toggle toggle-warning" defaultChecked />
                    </div>
                </div>
            </DungeonCard>

            <div className="mt-auto">
                <DungeonButton variant="danger" className="w-full">Log Out (Leave Guild)</DungeonButton>
            </div>
        </div>
    );
};
