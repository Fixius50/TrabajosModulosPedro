


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
    // 1. Get Crypto Data (CoinGecko - Free)
    getCryptoAssets: async (): Promise<MarketAsset[]> => {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,cardano,solana,polkadot,ripple&order=market_cap_desc&sparkline=true&price_change_percentage=24h'
            );
            if (!response.ok) throw new Error('CoinGecko API Error');
            const data = await response.json();

            return data.map((coin: any) => ({
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                price: coin.current_price,
                change_24h_percent: coin.price_change_percentage_24h,
                history: coin.sparkline_in_7d.price,
                type: 'crypto'
            }));
        } catch (error) {
            console.error("Error fetching crypto:", error);
            // Fallback Mock Data if API fails (e.g. 429/403 Rate Limit)
            return [
                { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 96500, change_24h_percent: 2.5, history: [94000, 95000, 96500, 96000, 97000, 96500], type: 'crypto' },
                { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2800, change_24h_percent: -1.2, history: [2900, 2850, 2800, 2750, 2800, 2800], type: 'crypto' },
                { id: 'solana', symbol: 'SOL', name: 'Solana', price: 145, change_24h_percent: 5.4, history: [130, 135, 140, 142, 145, 145], type: 'crypto' },
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
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
            if (!response.ok) throw new Error('Finnhub API Error');
            const data = await response.json();

            // Finnhub Quote Response: { c: Current price, d: Change, dp: Percent change, ... }
            if (data.c === 0 && data.d === null) return null; // Invalid symbol

            return {
                id: symbol,
                symbol: symbol,
                name: symbol, // Finnhub Basic Quote doesn't give full name, would need Profile2 endpoint
                price: data.c,
                change_24h_percent: data.dp,
                history: [], // Quote endpoint doesn't give history. We'd need 'stock/candle' for chart.
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
            const response = await fetch(
                `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${start}&to=${end}&token=${FINNHUB_API_KEY}`
            );
            if (!response.ok) throw new Error('Finnhub Candle Error');
            const data = await response.json();

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
