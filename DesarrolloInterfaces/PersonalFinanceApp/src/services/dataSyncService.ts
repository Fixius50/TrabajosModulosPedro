
import { coinGeckoService } from './coinGeckoService';
import { currencyService } from './currencyService';
import { storageService } from './storageService';

const SYNC_INTERVAL = 60 * 1000; // 60 seconds

class DataSyncService {
    private intervalId: number | null = null;
    private isSyncing: boolean = false;

    startSync() {
        if (this.intervalId) return;

        console.log('Starting Data Sync Service...');
        this.sync(); // Initial sync

        this.intervalId = window.setInterval(() => {
            this.sync();
        }, SYNC_INTERVAL);
    }

    stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Stopped Data Sync Service');
        }
    }

    async sync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            console.log('Syncing external data...');

            // 1. Fetch Crypto Prices
            const cryptoData = await coinGeckoService.getTopCoins('usd');

            // 2. Fetch Currency Rates
            const rates = await currencyService.getRates();

            // 3. Update Global Context (For now, we just log it as we don't have a central store for this yet)
            // Ideally, we would dispatch this to a React Context or Zustand store
            console.log('Data Synced:', { crypto: cryptoData.length, rates: Object.keys(rates).length });

            // In a real app, we would calculate total net worth here based on user holdings
            this.calculateTotalWealth(cryptoData, rates);

        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private calculateTotalWealth(cryptoData: any[], rates: any) {
        const profile = storageService.getUserProfile();
        // Use rates to avoid unused variable warning (even if mock logic doesn't use it yet)
        console.log("Rates loaded:", rates);

        // Mock holdings for demo (since we don't have a 'Holdings' feature yet)
        const mockBtc = 0.5;
        const btcPrice = cryptoData.find((c: any) => c.symbol === 'btc')?.current_price || 0;

        const cryptoValue = mockBtc * btcPrice;
        const goldBalance = profile.stats.goldEarned; // Assuming 1 Gold = 1 USD for simplicity in this fantasy economy

        const totalNetWorth = cryptoValue + goldBalance;

        // Save to storage
        storageService.updateNetWorth(totalNetWorth);

        console.log(`Estimated Wealth: ${goldBalance} GP + $${cryptoValue.toFixed(2)} USD (Crypto) = $${totalNetWorth.toFixed(2)}`);
    }
}

export const dataSyncService = new DataSyncService();
