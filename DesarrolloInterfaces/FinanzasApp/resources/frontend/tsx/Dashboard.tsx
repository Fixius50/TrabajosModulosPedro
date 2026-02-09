import React from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { BentoGrid, BentoItem } from './components/dashboard/BentoGrid';
import MarketHolo from './components/dashboard/3d/MarketHolo';
import EnergyWidget from './widgets/EnergyWidget';
import BagCarousel from './components/dashboard/BagCarousel';
import AccountUnlockModal from './AccountUnlockModal';
import { bankAccountService, type BankAccount } from '../ts/bankAccountService';

// Icons
import { IonIcon } from '@ionic/react';
import { statsChartOutline, cubeOutline, personOutline } from 'ionicons/icons';

interface DashboardProps {
    onUnlock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUnlock }) => {
    const router = useIonRouter();
    const [accounts, setAccounts] = React.useState<BankAccount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [unlockedAccounts, setUnlockedAccounts] = React.useState<Set<string>>(new Set());
    const [selectedAccountForUnlock, setSelectedAccountForUnlock] = React.useState<BankAccount | null>(null);

    const loadAccounts = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await bankAccountService.getUserAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error loading accounts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleAccountAction = (account: BankAccount) => {
        if (unlockedAccounts.has(account.id)) {
            router.push(`/app/finances`);
        } else {
            setSelectedAccountForUnlock(account);
        }
    };

    const handleUnlockSuccess = () => {
        if (selectedAccountForUnlock) {
            setUnlockedAccounts(prev => new Set(prev).add(selectedAccountForUnlock.id));
            setSelectedAccountForUnlock(null);
            onUnlock(); // Spatial navigation signal
        }
    };

    const totalBalance = React.useMemo(() => {
        return accounts.reduce((sum, acc) => sum + (unlockedAccounts.has(acc.id) ? acc.balance : 0), 0);
    }, [accounts, unlockedAccounts]);

    return (
        <IonPage>
            <IonContent fullscreen style={{ '--background': '#0f0a0a' }}>
                <div className="relative min-h-screen bg-[#0f0a0a] pb-20 pt-24 px-4 overflow-hidden">

                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.1) 0%, rgba(15, 10, 10, 0) 50%)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }} />

                    <BentoGrid>
                        {/* 1. Account Carousel - Replacing VaultModel */}
                        <BentoItem
                            colSpan={2}
                            rowSpan={2}
                            glowColor="#d4af37"
                        >
                            <div className="flex flex-col h-full">
                                <div className="p-5 flex justify-between items-start w-full relative z-10">
                                    <div>
                                        <h2 className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] font-bold mb-1">
                                            Arcas del Reino
                                        </h2>
                                        <h1 className="text-3xl text-white font-[Inter] font-bold tracking-tight">
                                            {totalBalance > 0 ? `${totalBalance.toLocaleString()} GP` : '--- ---'}
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Cuentas Activas</span>
                                        <div className="flex -space-x-2">
                                            {accounts.map((_, i) => (
                                                <div key={i} className="w-5 h-5 rounded-full bg-[#1a1616] border border-[#d4af37]/30 flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-[#d4af37]" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full relative overflow-visible">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center opacity-30">
                                            <div className="animate-pulse font-[Cinzel] tracking-widest text-[#d4af37]">Consultando Bovedas...</div>
                                        </div>
                                    ) : (
                                        <BagCarousel
                                            accounts={accounts}
                                            onSelectAccount={handleAccountAction}
                                            unlockedAccounts={unlockedAccounts}
                                        />
                                    )}
                                </div>
                            </div>
                        </BentoItem>

                        {/* 2. Global Market (Mercado) */}
                        <BentoItem onClick={() => router.push('/app/market')} glowColor="#38bdf8">
                            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
                                    <IonIcon icon={statsChartOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Mercado
                                </h2>
                            </div>
                            <div style={{ width: '100%', height: '100%' }}>
                                <MarketHolo />
                            </div>
                        </BentoItem>

                        {/* 3. Inventory (Items) */}
                        <BentoItem onClick={() => router.push('/app/inventory')} glowColor="#a855f7">
                            <div style={{ padding: '20px' }}>
                                <h2 style={{ margin: 0, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
                                    <IonIcon icon={cubeOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Inventario
                                </h2>
                                <div style={{
                                    marginTop: '20px',
                                    height: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px dashed rgba(168, 85, 247, 0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Sin Items Equipados</span>
                                </div>
                            </div>
                        </BentoItem>

                        {/* 4. Energy Status (Existing Widget) */}
                        <BentoItem colSpan={2} onClick={() => { }} glowColor="#22c55e">
                            <div style={{ padding: '10px' }}>
                                <EnergyWidget />
                            </div>
                        </BentoItem>

                        {/* 5. Quick Actions / Account */}
                        <BentoItem onClick={() => router.push('/app/account')} glowColor="#64748b">
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <IonIcon icon={personOutline} style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '10px' }} />
                                <span style={{ color: '#e2e8f0' }}>Perfil de Usuario</span>
                            </div>
                        </BentoItem>

                    </BentoGrid>

                </div>
            </IonContent>

            {selectedAccountForUnlock && (
                <AccountUnlockModal
                    account={selectedAccountForUnlock}
                    onSuccess={handleUnlockSuccess}
                    onClose={() => setSelectedAccountForUnlock(null)}
                />
            )}
        </IonPage>
    );
};

export default Dashboard;
