import './fantasy.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { transactionService } from '../../services/transactionService';
import { useMarketData } from '../../hooks/useMarketData';
import QuickAddMenu from './QuickAddMenu';
import { useStealth } from '../../context/StealthContext';
import { storageService } from '../../services/storageService';
import { oracleService } from '../../services/oracleService';

export default function GrimoireDashboard() {
    const { t } = useTranslation();
    const market = useMarketData();
    const { formatAmount } = useStealth();
    const { data: transactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: transactionService.getTransactions,
    });

    const { data: budgets } = useQuery({
        queryKey: ['budgets'],
        queryFn: () => storageService.getBudgets(),
    });

    const { data: visions } = useQuery({
        queryKey: ['oracle_visions'],
        queryFn: () => oracleService.getVisions(),
    });

    const totalBalance = transactions?.reduce((acc: number, curr: any) => {
        const isExpense = curr.categories?.type === 'expense';
        return acc + (isExpense ? -curr.amount : curr.amount);
    }, 0) || 0;

    return (
        <div className="fantasy-theme">
            {/* Mobile Container */}
            <div className="fantasy-container leather-texture iron-border max-w-md mx-auto">

                {/* Header */}
                <header className="fantasy-header">
                    {/* Corner Decors */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm opacity-50"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm opacity-50"></div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-primary runic-glow uppercase italic">{t('dashboard')}</h1>
                            <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Finanzas Personales</p>
                        </div>
                        <Link to="/adventurer-license" className="w-12 h-12 rounded-lg bg-stone-800 border border-primary/30 flex items-center justify-center hover:bg-stone-700 transition-colors">
                            <span className="material-icons text-primary">account_circle</span>
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">

                    {/* Rivers of Gold */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('net_worth')}
                        </h2>
                        <div className="relative fantasy-card h-48 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-full h-full opacity-60" viewBox="0 0 200 100">
                                    <path className="opacity-80" d="M 0 20 Q 50 20 100 50" fill="none" stroke="#ecb613" strokeWidth="3"></path>
                                    <path className="opacity-40" d="M 0 35 Q 50 35 100 50" fill="none" stroke="#ecb613" strokeWidth="1.5"></path>
                                    <path className="opacity-80" d="M 200 20 Q 150 20 100 50" fill="none" stroke="#7b1d1d" strokeWidth="3"></path>
                                    <path className="opacity-40" d="M 200 35 Q 150 35 100 50" fill="none" stroke="#7b1d1d" strokeWidth="1.5"></path>
                                    <circle className="animate-pulse" cx="100" cy="50" fill="#ecb613" r="12"></circle>
                                </svg>
                            </div>
                            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                <span className="text-stone-500 text-xs uppercase tracking-tighter">{t('current_net_worth')}</span>
                                <div className="text-4xl font-bold text-white tracking-widest my-1">
                                    {formatAmount(totalBalance)}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mana Vials */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('budgets')}
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {budgets?.slice(0, 3).map((budget) => {
                                const fillPercent = Math.min((budget.spent / budget.limit) * 100, 100);
                                const isWarning = fillPercent > 80;
                                const colorClass = isWarning ? 'bg-orange-500' : 'bg-mana-blue';

                                return (
                                    <div key={budget.id} className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-full border-2 border-stone-600 bg-stone-900/80 relative overflow-hidden shadow-inner">
                                            <div
                                                className={`absolute bottom-0 left-0 right-0 ${colorClass} opacity-80 transition-all duration-1000 vial-gradient`}
                                                style={{ height: `${fillPercent}%` }}
                                            ></div>
                                            <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                        </div>
                                        <span className="text-[0.625rem] uppercase font-bold tracking-wider opacity-60 truncate w-full text-center">{budget.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Oracle Visions */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('oracle_visions')}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {visions?.map((vision, idx) => (
                                <div key={idx} className="fantasy-card p-4 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-1 h-full ${vision.trend === 'rising' ? 'bg-emerald-500' : vision.trend === 'falling' ? 'bg-red-500' : 'bg-stone-500'}`}></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[0.625rem] uppercase tracking-widest text-stone-500 font-bold">{vision.timeframe} Projection</span>
                                        <span className={`text-sm font-mono font-bold ${vision.trend === 'rising' ? 'text-emerald-400' : vision.trend === 'falling' ? 'text-red-400' : 'text-stone-300'}`}>
                                            {formatAmount(vision.projectedBalance)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-300 italic">"{vision.insight}"</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Guild Tools */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('guild_tools')}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/debt-tracker" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95">
                                <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-[#5c4033] flex items-center justify-center group-hover:bg-[#5c4033] transition-colors">
                                    <span className="material-icons text-primary/80 group-hover:text-white">description</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-stone-200">Debt Tracker</h3>
                                    <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Manage IOUs</p>
                                </div>
                            </Link>

                            <Link to="/financial-score" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95">
                                <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <span className="material-icons text-primary/80 group-hover:text-primary">military_tech</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-stone-200">Hero Score</h3>
                                    <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Analysis</p>
                                </div>
                            </Link>

                            <div className="col-span-2">
                                <Link to="/shared-accounts" className="fantasy-card p-3 flex items-center justify-between group hover:border-primary/50 transition-all active:scale-95">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <span className="material-icons text-primary/80 group-hover:text-primary">account_balance</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-stone-200">Guild Vault</h3>
                                            <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Shared Assets</p>
                                        </div>
                                    </div>
                                    <span className="material-icons text-stone-600 group-hover:text-primary transition-colors">chevron_right</span>
                                </Link>
                            </div>

                            <Link to="/mercenary-contracts" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95 col-span-2">
                                <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <span className="material-icons text-primary/80 group-hover:text-primary">assignment_late</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-stone-200">Mercenary Contracts</h3>
                                    <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Subscriptions</p>
                                </div>
                            </Link>

                            <Link to="/treasure-chests" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95 col-span-2">
                                <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <span className="material-icons text-primary/80 group-hover:text-primary">inventory_2</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-stone-200">Treasure Chests</h3>
                                    <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Budgets</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Market Oracle (Ticker) */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('market_data')}
                        </h2>
                        <div className="fantasy-card flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-3">
                            {/* Crypto Ticker */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-stone-500">BTC</span>
                                <span className="text-primary font-mono">{market.crypto?.bitcoin?.eur ? `€${market.crypto.bitcoin.eur}` : '...'}</span>
                            </div>
                            <div className="w-px h-4 bg-white/10"></div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-stone-500">ETH</span>
                                <span className="text-primary font-mono">{market.crypto?.ethereum?.eur ? `€${market.crypto.ethereum.eur}` : '...'}</span>
                            </div>
                            <div className="w-px h-4 bg-white/10"></div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-stone-500">USD</span>
                                <span className="text-emerald-400 font-mono">{market.forex?.rates?.USD ? `$${market.forex.rates.USD}` : '...'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Recent Scrolls (Transactions) */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {t('recent_scrolls')}
                        </h2>
                        <div className="space-y-3">
                            {transactions?.map((t: any) => (
                                <div key={t.id} className="fantasy-card flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-stone-800 flex items-center justify-center text-xl border border-white/5">
                                            {t.categories?.icon || '📄'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white/90">{t.description}</h4>
                                            <p className="text-[0.625rem] uppercase text-stone-500">{t.categories?.name}</p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold ${t.categories?.type === 'expense' ? 'text-stone-300' : 'text-primary'}`}>
                                        {t.categories?.type === 'expense' ? '-' : '+'} {formatAmount(t.amount, '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                </main>

                <QuickAddMenu />
            </div>
        </div>
    );
}
