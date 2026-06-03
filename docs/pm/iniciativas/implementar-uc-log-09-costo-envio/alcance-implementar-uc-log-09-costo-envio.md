```yml
created_at: 2026-06-03T04:24:13
project: template-ecommerce-ui
author: Nestor Monroy
status: Borrador
version: 1.0.0
iniciativa: implementar-uc-log-09-costo-envio
submodulo: ui
```

# Alcance — Implementar UC-LOG-09 «Calcular Costo de Envío»

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0a + 0b |
| Red flags activos | Ninguno (feature nueva FABRICADA; no toca infra compartida ni cross-repo de producción) |
| Resultado | **CONFIRMAR-FABRICAR** (feature del template) |
| Evidencia (catálogo lo marca pendiente) | `catalogo-ucs.rst:2073` → `UC-LOG-09: Calcular Costo de Envio` con `**Capa 5 — TEST** Pendiente (TDD)` justo arriba (línea 2068) |
| Evidencia (backend de referencia no lo expone) | `grep -rn "shipping-quote\|shipping_quote\|UC-LOG-09\|costo-envio\|costo_envio" /tmp/references/e-comerce/api/practicayoruba` → **0 resultados** (salida vacía, exit 0) |
| Iniciativas previas revisadas | Ninguna (no existe iniciativa previa para UC-LOG-09 en `docs/pm/iniciativas/`) |

### Interpretación de la premisa

El catálogo de casos de uso (`catalogo-ucs.rst:2073`) declara
**UC-LOG-09 «Calcular Costo de Envío»** con criticidad **ALTO** pero sin
narrativa ni implementación. El backend Django de referencia no expone la
ruta de cotización (`grep` vacío). Según el principio rector del proyecto,
el backend de referencia es **referencia, no restricción**: que el endpoint
no exista allí no impide que el template lo tenga.

Por tanto el resultado del gate es **CONFIRMAR-FABRICAR**: se define el
contrato del endpoint, se mockea en MSW (sin backend real), se construye la
UI buyer-facing y se documenta el UC. La cobertura de capa 5 (UI) y capa 7
(test) se cierra en esta misma iniciativa; el backend queda como contrato
acordado para una implementación futura del repo hermano
`template-ecommerce-server`.

## Objetivo

Dar al comprador, desde la página del carrito, la capacidad de estimar el
costo de envío y la ventana de entrega para su código postal antes de
avanzar al checkout.

## Entregables

| # | Entregable | Ruta |
|---|------------|------|
| 1 | Handler MSW del endpoint de cotización | `src/mocks/handlers/logistics.ts` + registro en `src/mocks/handlers/index.ts` |
| 2 | Thunk `fetchShippingQuote` + estado (`shippingQuote`, `isQuoting`, `quoteError`) | `src/redux/slices/cartSlice.js` |
| 3 | Componente buyer-facing accesible | `src/components/cart/ShippingCalculator/{index.jsx,ShippingCalculator.module.scss,ShippingCalculator.test.jsx}` |
| 4 | Integración en la página del carrito | `src/pages/cart/CartPage.jsx` |
| 5 | Especificación narrativa del UC | `docs/pm/iniciativas/implementar-uc-log-09-costo-envio/uc-log-09-calcular-costo-envio.md` |

## Contrato del endpoint (resumen)

`POST /api/v1/logistics/shipping-quote/`

- Request: `{ postal_code: string, subtotal: number }`
- 200: `{ postal_code, zone, cost, currency, estimated_days_min, estimated_days_max, free_shipping_threshold, qualifies_free_shipping }`
- 400: `{ detail, codigo_error: 'POSTAL_CODE_INVALID' }`

Detalle completo y reglas de derivación en
`uc-log-09-calcular-costo-envio.md`.

## Fuera de alcance

- Implementación del endpoint en el backend Django (queda como contrato).
- Persistencia de la cotización entre sesiones.
- Integración del costo cotizado en el total del checkout (UC distinto).

## Verificación (gate de cierre)

1. `npx jest --ci --watchAll=false` → 0 failed.
2. `node scripts/check-scss.mjs` → clean.
3. `DEMO_MODE=true npm run build:demo` → EXIT=0.
