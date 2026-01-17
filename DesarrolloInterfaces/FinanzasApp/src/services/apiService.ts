export const getBitcoinPrice = async (): Promise<number | null> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.bitcoin.eur;
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        return null;
    }
};

export const getElectricityPrice = async (token?: string): Promise<any | null> => {
    try {
        if (!token) {
            console.warn('ESIOS Token missing');
            return null;
        }
        // ESIOS Indicator 1001: PVPC 2.0TD Peninsula
        const today = new Date().toISOString();
        const response = await fetch(`https://api.esios.ree.es/indicators/1001?start_date=${today}&end_date=${today}`, {
            headers: {
                'Accept': 'application/json; application/vnd.esios-api-v1+json',
                'Content-Type': 'application/json',
                'Authorization': `Token token="${token}"`
            }
        });
        if (!response.ok) throw new Error('ESIOS API Error');
        const data = await response.json();
        return data.indicator.values;
    } catch (error) {
        console.error('Error fetching Electricity price:', error);
        return null;
    }
};

export const convertCurrency = async (amount: number, from: string, to: string = 'EUR'): Promise<number | null> => {
    try {
        if (from === to) return amount;
        const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
        if (!response.ok) throw new Error('Currency API Error');
        const data = await response.json();
        return data.rates[to];
    } catch (error) {
        console.error('Error converting currency:', error);
        return null;
    }
};

export const getFinancialNews = async (api_token?: string): Promise<any[] | null> => {
    try {
        // Marketaux Free Tier
        const token = api_token || 'YOUR_MARKETAUX_TOKEN_HERE'; // User updates this in settings
        const response = await fetch(`https://api.marketaux.com/v1/news/all?symbols=TSLA,AMZN,MSFT&filter_entities=true&language=es&api_token=${token}`);
        if (!response.ok) {
            // Fallback to English generic news if specific ES news fails or no token
            // For demo purposes, we might leave it null or handle gracefully
            throw new Error('News API Error');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return null;
    }
};
