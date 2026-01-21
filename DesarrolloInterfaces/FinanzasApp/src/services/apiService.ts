import { proxyService } from './api.proxy';

export const getBitcoinPrice = async (): Promise<number | null> => {
    try {
        // Use proxy for CoinGecko too, or switch to Binance via proxy if desired. Keeping original logic but via proxy.
        // https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur
        const data: any = await proxyService.fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        return data.bitcoin.eur;
    } catch (error) {
        console.warn('Error fetching Bitcoin price (using mock):', error);
        return 95000.00; // Mock value to prevent endless loading UI
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
        // ESIOS usually requires strict headers. Proxy handles CORS, but we must pass headers.
        const headers = {
            'Accept': 'application/json; application/vnd.esios-api-v1+json',
            'Content-Type': 'application/json',
            'Authorization': `Token token="${token}"`
        };

        const data: any = await proxyService.fetch(
            `https://api.esios.ree.es/indicators/1001?start_date=${today}&end_date=${today}`,
            { headers }
        );

        return data.indicator.values;
    } catch (error) {
        console.error('Error fetching Electricity price via proxy:', error);
        return null;
    }
};

export const convertCurrency = async (amount: number, from: string, to: string = 'EUR'): Promise<number | null> => {
    try {
        if (from === to) return amount;
        // Frankfurter generally supports CORS, but using proxy ensures consistency.
        const data: any = await proxyService.fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
        return data.rates[to];
    } catch (error) {
        console.error('Error converting currency:', error);
        return null;
    }
};

export const getFinancialNews = async (): Promise<any[] | null> => {
    try {
        // Using El Pais Economy RSS Feed (Free & Infinite)
        // We use the Proxy to fetch the XML content content avoiding CORS
        const rssUrl = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada';

        // The proxy now returns text/xml if we ask or if the content is XML
        const xmlString: any = await proxyService.fetch(rssUrl);

        if (!xmlString || typeof xmlString !== 'string') {
            throw new Error('Invalid RSS response');
        }

        // Parse XML in the browser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        const news: any[] = [];

        items.forEach((item, index) => {
            if (index > 10) return; // Limit to 10 latest news

            const title = item.querySelector("title")?.textContent || "Sin título";
            const link = item.querySelector("link")?.textContent || "#";
            const description = item.querySelector("description")?.textContent || "";
            // Try to extract image from media:content or description if available, else placeholder
            const mediaContent = item.getElementsByTagNameNS("*", "content")[0];
            const imageUrl = mediaContent?.getAttribute("url") ||
                "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();

            news.push({
                uuid: link, // Use link as unique ID
                title: title,
                description: description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...', // Strip HTML tags
                url: link,
                image_url: imageUrl,
                published_at: pubDate,
                source: 'El País Economía'
            });
        });

        return news;

    } catch (error) {
        console.error('Error fetching RSS news:', error);
        return [];
    }
};
