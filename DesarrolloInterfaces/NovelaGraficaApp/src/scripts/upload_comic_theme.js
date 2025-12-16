import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Variables de entorno no encontradas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const themeData = {
    name: 'Tema Cómic Clásico',
    description: 'Estilo Pop Art con tramas, bordes gruesos y onomatopeyas visuales.',
    type: 'theme',
    cost: 300,
    asset_value: 'comic',
    is_active: true,
    style_config: {
        bg: '#ffffff',
        pattern: 'radial-gradient(circle, #000 2px, transparent 2.5px)',
        bgSize: '20px 20px',
        bgPos: '0 0',
        text: '#000000',
        cardBorder: '4px solid black',
        cardRadius: '0',
        cardShadow: '8px 8px 0px black',
        font: 'Bangers, cursive',
        accent: '#facc15'
    }
};

async function uploadTheme() {
    console.log(`🚀 Iniciando carga: ${themeData.name}`);

    try {
        const { data: existing, error: searchError } = await supabase
            .from('shop_items')
            .select('id')
            .eq('asset_value', 'comic')
            .single();

        if (searchError && searchError.code !== 'PGRST116') throw searchError;

        if (existing) {
            console.log(`⚠️ Actualizando tema existente (ID: ${existing.id})...`);
            const { error: updateError } = await supabase
                .from('shop_items')
                .update(themeData)
                .eq('id', existing.id);
            if (updateError) throw updateError;
            console.log('✅ Tema actualizado.');
        } else {
            console.log('✨ Creando nuevo tema...');
            const { error: insertError } = await supabase
                .from('shop_items')
                .insert([themeData]);
            if (insertError) throw insertError;
            console.log('✅ Tema creado.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

uploadTheme();
