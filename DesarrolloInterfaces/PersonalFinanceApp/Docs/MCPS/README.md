# Documentación de MCP Servers

## ¿Qué son los MCP Servers?

**Model Context Protocol (MCP)** es un estándar que conecta sistemas de IA con herramientas externas y fuentes de datos. Los MCP servers extienden las capacidades de Antigravity proporcionando acceso a funciones especializadas, información externa y servicios.

---

## 📋 MCP Servers Disponibles

### 1. **StitchMCP** - Generación de UI con IA

**Propósito**: Crear y editar interfaces de usuario mediante prompts de texto usando IA generativa.

**Capacidades**:

- Generación de pantallas desde descripciones de texto
- Edición de diseños existentes
- Creación de variantes de diseño
- Gestión de proyectos de UI

**Herramientas principales**:

- `create_project`: Crear nuevo proyecto de UI
- `generate_screen_from_text`: Generar pantalla desde prompt
- `edit_screens`: Editar pantallas existentes
- `generate_variants`: Crear variantes de diseño
- `list_projects`: Listar proyectos disponibles
- `get_screen`: Obtener detalles de una pantalla

**Casos de uso en este proyecto**:

- Prototipado rápido de nuevas pantallas
- Iteración de diseños de UI
- Generación de componentes visuales complejos

**Ejemplo de uso**:

```typescript
// Generar una nueva pantalla de login
mcp_StitchMCP_generate_screen_from_text({
  projectId: "123456",
  prompt: "Create a dark fantasy login screen with glassmorphism effects",
  deviceType: "DESKTOP"
})
```

---

### 2. **fetch** - Obtención de Contenido Web

**Propósito**: Recuperar contenido de URLs mediante HTTP.

**Capacidades**:

- Fetch de HTML convertido a Markdown
- Fetch de JSON
- Fetch de texto plano
- Headers personalizados

**Herramientas principales**:

- `fetch_html`: Obtener HTML como texto
- `fetch_markdown`: Obtener HTML convertido a Markdown
- `fetch_json`: Obtener datos JSON
- `fetch_txt`: Obtener texto plano

**Casos de uso en este proyecto**:

- Consultar documentación externa
- Obtener datos de APIs públicas
- Investigación de referencias de diseño

**Ejemplo de uso**:

```typescript
// Obtener documentación de una API
mcp_fetch_fetch_markdown({
  url: "https://api.example.com/docs",
  max_length: 5000
})
```

---

### 3. **filesystem** - Gestión de Archivos

**Propósito**: Operaciones de lectura/escritura en el sistema de archivos.

**Capacidades**:

- Lectura y escritura de archivos
- Creación de directorios
- Búsqueda de archivos
- Información de archivos
- Edición de archivos de texto

**Herramientas principales**:

- `read_text_file`: Leer archivos de texto
- `write_file`: Escribir archivos
- `edit_file`: Editar archivos existentes
- `list_directory`: Listar contenido de directorios
- `search_files`: Buscar archivos por patrón
- `create_directory`: Crear directorios
- `move_file`: Mover/renombrar archivos

**Casos de uso en este proyecto**:

- Gestión de archivos de configuración
- Lectura de datos iniciales (`initialData.json`)
- Organización de assets

**Ejemplo de uso**:

```typescript
// Leer archivo de configuración
mcp_filesystem_read_text_file({
  path: "/path/to/config.json"
})
```

---

### 4. **notebooklm** - Investigación con IA

**Propósito**: Interactuar con NotebookLM para investigación conversacional con RAG (Retrieval-Augmented Generation).

**Capacidades**:

- Gestión de biblioteca de notebooks
- Consultas conversacionales con contexto
- Sesiones de investigación persistentes
- Autenticación con Google

**Herramientas principales**:

- `add_notebook`: Añadir notebook a la biblioteca
- `list_notebooks`: Listar notebooks disponibles
- `ask_question`: Hacer preguntas con contexto
- `search_notebooks`: Buscar en la biblioteca
- `setup_auth`: Configurar autenticación

**Casos de uso en este proyecto**:

- Investigación de mejores prácticas
- Consulta de documentación técnica
- Análisis de patrones de diseño

**Ejemplo de uso**:

```typescript
// Consultar sobre React patterns
mcp_notebooklm_ask_question({
  question: "What are the best practices for state management in React?",
  notebook_id: "react-docs-123"
})
```

---

### 5. **postgres** - Base de Datos PostgreSQL

