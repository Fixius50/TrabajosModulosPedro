
export interface PVPCData {
    value: number;
    datetime: string;
}

export const esiosService = {
    async getPVPC(): Promise<PVPCData | null> {
        const token = import.meta.env.VITE_ESIOS_TOKEN;

        // Mock Data si no hay token (para desarrollo sin bloqueo)
        if (!token) {
            console.warn("ESIOS Token not found. Using Mock Data.");
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        value: 142.5, // €/MWh
                        datetime: new Date().toISOString()
                    });
                }, 500);
            });
        }

        try {
            // Indicator 1001: PVPC 2.0TD Península, Canarias, Baleares, Ceuta, Melilla
            // Usamos geo_id 8741 (Península) por defecto para MVP
            const now = new Date();
            const startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();

            const url = `https://api.esios.ree.es/indicators/1001?start_date=${startDate}&end_date=${endDate}&geo_ids[]=8741`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json; application/vnd.esios-api-v1+json',
                    'Content-Type': 'application/json',
                    'x-api-key': token
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // Encontrar el precio de la hora actual
            const currentHour = new Date().getHours();
            const values = data.indicator.values;
            const currentPrice = values.find((v: any) => new Date(v.datetime).getHours() === currentHour);

            return currentPrice ? {
                value: currentPrice.value,
                datetime: currentPrice.datetime
            } : null;

        } catch (error) {
            console.error("Error fetching ESIOS data:", error);
            return null;
        }
    }
};
