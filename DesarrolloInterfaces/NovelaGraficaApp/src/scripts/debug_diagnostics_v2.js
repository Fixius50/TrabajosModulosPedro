
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("--- SERIES COVERS ---");
    const { data: series, error } = await supabase.from('series').select('id, title, cover_url');
    if (error) console.error(error);
    else console.table(series);

    console.log("\n--- NODES (Sample) ---");
    // Check if we have any nodes in DB to verifying GetAllNodesBySeries
    const { data: nodes, error: nodeError } = await supabase.from('nodes').select('id, title, story_id').limit(5);
    if (nodeError) console.error(nodeError);
    else console.table(nodes);
}

checkData();
