# Plan de Monitoreo de KPIs para "La Perrada de William"

Este documento establece los indicadores clave de rendimiento (KPIs) para medir el éxito de la nueva plataforma de pedidos en sus primeros 30 días, cómo recolectar los datos y cuál es la próxima inversión recomendada.

---

## 1. KPIs de Éxito y Fórmulas

| Categoría | KPI (Indicador Clave) | Fórmula de Cálculo (basada en datos de Firestore) | Objetivo Inicial (Primeros 30 días) |
|---|---|---|---|
| **Éxito Operacional** | **1. Tiempo Promedio de Confirmación de Pago** | `AVG(confirmedAt - orderDate)` para pedidos con `paymentMethod: 'TRANSFERENCIA'` | `< 5 minutos` |
| | **2. Tiempo Promedio de Preparación en Cocina** | `AVG(readyAt - confirmedAt)` | `< 15 minutos` |
| | **3. Tiempo Total del Pedido (hasta despacho)** | `AVG(readyAt - orderDate)` | `< 20 minutos` |
| **Éxito de Adopción** | **4. Tasa de Adopción de la Plataforma** | `(Total de Pedidos en Plataforma / Total de Pedidos en todos los canales) * 100` | `> 50%` |
| | **5. Distribución de Métodos de Pago** | `% de pedidos con 'EFECTIVO' vs. 'TRANSFERENCIA'` | Entender la preferencia del cliente |

---

## 2. Plan de Recolección de Datos

La medición de estos KPIs es posible gracias a los `Timestamps` (sellos de tiempo) que se guardan en cada documento de pedido en Firestore.

**Campos Clave en la Colección `orders`:**

*   `orderDate`: Timestamp de cuándo el cliente finaliza el pedido. Se crea automáticamente.
*   `confirmedAt`: Timestamp de cuándo el admin presiona "Confirmar Pago". Se añade al actualizar el estado a `EN_PREPARACION`.
*   `readyAt`: Timestamp de cuándo el admin presiona "Marcar como Listo para Reparto". Se añade al actualizar el estado a `LISTO_REPARTO`.
*   `completedAt`: Timestamp de cuándo se completa el pedido. Se añade al actualizar el estado a `COMPLETADO`.

**Proceso de Cálculo:**

1.  **Exportar Datos:** Semanalmente, se pueden exportar los datos de la colección `orders` de Firestore a un formato como CSV o JSON.
2.  **Calcular Diferencias:** En una hoja de cálculo (Google Sheets, Excel) o con un script simple, se pueden calcular las diferencias en minutos o segundos entre los timestamps.
    *   Ejemplo en hoja de cálculo: `(celda_confirmedAt - celda_orderDate) * 1440` para obtener la diferencia en minutos.
3.  **Obtener Promedios:** Utilizar las funciones `PROMEDIO` (o `AVERAGE`) para calcular los KPIs operacionales.
4.  **Análisis Manual (Adopción):** El KPI de Tasa de Adopción requerirá un conteo manual de los pedidos que todavía llegan por WhatsApp para compararlos con los de la plataforma.

---

## 3. Sugerencia de Próxima Inversión (MVP 2.0)

**Módulo Sugerido: Gestión de Domiciliarios y Seguimiento Básico**

**Problema a Resolver:** Actualmente, el flujo termina cuando el pedido está "Listo para Reparto". No hay visibilidad sobre qué domiciliario tomó el pedido, cuándo salió o si ya fue entregado. Esto crea un nuevo "punto ciego" en la operación.

**Funcionalidad del MVP 2.0:**

1.  **Asignación de Domiciliario:** En la columna "Listo para Reparto", añadir un botón "Asignar Domiciliario".
    *   Esto abriría un modal simple donde el admin puede seleccionar de una lista predefinida de domiciliarios (Ej: "Rappi", "DiDi", "Domiciliario Propio 1").
2.  **Nuevo Estado: "En Camino":** Al asignar un domiciliario, el pedido pasaría a una nueva columna en el Kanban llamada **"En Camino"**.
    *   Esto actualiza el estado del pedido en Firestore a `EN_CAMINO`.
3.  **Notificación al Cliente (Opcional, pero de alto impacto):** Se podría enviar una notificación (email o SMS) al cliente diciendo "¡Tu pedido ya va en camino!".
4.  **Registro de Entrega:** El administrador marcaría el pedido como "Completado" una vez que el domiciliario confirme la entrega.

**Por qué es la mejor inversión:**

*   **Bajo Costo de Implementación:** No requiere hardware complejo (GPS) en su versión inicial. Es principalmente una mejora de la interfaz y la lógica de estados.
*   **Alto Impacto Operacional:** Proporciona trazabilidad completa del pedido, reduciendo la incertidumbre y las preguntas de "¿dónde está mi pedido?".
*   **Mejora la Experiencia del Cliente:** Aunque el cliente no vea un mapa en tiempo real, el saber que su pedido está "En Camino" aumenta la confianza y reduce la ansiedad.
