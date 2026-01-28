export interface MarketAsset {
    id: string;
    name: string;
    symbol: string;
    price: number;
    history: number[];
    volatility: number; // Sigma: How much it fluctuates
    trend: number;      // Mu: General trend (up/down)
    color: string;
}

const INITIAL_ASSETS: MarketAsset[] = [
    {
        id: 'mithril',
        name: 'Mithril Refinado',
        symbol: 'MTH',
        price: 5000,
        history: [],
        volatility: 0.05, // High volatility
        trend: 0.001,      // Slight upward trend
        color: '#3880ff'
    },
    {
        id: 'erebor_gold',
        name: 'Oro de Erebor',
        symbol: 'EGLD',
        price: 1350,
        history: [],
        volatility: 0.02, // Stable
        trend: 0.0005,
        color: '#ffc409'
    },
    {
        id: 'gringotts',
        name: 'Acciones Gringotts',
        symbol: 'GRIN',
        price: 250,
        history: [],
        volatility: 0.03,
        trend: 0.0002,
        color: '#2dd36f'
    },
    {
        id: 'spice',
        name: 'La Especia (Melange)',
        symbol: 'SPICE',
        price: 15000,
        history: [],
        volatility: 0.08, // Very volatile
        trend: -0.001,    // Slight downward trend
        color: '#eb445a'
    }
];

// Geometric Brownian Motion Logic
// S_t+1 = S_t * e^((mu - 0.5 * sigma^2) * dt + sigma * epsilon * sqrt(dt))
export const simulateNextPrice = (currentPrice: number, trend: number, volatility: number): number => {
    const dt = 1; // 1 time unit (e.g., 1 day)
    const drift = (trend - 0.5 * Math.pow(volatility, 2)) * dt;
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const diffusion = volatility * Math.sqrt(dt) * z;
    const nextPrice = currentPrice * Math.exp(drift + diffusion);

    return Number(nextPrice.toFixed(2));
};

export const generateHistory = (asset: MarketAsset, days: number = 30): number[] => {
    let currentPrice = asset.price;
    const history: number[] = [currentPrice];

    // Generate backwards
    for (let i = 0; i < days; i++) {
        // Inverse GBM mostly... or just simulate forward and reverse?
        // Let's simulate forward from a starting point "days" ago.
        // Re-calculating start price based on current is tricky with randomness.
        // Simpler: Just generate a totally new history from a base price and update current price.
    }
    return history;
};

// Singleton-ish state for the session
let marketState: MarketAsset[] = [...INITIAL_ASSETS];

// Initialize history on first load
marketState.forEach(asset => {
    let price = asset.price;
    const history = [];
    // Generate 30 days of history
    for (let i = 0; i < 30; i++) {
        history.push(price);
        price = simulateNextPrice(price, asset.trend, asset.volatility);
    }
    asset.history = history;
    asset.price = price; // Set "current" price to the end of simulation
});

export const getMarketData = (): MarketAsset[] => {
    return marketState;
};

export const tickMarket = (): MarketAsset[] => {
    marketState = marketState.map(asset => {
        const newPrice = simulateNextPrice(asset.price, asset.trend, asset.volatility);
        const newHistory = [...asset.history.slice(1), newPrice]; // Keep 30 days window
        return {
            ...asset,
            price: newPrice,
            history: newHistory
        };
    });
    return marketState;
};
