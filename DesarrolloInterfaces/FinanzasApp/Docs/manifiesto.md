# Visión General

Gestión de Finanzas Personales es una aplicación multiplataforma (Web y Android) diseñada para permitir a los usuarios llevar un control exhaustivo de sus ingresos y gastos. La aplicación se centra en la flexibilidad, permitiendo el almacenamiento local para funcionamiento offline y sincronización en la nube mediante Supabase para persistencia y acceso multidispositivo. Su diseño prioriza la experiencia móvil nativa.

# Estrategia Técnica

* **Frontend:** React con TypeScript + Vite.
* **UI Framework:** Ionic Framework (versión React) para componentes visuales adaptativos (Material Design/Cupertino) y gestión de navegación.
* **Mobile Runtime:** Capacitor para generar el APK nativo de Android y manejar plugins nativos.
* **Backend & Base de Datos:** Supabase (PostgreSQL) para CRUD en la nube, Autenticación y Storage.
* **Almacenamiento Local:** LocalStorage para configuraciones y IndexedDB (vía librería o wrapper) para caché de datos offline.
* **Internacionalización:** i18next para soporte multiidioma.
* **Http Client:** Fetch API o Axios Interceptors para conexión con APIs externas.

# Referencias de Usuario (Base de Investigación)

* **Prompt/Imagen de requisitos:**
  * **Multipantalla:** Navegación fluida entre vistas.
  * **Almacenamiento Híbrido:** Local (JSON/IndexedDB) + Nube (Supabase).
  * **Manejo de Ficheros:** Imágenes (tickets), PDFs (facturas).
  * **Multiplataforma:** Web y Android (APK).
  * **Multiusuario:** Auth segura integrada.
  * **CRUD Completo:** Crear, Leer, Editar, Borrar transacciones.
  * **Extras:** Conexión con APIs, Multiidioma.

# Sistema de Diseño (Design System)

* **Referencia Maestra:** [El Prisma del Patrimonio Híbrido](./design_system.md)
* **Estilo:** "Cosmic Financial" (Dashboard Gold/Cyan, Bóveda Purple, Ritual Red).
* **Framework:** TailwindCSS (Custom configuration).
* **Tipografía:** Manrope (UI), Newsreader (Display), JetBrains Mono (Datos).
* <s>**Base:** Ionic Design System (Adaptive). Se adapta automáticamente a Android (CSS Variables de Material Design) y iOS.</s> (Deprecated)
* **Tipografía:** Default del sistema (Roboto para Android, San Francisco para iOS) para máxima integración.
* **Paleta:**
  * Primary: Azul Financiero / Verde Éxito.
  * Danger: Rojo Gasto.
  * Background: Claro/Oscuro (Soporte Dark Mode automático).

# Hoja de Ruta (MVP)

1. **Project Scaffolding:** Inicializar proyecto con `npm create ionic-react-app` (o similar vite template) y configurar Capacitor.
2. **Supabase Setup:** Crear proyecto en Supabase (Schema SQL: Users, Transactions, Buckets) y conectar cliente.
3. **Auth Module:** Implementar Pantallas de Login/Registro y gestión de sesión (Persistencia local).
4. **Core UI & Layout:** Crear estructura de Tab Bar / Menú Lateral y pantallas principales (Dashboard, Movimientos, Ajustes).
5. **Local Data Layer:** Implementar servicios para guardar en IndexedDB y sincronizar con Supabase cuando haya red.
6. **CRUD Transacciones:** Formularios para añadir ingresos/gastos con adjuntos (imágenes).
7. **Storage & Files:** Implementar subida de ficheros a Supabase Storage y caché local.
8. **Settings & I18n:** Pantalla de configuración para cambio de idioma.
9. **Android Build:** Generar y firmar (debug) el APK.