**Propósito**: Ejecutar consultas SQL en bases de datos PostgreSQL.

**Capacidades**:

- Consultas SQL de solo lectura
- Conexión a bases de datos PostgreSQL

**Herramientas principales**:

- `query`: Ejecutar consultas SQL

**Casos de uso en este proyecto**:

- Consultas a base de datos de Supabase
- Análisis de datos almacenados
- Verificación de esquemas

**Ejemplo de uso**:

```typescript
// Consultar usuarios
mcp_postgres_query({
  sql: "SELECT * FROM users WHERE active = true LIMIT 10"
})
```

---

### 6. **sequential-thinking** - Razonamiento Estructurado

**Propósito**: Resolver problemas complejos mediante pensamiento secuencial y reflexivo.

**Capacidades**:

- Desglose de problemas en pasos
- Revisión y corrección de razonamiento
- Generación de hipótesis
- Verificación de soluciones

**Herramientas principales**:

- `sequentialthinking`: Proceso de pensamiento paso a paso

**Casos de uso en este proyecto**:

- Debugging de problemas complejos
- Diseño de arquitectura
- Planificación de features

**Ejemplo de uso**:

```typescript
// Analizar un problema complejo
mcp_sequential-thinking_sequentialthinking({
  thought: "First, I need to understand the data flow...",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

---

### 7. **supabase-mcp-server** - Gestión de Supabase

**Propósito**: Gestión completa de proyectos Supabase (base de datos, autenticación, funciones edge).

**Capacidades**:

- Gestión de proyectos y branches
- Ejecución de SQL y migraciones
- Deploy de Edge Functions
- Gestión de schemas y tablas
- Búsqueda en documentación

**Herramientas principales**:

- `list_projects`: Listar proyectos Supabase
- `execute_sql`: Ejecutar SQL
- `apply_migration`: Aplicar migraciones
- `deploy_edge_function`: Desplegar funciones
- `list_tables`: Listar tablas
- `search_docs`: Buscar en documentación
- `get_advisors`: Obtener recomendaciones de seguridad/performance

**Casos de uso en este proyecto**:

- Gestión de base de datos
- Deploy de funciones serverless
- Configuración de autenticación
- Monitoreo de seguridad

**Ejemplo de uso**:

```typescript
// Aplicar migración de base de datos
mcp_supabase-mcp-server_apply_migration({
  project_id: "abc123",
  name: "add_user_profiles",
  query: "CREATE TABLE user_profiles (id UUID PRIMARY KEY, ...)"
})
```

---

## 🔧 Configuración de MCPs

Los MCP servers se configuran automáticamente en Antigravity. No se requiere configuración adicional para este proyecto.

### Variables de Entorno Necesarias

Algunos MCPs pueden requerir variables de entorno:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# NotebookLM (opcional)
# Se configura mediante autenticación interactiva
```

---

## 📊 Uso Recomendado por Fase

### Phase 1-11: Desarrollo Core

- **filesystem**: Gestión de código y assets
- **supabase-mcp-server**: Configuración de base de datos
- **StitchMCP**: Generación de componentes UI

### Phase 12: Testing

- **sequential-thinking**: Debugging de tests complejos
- **fetch**: Consultar documentación de testing

### Phase 13-14: Optimización y PWA

- **supabase-mcp-server**: Optimización de queries
- **fetch**: Investigación de mejores prácticas PWA

### Phase 15: Deployment

- **supabase-mcp-server**: Deploy de funciones y migraciones
- **notebooklm**: Consulta de guías de deployment

---

## 🚀 Mejores Prácticas

1. **Usar el MCP correcto para cada tarea**:
   - UI → StitchMCP
   - Datos → supabase-mcp-server
   - Investigación → notebooklm
   - Archivos → filesystem

2. **Combinar MCPs para workflows complejos**:
   - Investigar con `notebooklm` → Implementar con `filesystem` → Deploy con `supabase-mcp-server`

3. **Aprovechar la documentación integrada**:
   - `supabase-mcp-server_search_docs` para consultas rápidas
   - `fetch_markdown` para documentación externa

4. **Mantener sesiones organizadas**:
   - Usar `notebooklm` con sesiones para investigación contextual
   - Cerrar sesiones cuando ya no sean necesarias

---

## 📚 Referencias

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [NotebookLM](https://notebooklm.google/)
- [Stitch AI](https://stitch.ai/)

---

**Última actualización**: 2026-02-15 19:58 CET  
**Autor**: Roberto Monedero Alonso
