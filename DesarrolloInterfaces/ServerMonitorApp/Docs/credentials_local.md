# Credenciales del Backend (Local VM)

> [!NOTE]
> Estas credenciales provienen de la configuración de la VM Local (192.168.2.154).

## Conexión
- **IP Host**: `192.168.2.154`
- **API URL**: `http://192.168.2.154:54321`
- **DB URL (REST)**: `http://192.168.2.154:54321/rest/v1/`
- **Dashboard (Studio)**: `http://192.168.2.154:54323`
- **Postgres Connection**: `postgresql://postgres:postgres@192.168.2.154:54322/postgres`

## Claves de API (Supabase)
### Anon Key (Public)
`sb_publishable_ACJWlzQH1ZjBrEguHvfOxg_3BJgxAaH`

### Service Role Key (Secret)
`sb_secret_N7UNDOUgjKTVK-UodkmOHg_xSvEMPvz`

> [!WARNING]
> La `Service Role Key` tiene permisos de superadministrador. No exponer en el cliente (Frontend). Usar solo en Edge Functions o scripts de servidor.
