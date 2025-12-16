
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../'); // Adjust based on script location

// Load env vars
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // Or Service Role Key if needing bypass RLS

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase Credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MAPPING ---
// Source Folder (relative to public/assets) -> Target Bucket
const BUCKET_MAPPING = {
    'portadas': 'comics',
    'common': 'themes',
    // Comic folders:
    'Batman': 'comics',
    'BoBoBo': 'comics',
    'DnD': 'comics',
    'RickAndMorty': 'comics',
    // 'fonts': 'fonts' // Uncomment if exists
};

const ASSETS_DIR = path.join(PROJECT_ROOT, 'public/assets');

async function uploadFile(bucket, filePath, remotePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        // Clean remote path (windows slashes)
        const cleanRemotePath = remotePath.replace(/\\/g, '/');

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(cleanRemotePath, fileBuffer, {
                upsert: true,
                contentType: getContentType(filePath)
            });

        if (error) throw error;
        console.log(`✅ Uploaded [${bucket}]: ${cleanRemotePath}`);
    } catch (err) {
        console.error(`❌ Failed [${bucket}] ${remotePath}:`, err.message);
    }
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
    };
    return map[ext] || 'application/octet-stream';
}

async function processDirectory(dirName, bucket) {
    const fullSourcePath = path.join(ASSETS_DIR, dirName);

    if (!fs.existsSync(fullSourcePath)) {
        console.warn(`⚠️ Skipped missing folder: ${dirName}`);
        return;
    }

    // Recursive walker
    async function walk(currentPath, baseDir) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            const fullPath = path.join(currentPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                await walk(fullPath, baseDir);
            } else {
                // Calculate remote path relative to the specific mapping root
                // Ex: public/assets/Batman/page1.jpg -> Batman/page1.jpg inside 'comics' bucket
                const relativePath = path.relative(ASSETS_DIR, fullPath);
                await uploadFile(bucket, fullPath, relativePath);
            }
        }
    }

    console.log(`📂 Processing '${dirName}' -> Bucket '${bucket}'...`);
    await walk(fullSourcePath, fullSourcePath);
}

// --- MAIN ---
async function main() {
    console.log('🚀 Starting Asset Organization...');

    for (const [folder, bucket] of Object.entries(BUCKET_MAPPING)) {
        await processDirectory(folder, bucket);
    }

    console.log('✨ All uploads processed.');
}

main();
