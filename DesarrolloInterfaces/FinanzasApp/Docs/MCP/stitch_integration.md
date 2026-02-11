# Integración con Google Stitch (MCP)

Esta guía detalla cómo conectar el servidor MCP de Google Stitch para habilitar el flujo de diseño asistido por IA.

## Requisitos Previos

1. **Cuenta de Google Cloud Platform (GCP)** activa.
2. **Proyecto en GCP** creado específicamente para esta integración (o usar uno existente).

## Pasos de Configuración

### 1. Habilitar la API de Stitch

1. Ve a la consola de Google Cloud: [console.cloud.google.com](https://console.cloud.google.com).
2. Selecciona tu proyecto.
3. Busca "Stitch API" en la barra de búsqueda y habilítala.

### 2. Crear Credenciales (OAuth 2.0)

1. Ve a "APIs & Services" > "Credentials".
2. Haz clic en "Create Credentials" > "OAuth client ID".
3. Si es la primera vez, configura la "Consent Screen" (User Type: External/Internal).
4. Tipo de aplicación: **Desktop App**.
5. Descarga el archivo JSON de credenciales y guárdalo en un lugar seguro (NO en el repo público).

### 3. Configuración del Servidor MCP

Añade la configuración al archivo `mcp_config.json` (o similar en tu editor):

```json
{
  "mcpServers": {
    "googlestitch": {
      "command": "npx",
      "args": [
        "-y",
        "@google/stitch-mcp-server"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:\\Users\\rober\\Desktop\\TrabajosModulosPedro\\DesarrolloInterfaces\\FinanzasApp\\Docs\\MCP\\client_secret_78855860233-idm18drortajh2aj4hle1ole68kiue9n.apps.googleusercontent.com.json"
      }
    }
  }
}
```

> **Nota**: Asegúrate de reemplazar `/path/to/your/credentials.json` con la ruta real absoluta a tu archivo de credenciales.

## Verificación

Una vez configurado, reinicia el servidor MCP o el editor. Deberías ver las herramientas de stitch disponibles (`get_stitch_screen`, etc).
