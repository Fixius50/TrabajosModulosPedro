# MultiDocApp - Documentación de Funcionalidades

## Visión General
MultiDocApp es una aplicación web moderna diseñada para la gestión, visualización y edición de documentos multimedia. Utiliza una arquitectura híbrida que permite el funcionamiento offline mediante IndexedDB y la sincronización opcional con la nube (Supabase).

## Características Principales

### 1. Gestión de Documentos
*   **Dashboard Interactivo**: Vista principal con tarjetas de documentos que muestran título, tipo y fecha relativa.
*   **CRUD Completo**: Capacidad para Crear (simulado), Leer, Actualizar y Borrar documentos.
*   **Persistencia Híbrida**:
    *   **Local (Prioritaria)**: Todos los cambios se guardan instantáneamente en el navegador usando IndexedDB.
    *   **Cloud (Opcional)**: Integración preparada con Supabase para sincronización remota si se configuran las credenciales.

### 2. Edición y Visualización Multiformato
La aplicación detecta automáticamente el tipo de archivo y carga el editor correspondiente:

*   **Editor de Código / Markdown (Monaco Editor)**
    *   Sintaxis resaltada para múltiples lenguajes.
    *   Edición en tiempo real.
    *   Números de línea y minimapa.
*   **Visor de PDF**
    *   Renderizado nativo de documentos PDF dentro de la app.
    *   Navegación por páginas.
*   **Visor Multimedia**
    *   Soporte para imágenes y videos (extensible).
    *   Visualización optimizada.

### 3. Motor de Transformación y Exportación
Herramienta potente para convertir y descargar documentos:

*   **Exportar a PDF**: Convierte el documento visible (código, imagen, etc.) en un archivo PDF descargable.
*   **Exportar a Imagen**: Captura el contenido del editor como una imagen PNG de alta resolución.
*   **Tecnología**: Utiliza `html2canvas` y `jspdf` para renderizado fiel en el cliente.

### 4. Interfaz de Usuario (UI/UX)
*   **Diseño Premium**: Estética moderna utilizando Tailwind CSS.
*   **Tema Oscuro/Claro**: Variables CSS preparadas para tematización.
*   **Componentes Interactivos**: Menús desplegables, animaciones suaves y feedback visual.
*   **Accesibilidad**: Uso de Radix UI para componentes accesibles por teclado y lector de pantalla.

## Tecnologías Clave
*   **Frontend**: React, TypeScript, Vite.
*   **Estilos**: Tailwind CSS, Lucide React (Iconos).
*   **Estado**: Zustand.
*   **Datos**: idb-keyval (Local), Supabase Client (Cloud).
*   **PDF/Export**: react-pdf, html2canvas, jspdf.
