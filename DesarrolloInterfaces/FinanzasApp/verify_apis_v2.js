
import https from 'https';
import fs from 'fs';
import path from 'path';

// Manual .env parser to avoid dotenv dependency issues
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.log("❌ Could not read .env file");
}

const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const KEY = envVars['VITE_FINNHUB_API_KEY'];
console.log(`Key in .env: ${KEY ? 'FOUND (' + KEY.substring(0, 5) + '...)' : 'MISSING'}`);

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', (e) => reject(e));
    });
}

async function run() {
    console.log("--- Testing CoinGecko ---");
    try {
        const res = await fetchUrl('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        if (res.status === 200) {
            console.log("✅ CoinGecko OK:", res.body);
        } else {
            console.log(`❌ CoinGecko Error ${res.status}:`, res.body);
        }
    } catch (e) {
        console.log("❌ CoinGecko Exception:", e.message);
    }

    console.log("\n--- Testing Finnhub ---");
    if (!KEY) {
        console.log("⚠️ Skipping Finnhub (No Key)");
        return;
    }
    try {
        const res = await fetchUrl(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${KEY}`);
        if (res.status === 200) {
            console.log("✅ Finnhub OK:", res.body);
        } else {
            console.log(`❌ Finnhub Error ${res.status}:`, res.body);
        }
    } catch (e) {
        console.log("❌ Finnhub Exception:", e.message);
    }
}

run();
