```yml
created_at: 2026-06-03T04:49:22
project: template-ecommerce-ui
author: claude
status: Aprobado
version: 1.0.0
```

# Alcance — Implementar UC-LOG-07 «Reportar problema de envío»

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0a / 0b |
| Red flags activos | Ninguno |
| Resultado | CONFIRMAR-FABRICAR (feature del template) |
| Evidencia | `catalogo-ucs.rst` lista UC-LOG-07 como UC válido; `grep -rlnE "reportar.?problema\|shipping.?issue\|incidencia"` en `src/` → 0 UI real (verificado 2026-06-03). El backend de referencia (`/tmp/references/.../practicayoruba`) no expone endpoint de incidencias de envío, pero **es solo referencia, no restricción**: el template puede tener la feature. |
| Iniciativas previas revisadas | `alinear-ui-al-backend-real` (barrido de UCs: UC-LOG-07 era el único AUSENTE-UI restante) |

## Objetivo

El comprador puede reportar un problema con el envío de una orden ya despachada
(no llegó, llegó dañado, faltan productos, retraso, otro), creando una incidencia
que el equipo de soporte/logística puede atender.

## Contrato definido (mockeado en MSW; sin backend de referencia)

`POST /api/v1/logistics/shipping-issues/`
- Request: `{ order_id, reason, description }`
- 201: `{ id, order_id, reason, description, status: 'ABIERTO', created_at }`
- 400 (validación): `{ detail, codigo_error: 'SHIPPING_ISSUE_INVALID' }` si falta
  `reason` o `description`.

`reason ∈ { NO_LLEGO, DANADO, INCOMPLETO, RETRASO, OTRO }`.

## Entregables

- `src/components/orders/ShippingIssueReport/` (componente + SCSS + test).
- `reportShippingIssue` thunk + estado `shippingIssue` en `ordersSlice.js`.
- Handler MSW en `src/mocks/handlers/logistics.ts`.
- Integración en `src/pages/account/OrderDetailPage.jsx` (SupportCard), visible
  cuando `order.status ∈ {SHIPPED, DELIVERED}`.
- Este alcance + la especificación del UC.

## Verificación (DoD)

jest verde + `check-scss` limpio + `build:demo` EXIT=0; fila de la matriz
actualizada a IMPLEMENTADO.
