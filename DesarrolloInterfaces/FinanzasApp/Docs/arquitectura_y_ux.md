# Documentación Técnica: Arquitectura, Tecnologías y UX

Este documento detalla el stack tecnológico, la arquitectura del software y las decisiones de diseño de la aplicación **FinanzasApp**.

## 1. Stack Tecnológico

### Core & Framework
*   **React (v18.2)**: Librería principal para la construcción de interfaces de usuario.
*   **TypeScript**: Lenguaje base para asegurar tipado estático y reducir errores en tiempo de ejecución.
*   **Ionic React (v8.2)**: Framework de UI móvil que proporciona componentes nativos adaptables (iOS/Android).
    *   `@ionic/react`: Componentes visuales.
    *   `@ionic/react-router`: Gestión de navegación basada en React Router.
*   **Vite**: Bundler y entorno de desarrollo de alto rendimiento.

### Gestión de Datos & Backend
*   **Supabase (BaaS)**: Backend-as-a-Service utilizado para:
    *   **Base de Datos**: PostgreSQL para almacenamiento relacional.
    *   **Autenticación**: Gestión de usuarios (`@supabase/supabase-js`).
    *   **Storage**: Almacenamiento de imágenes (recibos/facturas).
*   **Axios**: (Opcional/Si se usa) Cliente HTTP para peticiones externas.

### Herramientas & Utilidades
*   **i18next**: Sistema de internacionalización para soporte Multi-idioma (ES/EN).
*   **Chart.js & React-Chartjs-2**: Renderizado de gráficos de datos (Sectores/Barras).
*   **jsPDF & jspdf-autotable**: Generación de reportes PDF en el cliente.
*   **React Hook Form** (Si aplica): Gestión de formularios.
*   **ESLint**: Linter para asegurar calidad de código.

---

## 2. Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **Componentes y Servicios**, separando la lógica de negocio de la interfaz.

### Estructura de Directorios (`/src`)
*   **`/components`**: Componentes UI reutilizables y "tontos" (sin lógica de negocio compleja).
    *   Ej: `BudgetModal`, `TransactionModal`, `MainTabs`.
*   **`/pages`**: Vistas principales de la aplicación (Screens). Son los contenedores que gestionan el estado y llaman a los servicios.
    *   Ej: `Dashboard`, `Transactions`, `Budgets`.
*   **`/services`**: Capa de comunicación con el Backend (Supabase). Aquí reside toda la lógica de datos.
    *   `authService.ts`: Login, Registro, Logout.
    *   `transactionService.ts`: CRUD de movimientos.
    *   `budgetService.ts`: Lógica de presupuestos.
    *   `exportService.ts`: Lógica de generación de PDF/JSON.
*   **`/theme`**: Definiciones globales de estilos y variables CSS (Modo Oscuro).
*   **`/i18n`**: Configuración de idiomas y archivos JSON de traducción (`es.json`, `en.json`).
*   **`/types`** (o interfaces en archivos): Definiciones de tipos TypeScript compartidos (`Budget`, `Transaction`).

### Patrones de Diseño
1.  **Service Repository Pattern (Simplificado)**:
    *   Los componentes visuales (`Pages`) **nunca** llaman a la API o DB directamente.
    *   Siempre importan una función de un **Service** (ej: `getTransactions()`).
    *   Esto permite cambiar el backend en el futuro sin tocar la UI.
2.  **Estado Local vs Global**:
    *   Se prioriza el estado local (`useState`) para datos de vista.
    *   Se utiliza `useEffect` / `useIonViewWillEnter` para la sincronización de datos al entrar en pantalla.
    *   *Nota: No es necesario Redux/Context complejo por el momento dada la simplicidad del flujo.*

---

## 3. Funcionalidades de UX/UI (Interfaz y Experiencia)

La aplicación está construida sobre **Ionic Framework** con **React**, ofreciendo una experiencia nativa y fluida.

