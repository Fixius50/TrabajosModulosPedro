# Manifiesto del Proyecto: ServerMonitorApp

## 1. Visión y Estrategia
**ServerMonitorApp** es una aplicación de monitorización y gestión de infraestructura diseñada para controlar servidores remotos (nodos en contenedores) alojados en una VPS Online desde un panel web centralizado en la nube.

-   **Objetivo Principal**: Proveer una interfaz moderna, reactiva y segura para la gestión de contenedores Docker remotos sin exponer puertos críticos.
-   **Infraestructura Base**: Oracle Cloud (Always Free) con Ubuntu Server 24.04 LTS (Arquitectura ARM, 24GB RAM).

## 2. Arquitectura Técnica

### Infraestructura Híbrida
-   **Nube Pública (Frontend)**: Vercel (Next.js App Router).
-   **Servidor Remoto (Backend/Infra)**: VPS Oracle Cloud.
-   **Conectividad**: DuckDNS (Dynamic DNS).
    -   *Justificación*: Acceso directo mediante nombre de dominio dinámico (requiere apertura de puertos o proxy inverso).

### Stack Tecnológico
-   **Frontend**: Next.js, Tremor (Componentes de Dashboard), Tailwind CSS.
-   **Backend**: Supabase (Gestión de base de datos, Auth, Realtime).
-   **Motor de Contenedores**: Docker & Docker Compose.
-   **Comunicación**: HTTP/REST (Control) + WebSockets (Supabase Realtime para estados).

## 3. Lógica del Sistema (Flujo de Operación)
1.  **Heartbeat (Detección)**: Verificación inicial de conectividad con la VM a través del Túnel.
2.  **Inicialización Global**: Comando maestro `start_all_buckets` para levantar la infraestructura Docker.
3.  **Control Granular**: Dashboard interactivo para Start/Stop y monitorización de contenedores individuales.
4.  **Feedback Visual**: Indicadores de estado en tiempo real (Online/Offline) mediante códigos de colores.

## 4. Directorio de Trabajo
`DesarrolloInterfaces/ServerMonitorApp/`
-   `Docs/`: Documentación y logs.
-   `supabase/`: Configuración de base de datos y Edge Functions.
-   `frontend/`: Aplicación Next.js.
