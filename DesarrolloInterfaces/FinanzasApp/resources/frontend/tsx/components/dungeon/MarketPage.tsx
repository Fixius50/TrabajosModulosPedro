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
            const [assetsData, newsData] = await Promise.all([
                marketService.getAssets(),
                marketService.getNews()
            ]);
            setAssets(assetsData);
            setNews(newsData);
            setLoading(false);
        };
        loadMarket();
    }, []);

    if (loading) {
        return <div className="p-8 text-center font-dungeon-header text-gold-coin animate-pulse">Consulting the Oracles...</div>;
    }

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture p-4 pb-20 flex flex-col gap-6 text-ink">
            {/* Header */}
            <header className="border-b-2 border-iron-border pb-2">
                <h1 className="font-dungeon-header text-2xl text-gold-coin drop-shadow-md uppercase tracking-widest">
                    The Grand Market
                </h1>
                <p className="font-dungeon-body text-xs text-parchment opacity-70">
                    Real-time valuations from across the realm.
                </p>
            </header>

            {/* Assets Ticker */}
            <DungeonCard title="Treasures & Assets">
                <div className="space-y-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="flex justify-between items-center border-b border-ink/10 pb-2 last:border-0 hover:bg-ink/5 p-1 rounded transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${asset.type === 'crypto' ? 'bg-indigo-900 text-indigo-200' : 'bg-green-900 text-green-200'}`}>
                                    {asset.symbol[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-dungeon-header font-bold text-sm">{asset.name}</span>
                                    <span className="font-dungeon-body text-[10px] opacity-60 uppercase">{asset.type}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-dungeon-technical font-bold text-lg">
                                    {asset.price.toLocaleString()} GP
                                </div>
                                <div className={`text-xs font-bold ${asset.change24h >= 0 ? 'text-emerald-income' : 'text-ruby-expense'}`}>
                                    {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DungeonCard>

            {/* Tavern Rumors (News) */}
            <div>
                <h2 className="font-dungeon-header text-xl text-parchment mb-4 pl-2 border-l-4 border-gold-coin">
                    Tavern Rumors
                </h2>
                <div className="space-y-4">
                    {news.map(item => (
                        <DungeonCard key={item.id} className="transform hover:scale-[1.02] transition-transform cursor-pointer">
                            <h3 className="font-dungeon-header font-bold text-lg mb-1 leading-tight">{item.headline}</h3>
                            <p className="font-dungeon-body text-xs italic opacity-80 mb-2">"{item.summary}"</p>
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-ink/50 border-t border-ink/10 pt-2">
                                <span>{item.source}</span>
                                <span>{item.date}</span>
                            </div>
                        </DungeonCard>
                    ))}
                </div>
            </div>
        </div>
    );
};
