
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Faltan variables de entorno.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Auth with token if provided
const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;
const TEST_REFRESH_TOKEN = process.env.TEST_REFRESH_TOKEN;

if (TEST_ACCESS_TOKEN && TEST_REFRESH_TOKEN) {
    console.log("🔐 Usando token de prueba para autenticación...");
    await supabase.auth.setSession({
        access_token: TEST_ACCESS_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN
    });
} else {
    console.warn("⚠️ No se proporcionó token (TEST_ACCESS_TOKEN). Se usará cliente anónimo (puede fallar por RLS).");
}

async function simulateSpouseActivity() {
    console.log("🤖 Iniciando Simulación de Cónyuge...");

    // 1. Get first household
    const { data: households, error: hhError } = await supabase.from('households').select('*').limit(1);

    if (hhError || !households || households.length === 0) {
        console.error("❌ No se encontraron hogares.", hhError);
        return;
    }

    const householdId = households[0].id;
    console.log(`🏠 Hogar encontrado: ${households[0].name} (${householdId})`);

    // 2. Get first shared account
    const { data: accounts, error: accError } = await supabase
        .from('shared_accounts')
        .select('*')
        .eq('household_id', householdId)
        .limit(1);

    if (accError || !accounts || accounts.length === 0) {
        console.error("❌ No se encontraron cuentas compartidas en este hogar.");
        return;
    }

    const account = accounts[0];
    console.log(`💰 Cuenta objetivo: ${account.name} (${account.id})`);
    console.log(`📊 Saldo actual: ${account.balance}`);

    // 3. Insert a transaction
    const amount = -15.50;
    const description = "Simulación Compra Cónyuge 🛒";

    console.log(`⏳ Insertando transacción de ${amount} por ${description}...`);

    // NOTA: En un caso real, esto lo haría el usuario autenticado. 
    // Aquí usamos el cliente anónimo, por lo que las políticas RLS deben permitir INSERT si somos miembros.
    // Para simplificar la prueba, asumiremos que tenemos permisos o usaremos un Service Role si fuera necesario (aquí usaremos anon key, esperando que pases logueado o que las reglas permitan anon para pruebas, si no fallará y necesitaré tu token).

    // ATTENTION: RLS might block this if not authenticated.
    // For this test script to work without full auth flow, we might need a valid user token.
    // But let's try assuming broad permissions for dev or we'll assume the helper runs in context.
    // Better strategy: We can't easily fake auth unless we sign in.
    // Let's Try to SignIn with a test account if exists, or just try insert.

    // UPDATE: To make this robust, I'll update the account balance directly (simulate backend trigger) 
    // and insert transaction.

    const { data: tx, error: txError } = await supabase
        .from('shared_account_transactions')
        .insert({
            shared_account_id: account.id,
            amount: amount,
            description: description,
            category: 'Alimentación',
            created_by: households[0].created_by // Simulate it was created by the owner for now to pass foreign key if any
        })
        .select()
        .single();

    if (txError) {
        console.error("❌ Error insertando transacción (Probablemente RLS):", txError);
        console.log("⚠️ Asegúrate de que las políticas RLS permitan inserts o usa un usuario autenticado.");
    } else {
        console.log("✅ Transacción insertada correctamente:", tx);
    }

    // 4. Update Balance (Simulating Trigger)
    const newBalance = account.balance + amount;
    const { error: updateError } = await supabase
        .from('shared_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

    if (updateError) {
        console.error("❌ Error actualizando saldo:", updateError);
    } else {
        console.log(`✅ Saldo actualizado a: ${newBalance}`);
    }

    console.log("🎉 Simulación completada. Verifica la UI.");
}

simulateSpouseActivity();
