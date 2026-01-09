
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SHOP_ITEMS = [
    {
        type: 'theme',
        asset_value: 'neon',
        display_name: 'Tema Neón',
        price: 40,
        description: 'Estilo cyberpunk con brillos neón.',
        style_config: { bg: "#1a0b2e", accent: "#d946ef", font: "Orbitron", cardBorder: "2px solid #d946ef" }
    },
    {
        type: 'theme',
        asset_value: 'comic',
        display_name: 'Tema Cómic',
        price: 20,
        description: 'Estilo cómic clásico con bordes negros.',
        style_config: { bg: "#ffffff", accent: "#facc15", font: "Bangers", cardBorder: "4px solid black" }
    },
    {
        type: 'theme',
        asset_value: 'manga',
        display_name: 'Tema Manga',
        price: 30,
        description: 'Blanco y negro con tramas.',
        style_config: { bg: "#ffffff", accent: "#000000", font: "Bangers", cardBorder: "3px solid black" }
    },
    {
        type: 'theme',
        asset_value: 'inverse',
        display_name: 'Modo Inverso',
        price: 0,
        description: 'Interfaz clara y accesible.',
        style_config: { bg: "#f0f0f0", accent: "#333333", font: "Inter", cardBorder: "1px solid #ccc" }
    }
];

const SERIES = [
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Dungeons & Dragons',
        description: 'Aventuras en los Reinos Olvidados.',
        cover_url: 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/cover.png',
        price: 0,
        is_premium: false,
        reading_time: '45m',
        genre: 'Fantasía'
    },
    {
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        title: 'Batman',
        description: 'El Caballero Oscuro regresa.',
        cover_url: 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/cover.png',
        price: 100,
        is_premium: true,
        reading_time: '30m',
        genre: 'Superhéroes'
    },
    {
        id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        title: 'Rick and Morty',
        description: 'Ciencia loca y viajes interdimensionales.',
        cover_url: 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/cover.png',
        price: 0,
        is_premium: false,
        reading_time: '20m',
        genre: 'Ciencia Ficción'
    },
    {
        id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        title: 'BoBoBo',
        description: 'Absurdo y batallas de pelo nasal.',
        cover_url: 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/cover.png',
        price: 50,
        is_premium: false,
        reading_time: '15m',
        genre: 'Humor'
    },
    {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        title: 'Neon Rain',
        description: 'Thriller Cyberpunk Hiperrealista.',
        cover_url: 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/NeonRain/cover.png',
        price: 0,
        is_premium: false,
        reading_time: '25m',
        genre: 'Cyberpunk'
    }
];

const CHAPTERS = [
    {
        series_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Inicio de la Campaña',
        order_index: 1,
        pages: [
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/1.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/2.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/3.jpg"
        ]
    },
    {
        series_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        title: 'Shadows of Gotham',
        order_index: 1,
        pages: [
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/1.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/2.jpg"
        ]
    },
    {
        series_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        title: 'Multiverse Madness',
        order_index: 1,
        pages: [
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/A1.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/A2.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/B1.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/B2.jpg"
        ]
    },
    {
        series_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        title: 'Fist of the Nose Hair',
        order_index: 1,
        pages: [
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/1.jpg",
            "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/2.jpg"
        ]
    },
    {
        series_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        title: 'Protocolo Fantasma',
        order_index: 1,
        pages: [
            "/assets/NeonRain/1.jpg",
            "/assets/NeonRain/2.jpg"
        ]
    }
];

async function reseed() {
    console.log('🔄 Starting Database Re-seed...');

    // 1. DELETE EXISTING DATA
    // Order matters due to foreign keys: chapters -> reviews -> series, shop_items

    console.log('🗑️ Clearing tables...');

    // Delete CHILD tables first
    const { error: err1 } = await supabase.from('review_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.error('Error clearing review_comments:', err1);

    const { error: err2 } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error('Error clearing reviews:', err2);

    // Chapters reference Series
    const { error: err3 } = await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('Error clearing chapters:', err3);

    // Nodes reference Chapters
    const { error: errNodes } = await supabase.from('story_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errNodes) console.error('Error clearing story_nodes:', errNodes);

    // User Library references items (text) but better clear it
    const { error: err4 } = await supabase.from('user_library').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.error('Error clearing user_library:', err4);

    // Now delete PARENT tables
    const { error: err5 } = await supabase.from('series').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5) console.error('Error clearing series:', err5);

    const { error: err6 } = await supabase.from('shop_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err6) console.error('Error clearing shop_items:', err6);

    console.log('✅ Tables cleared.');

    // 2. INSERT SHOP ITEMS
    console.log('🛍️ Inserting Shop Items...');
    const { error: themeError } = await supabase.from('shop_items').insert(SHOP_ITEMS);
    if (themeError) {
        console.error('❌ Error inserting themes:', themeError);
    } else {
        console.log('✅ Shop Items inserted.');
    }

    // 3. INSERT SERIES
    console.log('📖 Inserting Series...');
    const { error: seriesError } = await supabase.from('series').insert(SERIES);
    if (seriesError) {
        console.error('❌ Error inserting series:', seriesError);
    } else {
        console.log('✅ Series inserted.');
    }

    // 4. INSERT CHAPTERS
    console.log('📑 Inserting Chapters...');
    const { error: chaptersError } = await supabase.from('chapters').insert(CHAPTERS);
    if (chaptersError) {
        console.error('❌ Error inserting chapters:', chaptersError);
    } else {
        console.log('✅ Chapters inserted.');
    }

    console.log('🎉 Database re-seeded successfully.');
}

reseed().catch(err => console.error('Fatal error:', err));
