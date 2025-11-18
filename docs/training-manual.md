# Manual de Capacitación y Pruebas para "Perrada Segura"

Este documento contiene los escenarios de prueba críticos, el manual de uso para el panel de administración y la lista de verificación para el lanzamiento de la nueva plataforma de pedidos de "La Perrada de William".

---

## 1. Escenarios de Prueba Críticos (Go/No-Go)

Antes del lanzamiento, se deben completar exitosamente los siguientes 5 escenarios para validar que el sistema está listo.

| # | Escenario | Pasos a Seguir | Resultado Esperado |
|---|---|---|---|
| **1** | **Pedido con Pago en Efectivo** | 1. Cliente añade productos al carrito. <br> 2. Procede al checkout y completa sus datos. <br> 3. Elige "Efectivo" y finaliza el pedido. | 1. El pedido aparece en la columna **"Nuevos Pedidos"** del panel admin. <br> 2. El cliente es redirigido a la página de confirmación con el mensaje para pago en efectivo. |
| **2** | **Pedido con Pago por Transferencia** | 1. Cliente añade productos. <br> 2. Procede al checkout. <br> 3. Elige "Transferencia" y finaliza. <br> 4. Envía el comprobante por WhatsApp. | 1. El pedido aparece en **"Nuevos Pedidos"**. <br> 2. El cliente ve la página de confirmación con los datos de Bancolombia/Nequi. <br> 3. El admin recibe el comprobante por WhatsApp. |
| **3** | **Admin Confirma Pago (CRÍTICO)** | 1. Admin ve el nuevo pedido en el panel. <br> 2. Verifica el comprobante de pago recibido por WhatsApp. <br> 3. Presiona el botón **"Confirmar Pago / Enviar a Cocina"**. | 1. La tarjeta del pedido se mueve automáticamente de "Nuevos Pedidos" a **"En Preparación"** en tiempo real. |
| **4** | **Admin Avanza el Pedido** | 1. Admin toma un pedido de "En Preparación". <br> 2. Presiona "Marcar como Listo para Reparto". <br> 3. Presiona "Marcar como Completado". | 1. La tarjeta del pedido avanza correctamente por las columnas **"En Preparación" -> "Listo para Reparto" -> "Completado"**. |
| **5** | **Impresión de Comanda** | 1. Admin hace clic en un pedido en cualquier columna. <br> 2. Presiona el botón **"Imprimir Ticket"**. | 1. Se muestra una alerta o se imprime en la consola un texto formateado con los detalles del pedido para la cocina (Ej: "2x Perro Especial, 1x Coca-Cola"). |

---

## 2. Esqueleto del Manual de Capacitación del Administrador

### Sección 1: Cómo Acceder al Panel
- URL de acceso: `[URL_DEL_SITIO]/login`
- Ingreso con credenciales de administrador (email y contraseña).
- Botón para cerrar sesión.

### Sección 2: Entendiendo el Panel Kanban
- **Columnas:** Explicación de qué significa cada estado ("Nuevos Pedidos", "En Preparación", "Listo para Reparto", "Completado").
- **Tarjetas de Pedido:** Anatomía de una tarjeta (Número de pedido, nombre, total, método de pago).
- **Actualización en Tiempo Real:** Cómo los nuevos pedidos aparecen automáticamente sin necesidad de recargar la página.

### Sección 3: Procedimiento de Confirmación de Pago Manual (Flujo Clave)

Este es el paso más importante de la operación diaria.

**Paso 1: Identificar un Nuevo Pedido**
- Un nuevo pedido realizado por un cliente aparecerá como una tarjeta en la columna **"Nuevos Pedidos"**. La tarjeta indicará si el pago es "EFECTIVO" o "TRANSFERENCIA".

**Paso 2: Esperar y Verificar el Comprobante (Solo para Transferencias)**
- Abre la conversación de WhatsApp de "La Perrada de William".
- Espera a que el cliente envíe la foto o captura de pantalla del comprobante de pago (Nequi/Bancolombia).

**Paso 3: Validar la Información**
- Compara el **valor total** del pedido en el Panel Kanban con el monto en el comprobante de WhatsApp.
- Asegúrate de que el nombre del cliente (si aparece) o el número de orden coincidan.

**Paso 4: Confirmar y Enviar a Cocina**
- Una vez verificado el pago, busca la tarjeta del pedido correspondiente en el panel.
- Haz clic en el botón **"Confirmar Pago y Enviar a Cocina"**.

**Paso 5: Verificar el Avance**
- La tarjeta del pedido desaparecerá de "Nuevos Pedidos" y aparecerá instantáneamente en la columna **"En Preparación"**.
- ¡La cocina ya puede empezar a trabajar en ese pedido!

### Sección 4: Avanzando el Pedido en el Flujo
- **De "En Preparación" a "Listo para Reparto":** Cuando la cocina termine de preparar el pedido, presiona el botón "Marcar como Listo para Reparto".
- **De "Listo para Reparto" a "Completado":** Una vez que el domiciliario haya entregado el pedido (o el cliente lo haya recogido), presiona "Marcar como Completado".

### Sección 5: Cómo Imprimir una Comanda para la Cocina
- En cualquier tarjeta de pedido, haz clic en el botón **"Imprimir Ticket"**.
- Esto generará un formato de texto simple con los productos y cantidades, listo para que el personal de cocina lo lea.

---

## 3. Checklist de Puesta en Marcha (Día del Lanzamiento)

| Hecho | Tarea | Responsable |
|:---:|---|---|
| ☐ | **Verificar URL y Mensajes:** Confirmar que la URL principal funciona y que los mensajes automáticos de WhatsApp Business ya tienen el nuevo link. | Gerente |
| ☐ | **Acceso de Admin:** Realizar un inicio de sesión de prueba con las credenciales de administrador para asegurar el acceso al panel. | Admin de Turno |
| ☐ | **Datos de Pago Correctos:** Hacer un pedido de prueba con "Transferencia" y verificar que los números de cuenta de Bancolombia y Nequi en la página de confirmación son correctos. | Gerente |
| ☐ | **Prueba de Impresión:** Realizar una prueba de impresión de ticket de cocina para asegurar que el formato es legible y claro para el personal. | Admin de Turno |
