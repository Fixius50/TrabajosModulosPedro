
interface CoinData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Cache to avoid hitting rate limits
const CACHE_KEY = 'crypto_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CoinGeckoService {
    async getTopCoins(currency: string = 'usd'): Promise<CoinData[]> {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Returning cached crypto data');
                return data;
            }
        }

        try {
            console.log('Fetching fresh crypto data...');
            const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=false`);

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.statusText}`);
            }

            const data = await response.json();

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));

            return data;
        } catch (error) {
            console.error('Failed to fetch crypto data:', error);
            // Return cached data if available even if expired, otherwise empty array
            if (cached) return JSON.parse(cached).data;
            return [];
        }
    }
}

export const coinGeckoService = new CoinGeckoService();
