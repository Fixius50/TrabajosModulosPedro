/**
 * MultiDocApp Backend Server
 * 
 * Express.js API that acts as a proxy to Supabase and provides
 * sync endpoints for the frontend.
 */

require('dotenv').config({ path: '.env.local' })

const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true
}))
app.use(express.json({ limit: '50mb' }))

// Initialize Supabase client (server-side)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

const isCloudEnabled = !!supabase

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        cloud: isCloudEnabled,
        timestamp: new Date().toISOString()
    })
})

// ==================== DOCUMENTS ====================
app.get('/api/documents', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { folderId } = req.query
        let query = supabase.from('documents').select('*')

        if (folderId) {
            query = query.eq('folder_id', folderId)
        } else if (folderId === 'null') {
            query = query.is('folder_id', null)
        }

        const { data, error } = await query.order('order', { ascending: true })

        if (error) throw error
        res.json(data || [])
    } catch (error) {
        console.error('Error fetching documents:', error)
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/documents', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const doc = req.body
        const { data, error } = await supabase
            .from('documents')
            .insert([{
                id: doc.id,
                title: doc.title,
                type: doc.type,
                content: doc.content,
                url: doc.url,
                folder_id: doc.folderId,
                pinned: doc.pinned,
                order: doc.order,
                ext: doc.ext,
                size: doc.size,
                created_at: doc.createdAt
            }])
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        console.error('Error creating document:', error)
        res.status(500).json({ error: error.message })
    }
})

app.put('/api/documents/:id', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { id } = req.params
        const updates = req.body
        const { error } = await supabase
            .from('documents')
            .update({
                title: updates.title,
                content: updates.content,
                url: updates.url,
                folder_id: updates.folderId,
                pinned: updates.pinned,
                order: updates.order,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error
        res.json({ success: true })
    } catch (error) {
        console.error('Error updating document:', error)
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/documents/:id', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { id } = req.params
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting document:', error)
        res.status(500).json({ error: error.message })
    }
})

// ==================== FOLDERS ====================
app.get('/api/folders', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { parentId } = req.query
        let query = supabase.from('folders').select('*')

        if (parentId) {
            query = query.eq('parent_id', parentId)
        } else if (parentId === 'null') {
            query = query.is('parent_id', null)
        }

        const { data, error } = await query.order('order', { ascending: true })

        if (error) throw error
        res.json(data || [])
    } catch (error) {
        console.error('Error fetching folders:', error)
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/folders', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const folder = req.body
        const { data, error } = await supabase
            .from('folders')
            .insert([{
                id: folder.id,
                name: folder.name,
                parent_id: folder.parentId,
                pinned: folder.pinned,
                order: folder.order,
                created_at: folder.createdAt
            }])
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        console.error('Error creating folder:', error)
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/folders/:id', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { id } = req.params
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id)

        if (error) throw error
        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting folder:', error)
        res.status(500).json({ error: error.message })
    }
})

// ==================== SYNC ====================
app.post('/api/sync', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { documents, folders, lastSyncAt } = req.body
        const result = {
            uploaded: { documents: 0, folders: 0 },
            downloaded: { documents: 0, folders: 0 },
            errors: []
        }

        // Upload local changes to cloud
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                try {
                    const { error } = await supabase
                        .from('documents')
                        .upsert({
                            id: doc.id,
                            title: doc.title,
                            type: doc.type,
                            content: doc.content,
                            url: doc.url,
                            folder_id: doc.folderId,
                            pinned: doc.pinned,
                            order: doc.order,
                            ext: doc.ext,
                            size: doc.size,
                            created_at: doc.createdAt,
                            updated_at: new Date().toISOString()
                        })

                    if (error) throw error
                    result.uploaded.documents++
                } catch (e) {
                    result.errors.push(`Document ${doc.title}: ${e.message}`)
                }
            }
        }

        if (folders && folders.length > 0) {
            for (const folder of folders) {
                try {
                    const { error } = await supabase
                        .from('folders')
                        .upsert({
                            id: folder.id,
                            name: folder.name,
                            parent_id: folder.parentId,
                            pinned: folder.pinned,
                            order: folder.order,
                            created_at: folder.createdAt
                        })

                    if (error) throw error
                    result.uploaded.folders++
                } catch (e) {
                    result.errors.push(`Folder ${folder.name}: ${e.message}`)
                }
            }
        }

        // Download cloud changes
        const { data: cloudDocs } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false })

        const { data: cloudFolders } = await supabase
            .from('folders')
            .select('*')
            .order('order', { ascending: true })

        result.downloaded.documents = cloudDocs?.length || 0
        result.downloaded.folders = cloudFolders?.length || 0

        res.json({
            success: result.errors.length === 0,
            result,
            data: {
                documents: cloudDocs || [],
                folders: cloudFolders || []
            }
        })
    } catch (error) {
        console.error('Sync error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ==================== TRASH ====================
app.get('/api/trash', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { data, error } = await supabase
            .from('trash')
            .select('*')
            .order('deleted_at', { ascending: false })

        if (error) throw error
        res.json(data || [])
    } catch (error) {
        console.error('Error fetching trash:', error)
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/trash', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Cloud not configured' })
    }

    try {
        const { error } = await supabase
            .from('trash')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (error) throw error
        res.json({ success: true })
    } catch (error) {
        console.error('Error emptying trash:', error)
        res.status(500).json({ error: error.message })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║          MultiDocApp Backend Server           ║
╠═══════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}  ║
║  ☁️  Supabase: ${isCloudEnabled ? 'Connected' : 'Not configured'}                 ║
╚═══════════════════════════════════════════════╝
    `)
})
