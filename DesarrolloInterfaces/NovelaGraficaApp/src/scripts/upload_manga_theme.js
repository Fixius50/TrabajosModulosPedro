import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase keys missing.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const themeData = {
    name: 'Estilo Manga',
    description: 'Blanco y negro, tramas y acción pura.',
    type: 'theme',
    cost: 0, // Free for now to test
    asset_value: 'manga',
    is_active: true
};

async function upload() {
    console.log(`🚀 Uploading: ${themeData.name}`);
    const { data: existing } = await supabase.from('shop_items').select('id').eq('asset_value', 'manga').single();

    if (existing) {
        console.log(`⚠️ Updating existing (ID: ${existing.id})`);
        await supabase.from('shop_items').update(themeData).eq('id', existing.id);
    } else {
        console.log('✨ Creating new theme');
        await supabase.from('shop_items').insert([themeData]);
    }
    console.log('✅ Done.');
}

upload();
