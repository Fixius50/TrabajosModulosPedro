
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ------------------------------------------------------------------
// 1. Environment Setup (Manual .env parsing to avoid dependencies)
// ------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) {
            console.warn('Warning: .env file not found at', envPath);
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                envVars[key.trim()] = value;
            }
        });
        return envVars;
    } catch (e) {
        console.error('Error loading .env:', e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
// Try Service Role Key first, then Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Access requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANNON_KEY).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// 2. Configuration
// ------------------------------------------------------------------
const ASSETS_DIR = path.resolve(__dirname, '../src/assets/marketplace');
const BUCKET_NAME = 'marketplace';

// Mapping filename -> DB item name
// Make sure these match exactly what is in your database 'name' column
const ITEM_MAPPING: Record<string, string> = {
    // Batch 1
    'novice_adventurer_icon.png': 'Novice Adventurer',
    'gold_hoarder_icon.png': 'Gold Hoarder',
    // Batch 2
    'dragon_slayer_icon.png': 'Dragon Slayer',
    'neon_cyber_theme.png': 'Neon Cyber',
    // Batch 3
    'dark_fantasy_theme.png': 'Dark Fantasy',
    'warrior_avatar.png': 'Warrior',
    // Batch 4
    'mage_avatar.png': 'Mage'
};

// ------------------------------------------------------------------
// 3. Main Logic
// ------------------------------------------------------------------
async function uploadAssets() {
    console.log(`\n🚀 Starting asset upload script for Bucket: [${BUCKET_NAME}]`);
    console.log(`📂 Source Directory: ${ASSETS_DIR}\n`);

    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        // Basic image filter
        if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;

        const itemName = ITEM_MAPPING[file];
        if (!itemName) {
            console.log(`⚠️  Skipping unmapped file: ${file}`);
            continue;
        }

        console.log(`➤ Processing [${itemName}] -> ${file}...`);

        try {
            const filePath = path.join(ASSETS_DIR, file);
            const fileBuffer = fs.readFileSync(filePath);

            // Detect Content-Type
            let contentType = 'image/png';
            if (file.endsWith('.jpg') || file.endsWith('.jpeg')) contentType = 'image/jpeg';
            if (file.endsWith('.webp')) contentType = 'image/webp';

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(`items/${file}`, fileBuffer, {
                    contentType: contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error(`   ❌ Upload Failed:`, uploadError.message);
                errorCount++;
                continue;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(`items/${file}`);

            // 3. Update Database
            const { error: dbError } = await supabase
                .from('marketplace_items')
                .update({ image_url: publicUrl })
                .eq('name', itemName);

            if (dbError) {
                console.error(`   ❌ DB Update Failed:`, dbError.message);
                errorCount++;
            } else {
                console.log(`   ✅ Success! URL: ${publicUrl}`);
                successCount++;
            }

        } catch (err: any) {
            console.error(`   ❌ Unexpected Error:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n✨ Done. Success: ${successCount}, Errors: ${errorCount}`);
}

uploadAssets().catch(console.error);
