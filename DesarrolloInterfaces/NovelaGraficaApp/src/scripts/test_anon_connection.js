
import { createClient } from '@supabase/supabase-js';

// ---- CONFIGURATION (From your .env) ----
const SUPABASE_URL = 'https://itvwrrsaigfejbooewjb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dndycnNhaWdmZWpib29ld2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODQwOTgsImV4cCI6MjA4MDI2MDA5OH0.Tu2HPHbEgO3ESYWenmvdn9GmvwEHIJw2lK0cRMrVU_s';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testAnon() {
    console.log("🕵️ Testing Anon Key Connection...");

    const start = Date.now();
    const { data, error } = await supabase.from('series').select('*');
    const duration = Date.now() - start;

    if (error) {
        console.error(`❌ Anon Fetch Failed (${duration}ms):`, error);
    } else {
        console.log(`✅ Anon Fetch Success (${duration}ms). Found ${data.length} items.`);
        if (data.length > 0) {
            console.log("   First Item:", data[0].title);
        } else {
            console.warn("   ⚠️ Warning: Data is empty (RLS might be hiding rows).");
        }
    }
}

testAnon();
