# Instrucciones de Inicialización de Base de Datos

## Paso 1: Ejecutar el SQL en el Dashboard (Obligatorio)

❌ **Importante**: Tener el archivo `schema.sql` en la carpeta del proyecto **NO** crea las tablas automáticamente en la base de datos.
✅ **Solución**: Debes "inyectarlas" manualmente siguiendo estos pasos:

1.  **Copiar SQL**: Abre el archivo `supabase/schema.sql` y copia todo su contenido.
2.  **Abrir Supabase Studio**:
    *   Desde tu navegador en Windows, ve a: [http://192.168.2.154:54323](http://192.168.2.154:54323)
3.  **Ejecutar Query**:
    *   Ve a la sección **SQL Editor** (menú lateral).
    *   Pega el código copiado.
    *   Haz clic en **RUN** (Ejecutar).

Esto creará las tablas `sm_containers`, `sm_metrics` y `sm_commands` necesarias para que el Agente y el Frontend funcionen.
