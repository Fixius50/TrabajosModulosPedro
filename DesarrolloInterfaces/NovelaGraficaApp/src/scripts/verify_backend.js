
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    const { count: seriesCount } = await supabase.from('series').select('*', { count: 'exact', head: true });
    const { count: shopCount } = await supabase.from('shop_items').select('*', { count: 'exact', head: true });
    const { count: chaptersCount } = await supabase.from('chapters').select('*', { count: 'exact', head: true });

    console.log(`Series: ${seriesCount}`);
    console.log(`Shop Items: ${shopCount}`);
    console.log(`Chapters: ${chaptersCount}`);
}

verify();
