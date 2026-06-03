```yml
created_at: 2026-06-03T04:49:22
project: template-ecommerce-ui
author: claude
status: Aprobado
version: 1.0.0
```

# UC-LOG-07: Reportar Problema de Envío

| Campo | Valor |
|-------|-------|
| **ID** | UC-LOG-07 |
| **Actor** | Comprador (autenticado) |
| **Criticidad** | ALTO |
| **Módulo** | logistics / orders |
| **Estado** | Implementado (feature fabricada del template) |

## Descripción

El comprador reporta un problema con el envío de una orden ya despachada
(`SHIPPED` o `DELIVERED`). El sistema registra la incidencia para que soporte
o logística la atienda.

## Precondiciones

- El comprador está autenticado y es dueño de la orden.
- La orden está en estado `SHIPPED` o `DELIVERED`.

## Flujo principal

1. El comprador abre el detalle de su pedido (`account/orders/:id`).
2. En la tarjeta de soporte ve la acción «Reportar problema de envío».
3. Al activarla, completa el formulario: **motivo** (No llegó / Llegó dañado /
   Faltan productos / Retraso / Otro) y **descripción**.
4. Envía el reporte (`POST /api/v1/logistics/shipping-issues/`).
5. El sistema crea la incidencia con estado `ABIERTO` y confirma al comprador.

## Flujos alternativos

- **3a. Campos incompletos:** si falta motivo o descripción, el sistema muestra
  un error de validación y no envía (también validado server-side, 400
  `SHIPPING_ISSUE_INVALID`).
- **4a. Error de red/servidor:** se muestra un mensaje de error y el comprador
  puede reintentar.

## Postcondiciones

- Existe una incidencia de envío `ABIERTO` asociada a la orden.
- El comprador recibe confirmación visual del envío del reporte.

## Contrato

`POST /api/v1/logistics/shipping-issues/`
- Request: `{ order_id, reason, description }`
- Response 201: `{ id, order_id, reason, description, status: 'ABIERTO', created_at }`
- Response 400: `{ detail, codigo_error: 'SHIPPING_ISSUE_INVALID' }`

`reason ∈ { NO_LLEGO, DANADO, INCOMPLETO, RETRASO, OTRO }`.

## Criterios de aceptación

- El control solo aparece para órdenes `SHIPPED`/`DELIVERED`.
- Enviar sin motivo o sin descripción no llama al endpoint y muestra error.
- Un envío válido llama a `POST /api/v1/logistics/shipping-issues/` con
  `{ order_id, reason, description }` y muestra confirmación.
- Accesibilidad: formulario etiquetado, error con `role="alert"`, confirmación
  con `role="status"`.

## Trazabilidad

- Componente: `src/components/orders/ShippingIssueReport/`
- Slice: `reportShippingIssue` en `src/redux/slices/ordersSlice.js`
- Mock: `src/mocks/handlers/logistics.ts`
- Integración: `src/pages/account/OrderDetailPage.jsx` (SupportCard)
