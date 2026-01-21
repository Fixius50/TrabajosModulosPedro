
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const FINNHUB_KEY = process.env.VITE_FINNHUB_API_KEY;

console.log("Checking API access...");
console.log(`Key found in .env: ${FINNHUB_KEY ? 'YES' : 'NO'}`);

async function checkCoinGecko() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        if (res.ok) console.log("✅ CoinGecko: OK");
        else console.log(`❌ CoinGecko: Error ${res.status}`);
    } catch (e) {
        console.log(`❌ CoinGecko: Failed (${e.message})`);
    }
}

async function checkFinnhub() {
    if (!FINNHUB_KEY) {
        console.log("❌ Finnhub: No key found");
        return;
    }
    try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_KEY}`);
        if (res.ok) {
            const data = await res.json();
            if (data.c) console.log(`✅ Finnhub: OK (AAPL: ${data.c})`);
            else console.log(`⚠️ Finnhub: Response invalid (Check Key?)`);
        } else {
            console.log(`❌ Finnhub: Error ${res.status} (Check Key?)`);
        }
    } catch (e) {
        console.log(`❌ Finnhub: Failed (${e.message})`);
    }
}

async function run() {
    await checkCoinGecko();
    await checkFinnhub();
}

run();
