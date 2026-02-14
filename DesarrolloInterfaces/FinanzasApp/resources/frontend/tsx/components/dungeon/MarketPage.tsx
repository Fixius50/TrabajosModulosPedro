import React, { useEffect, useState } from 'react';
import { marketService } from '../../../ts/services/marketService';
import type { MarketAsset, MarketNews } from '../../../ts/services/marketService';
import { DungeonCard } from './DungeonCard';

export const MarketPage: React.FC = () => {
    const [assets, setAssets] = useState<MarketAsset[]>([]);
    const [news, setNews] = useState<MarketNews[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMarket = async () => {
            try {
                // Determine if we need to use real API or Mock based on config/env
                // For now, marketService handles the logic (Real Frankfurter + Mock Yahoo)
                const [assetsData, newsData] = await Promise.all([
                    marketService.getAssets(),
                    marketService.getNews()
                ]);
                setAssets(assetsData);
                setNews(newsData);
            } catch (error) {
                console.error("Failed to load market data:", error);
                // Optional: Set some error state or just leave empty arrays
            } finally {
                setLoading(false);
            }
        };
        loadMarket();
    }, []);

    if (loading) {
        return <div className="p-8 text-center font-dungeon-header text-gold-coin animate-pulse">Consulting the Oracles...</div>;
    }

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture p-4 pb-20 flex flex-col gap-6 text-ink">
            {/* Header */}
            {/* Header */}
            <header className="border-b-2 border-iron-border pb-2 relative bg-paper-texture/20 p-2 rounded">
                <h1 className="font-dungeon-header text-2xl text-gold-coin drop-shadow-md uppercase tracking-widest text-center">
                    The Grand Market
                </h1>
                <p className="font-dungeon-body text-ink/70 text-sm italic text-center mt-1">
                    "Precios de los Reinos Lejanos..."
                </p>
                {/* Decorative Bolts */}
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-iron-border shadow-inner"></div>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-iron-border shadow-inner"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-iron-border shadow-inner"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-iron-border shadow-inner"></div>
            </header>

            {/* Market Ticker / Assets */}
            <section className="mb-8">
                <h2 className="font-dungeon-header text-xl text-parchment-light mb-3 flex items-center gap-2 drop-shadow-md">
                    <span className="material-symbols-outlined text-gold-coin">trending_up</span>
                    Tasas de Cambio
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {assets.map(asset => (
                        <DungeonCard key={asset.id} className="flex justify-between items-center border-l-4 border-l-gold-coin bg-parchment-texture/95">
                            <div>
                                <h3 className="font-bold text-ink font-dungeon-header text-lg">{asset.name}</h3>
                                <div className="text-sm text-ink/60 font-mono font-bold tracking-tight">{asset.symbol}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold font-mono text-ink">
                                    {asset.type === 'crypto' || asset.type === 'stock' ? '$' : ''}
                                    {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    {asset.type === 'forex' ? ' €' : ''}
                                </div>
                                <div className={`text-sm font-bold ${asset.change24h >= 0 ? 'text-green-700' : 'text-red-700'} flex items-center justify-end gap-1`}>
                                    <span className="material-symbols-outlined text-xs">
                                        {asset.change24h >= 0 ? 'arrow_upward' : 'arrow_downward'}
                                    </span>
                                    {Math.abs(asset.change24h).toFixed(2)}%
                                </div>
                            </div>
                        </DungeonCard>
                    ))}
                </div>
            </section>

            {/* Tavern Rumors (News) */}
            <section>
                <h2 className="font-dungeon-header text-xl text-parchment-light mb-3 flex items-center gap-2 drop-shadow-md">
                    <span className="material-symbols-outlined text-gold-coin">auto_stories</span>
                    Rumores de Taberna
                </h2>
                <div className="space-y-4">
                    {news.map(item => (
                        <div key={item.id} className="relative bg-paper-texture p-4 rounded border border-ink/20 shadow-sm hover:rotate-1 transition-transform duration-300">
                            {/* Pin visual */}
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-black/30 z-10"></div>

                            <h3 className="font-dungeon-header font-bold text-ink text-lg leading-tight mb-1">
                                {item.headline}
                            </h3>
                            <div className="text-xs text-ink/50 mb-2 uppercase tracking-wide font-bold">{item.source} • {item.date}</div>
                            <p className="font-dungeon-body text-ink/80 text-sm leading-relaxed border-l-2 border-ink/10 pl-2">
                                {item.summary}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
