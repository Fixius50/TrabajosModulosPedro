# Guía Rápida de MCPs

## 🚀 Quick Start por MCP

### StitchMCP - Generación de UI

**Workflow típico**:

1. Crear proyecto:

```typescript
mcp_StitchMCP_create_project({ title: "Mi App UI" })
```

1. Generar pantalla:

```typescript
mcp_StitchMCP_generate_screen_from_text({
  projectId: "123",
  prompt: "Dark fantasy login screen with glassmorphism",
  deviceType: "DESKTOP"
})
```

1. Obtener resultado:

```typescript
mcp_StitchMCP_get_screen({
  name: "projects/123/screens/456",
  projectId: "123",
  screenId: "456"
})
```

---

### filesystem - Gestión de Archivos

**Operaciones comunes**:

```typescript
// Leer archivo
mcp_filesystem_read_text_file({ path: "/path/to/file.json" })

// Escribir archivo
mcp_filesystem_write_file({
  path: "/path/to/file.json",
  content: JSON.stringify(data, null, 2)
})

// Listar directorio
mcp_filesystem_list_directory({ path: "/path/to/dir" })

// Buscar archivos
mcp_filesystem_search_files({
  path: "/src",
  pattern: "**/*.tsx"
})
```

---

### supabase-mcp-server - Gestión de Supabase

**Setup inicial**:

```typescript
// 1. Listar proyectos
mcp_supabase-mcp-server_list_projects()

// 2. Ver tablas
mcp_supabase-mcp-server_list_tables({
  projectId: "abc123",
  schemas: ["public"]
})

// 3. Ejecutar SQL
mcp_supabase-mcp-server_execute_sql({
  project_id: "abc123",
  query: "SELECT * FROM users LIMIT 10"
})
```

**Migraciones**:

```typescript
mcp_supabase-mcp-server_apply_migration({
  project_id: "abc123",
  name: "create_user_profiles",
  query: `
    CREATE TABLE user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
})
```

**Edge Functions**:

```typescript
mcp_supabase-mcp-server_deploy_edge_function({
  project_id: "abc123",
  name: "hello-world",
  entrypoint_path: "index.ts",
  verify_jwt: true,
  files: [
    {
      name: "index.ts",
      content: `
        Deno.serve(async (req: Request) => {
          return new Response(JSON.stringify({ message: "Hello!" }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      `
    }
  ]
})
```

---

### notebooklm - Investigación

**Setup**:

```typescript
// 1. Autenticación (primera vez)
mcp_notebooklm_setup_auth()

// 2. Añadir notebook
mcp_notebooklm_add_notebook({
  url: "https://notebooklm.google.com/notebook/...",
  name: "React Best Practices",
  description: "Documentación de React patterns",
  topics: ["React", "Hooks", "State Management"]
})

// 3. Consultar
mcp_notebooklm_ask_question({
  question: "What are the best practices for useEffect?",
  notebook_id: "123"
})
```

---

### fetch - Obtención de Contenido

**Ejemplos**:

```typescript
// Obtener documentación como Markdown
mcp_fetch_fetch_markdown({
  url: "https://react.dev/reference/react/useState",
  max_length: 10000
})

// Obtener datos JSON
mcp_fetch_fetch_json({
  url: "https://api.github.com/repos/facebook/react"
})

// Con headers personalizados
mcp_fetch_fetch_json({
  url: "https://api.example.com/data",
  headers: {
    "Authorization": "Bearer token123"
  }
})
```

---

### postgres - Consultas SQL

**Uso básico**:

```typescript
// Consulta simple
mcp_postgres_query({
  sql: "SELECT * FROM users WHERE active = true"
})

