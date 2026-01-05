
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/comics`;

const SERIES_UPDATES = [
    {
        title: 'Batman: Sombras',
        path: 'Batman/cover.png'
    },
    {
        title: 'Cyberpunk: Neon Rain',
        path: 'NeonRain/cover.png'
    },
    {
        title: 'Dungeons & Dragons',
        path: 'DnD/cover.png'
    },
    {
        title: 'Rick and Morty',
        path: 'RickAndMorty/cover.png'
    },
    {
        title: 'BoBoBo',
        path: 'BoBoBo/cover.png'
    }
];

async function forceUpdateCovers() {
    console.log('🚀 Starting Forced Cover Update (Cache Busting)...');

    const timestamp = Date.now();

    for (const item of SERIES_UPDATES) {
        const fullUrl = `${BASE_STORAGE_URL}/${item.path}?t=${timestamp}`;
        console.log(`🔄 Updating '${item.title}' -> ${fullUrl}`);

        const { error } = await supabase
            .from('series')
            .update({ cover_url: fullUrl })
            .eq('title', item.title);

        if (error) {
            console.error(`❌ Failed to update ${item.title}:`, error.message);
        } else {
            console.log(`✅ Success: ${item.title}`);
        }
    }

    console.log('✨ All updates completed.');
}

forceUpdateCovers();
