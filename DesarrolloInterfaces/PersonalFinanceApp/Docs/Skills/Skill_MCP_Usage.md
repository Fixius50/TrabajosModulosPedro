# Skill: Uso de Herramientas MCP (Model Context Protocol)

## Descripción

Protocolo para extender las capacidades del Agente mediante servidores MCP. Define cómo y cuándo usar herramientas externas.

## 1. Principios de Uso

- **Aumentación, no Remplazo**: Usar MCPs para tareas que el Agente no puede hacer nativamente (ej. ejecutar SQL, acceder a Filesystem, navegar web).
- **Seguridad Primero**: Jamás enviar credenciales o secretos (API Keys) a servidores MCP desconocidos o de terceros no verificados.
- **Eficiencia**: Preferir herramientas específicas (`postgres_query`) sobre genéricas (`run_command` para `psql`) para mejor manejo de errores.

## 2. Catálogo de Servidores Aprobados

### Sistema de Archivos (`filesystem`)

- **Uso**: Lectura/Escritura de código y docs.
- **Regla**: Siempre usar rutas absolutas.
- **Prohibido**: Borrar directorios enteros sin backup previo o confirmación explícita.

### Base de Datos (`supabase-mcp-server` / `postgres`)

- **Uso**: Inspección de esquema, migraciones y queries complejos.
- **Flujo**:
    1. `list_tables` para entender el esquema.
    2. `describe_table` (o query de info) para ver columnas.
    3. `execute_sql` para consultas de lectura.
    4. **Precaución**: Las mutaciones (INSERT/UPDATE) deben probarse primero en entorno local/dev.

### Navegación Web (`fetch` / `browser`)

- **Uso**: Investigación de documentación (ver `Skill_API_Research`).
- **Regla**: No navegar a sitios que requieran login con credenciales del usuario, a menos que sea estrictamente necesario y seguro.

## 3. Protocolo de Error

Si una herramienta MCP falla:

1. **Leer el Error**: No reintentar ciegamente.
2. **Diagnosticar**: ¿Es un error de sintaxis? ¿De conexión? ¿De permisos?
3. **Alternativa**: Si `read_file` falla, probar `list_dir` para verificar la ruta. Si `execute_sql` falla, revisar el esquema primero.
