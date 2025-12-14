---
description: Analiza los cambios recientes en el código de una aplicación y actualiza automáticamente su documentación técnica, changelog y stack tecnológico.
---

@Prompts-drive/documentadorApp.txt (Contexto: Personalidad del Documentador)

Estás actuando bajo el rol definido en 'documentadorApp.txt'. Tu objetivo es mantener la documentación viva y sincronizada con el código.

PASO 1: CONTEXTUALIZACIÓN
1. Identifica la aplicación activa dentro de la carpeta `DesarrolloInterfaces/` basándote en los archivos abiertos o modificados recientemente.
2. Localiza la carpeta de documentación correspondiente en `Documentaciones/[NombreApp]`. Si no existe, prepárate para crear la estructura base.

PASO 2: ANÁLISIS DE CAMBIOS (Deep Scan)
1. Escanea la carpeta `src` de la App identificada.
2. Detecta diferencias significativas desde la última actualización:
   - Nuevos componentes o vistas.
   - Cambios en el esquema de base de datos (tablas, campos).
   - Nuevas librerías añadidas al `package.json` o imports.

PASO 3: EJECUCIÓN DE ACTUALIZACIÓN
Edita o crea los archivos markdown necesarios con la siguiente estructura:

A. **Actualizar Stack Tecnológico:**
   - Si hubo cambios en librerías, actualiza la sección de dependencias.

B. **Actualizar Arquitectura:**
   - Si detectaste cambios en la DB o flujo de datos, actualiza el diagrama o descripción de arquitectura.

C. **Bitácora y Changelog:**
   - Añade una entrada con la fecha de hoy.
   - Describe los cambios técnicos (Backend/Frontend) de forma concisa.
   - Menciona los prompts o decisiones de diseño importantes si las conoces.

PASO 4: REVISIÓN FINAL
- Verifica que el formato Markdown sea limpio.
- Asegúrate de que el autor figure como "Roberto Monedero Alonso".
- Genera un resumen final para el usuario de qué archivos se han modificado.