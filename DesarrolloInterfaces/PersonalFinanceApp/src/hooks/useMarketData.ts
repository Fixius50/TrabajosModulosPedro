import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

export const useMarketData = () => {
    const { data: crypto, isLoading: loadingCrypto } = useQuery({
        queryKey: ['market', 'crypto'],
        queryFn: () => apiService.getCryptoPrices(['bitcoin', 'ethereum', 'solana'], 'eur'),
        staleTime: 1000 * 60 * 15, // 15 mins
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep in persistence)
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    const { data: forex, isLoading: loadingForex } = useQuery({
        queryKey: ['market', 'forex'],
        queryFn: () => apiService.getForexRates('EUR'),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 48, // 48 hours
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    return {
        crypto,
        forex,
        loading: loadingCrypto || loadingForex
    };
};
