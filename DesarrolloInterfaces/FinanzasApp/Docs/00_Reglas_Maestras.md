# 00. Reglas Maestras y Visión del Producto

## 1. Visión del Producto

**Gestión de Finanzas Personales** es una aplicación multiplataforma (Web y Android) centrada en la **soberanía de datos** y la **experiencia de usuario premium**. Permite a los usuarios controlar sus finanzas con un enfoque híbrido: funcionamiento offline robusto (Local First) y sincronización opcional en la nube.

## 2. Reglas de Negocio Inmutables

1. **Privacidad por Diseño**: Los datos sensibles (presupuestos, transacciones) pertenecen al usuario. El acceso está restringido por RLS (Row Level Security) en Supabase.
2. **Offline First**: La aplicación debe ser completamente funcional sin conexión a internet. La sincronización ocurre en segundo plano cuando se recupera la conexión.
3. **Experiencia Nativa**: Aunque construida con tecnologías web (React/Ionic), la interacción debe sentirse nativa en plataformas móviles (gestos, transiciones, feedback táctil).
4. **Integridad de Datos**: No se permiten estados inconsistentes. Las transacciones financieras deben ser atómicas y precisas.

## 3. Estándares de Código y Archivos

* **Rutas Relativas (STRICT)**: Siempre que sea técnicamente posible, se deben usar rutas relativas (`./`, `../`) en lugar de absolutas. Esto aplica a imports, links en documentación y comandos.
* **English Code / Spanish Docs**: Código en inglés, comentarios complejos y documentación en español.
* **Mobile-First**: La UI debe diseñarse primero para pantallas pequeñas.
* **Accesibilidad**: Soporte nativo para modo claro/oscuro y tamaños de fuente adaptables.

## 4. Principios de Diseño

* **Minimalismo Funcional**: Mostrar solo lo necesario en el momento adecuado.
* **Estética "Cosmic Financial"**: Uso de temas oscuros, gradientes sutiles y feedback visual rico (ver `02_Diseño_UI_UX.md`).

## 5. Actores del Sistema

* **Usuario Final**: Persona que registra gastos/ingresos y consulta reportes.
* **Sistema (App)**: Interfaz que gestiona la lógica local y caché.
* **Nube (Supabase)**: Fuente de la verdad persistente y almacenamiento de ficheros.
