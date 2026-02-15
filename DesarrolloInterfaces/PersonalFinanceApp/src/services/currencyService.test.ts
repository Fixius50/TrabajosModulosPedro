import { describe, it, expect, vi, beforeEach } from 'vitest';
import { currencyService } from './currencyService';

describe('CurrencyService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should fetch exchange rates and cache them', async () => {
        const mockData = { result: 'success', rates: { EUR: 0.92, GBP: 0.78 } };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const rates = await currencyService.getRates();

        expect(rates).toEqual(mockData.rates);
        expect(global.fetch).toHaveBeenCalled();

        // Check cache
        const cached = localStorage.getItem('currency_data_cache');
        expect(cached).not.toBeNull();
        expect(JSON.parse(cached!).data).toEqual(mockData.rates);
    });

    it('should correcty convert amounts', () => {
        const rates = { USD: 1, EUR: 0.9, GBP: 0.8 };

        // 100 USD to EUR
        const eurAmount = currencyService.convert(100, 'USD', 'EUR', rates);
        expect(eurAmount).toBe(90);

        // 90 EUR to GBP
        const gbpAmount = currencyService.convert(90, 'EUR', 'GBP', rates);
        expect(gbpAmount).toBe(80);
    });

    it('should return cached data if fresh', async () => {
        const mockRates = { EUR: 0.92 };
        localStorage.setItem('currency_data_cache', JSON.stringify({
            timestamp: Date.now(),
            data: mockRates
        }));

        const results = await currencyService.getRates();

        expect(results).toEqual(mockRates);
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
