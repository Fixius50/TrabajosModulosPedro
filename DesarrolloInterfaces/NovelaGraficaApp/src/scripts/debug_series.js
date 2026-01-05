
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSeries() {
    console.log("--- SERIES DATA ---");
    const { data: series, error } = await supabase.from('series').select('id, title, cover_url');

    if (error) {
        console.error("Error:", error);
        return;
    }

    series.forEach(s => {
        console.log(`ID: ${s.id}`);
        console.log(`Title: ${s.title}`);
        console.log(`Cover: ${s.cover_url}`);
        console.log("-------------------");
    });
}

checkSeries();