// Con joins
mcp_postgres_query({
  sql: `
    SELECT u.*, p.display_name
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.created_at > NOW() - INTERVAL '7 days'
  `
})
```

---

### sequential-thinking - Razonamiento

**Proceso de pensamiento**:

```typescript
// Paso 1: Identificar el problema
mcp_sequential-thinking_sequentialthinking({
  thought: "The user wants to add authentication. First, I need to understand the current auth setup.",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

// Paso 2: Analizar opciones
mcp_sequential-thinking_sequentialthinking({
  thought: "We have two options: Supabase Auth or custom JWT. Supabase is already integrated.",
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

// ... continuar hasta llegar a una solución
```

---

## 🎯 Workflows Comunes

### Workflow 1: Crear Nueva Feature

1. **Investigar** (notebooklm):

```typescript
mcp_notebooklm_ask_question({
  question: "Best practices for implementing user profiles in React",
  notebook_id: "react-docs"
})
```

1. **Generar UI** (StitchMCP):

```typescript
mcp_StitchMCP_generate_screen_from_text({
  projectId: "123",
  prompt: "User profile screen with avatar, name, and stats"
})
```

1. **Crear Schema** (supabase-mcp-server):

```typescript
mcp_supabase-mcp-server_apply_migration({
  project_id: "abc",
  name: "add_user_profiles",
  query: "CREATE TABLE user_profiles (...)"
})
```

1. **Implementar** (filesystem):

```typescript
mcp_filesystem_write_file({
  path: "/src/features/profile/UserProfile.tsx",
  content: componentCode
})
```

---

### Workflow 2: Debugging

1. **Analizar problema** (sequential-thinking):

```typescript
mcp_sequential-thinking_sequentialthinking({
  thought: "User reports login not working. Let me trace the auth flow...",
  thoughtNumber: 1,
  totalThoughts: 10
})
```

1. **Revisar logs** (supabase-mcp-server):

```typescript
mcp_supabase-mcp-server_get_logs({
  project_id: "abc",
  service: "auth"
})
```

1. **Consultar código** (filesystem):

```typescript
mcp_filesystem_read_text_file({
  path: "/src/features/auth/LoginScreen.tsx"
})
```

1. **Buscar solución** (fetch):

```typescript
mcp_fetch_fetch_markdown({
  url: "https://supabase.com/docs/guides/auth/troubleshooting"
})
```

---

### Workflow 3: Deployment

1. **Verificar schema** (supabase-mcp-server):

```typescript
mcp_supabase-mcp-server_list_tables({
  projectId: "abc",
  schemas: ["public"]
})
```

1. **Deploy functions** (supabase-mcp-server):

```typescript
mcp_supabase-mcp-server_deploy_edge_function({
  project_id: "abc",
  name: "api-handler",
  files: [...]
})
```

1. **Verificar advisors** (supabase-mcp-server):

```typescript
mcp_supabase-mcp-server_get_advisors({
  project_id: "abc",
  type: "security"
})
```

---

## 💡 Tips y Trucos

### Combinar MCPs

```typescript
// 1. Investigar con notebooklm
const research = await mcp_notebooklm_ask_question({
  question: "How to implement real-time subscriptions?"
})

// 2. Buscar ejemplos con fetch
const examples = await mcp_fetch_fetch_markdown({
  url: "https://supabase.com/docs/guides/realtime"
})

// 3. Implementar con filesystem
await mcp_filesystem_write_file({
  path: "/src/services/realtimeService.ts",
  content: implementationCode
})
```

### Usar Búsqueda de Documentación

```typescript
// Buscar en docs de Supabase
mcp_supabase-mcp-server_search_docs({
  graphql_query: `
    query {
      searchDocs(query: "row level security", limit: 5) {
        nodes {
          title
          href
          content
        }
      }
    }
  `
})
```

### Gestión de Sesiones en NotebookLM

```typescript
// Listar sesiones activas
mcp_notebooklm_list_sessions()

// Continuar sesión existente
mcp_notebooklm_ask_question({
  question: "Can you elaborate on that?",
  session_id: "session-123"
})

// Cerrar sesión cuando termine
mcp_notebooklm_close_session({
  session_id: "session-123"
})
```

---

## ⚠️ Limitaciones y Consideraciones

### StitchMCP

- Requiere conexión a internet
- Generación puede tardar minutos
- No reintentar si falla

### notebooklm

- Límite de 50 consultas/día (cuenta gratuita)
- Requiere autenticación con Google
- Usar `re_auth` para cambiar de cuenta

### supabase-mcp-server

- Operaciones de migración son irreversibles
- Siempre usar branches para testing
- Verificar advisors antes de deployment

### filesystem

- Solo funciona en directorios permitidos
- No puede editar archivos binarios
- Usar paths absolutos

---

**Última actualización**: 2026-02-15 19:58 CET  
**Autor**: Roberto Monedero Alonso
