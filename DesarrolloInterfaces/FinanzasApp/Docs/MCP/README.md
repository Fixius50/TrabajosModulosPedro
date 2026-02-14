# Stack MCP Oficial - FinanzasApp Dungeon Edition

## 🛠️ Configuración Activa (Estable)

Este documento detalla los servidores MCP oficiales y funcionales para el desarrollo del proyecto. Copia este JSON en tu configuración global si necesitas restaurar el entorno.

### 📋 JSON de Configuración (`mcp_config.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_TOKEN"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@host:5432/db"],
      "description": "Gestión directa de la base de datos y esquemas."
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Path/To/Project"],
      "description": "Acceso seguro a lectura/escritura de archivos."
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "mcp-fetch-server"],
      "description": "Capacidad de navegación web y peticiones API para el Agente."
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "description": "Módulo de razonamiento avanzado para resolución de problemas complejos."
    }
  }
}
```

---

## 🚫 Servidores Descartados/Alternativos

* **Yahoo Finance MCP**: *Eliminado*. La implementación actual es inestable en entornos Windows (`EOF error`).
  * **Solución**: El proyecto utiliza **Frankfurter API** directamente vía `fetch` estándar en el frontend y **Mocks** robustos para simulaciones de mercado, eliminando la dependencia de un servidor intermedio.

* **Google Maps**: *Desactivado*. Requiere API Key de pago. Se utilizan mapas estáticos o placeholders estilizados en la UI.

---

## 💡 Flujo de Trabajo con MCPs

1. **Base de Datos**: Usa el servidor `postgres` para inspeccionar tablas: `DESCRIBE transactions;`
2. **Investigación**: Usa `fetch` para leer documentación oficial actualizada.
3. **Código**: `filesystem` permite la edición segura del código fuente.
4. **Planificación**: `sequential-thinking` ayuda a desglosar tareas grandes (Fase 3, Fase 4).
