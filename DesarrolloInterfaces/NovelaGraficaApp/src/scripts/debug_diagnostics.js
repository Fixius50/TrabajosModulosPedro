
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
    console.log('🔍 Running Cover Diagnostics...\n');

    console.log('--- SERIES TABLE (Cover URLs) ---');
    const { data: series, error: dbError } = await supabase.from('series').select('title, cover_url');

    if (dbError) {
        console.error("DB Error:", dbError);
    } else {
        series.forEach(s => {
            console.log(`Title: ${s.title.padEnd(20)} | URL: ${s.cover_url}`);
        });
    }
}

runDiagnostics();
