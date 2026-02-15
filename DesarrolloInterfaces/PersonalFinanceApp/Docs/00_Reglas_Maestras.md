# 00. Reglas Maestras del Proyecto

## Vision

Crear una aplicación de gestión de finanzas personales "muy completa", con enfoque primario en mobile (Mobile First), capacidades offline-first y sincronización en la nube. La estética debe ser premium y la arquitectura robusta.

## Requisitos Inviolables (User Constraints)

1. **Mobile First**: Diseño y usabilidad priorizando dispositivos móviles.
2. **Multipantalla/Multiplataforma**: Diseño responsivo y adaptable a diferentes resoluciones (Desktop, Tablet, Mobile).
3. **Offline First & Local Storage**:
    - La app debe funcionar sin conexión.
    - Persistencia local mediante `IndexedDB` y archivos `JSON` locales.
4. **Backend & Sync**:
    - **Supabase**: Base de datos principal (PostgreSQL), Autenticación y Storage.
    - CRUD completo (Crear, Leer, Actualizar, Borrar) sincronizado.
5. **Manejo de Archivos**: Soporte para adjuntar imágenes, PDFs, audios a las transacciones/entidades.
6. **Multiusuario**: Autenticación segura y segregación de datos por usuario (RLS en Supabase).
7. **Internacionalización (i18n)**: Soporte multiidioma desde el inicio.
8. **Conectividad**: Preparada para conectar con APIs externas (ej. bancos, cotizaciones).
9. **Estrategia Stitch-First UI**: Para nuevas pantallas o componentes visuales complejos, SIEMPRE generar primero el diseño/código base usando Stitch (`GrimorioFinanciero`) y luego integrar en la app.

## Estándares de Calidad

- **Código**: Clean Code, SOLID, Tipado estricto (TypeScript).
- **UI/UX**: Estética "Rich Aesthetics" (Glassmorphism, animaciones fluidas, modo oscuro cuidado). NO usar TailwindCSS (según reglas globales), usar CSS moderno (Variables, Flexbox/Grid).
- **Performance**: Carga rápida, optimización de assets.

## Entregables

- Código fuente en repositorio.
- Documentación del proceso de resolución.
- PDF con enlaces a la app desplegada y repo.
