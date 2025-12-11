// Quick Supabase connection test
import { supabase, isSupabaseConfigured } from './src/lib/supabase.ts'

async function testConnection() {
    console.log('=== Supabase Connection Test ===\n')

    // Check if configured
    console.log('1. Checking configuration...')
    if (!isSupabaseConfigured()) {
        console.error('❌ Supabase NOT configured. Check .env.local file.')
        console.log('   Required variables:')
        console.log('   - VITE_SUPABASE_URL')
        console.log('   - VITE_SUPABASE_ANON_KEY')
        return
    }
    console.log('✅ Supabase client configured\n')

    // Test connection with a simple query
    console.log('2. Testing connection...')
    try {
        const { data, error } = await supabase!.from('documents').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('❌ Query error:', error.message)
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('\n⚠️  The table does not exist yet.')
                console.log('   Run the SQL from supabase_guide.md to create tables.')
            }
        } else {
            console.log('✅ Connection successful!')
            console.log('   Documents count:', data)
        }
    } catch (e) {
        console.error('❌ Connection failed:', e)
    }
}

testConnection()
