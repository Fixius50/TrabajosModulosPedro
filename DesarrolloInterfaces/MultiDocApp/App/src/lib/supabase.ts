
import { createClient } from '@supabase/supabase-js'

// Try to get env vars, fallback to empty string (will cause errors if used but safe for local only mode if handled)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null

export async function fetchDocuments() {
    if (!supabase) return []
    const { data, error } = await supabase.from('documents').select('*')
    if (error) throw error
    return data
}
