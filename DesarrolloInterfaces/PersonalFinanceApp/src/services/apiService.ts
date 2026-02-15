
interface MarketDataCache<T> {
    timestamp: number;
    data: T;
}

const CACHE_KEYS = {
    CRYPTO: 'market_data_crypto',
    FOREX: 'market_data_forex'
};

const CACHE_DURATION = {
    CRYPTO: 15 * 60 * 1000, // 15 minutes
    FOREX: 24 * 60 * 60 * 1000 // 24 hours
};

export class ApiService {
    async getCryptoPrices(ids: string[] = ['bitcoin', 'ethereum', 'solana'], currency: string = 'eur') {
        const cacheKey = `${CACHE_KEYS.CRYPTO}_${currency}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const { timestamp, data }: MarketDataCache<any> = JSON.parse(cached);
            const isFresh = Date.now() - timestamp < CACHE_DURATION.CRYPTO;
            if (isFresh) {
                console.log('Returning cached crypto data');
                return data;
            }
        }

        try {
            console.log('Fetching fresh crypto data...');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${currency}&include_24hr_change=true`
            );

            if (!response.ok) throw new Error('CoinGecko API Error');

            const data = await response.json();

            // Save to Cache
            const cacheEntry: MarketDataCache<any> = {
                timestamp: Date.now(),
                data
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

            return data;
        } catch (error) {
            console.warn('Failed to fetch crypto prices, returning stale cache if available', error);
            if (cached) return JSON.parse(cached).data;
            return {};
        }
    }

    async getForexRates(base: string = 'EUR') {
        const cacheKey = `${CACHE_KEYS.FOREX}_${base}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const { timestamp, data }: MarketDataCache<any> = JSON.parse(cached);
            const isFresh = Date.now() - timestamp < CACHE_DURATION.FOREX;
            if (isFresh) {
                console.log('Returning cached forex data');
                return data;
            }
        }

        try {
            console.log('Fetching fresh forex data...');
            const response = await fetch(`https://api.frankfurter.app/latest?from=${base}`);

            if (!response.ok) throw new Error('Frankfurter API Error');

            const data = await response.json();

            // Save to Cache
            const cacheEntry: MarketDataCache<any> = {
                timestamp: Date.now(),
                data
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

            return data;
        } catch (error) {
            console.warn('Failed to fetch forex rates, returning stale cache if available', error);
            if (cached) return JSON.parse(cached).data;
            return null;
        }
    }
}

export const apiService = new ApiService();
