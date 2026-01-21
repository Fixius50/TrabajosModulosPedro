# 📚 Investigación de APIs Gratuitas y Abiertas

Este documento recoge el resultado de la investigación solicitada para integrar datos externos en **FinanzasApp** sin coste y, preferiblemente, sin registro (API Key).

## 🏆 Top Picks: APIs "Sin Barreras" (No Auth / No Key)

### 1. 💱 Frankfurter (Divisas)
*   **Estado:** ✅ **Verificada**.
*   **Uso:** Conversión de monedas (EUR/USD).
*   **URL:** `https://api.frankfurter.app/latest`

### 2. 🪙 Binance Public Data (Cripto)
*   **Estado:** ✅ **Verificada** (Vía Proxy).
*   **Uso:** Precios en tiempo real de Bitcoin, Ethereum, etc.
*   **URL:** `https://api.binance.com/api/v3/ticker/price`

### 3. 📰 RSS Feeds (Noticias Infinitas)
*   **Estrategia:** Usar canales RSS públicos en lugar de APIs limitadas.
*   **Ventaja:** **Totalmente gratis e ilimitado**. No requiere Keys.
*   **Fuentes Verificadas (España/Latam):**
    *   **Investing.com (Finanzas):** `https://es.investing.com/rss/news.rss` (General)
    *   **El País (Economía):** `https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada`
    *   **El Mundo (Economía):** `https://e00-elmundo.uecdn.es/elmundo/rss/economia.xml`
*   **Implementación:** Se leen vía `proxyService` y se convierten de XML a JSON en la App.

---

## 🥈 Opciones "Freemium" (Requieren Key)
Solo usar si se necesita funcionalidad muy específica no cubierta por las anteriores.

### 1. 📈 Finnhub (Stocks/Bolsa)
*   **Uso:** Gráficos de velas (Candles) para Stocks (Tesla, Apple).
*   **Limitación:** Requiere API Key gratuita.

---

## ⚠️ Notas Técnicas
*   **Proxy:** Todas las peticiones externas (especialmente RSS y Binance) deben pasar por las **Supabase Edge Functions** para evitar bloqueos CORS.
