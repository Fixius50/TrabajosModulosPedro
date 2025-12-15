
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; 
// NOTE: For writing to storage, we might need SERVICE_ROLE_KEY if RLS is strict.
// But usually for authenticated users or correct policies ANON works. 
// However, a admin script usually uses SERVICE_ROLE.
// Let's try to use the one available in .env. If it fails, we'll ask user.
// Ideally, the user should have a SUPABASE_SERVICE_KEY for admin scripts.

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'novel-assets';
const LOCAL_ASSETS_DIR = path.join(__dirname, '../public/assets');

async function uploadFile(filePath, relativePath) {
  const fileContent = fs.readFileSync(filePath);
  // Prepare path for Supabase (windows uses \, web uses /)
  const supabasePath = relativePath.split(path.sep).join('/');

  console.log(`Uploading: ${supabasePath}...`);

  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(supabasePath, fileContent, {
      upsert: true,
      contentType: getContentType(filePath)
    });

  if (error) {
    console.error(`Error uploading ${supabasePath}:`, error.message);
  } else {
    console.log(`Success: ${supabasePath}`);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg': return 'image/jpeg';
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

async function scanAndUpload(dir, baseDir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await scanAndUpload(fullPath, baseDir);
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      await uploadFile(fullPath, relativePath);
    }
  }
}

async function main() {
  console.log(`Starting Sync from ${LOCAL_ASSETS_DIR} to bucket '${BUCKET_NAME}'...`);
  
  if (!fs.existsSync(LOCAL_ASSETS_DIR)) {
      console.error("Assets directory not found!");
      return;
  }

  // Ensure bucket exists (optional, or assume user made it)
  // const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  
  await scanAndUpload(LOCAL_ASSETS_DIR, LOCAL_ASSETS_DIR);
  
  console.log("Sync Complete!");
}

main();
