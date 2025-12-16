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
    name: 'Tema Manga',
    description: 'Estilo blanco y negro de alto contraste con tramas y líneas de velocidad.',
    type: 'theme',
    cost: 500,
    asset_value: 'manga',
    is_active: true
};

async function uploadTheme() {
    console.log(`🚀 Iniciando carga: ${themeData.name}`);

    try {
        const { data: existing, error: searchError } = await supabase
            .from('shop_items')
            .select('id')
            .eq('asset_value', 'manga')
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
