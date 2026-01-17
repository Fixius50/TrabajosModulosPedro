# Propuesta de Nuevas Funcionalidades
Basado en la investigación de mejores prácticas para Apps de Finanzas Personales (Offline-First), se proponen las siguientes adiciones:

## 1. Presupuestos (Budgets)
Permitir establecer límites de gasto mensuales por categoría.
- **Valor:** Ayuda al usuario a no gastar de más.
- **Implica:** Nueva tabla `budgets`, UI para crear presupuesto y barras de progreso en Dashboard.

## 2. Transacciones Recurrentes (Suscripciones)
Gestionar gastos fijos (Netflix, Alquiler, Gimnasio) que se repiten automáticamente.
- **Valor:** Reduce la fricción de entrada de datos manual.
- **Implica:** Nueva tabla `recurring_transactions`, lógica en el arranque de la app para generar las transacciones pendientes.

## 3. Metas de Ahorro (Goals)
"Huchas" para objetivos específicos (Coche, Viaje, Fondo de Emergencia).
- **Valor:** Gamificación y motivación.
- **Implica:** Tabla `goals`, asignar parte del saldo a estas metas.

## 4. Analíticas Avanzadas
Gráficos más detallados.
- **Valor:** Mejor comprensión de hábitos.
- **Implica:** Gráfico de tarta (Gastos por Categoría) y Barras (Evolución mensual).

## 5. Autenticación Biométrica (Local)
Proteger el acceso a la app con Huella/FaceID (nativo).
- **Valor:** Seguridad y privacidad rápida.
- **Implica:** Plugin Capacitor Biometric.

# Recomendación Inmediata
Implementar **Analíticas Avanzadas (Gráfico de Sectores)** en el Dashboard actual, ya que es una mejora visual de alto impacto y bajo coste, y **Presupuestos** como siguiente gran funcionalidad.
