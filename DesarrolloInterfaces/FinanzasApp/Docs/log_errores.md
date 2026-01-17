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
