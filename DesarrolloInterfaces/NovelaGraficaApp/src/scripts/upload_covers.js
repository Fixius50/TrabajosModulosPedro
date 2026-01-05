
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load .env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase keys.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COVERS = [
    { localPath: 'public/assets/Batman/cover.png', bucketPath: 'comics/Batman/cover.png', seriesTitle: 'Batman' },
    { localPath: 'public/assets/DnD/cover.png', bucketPath: 'comics/DnD/cover.png', seriesTitle: 'Dungeons & Dragons' },
    { localPath: 'public/assets/RickAndMorty/cover.png', bucketPath: 'comics/RickAndMorty/cover.png', seriesTitle: 'Rick and Morty' },
    { localPath: 'public/assets/BoBoBo/cover.png', bucketPath: 'comics/BoBoBo/cover.png', seriesTitle: 'BoBoBo' },
    { localPath: 'public/assets/NeonRain/cover.png', bucketPath: 'comics/NeonRain/cover.png', seriesTitle: 'Neon Rain' }
];

async function uploadCovers() {
    console.log('🚀 Starting Cover Migration to Supabase Storage...');

    for (const item of COVERS) {
        try {
            const absolutePath = join(__dirname, '../../', item.localPath);
            if (!fs.existsSync(absolutePath)) {
                console.error(`⚠️ File missing: ${item.localPath}`);
                continue;
            }

            const fileBuffer = fs.readFileSync(absolutePath);

            console.log(`📤 Uploading ${item.seriesTitle}...`);
            const { error: uploadError } = await supabase.storage
                .from('comics')
                .upload(item.bucketPath, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                console.error(`❌ Upload failed for ${item.seriesTitle}:`, uploadError);
                continue;
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('comics')
                .getPublicUrl(item.bucketPath);

            const publicUrl = publicUrlData.publicUrl;
            console.log(`✅ Uploaded to: ${publicUrl}`);

            // Update Database
            console.log(`🔄 Updating DB for ${item.seriesTitle}...`);
            const { error: dbError } = await supabase
                .from('series')
                .update({ cover_url: publicUrl })
                .eq('title', item.seriesTitle);

            if (dbError) {
                console.error(`❌ DB Update failed for ${item.seriesTitle}:`, dbError);
            } else {
                console.log(`✅ Database synced.`);
            }

        } catch (err) {
            console.error(`❌ Unexpected error for ${item.seriesTitle}:`, err);
        }
    }
    console.log('🎉 Migration Complete.');
}

uploadCovers();
