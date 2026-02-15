# **Especificación de Funcionalidades: Ecosistema de Gestión Patrimonial 2025**

Este documento define las capacidades técnicas de la plataforma de finanzas personales (PFM). La arquitectura se basa en un modelo **Hybrid Cloud/Local-First** utilizando **Supabase**, **SQLite** y una interfaz inmersiva de **Fantasía Épica**.

## **1\. Arquitectura de Datos Híbrida**

*La app garantiza la persistencia mediante una sincronización mística entre el reino local y la nube.*

### A. Archivo Infinito (Supabase Cloud \- Registros y Backups)

* **PostgreSQL (Bitácora Maestra):** Base de datos en la nube dedicada al almacenamiento de **registros de actividad (logs)**, auditorías de seguridad y metadatos globales del sistema.  
* **Buckets de Almacenamiento (Bóvedas de Respaldo):**  
  * `backups-master`: Almacena copias de seguridad automáticas y manuales del estado de la aplicación.  
  * `vault-receipts`: Almacena imágenes de alta resolución de tickets y facturas (Pergaminos de Gasto).  
  * `legal-scrolls`: Almacena estados de cuenta en PDF y documentos fiscales cifrados.  
* **Edge Functions (Hechizos de Servidor):** Funciones Serverless para procesar la lógica de respaldo, validación de integridad de datos en la nube y ejecución del Oráculo de IA.

  ### B. Crónicas de Piedra (Persistencia Local \- SQLite/JSON)

* **Motor SQLite (Gestión de Flujos):**  
  * **Transferencias:** Almacenamiento local dedicado a la gestión de movimientos de fondos entre cuentas y validación de transacciones pendientes.  
  * **Migraciones de Datos:** Módulo interno para gestionar la importación/exportación de datos desde otros reinos (entidades bancarias o apps antiguas) sin depender de la red.  
  * **Cifrado AES-256:** Protección total del libro de cuentas local.  
* **Pergaminos de Identidad (JSON \- Usuarios y Cuentas):**  
  * **Gestión de Usuarios:** Archivos estructurados para el manejo rápido de perfiles, permisos y datos biográficos de los héroes.  
  * **Inventario de Cofres:** Gestión detallada de las cuentas vinculadas, balances actuales y configuraciones de acceso por usuario.  
  * **Carga Inmediata:** Optimización para una respuesta de la interfaz inferior a 100ms al cargar el perfil del usuario.

  ## **2\. Gestión Multisesión y Multicuenta**

*El Salón de los Héroes permite la convivencia de múltiples aventureros en un solo grimorio.*

* **Multisesión:** Cambio rápido de perfil (Switch Hero) con validación biométrica independiente para cada sesión activa.  
* **Agregación de Arcas (Multicuenta):**  
  * **Cuentas Bancarias:** Conexión vía Open Finance a bancos tradicionales y neobancos.  
  * **Cofres de Inversión:** Seguimiento de acciones, bonos y ETFs.  
  * **Bolsas de Cripto:** Integración con exchanges para ver saldos de activos digitales en tiempo real.  
* **Modo Gremio (Cuentas Compartidas):** Visualización de gastos comunes para parejas o grupos, manteniendo la privacidad de las bolsas individuales.

  ## **3\. Estética Visual y Componentes (Estética D\&D)**

*El diseño visual transforma datos fríos en una experiencia de exploración de mazmorras.*

* **Interfaz de "Grimorio Oscuro":** Fondos de cuero envejecido, bordes de hierro reforzado y animaciones de partículas mágicas al recibir oro.  
* **Componentes de Visualización:**  
  * **Ríos de Oro (Sankey Diagram):** Un gráfico dinámico que muestra el flujo del dinero desde los ingresos hasta los gastos y ahorros, visualizado como corrientes de agua dorada y roja.  
  * **Viales de Maná Financiero:** Barras de presupuesto circulares que parecen frascos de cristal. El líquido sube o baja y cambia de color (azul a naranja fuego) según el riesgo de sobregiro.  
  * **Radar de Tesoros (Spider Chart):** Gráfico de araña que compara tu salud financiera en 5 áreas: Ahorro, Inversión, Deuda, Gastos Fijos y Patrimonio Neto.

  ## **4\. Inteligencia Artificial y El Oráculo**

*IA predictiva integrada para guiar al héroe hacia la libertad financiera.*

* **El Oráculo Predictivo:** Proyección de flujo de caja a 3, 6 y 12 meses basada en el análisis histórico de SQLite.  
* **Análisis de Sentimiento de Gasto:** La IA analiza si tus gastos te generan "Felicidad" o "Remordimiento" basándose en tus notas manuales, ayudando a reconocer gastos emocionales.  
* **Detección de Maleficios (Fraudes):** Identificación de patrones atípicos y alertas inmediatas ante posibles ataques de "mímicos" (cargos no autorizados).

  ## **5\. Gamificación y Progresión de Salud**

*Mecánicas de rol para incentivar la disciplina financiera.*

* **Niveles de XP Financiero:** Gana experiencia al registrar gastos a tiempo, cumplir presupuestos y alcanzar metas de ahorro.  
* **Clases de Héroe:**  
  * **El Guardián:** Especialista en fondos de emergencia y seguros.  
  * **El Alquimista:** Especialista en inversiones de alto rendimiento y diversificación.  
* **Misiones de Campaña (Savings Goals):** Establece misiones como "Cofre para Casa Nueva". Al depositar, se visualiza una animación de monedas llenando un cofre físico.

  ## **6\. Seguridad y Cumplimiento**

*Defensas impenetrables protegidas por sellos de seguridad.*

* **Sello Biométrico Rúnico:** Integración de FaceID/TouchID en una runa animada que "desbloquea" el grimorio.  
* **Row Level Security (RLS):** Implementación estricta en Supabase para que ningún usuario pueda acceder a los datos de otro, ni siquiera accidentalmente.  
* **Capa de Invisibilidad:** Un interruptor rápido en la UI que reemplaza todos los montos reales por asteriscos o nombres de gemas preciosas ficticias para uso en público.

  ## **7\. Niveles de Acceso y Monetización**

* **Rango Escudero (Gratis):** Almacenamiento local en SQLite/JSON, registro manual y 1 cuenta bancaria.  
* **Rango Caballero (Pro):** Sincronización completa con Supabase (Backups y registros en la nube), Buckets ilimitados, multisesión y Oráculo de IA.  
* **Rango Señor del Tesoro (Gremio):** Todo lo anterior más gestión multicuenta para 5 usuarios, reportes avanzados de grupo y soporte prioritario.