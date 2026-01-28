import { proxyService } from './api.proxy';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

export interface MarketAsset {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change_24h_percent: number;
    history: number[]; // Simple history for sparkline
    type: 'crypto' | 'stock';
}

export const marketService = {
    // 1. Get Crypto Data (Binance Public API via Proxy to avoid CORS)
    getCryptoAssets: async (): Promise<MarketAsset[]> => {
        try {
            // Binance endpoints
            // Ticker 24h: https://api.binance.com/api/v3/ticker/24hr
            // We'll fetch top pairs: BTCUSDT, ETHUSDT, SOLUSDT, ADAUSDT, XRPUSDT, DOTUSDT
            // Note: Binance prices are in USDT (USD equivalent). Converting to EUR implies getting EURUSD rate or just displaying $.
            // For simplicity, we'll display as USD ($) or assume rough 1:1 for this demo, or fetch BTCEUR if available.

            const pairs = ['BTCEUR', 'ETHEUR', 'SOLEUR', 'ADAEUR', 'XRPEUR'];
            // We use the proxy because Binance API might have strict CORS or we just want to centralize traffic.
            // Actually Binance API is usually CORS friendly, but let's use proxy to prove concept and ensure stability.

            // Fetching 24h ticker for all symbols (filtered client side is heavy, better specific calls or all-ticker)
            // Let's iterate or fetch all (lightweight JSON).
            const data: any[] = await proxyService.fetch('https://api.binance.com/api/v3/ticker/24hr');

            const filtered = data.filter((item: any) => pairs.includes(item.symbol));

            return filtered.map((item: any) => ({
                id: item.symbol,
                symbol: item.symbol.replace('EUR', ''),
                name: item.symbol.replace('EUR', ''), // Binance doesn't give full names in ticker
                price: parseFloat(item.lastPrice),
                change_24h_percent: parseFloat(item.priceChangePercent),
                history: [], // Binance ticker doesn't give history. We'd need klines endpoint.
                type: 'crypto'
            }));

        } catch (error) {
            console.error("Error fetching crypto via proxy:", error);
            // Fallback Mock Data
            return [
                { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin (Mock)', price: 96500, change_24h_percent: 2.5, history: [], type: 'crypto' },
                { id: 'ethereum', symbol: 'ETH', name: 'Ethereum (Mock)', price: 2800, change_24h_percent: -1.2, history: [], type: 'crypto' },
            ];
        }
    },

    // 2. Get Stock Data (Finnhub - Requires Key)
    getStockQuote: async (symbol: string): Promise<MarketAsset | null> => {
        if (!FINNHUB_API_KEY) {
            console.warn("Finnhub API Key missing");
            return null;
        }

        try {
            // Use Proxy for Finnhub too to hide Origin if needed, though Finnhub is usually OK.
            // Using proxy ensures consistency.
            const data: any = await proxyService.fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);

            // Finnhub Quote Response: { c: Current price, d: Change, dp: Percent change, ... }
            if (data.c === 0 && data.d === null) return null; // Invalid symbol

            return {
                id: symbol,
                symbol: symbol,
                name: symbol,
                price: data.c,
                change_24h_percent: data.dp,
                history: [],
                type: 'stock'
            };
        } catch (error) {
            console.error(`Error fetching stock ${symbol}:`, error);
            return null;
        }
    },

    // 3. Get Stock History (Candles for Chart)
    getStockHistory: async (symbol: string, resolution: string = 'D'): Promise<number[]> => {
        if (!FINNHUB_API_KEY) return [];

        // Get timestamps for last 30 days
        const end = Math.floor(Date.now() / 1000);
        const start = end - (30 * 24 * 60 * 60);

        try {
            const data: any = await proxyService.fetch(
                `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${start}&to=${end}&token=${FINNHUB_API_KEY}`
            );

            if (data.s === 'ok') {
                return data.c; // Return closing prices
            }
            return [];
        } catch (error) {
            console.error("Error fetching stock history:", error);
            return [];
        }
    }
};
