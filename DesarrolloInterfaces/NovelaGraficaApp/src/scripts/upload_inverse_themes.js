import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: ENV missing');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const themes = [
    {
        name: 'Modo Inverso (Blanco)',
        description: 'Interfaz clara y limpia.',
        type: 'theme',
        price: 0,
        asset_value: 'manga-dark',
        // is_active: true
    },
    {
        name: 'Comic Dark',
        description: 'Estilo cómic americano en modo oscuro.',
        type: 'theme',
        cost: 0,
        asset_value: 'comic-dark',
        // is_active: true
    }
];

async function upload() {
    for (const theme of themes) {
        console.log(`🚀 Processing: ${theme.name}`);
        const { data: existing } = await supabase.from('shop_items').select('id').eq('asset_value', theme.asset_value).single();

        if (existing) {
            console.log(`⚠️ Updating existing (ID: ${existing.id})`);
            const { error } = await supabase.from('shop_items').update(theme).eq('id', existing.id);
            if (error) console.error('Update Error:', error);
        } else {
            console.log('✨ Creating new theme');
            const { error } = await supabase.from('shop_items').insert([theme]);
            if (error) console.error('Insert Error:', error);
        }
    }
    console.log('✅ Done.');
}

upload();
