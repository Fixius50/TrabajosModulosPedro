import { proxyService } from './api.proxy';
import { getMarketData } from './marketSimulationService';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

export interface MarketAsset {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change_24h_percent: number;
    history: number[]; // Simple history for sparkline
    type: 'crypto' | 'stock' | 'lore';
    rarity?: 'Comun' | 'Raro' | 'Epico' | 'Legendario' | 'Artefacto';
    description?: string;
}

export const marketService = {
    // 1. Unified Market Fetch
    getUnifiedAssets: async (): Promise<MarketAsset[]> => {
        try {
            const [crypto, lore] = await Promise.all([
                marketService.getCryptoAssets(),
                Promise.resolve(getMarketData())
            ]);

            // Combine and enrich
            const loreAssets: MarketAsset[] = lore.map(l => ({
                id: l.id,
                symbol: l.symbol,
                name: l.name,
                price: l.price,
                change_24h_percent: ((l.price - (l.history[l.history.length - 2] || l.price)) / (l.history[l.history.length - 2] || l.price)) * 100,
                history: l.history,
                type: 'lore',
                rarity: l.volatility > 0.05 ? 'Legendario' : l.volatility > 0.03 ? 'Epico' : 'Raro',
                description: `Un objeto de inmenso valor proveniente de las tierras de ${l.name.includes('Erebor') ? 'Erebor' : 'el universo conocido'}.`
            }));

            return [...loreAssets, ...crypto];
        } catch (error) {
            console.error("Error in unified market fetch:", error);
            return marketService.getCryptoAssets(); // Fallback to just crypto
        }
    },

    // 2. Get Crypto Data (Binance Public API via Proxy)
    getCryptoAssets: async (): Promise<MarketAsset[]> => {
        try {
            const pairs = ['BTCEUR', 'ETHEUR', 'SOLEUR', 'ADAEUR', 'XRPEUR'];
            const data: any[] = await proxyService.fetch('https://api.binance.com/api/v3/ticker/24hr');
            const filtered = data.filter((item: any) => pairs.includes(item.symbol));

            return filtered.map((item: any) => {
                // Generate a fake history if none exists to avoid empty charts
                const price = parseFloat(item.lastPrice);
                const history = Array.from({ length: 30 }, () => price * (1 + (Math.random() - 0.5) * 0.05));
                history[29] = price;

                return {
                    id: item.symbol,
                    symbol: item.symbol.replace('EUR', ''),
                    name: item.symbol.replace('EUR', ''),
                    price: price,
                    change_24h_percent: parseFloat(item.priceChangePercent),
                    history: history,
                    type: 'crypto',
                    rarity: 'Raro'
                };
            });

        } catch (error) {
            console.error("Error fetching crypto via proxy:", error);
            // Fallback Mock Data with history
            return [
                { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 96500, change_24h_percent: 2.5, history: Array.from({ length: 30 }, () => 90000 + Math.random() * 10000), type: 'crypto', rarity: 'Legendario' },
                { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2800, change_24h_percent: -1.2, history: Array.from({ length: 30 }, () => 2500 + Math.random() * 500), type: 'crypto', rarity: 'Epico' },
            ];
        }
    },

    // 3. Get Stock Data
    getStockQuote: async (symbol: string): Promise<MarketAsset | null> => {
        if (!FINNHUB_API_KEY) return null;
        try {
            const data: any = await proxyService.fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
            if (data.c === 0 && data.d === null) return null;

            return {
                id: symbol,
                symbol: symbol,
                name: symbol,
                price: data.c,
                change_24h_percent: data.dp,
                history: [],
                type: 'stock',
                rarity: 'Comun'
            };
        } catch (error) {
            console.error(`Error fetching stock ${symbol}:`, error);
            return null;
        }
    },

    // 4. Get Stock History
    getStockHistory: async (symbol: string, resolution: string = 'D'): Promise<number[]> => {
        if (!FINNHUB_API_KEY) return [];
        const end = Math.floor(Date.now() / 1000);
        const start = end - (30 * 24 * 60 * 60);

        try {
            const data: any = await proxyService.fetch(
                `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${start}&to=${end}&token=${FINNHUB_API_KEY}`
            );
            return data.s === 'ok' ? data.c : [];
        } catch (error) {
            console.error("Error fetching stock history:", error);
            return [];
        }
    }
};
