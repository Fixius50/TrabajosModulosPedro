
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

const CACHE_KEY = 'currency_data_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

class CurrencyService {
    async getRates(): Promise<Record<string, number>> {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }

        try {
            const response = await fetch(EXCHANGE_API_URL);
            const data = await response.json();

            if (data.result === 'success') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: data.rates
                }));
                return data.rates;
            }
            return {};
        } catch (error) {
            console.error('Failed to fetch currency rates:', error);
            if (cached) return JSON.parse(cached).data;
            return {};
        }
    }

    convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
        if (!rates[from] || !rates[to]) return amount;
        const inUSD = amount / rates[from];
        return inUSD * rates[to];
    }
}

export const currencyService = new CurrencyService();
