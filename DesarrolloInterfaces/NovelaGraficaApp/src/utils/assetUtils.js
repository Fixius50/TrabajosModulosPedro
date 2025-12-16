
import { supabase } from '../services/supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Resolves a local asset path to a Supabase Storage URL.
 * 
 * localPath: e.g. "/assets/portadas/Batman.png"
 * 
 * Logic:
 * - If it starts with "http", return as is.
 * - If it starts with "/assets/portadas", maps to "comics" bucket.
 * - If it starts with "/assets/common", maps to "themes" bucket.
 * - If it is a comic folder (e.g. "/assets/Batman/"), maps to "comics" bucket.
 * - Fallback: Return original path (allows local dev if buckets fail).
 */
export function getAssetUrl(localPath) {
    if (!localPath) return '';
    if (localPath.startsWith('http')) return localPath;

    // Remove leading slash for cleaner processing
    const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
    // Now: "assets/portadas/Batman.png"

    if (!cleanPath.startsWith('assets/')) return localPath; // Unknown structure

    const internalPath = cleanPath.replace('assets/', '');
    // Now: "portadas/Batman.png" or "common/bg.jpg"

    let bucket = '';

    if (internalPath.startsWith('portadas/') ||
        internalPath.startsWith('Batman/') ||
        internalPath.startsWith('DnD/') ||
        internalPath.startsWith('RickAndMorty/') ||
        internalPath.startsWith('BoBoBo/')) {
        bucket = 'comics';
    } else if (internalPath.startsWith('common/') || internalPath.startsWith('ui/')) {
        bucket = 'themes';
    } else if (internalPath.startsWith('fonts/')) {
        bucket = 'fonts';
    }

    if (bucket && SUPABASE_URL) {
        // Construct Public URL
        return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${internalPath}`;
    }

    return localPath;
}
