# Hoja de Ruta de Producto: Fase de Expansión

Este documento detalla las nuevas funcionalidades propuestas tras una investigación exhaustiva de APIs gratuitas y herramientas de datos abiertos.

## 🌟 Prioridad 1: Control de Gastos del Hogar (España)
Integración con datos abiertos del Gobierno de España para el ahorro doméstico.

### 🔌 Precio de la Luz en Tiempo Real (PVPC)
*   **Fuente**: [ESIOS (Red Eléctrica de España)](https://api.esios.ree.es).
*   **Funcionalidad**:
    *   Widget en Dashboard con el precio actual del kWh (hora a hora).
    *   "Semáforo de Ahorro": Indicador visual (Verde/Rojo) de si es buen momento para poner la lavadora/horno.
*   **Implementación Técnica**:
    *   Requiere Token personal (se solicita gratis a `consultasios@ree.es`).
    *   Endpoint: `/indicators/1001` (PVPC 2.0TD Península).

---

## 🚀 Prioridad 2: Automatización Bancaria (Open Banking)
La característica "Kill Feature" de las apps modernas.

### 🏦 Sincronización Bancaria (PSD2)
*   **Fuente**: [Nordigen (GoCardless)](https://nordigen.com/en/).
*   **Estado**: **Gratuito** para acceso a datos (Saldos y Transacciones) en España (BBVA, Santander, Caixa, etc).
*   **Funcionalidad**:
    *   Conectar cuenta bancaria real.
    *   Descargar automáticamente los últimos movimientos sin escribirlos a mano.
*   **Implementación Técnica**:
    *   Complejidad Alta. Requiere renovar tokens de acceso cada 90 días.
    *   Flujo OAuth2 estándar.

---

## 📸 Prioridad 3: Digitalización de Recibos
Reducir la fricción de entrada de datos.

### 🧾 Escaneo de Tickets (OCR)
*   **Fuente**: [TabScanner API](https://tabscanner.com/) o [Veryfi](https://www.veryfi.com/).
*   **Funcionalidad**:
    *   El usuario hace foto a un ticket.
    *   La API extrae: **Total**, **Fecha** y **Comercio**.
    *   Autocompleta el formulario de "Nuevo Gasto".
*   **Coste**: Capa gratuita generosa (ej. 20-50 escaneos/mes), luego pago.

---

## 🌍 Prioridad 4: Contexto Económico Global
Herramientas para usuarios viajeros o inversores.

### 💱 Conversor Multidivisa
*   **Fuente**: [ExchangeRate-API](https://www.exchangerate-api.com/).
*   **Funcionalidad**:
    *   Al viajar, introducir gasto en $ y que se guarde en € automáticamente con el cambio real del día.
*   **Implementación**: Muy sencilla (API JSON simple).

---

## 📰 Prioridad 5: Noticias de Impacto
Estilo "Bloomberg" personal.

### 🗞️ Feed Financiero
*   **Fuente**: [Marketaux](https://marketaux.com/) o [Finnhub](https://finnhub.io/).
*   **Funcionalidad**:
    *   Pestaña "Noticias" con titulares sobre economía, euríbor o cripto.
    *   Filtrado por "España" o "Global".

---

# 🎯 Recomendación de Implementación Inmediata

Dado que el usuario busca "investigar a fondo" y "añadir más cosas", sugiero comenzar por el **Valor Diferencial Local**:

1.  **Widget "Precio Luz España"**: Es técnicamente viable, gratuito y de altísima utilidad diaria.
2.  **Conversor de Divisas**: Fácil de añadir al formulario de Transacciones actual.

¿Por cuál quieres empezar?
