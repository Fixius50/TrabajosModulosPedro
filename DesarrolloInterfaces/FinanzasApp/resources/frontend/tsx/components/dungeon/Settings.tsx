import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DungeonCard } from './DungeonCard';
import { DungeonButton } from './DungeonButton';
import { supabase } from '../../../ts/supabaseClient';
import { storageService } from '../../../ts/services/storageService';

export const DungeonSettings: React.FC = () => {
    const { t } = useTranslation();
    const [syncing, setSyncing] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleCloudSync = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setSyncing(true);
        try {
            // Mocking data for now, in a real app this would be a full dump of the DB
            const appData = {
                exported_at: new Date().toISOString(),
                version: "1.0.0",
                inventory: [], // This would come from real services
                transactions: []
            };

            await storageService.uploadUserData(user.id, "auto_save", appData);
            alert(t('settings.saved'));
        } catch (err) {
            console.error(err);
            alert(t('profile.error'));
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-dungeon-bg p-4 bg-wood-texture flex flex-col gap-6">
            <div className="mb-4 text-center border-b-2 border-iron-border pb-2">
                <h2 className="font-dungeon-header text-2xl text-gold-coin drop-shadow-md tracking-widest uppercase">
                    {t('settings.title')}
                </h2>
            </div>

            <DungeonCard title={t('settings.editProfile')}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-parchment border-2 border-gold-coin flex items-center justify-center">
                        <span className="font-dungeon-header text-2xl font-bold text-[#5d4037]">A</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t('profile.username')}</h3>
                        <p className="text-sm opacity-70">Level 5 Merchant</p>
                    </div>
                </div>
            </DungeonCard>

            <DungeonCard title={t('settings.exportData')}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                        <div className="flex flex-col">
                            <span className="font-bold">Supabase Cloud Sync</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-tighter">Remote Backup</span>
                        </div>
                        <DungeonButton
                            variant="secondary"
                            onClick={handleCloudSync}
                            disabled={syncing}
                        >
                            {syncing ? 'SYNCING...' : 'SYNC NOW'}
                        </DungeonButton>
                    </div>
                </div>
            </DungeonCard>

            <DungeonCard title={t('settings.api_tokens')}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span>{t('settings.language')}</span>
                        <span className="text-gold-coin font-bold">ES</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>{t('settings.darkMode')} (Dark Magic)</span>
                        <input type="checkbox" className="toggle toggle-warning" defaultChecked />
                    </div>
                </div>
            </DungeonCard>

            <div className="mt-auto">
                <DungeonButton variant="danger" className="w-full" onClick={handleLogout}>
                    {t('settings.logout')}
                </DungeonButton>
            </div>
        </div>
    );
};
