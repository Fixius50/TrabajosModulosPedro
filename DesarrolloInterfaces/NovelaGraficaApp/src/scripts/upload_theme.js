import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env from root
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment variables.');
    console.log('Make sure you have a .env file in the root directory.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const themeData = {
    name: 'Tema Neón (Moderno)',
    description: 'Rediseño completo con estética Glassmorphism y colores vibrantes.',
    type: 'theme',
    cost: 500,
    asset_value: 'modern',
    is_active: true
};

async function uploadTheme() {
    console.log(`🚀 Iniciando carga del tema: ${themeData.name}`);

    try {
        // 1. Check if theme exists
        const { data: existing, error: searchError } = await supabase
            .from('shop_items')
            .select('id')
            .eq('asset_value', 'modern')
            .single();

        if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw searchError;
        }

        if (existing) {
            console.log(`⚠️ El tema ya existe (ID: ${existing.id}). Actualizando datos...`);
            const { error: updateError } = await supabase
                .from('shop_items')
                .update(themeData)
                .eq('id', existing.id);

            if (updateError) throw updateError;
            console.log('✅ Tema actualizado correctamente.');
        } else {
            console.log('✨ Creando nuevo registro de tema...');
            const { error: insertError } = await supabase
                .from('shop_items')
                .insert([themeData]);

            if (insertError) throw insertError;
            console.log('✅ Tema insertado en la tienda correctamente.');
        }

    } catch (err) {
        console.error('❌ Error operando con Supabase:', err.message);
        // Hint: RLS might block this if using ANON key without policies
        if (err.message.includes('policy') || err.message.includes('permission')) {
            console.warn('💡 Nota: Si esto falla por permisos, asegúrate de tener una política RLS que permita INSERT/UPDATE a anon/authenticated, o usa la SERVICE_ROLE_KEY en el script.');
        }
    }
}

uploadTheme();