### 🎨 Diseño y Personalización
*   **Modo Oscuro (Dark Mode)**: Implementación completa de temas claro/oscuro. La preferencia del usuario se guarda y persiste entre sesiones.
*   **Internacionalización (i18n)**: Soporte multi-idioma (Español e Inglés). Todos los textos, fechas y monedas se adaptan al idioma seleccionado.
*   **Diseño Responsivo**: Interfaz adaptable que funciona correctamente en dispositivos móviles (iOS/Android) y navegadores de escritorio.

### 📊 Visualización e Interacción
*   **Dashboard Dinámico**:
    *   **Gráficos**: Uso de `Chart.js` para visualizar la distribución de gastos por categoría (Gráfico de sectores).
    *   **Widgets**: Tarjetas informativas con datos en tiempo real (ej. Precio Bitcoin).
*   **Gestión de Presupuestos**:
    *   Barras de progreso visuales (`IonProgressBar`) que cambian de color (Verde/Naranja/Rojo) según el porcentaje gastado.
*   **Navegación Intuitiva**:
    *   Barra de pestañas inferior (`IonTabBar`) para acceso rápido a las secciones principales.
    *   **Modales**: Los formularios de creación/edición (Movimientos, Presupuestos, Configuración) se abren en ventanas modales para no perder el contexto de la navegación.
*   **Feedback al Usuario**:
    *   **Toasts**: Mensajes emergentes no intrusivos para notificar errores o confirmaciones de guardado.
    *   **Pull-to-Refresh**: Gesto de deslizar hacia abajo para actualizar datos manualmente.
    *   **Loaders**: Indicadores de carga durante operaciones asíncronas.

---

## 2. Arquitectura y Gestión de Datos

La aplicación sigue un modelo **Cloud-First** con persistencia local para configuraciones.

### ☁️ Base de Datos en la Nube (Supabase)
Supabase (PostgreSQL) actúa como el backend principal. Todos los datos sensibles y críticos se almacenan aquí.

| Entidad / Recurso | Descripción | Tipo de Almacenamiento |
| :--- | :--- | :--- |
| **Usuarios** | Gestión de identidad, emails y contraseñas. Gestionado por `Supabase Auth`. | **Nube (Auth)** |
| **Movimientos** (`transactions`) | Guarda cada ingreso o gasto: cantidad, fecha, descripción, categoría, tipo. | **Nube (Postgres DB)** |
| **Presupuestos** (`budgets`) | Guarda los límites definidos por el usuario por categoría. | **Nube (Postgres DB)** |
| **Imágenes** | Fotos de recibos o facturas adjuntos a movimientos. | **Nube (Supabase Storage)** |

> **Seguridad (RLS)**: Se utilizan políticas *Row Level Security*. Aunque la base de datos es única, cada usuario tiene acceso estricto **solo a sus propios datos**. Un usuario no puede leer ni modificar presupuestos o movimientos de otro.

### 🏠 Almacenamiento Local (Dispositivo)
Se utiliza para preferencias de usuario que no requieren sincronización crítica o seguridad alta.

| Dato | Key | Descripción |
| :--- | :--- | :--- |
| **Preferencia de Tema** | `darkMode` | (`true`/`false`) Guarda si el usuario prefiere la app en negro o blanco. |
| **Idioma** | `i18nextLng` | (`es` / `en`) Guarda el último idioma seleccionado. |

### 🌐 Datos Externos (APIs)
Datos que se consumen en tiempo real y no se almacenan en nuestra base de datos.

*   **CoinGecko API**: Se consulta cada vez que se carga el Dashboard para obtener el precio actual del Bitcoin en Euros.

---

## 3. Resumen de Flujo de Datos

1.  **Inicio**: La App carga preferencias (Tema/Idioma) de `LocalStorage`.
2.  **Login**: Se autentica contra **Supabase Auth**. Se recibe un token seguro.
3.  **Uso**:
    *   Al crear un Gasto -> Se envía a `transactions` en Supabase.
    *   Si tiene foto -> Se sube primero al `Storage`, se obtiene la URL y se guarda en la transacción.
    *   Al ver el Dashboard -> Se descargan datos de `transactions` y `budgets` para calcular totales y gráficas en el cliente.
4.  **Cierre**: Al cerrar sesión, se limpia el token de acceso, pero las preferencias (tema/idioma) se mantienen.
