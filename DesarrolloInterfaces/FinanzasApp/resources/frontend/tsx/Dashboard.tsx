import React from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { BentoGrid, BentoItem } from './components/dashboard/BentoGrid';
import VaultModel from './components/dashboard/3d/VaultModel';
import MarketHolo from './components/dashboard/3d/MarketHolo';
import EnergyWidget from './widgets/EnergyWidget';
import BankAccountManager from './BankAccountManager';

// Icons
import { IonIcon } from '@ionic/react';
import { walletOutline, statsChartOutline, cubeOutline, personOutline } from 'ionicons/icons';

interface DashboardProps {
    onUnlock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUnlock }) => {
    const router = useIonRouter();

    return (
        <IonPage>
            <IonContent fullscreen style={{ '--background': '#0f0a0a' }}>
                <div className="relative min-h-screen bg-[#0f0a0a] pb-20 pt-24 px-4 overflow-hidden">

                    {/* Background subtle effect */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.1) 0%, rgba(15, 10, 10, 0) 50%)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }} />

                    <BentoGrid>
                        {/* 1. Main Vault (Patrimonio) - Grande */}
                        <BentoItem
                            colSpan={2}
                            rowSpan={2}
                            onClick={() => router.push('/app/finances')}
                            glowColor="#d4af37"
                        >
                            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px' }}>
                                    <IonIcon icon={walletOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Bóveda Principal
                                </h2>
                                <h1 style={{ margin: '5px 0', fontSize: '2.5rem', color: 'white', fontFamily: 'monospace' }}>
                                    $ ---,---
                                </h1>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                    Estado: Bloqueado
                                </p>
                            </div>
                            {/* 3D Scene Container */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', zIndex: 1 }}>
                                <VaultModel />
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

                    {/* Hidden Logic for Bank Manager (Unlock Logic) - Kept in background or integrated? 
                        The user wanted "Interfaces unique". Passing the Unlock handler to the vault click is cleaner.
                        For now, we keep BankAccountManager logic if strictly needed, but visualize it differently.
                        Actually, 'BankAccountManager' renders a UI list of accounts.
                        Let's render it conditionally or in Finances Tab.
                        The prop 'onUnlock' was passed to Dashboard. 
                        Let's assume FinancesTab handles the details. 
                    */}
                    <div style={{ opacity: 0, pointerEvents: 'none', height: 0 }}>
                        {/* Mantenemos BankAccountManager invisible para preservar lógica de unlock si está acoplada, 
                             o mejor aún, asumimos que FinancesPage lo maneja. 
                             El Dashboard es ahora un lanzador. */}
                        <BankAccountManager onUnlock={onUnlock} />
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
