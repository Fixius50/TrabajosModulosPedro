
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load Environment Variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

let processEnv = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            processEnv[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not read .env file.");
    process.exit(1);
}

const supabaseUrl = processEnv.VITE_SUPABASE_URL;
const supabaseKey = processEnv.VITE_SUPABASE_ANON_KEY; // OR SERVICE_ROLE_KEY if RLS blocks delete

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log("🧹 Starting Cleanup of Duplicates...");

    // 1. Fetch all series
    const { data: series, error } = await supabase.from('series').select('id, title, created_at');
    if (error) {
        console.error("Error fetching series:", error);
        return;
    }

    console.log(`Found ${series.length} total series.`);

    // 2. Group by title
    const groups = {};
    series.forEach(s => {
        if (!groups[s.title]) groups[s.title] = [];
        groups[s.title].push(s);
    });

    // 3. Identify duplicates to delete
    const toDeleteIds = [];

    for (const title in groups) {
        const group = groups[title];
        if (group.length > 1) {
            console.log(`Duplicate found for "${title}": ${group.length} copies.`);
            // Sort by created_at desc (keep newest) or asc (keep oldest). 
            // Let's keep the OLDEST (so IDs in other tables might stay valid if they linked to first one? 
            // Actually seeded data links to specific IDs generated during that run. 
            // So if we have orphaned chapters, it's messy.
            // Safe bet: Keep the most recent one assuming it's the valid one from last seed run.

            // Sort: Newest first
            group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Keep index 0, delete the rest
            const duplicates = group.slice(1);
            duplicates.forEach(d => toDeleteIds.push(d.id));
        }
    }

    if (toDeleteIds.length === 0) {
        console.log("No duplicates found.");
        return;
    }

    console.log(`Deleting ${toDeleteIds.length} duplicate series...`);

    // 4. Delete
    const { error: deleteError } = await supabase
        .from('series')
        .delete()
        .in('id', toDeleteIds);

    if (deleteError) {
        console.error("Error deleting:", deleteError);
    } else {
        console.log("✅ Cleanup complete. Duplicates removed.");
    }
}

cleanup();
