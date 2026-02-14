import React, { useEffect, useState } from 'react';
import { marketService } from '../../../ts/services/marketService';
import type { MarketAsset, MarketNews } from '../../../ts/services/marketService';

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

    // STITCH DESIGN: "The Grand Market" (Gothic Dungeon Theme)
    // - Background: Stone Wall #1a1814
    // - Accents: Gold Ink #f2b90d
    // - Font: Serif (Cinzel/Noto Serif)

    return (
        <div className="min-h-screen bg-[#1a1814] text-[#d9c5a0] font-serif pb-20 relative overflow-hidden">
            {/* Background Texture Overlay (Stone) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/dark-matter.png)' }}></div>

            {/* Torchlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/60 pointer-events-none"></div>

            {/* Header / Status Bar */}
            <header className="relative z-10 px-6 pt-12 pb-4 flex justify-between items-center border-b border-[#3d3d3d]/50 bg-[#1a1814]/90 backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-3">
                    <span className="text-3xl text-[#f2b90d]">⚖️</span>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase text-[#f2b90d] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">The Grand Market</h1>
                        <p className="text-[10px] text-[#8a8a8a] tracking-widest uppercase">Est. 1245 A.D.</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    {/* Placeholder for small status or weather icon */}
                    <span className="text-xs text-[#f2b90d]/70 animate-pulse">● Open</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 px-4 py-6 space-y-8">

                {/* SECTION 1: Market Trends (Parchment Scroll) */}
                <section className="relative">
                    {/* Parchment Container */}
                    <div className="bg-[#e3d5b8] text-[#2a2721] rounded-sm p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] transform rotate-[0.5deg]">
                        <div className="border border-[#b8a888] p-4 relative overflow-hidden">
                            {/* Paper Texture */}<div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/aged-paper.png)' }}></div>

                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <h2 className="font-bold uppercase text-sm tracking-widest italic border-b-2 border-[#2a2721] pb-1">Asset Value History</h2>
                                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Last 30 Moons</span>
                            </div>

                            {/* Chart Area */}
                            <div className="h-32 w-full relative flex items-end justify-between px-2">
                                {/* Simple CSS Bar Chart Mockup (since we don't have a chart lib) */}
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="w-1/12 bg-[#2a2721] opacity-20 relative group hover:opacity-40 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#2a2721] text-[#e3d5b8] text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {h * 10} GP
                                        </div>
                                    </div>
                                ))}
                                {/* Trend Line Overlay (SVG) */}
                                <svg className="absolute inset-0 h-full w-full pointer-events-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <path d="M5 60 L 20 35 L 35 55 L 50 20 L 65 45 L 80 10 L 95 30" fill="none" stroke="#2a2721" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    {/* Gold Accent Line */}
                                    <path d="M5 60 L 20 35 L 35 55 L 50 20 L 65 45 L 80 10 L 95 30" fill="none" stroke="#f2b90d" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 2"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    {/* Wax Seal Decoration */}
                    <div className="absolute -bottom-3 -right-2 w-12 h-12 bg-[#8a2be2] rounded-full flex items-center justify-center shadow-lg border-2 border-[#5a1b92] transform rotate-12">
                        <span className="text-xs font-bold text-white/80">Valid</span>
                    </div>
                </section>

                {/* SECTION 2: Commodities (Cards) */}
                <section>
                    <h2 className="text-[#d9c5a0] uppercase tracking-[0.2em] text-xs font-bold mb-4 flex items-center gap-2">
                        <span className="h-px w-8 bg-[#f2b90d]"></span>
                        Commodities
                        <span className="h-px flex-1 bg-[#3d3d3d]"></span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {loading ? (
                            // Skeleton Loaders
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-[#221e10] border border-[#3d3d3d] rounded animate-pulse"></div>
                            ))
                        ) : (
                            assets.map((asset) => (
                                <div key={asset.symbol} className="bg-[#221e10] border border-[#3d3d3d] p-0 overflow-hidden group hover:border-[#f2b90d]/50 transition-colors duration-300 rounded relative">
                                    <div className="p-3 bg-[#1a1814] border-b border-[#3d3d3d] flex justify-between items-start">
                                        <div className="w-8 h-8 rounded bg-[#3d3d3d]/30 flex items-center justify-center text-xl">
                                            {/* Simple Icon Mapping */}
                                            {asset.symbol.includes('BTC') ? '🐉' : asset.symbol.includes('ETH') ? '⚡' : asset.symbol.includes('SPY') ? '🏰' : '💎'}
                                        </div>
                                        <span className={`text-xs px-1.5 py-0.5 rounded border ${asset.change24h >= 0 ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-red-900/50 text-red-500 bg-red-900/10'}`}>
                                            {asset.change24h >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-[#e3d5b8] font-bold text-sm truncate">{asset.name}</h3>
                                        <p className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mb-2">{asset.symbol}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[#f2b90d] text-lg font-bold">{asset.price.toFixed(2)}</span>
                                            <span className="text-[10px] text-[#f2b90d]/60">GP</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* SECTION 3: Town Crier (News) */}
                <section className="pb-8">
                    <div className="bg-[#221e10] border-y-2 border-[#f2b90d] py-2 overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#1a1814] to-transparent z-10"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#1a1814] to-transparent z-10"></div>

                        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center">
                            <span className="text-[#f2b90d] font-bold uppercase text-xs tracking-widest px-4">⚡ Town Crier ⚡</span>
                            {news.map((item, i) => (
                                <React.Fragment key={i}>
                                    <span className="text-[#d9c5a0] text-sm font-serif italic">"{item.headline}"</span>
                                    <span className="text-[#3d3d3d]">♦</span>
                                </React.Fragment>
                            ))}
                            {/* Fallback if no news */}
                            {news.length === 0 && <span className="text-[#d9c5a0] text-sm italic">The winds are silent today...</span>}
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};
