# Log de Errores

## 1. Initial Scaffolding
**Error:** `create-vite` target directory not empty (contained `Docs`).
**Solución:** Movido `Docs` temporalmente, ejecutado scaffolding, y restaurado `Docs`.

## 2. Dependency Conflict
**Error:** `No matching export ... for import "withRouter"` in `@ionic/react-router`.
**Causa:** `react-router-dom` v7 (instalado por defecto) no es compatible con `@ionic/react-router` actualmente.
**Solución:** Downgrade a `react-router-dom@6` (luego v5).

## 3. Auth Failures
**Error:** Registro falla ("password invalid" o "already registered") y Login falla ("invalid credentials").
**Causa probable:** Supabase requiere confirmación de email por defecto. El usuario se crea pero no puede loguearse sin verificar.
**Solución:** Mejorar feedback en UI para avisar de la verificación de email.

## 4. [CRITICAL] Infinite Loading Overlay (Ionic Portal Issue)
**Fecha:** 2026-01-21
**Síntoma:**
La aplicación mostraba un spinner "Cargando..." sobreimpreso en pantalla indefinidamente, incluso después de que el usuario se hubiera autenticado y el Dashboard fuera visible de fondo.
**Causa:**
El componente `<IonLoading />` de Ionic utiliza React Portals para renderizarse en el nodo raíz del DOM (`ion-app`). Si el estado `loading` cambia a `false` o el componente padre (`App.tsx`) se desmonta/actualiza demasiado rápido durante la transición de autenticación, el portal no recibe la señal de desmontaje correctamente debido a una condición de carrera, dejando el overlay "huérfano" bloqueando la UI.
**Solución:**
Se reemplazó la dependencia de `IonLoading` por un spinner HTML/CSS nativo renderizado condicionalmente dentro del mismo árbol de componentes.
```tsx
// Antes (Problemático)
<IonLoading isOpen={true} />

// Ahora (Solución Robusta)
<div className="simple-spinner" /> // CSS puro
```
Esto garantiza que si el componente padre deja de renderizarse, el spinner desaparece obligatoriamente con él.

## 5. [UI] Dashboard Layout Collapse (Blank Screen)
**Fecha:** 2026-01-21
**Síntoma:**
El Dashboard aparecía completamente vacío (fondo negro/blanco sin contenido) o solo se veían los bordes de debug colapsados en la parte superior.
**Causa:**
El componente `MainTabs` usaba `height: 100%`. Al estar anidado dentro de rutas de `App.tsx` que no garantizaban una altura explícita en toda la cadena de contenedores, el cálculo de altura colapsaba a 0px.
**Solución:**
Se cambiaron las unidades relativas al padre (`%`) por unidades relativas al viewport (`vh/vw`) para forzar la ocupación total de la pantalla independientemente del contenedor padre.
```tsx
// Antes
<IonPage style={{ height: '100%' }}>
// Ahora
<IonPage style={{ height: '100vh', width: '100vw', position: 'absolute' }}>
```
---
