
const ESIOS_TOKEN = import.meta.env.VITE_ESIOS_TOKEN || '';
const ESIOS_API_URL = 'https://api.esios.ree.es/indicators/1001';

export interface EsiosData {
    prices: { hour: string; price: number; isCheap: boolean }[]; // hour: "00-01", price: €/kWh
    currentPrice: { hour: string; price: number; isCheap: boolean };
    avgPrice: number;
}

// Mock Data para cuando no hay token o la API falla
const MOCK_DATA: EsiosData = {
    prices: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`,
        price: Math.random() * 0.30, // 0.00 - 0.30 €
        isCheap: false
    })).map(p => ({ ...p, isCheap: p.price < 0.15 })),
    currentPrice: { hour: "14-15", price: 0.1423, isCheap: true },
    avgPrice: 0.18
};

export const esiosService = {
    async getPvpcPrices(): Promise<EsiosData> {
        // Retornar Mock si no hay token configurado para evitar 401s constantes en desarrollo
        if (!ESIOS_TOKEN || ESIOS_TOKEN === 'YOUR_TOKEN_HERE') {
            console.warn('ESIOS Token missing. Using Mock Data.');
            return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA), 500));
        }

        try {
            const response = await fetch(ESIOS_API_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': ESIOS_TOKEN
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            return this.processData(data);
        } catch (error) {
            console.error('Error fetching ESIOS data:', error);
            return MOCK_DATA;
        }
    },

    processData(apiData: any): EsiosData {
        try {
            // ESIOS devuelve una estructura compleja. Values está en indicator.values
            // Filtramos para geo_id = 8741 (Península) o default
            const values = apiData.indicator.values;

            // Simplificación: Tomamos el primer set de 24h disponible (usualmente el día actual)
            // La API devuelve values con "datetime" (UTC). Convertir a local.
            const todayValues = values.filter((v: any) => v.geo_id === 8741); // 8741 Península

            const prices = todayValues.map((v: any) => {
                const date = new Date(v.datetime);
                const priceKwh = v.value / 1000; // API da €/MWh -> Convertir a €/kWh
                return {
                    hour: `${date.getHours().toString().padStart(2, '0')}-${(date.getHours() + 1).toString().padStart(2, '0')}`,
                    price: priceKwh,
                    isCheap: priceKwh < 0.15 // Umbral arbitrario de "barato"
                };
            });

            const currentHour = new Date().getHours();
            const currentPrice = prices.find((p: any) => p.hour.startsWith(currentHour.toString().padStart(2, '0'))) || prices[0];
            const avgPrice = prices.reduce((acc: number, cur: any) => acc + cur.price, 0) / prices.length;

            return {
                prices,
                currentPrice,
                avgPrice
            };
        } catch (e) {
            console.error('Error parsing ESIOS data', e);
            return MOCK_DATA;
        }
    }
};
