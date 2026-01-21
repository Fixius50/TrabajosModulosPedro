import { supabase } from '../supabaseClient';

/**
 * Proxy service to fetch external data avoiding CORS.
 * Uses Supabase Edge Function 'fetch-external-data'.
 */
export const proxyService = {
    /**
     * Fetch data from an external URL via Supabase Edge Function
     * @param url The external URL to fetch
     * @param options Optional fetch options (method, headers, body)
     * @returns The JSON response from the external API
     */
    async fetch(url: string, options: { method?: string, headers?: any, body?: any } = {}) {
        try {
            const { data, error } = await supabase.functions.invoke('fetch-external-data', {
                body: {
                    url,
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.body
                }
            });

            if (error) {
                console.error("Proxy Function Error:", error);
                throw error;
            }

            return data;
        } catch (err) {
            console.error("Proxy Service call failed:", err);
            // Fallback: Try direct fetch if proxy fails (only works if NO CORS issues)
            console.warn("Falling back to direct fetch...");
            const res = await fetch(url, {
                method: options.method || 'GET',
                headers: options.headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            return await res.json();
        }
    }
};
