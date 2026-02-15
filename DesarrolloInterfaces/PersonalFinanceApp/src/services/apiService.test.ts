import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from './apiService';

describe('ApiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should fetch crypto prices and cache them', async () => {
        const mockData = { bitcoin: { eur: 50000 } };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const result = await apiService.getCryptoPrices(['bitcoin'], 'eur');

        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalled();

        // Check cache
        const cached = localStorage.getItem('market_data_crypto_eur');
        expect(cached).not.toBeNull();
        expect(JSON.parse(cached!).data).toEqual(mockData);
    });

    it('should return cached data if fresh', async () => {
        const mockData = { bitcoin: { eur: 50000 } };
        localStorage.setItem('market_data_crypto_eur', JSON.stringify({
            timestamp: Date.now(),
            data: mockData
        }));

        const result = await apiService.getCryptoPrices(['bitcoin'], 'eur');

        expect(result).toEqual(mockData);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch fresh data if cache is stale', async () => {
        const staleData = { bitcoin: { eur: 40000 } };
        const freshData = { bitcoin: { eur: 50000 } };

        localStorage.setItem('market_data_crypto_eur', JSON.stringify({
            timestamp: Date.now() - (20 * 60 * 1000), // 20 mins ago (stale for crypto)
            data: staleData
        }));

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => freshData,
        });

        const result = await apiService.getCryptoPrices(['bitcoin'], 'eur');

        expect(result).toEqual(freshData);
        expect(global.fetch).toHaveBeenCalled();
    });
});
