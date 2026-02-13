// marketService.ts
// Estrategia de Datos:
// 1. Divisas: Frankfurter API (Reg-Free, Open Source) -> Integración Real via Fetch
// 2. Mercado/Crypto: Yahoo Finance MCP (Simulated via Mocks until MCP is connected)

export interface MarketAsset {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    type: 'crypto' | 'stock' | 'forex';
}

export interface MarketNews {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    date: string;
}

// --- YAHOO FINANCE SIMULATION (Waiting for MCP) ---
const MOCK_ASSETS: MarketAsset[] = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 42000, change24h: 2.5, type: 'crypto' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2300, change24h: -1.2, type: 'crypto' },
    { id: 'sp500', symbol: 'SPX', name: 'S&P 500', price: 4800, change24h: 0.8, type: 'stock' },
];

const MOCK_NEWS: MarketNews[] = [
    { id: 1, headline: "Dragon's Hoard Reserve Rates Unchanged", summary: "The Central Bank of the Realm decides to keep interest rates steady.", source: "Yahoo Finance", url: "#", date: "2024-02-14" },
    { id: 2, headline: "Mithril (BTC) Rally Continues", summary: "Crypto markets surge as dwarves adopt digital gold.", source: "Yahoo Finance", url: "#", date: "2024-02-13" },
];

export const marketService = {
    // Intenta usar Frankfurter para divisas reales, fallback a mocks para lo demás
    getAssets: async (): Promise<MarketAsset[]> => {
        const assets = [...MOCK_ASSETS];

        try {
            // INTEGRACIÓN REAL: Frankfurter API (Fetch)
            // Obtener precio de 1 Ounce of Gold (XAU) simulado o USD to EUR
            const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR');
            if (response.ok) {
                const data = await response.json();
                assets.push({
                    id: 'usd-eur',
                    symbol: 'USD/EUR',
                    name: 'US Dollar to Euro',
                    price: data.rates.EUR,
                    change24h: 0.1, // Frankfurter gratis no da cambio 24h directo simple, mockeado
                    type: 'forex'
                });
            }
        } catch (error) {
            console.warn("Frankfurter API unreachable, using offline mode.");
        }

        return assets;
    },

    getNews: async (): Promise<MarketNews[]> => {
        // En el futuro: Usar Yahoo Finance MCP para traer noticias reales
        return new Promise(resolve => setTimeout(() => resolve(MOCK_NEWS), 800));
    }
};
