# Manifiesto del Proyecto: ServerMonitorApp

## 1. Visión y Estrategia
**ServerMonitorApp** es una aplicación de monitorización y gestión de infraestructura diseñada para controlar servidores remotos (nodos en contenedores) alojados en una Máquina Virtual Local (o VPS) desde un panel web centralizado en la nube.

-   **Objetivo Principal**: Proveer una interfaz moderna, reactiva y segura para la gestión de contenedores Docker remotos sin exponer puertos críticos.
-   **Infraestructura Base**: MV Local (Ubuntu Server 24.04 LTS) simulando entorno de producción.

## 2. Arquitectura Técnica

### Infraestructura Híbrida
-   **Nube Pública (Frontend)**: Vercel (Next.js App Router).
-   **Servidor Privado (Backend/Infra)**: MV Local (`192.168.2.154`).
-   **Conectividad Segura**: Cloudflare Tunnel (Zero Trust).
    -   *Justificación*: Permite exponer la MV local a Internet de forma segura (HTTPS) para que Vercel pueda conectarse, sin abrir puertos en el router.

### Stack Tecnológico
-   **Frontend**: Next.js, Tremor (Componentes de Dashboard), Tailwind CSS.
-   **Backend**: Supabase (Self-Hosting en Docker).
-   **Integraciones Extra**:
    -   **IP Geolocation API**: Para mostrar la ubicación física/ISP del servidor monitorizado (Feature extraída de fase de investigación).

## 3. Lógica del Sistema (Flujo de Operación)
1.  **Heartbeat (Detección)**: Verificación de conectividad con la URL del Túnel.
2.  **Inicialización**: Comando `start_all_buckets` vía RPC/Edge Function.
3.  **Monitorización**: Dashboard con estados en tiempo real (Supabase Realtime).
4.  **Geolocalización**: Visualización de datos del host mediante API externa.

## 4. Directorio de Trabajo
`DesarrolloInterfaces/ServerMonitorApp/`
-   `Docs/`: Documentación, logs y credenciales.
-   `supabase/`: Configuración del backend.
-   `frontend/`: Aplicación Next.js.
