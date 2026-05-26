# Iniciativa: auditar-y-corregir-inconsistencias

| Campo | Valor |
|-------|-------|
| Slug | `auditar-y-corregir-inconsistencias` |
| Estado | Cerrada |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-26T00:39:04 |
| Fecha de apertura formal | 2026-05-26T00:39:04 |
| Fecha de paso a ejecucion | 2026-05-26T00:39:04 |
| Fecha de cierre | 2026-05-26T00:48:46 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

La auditoria del codigo producido por las iniciativas recientes
(`habilitar-msw-en-modo-demo`, INI-SRV-007) revela inconsistencias
que impiden que la app funcione correctamente incluso con MSW activo.

El problema mas grave: los **handlers MSW interceptan paths distintos
a los que la app realmente llama**. MSW esta activo pero las requests
no son interceptadas porque los paths no coinciden. La app recibe
errores de red en lugar de datos de mock.

Inconsistencias identificadas en el analisis:

**H-01 — Paths de catalogo: handlers vs app**
Los handlers de `catalog.ts` interceptan `/api/products/` y
`/api/categories/`. La app llama a `/api/v1/catalogue/` y
`/api/v1/categories/`. Ninguna request de catalogo es interceptada.

**H-02 — Paths de auth: handlers duplicados con paths distintos**
`auth.ts` tiene dos conjuntos de handlers: uno en `/api/v1/auth/*`
(correcto, coincide con la app) y otro en `/api/token/`,
`/api/auth/*` (legacy, no coincide con la app actual).

**H-03 — Paths de cart: handlers vs app**
Los handlers de `cart.ts` interceptan `/api/cart/*`. La app llama
a los mismos paths `/api/cart/*`. Este dominio SI coincide.

**H-04 — Paths de payments: handlers vs app**
Los handlers interceptan `/api/payments/mercadopago/create/` y
`/api/payments/paypal/create/`. La app llama a
`/api/v1/payments/mercadopago/checkout` y
`/api/v1/payments/paypal/checkout`. No coinciden.

**H-05 — Paths de wishlist: handlers vs app**
Los handlers interceptan `/api/wishlist/*`. La app llama a
`/api/v1/wishlist/`. No coinciden.

**H-06 — API_BASE en constants/index.js es letra muerta**
`constants/index.js` exporta `API_BASE = process.env.API_URL || ''`.
`apiService.js` ya lee `process.env.API_URL` directamente en su
constructor. `API_BASE` no se importa en ningun archivo de `src/`.
Es codigo muerto.

**H-07 — Proxy de webpack-dev-server hardcodea localhost:8000**
El devServer proxy tiene `target: process.env.API_URL || 'http://localhost:8000'`.
Con `API_URL` vacio (el nuevo default), el proxy apunta a
`localhost:8000`. En modo demo con `npm run dev`, las requests que
MSW no intercepta van a `localhost:8000` en lugar de fallar
claramente. Este es el fallback viejo que eliminamos de
`constants/index.js` pero sobrevivio en el proxy.

## ADR relacionada

`dec-mocks-via-msw-service-worker` — la inconsistencia de paths es
una consecuencia de la migracion del interceptor a MSW. Los paths
del interceptor original eran distintos a los que la app usa hoy.
La ADR no se supersede; esta iniciativa corrige la implementacion.

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-26.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-auditar-y-corregir-inconsistencias.md](alcance-auditar-y-corregir-inconsistencias.md) | Que cubre, criterio de completitud, fuera de alcance. |
| [analisis-auditar-y-corregir-inconsistencias.md](analisis-auditar-y-corregir-inconsistencias.md) | Inventario detallado de cada inconsistencia con evidencia de codigo. |
| [plan-auditar-y-corregir-inconsistencias.md](plan-auditar-y-corregir-inconsistencias.md) | Plan de fases con tareas atomicas T-NNN y DAG. |
| [tareas-auditar-y-corregir-inconsistencias.md](tareas-auditar-y-corregir-inconsistencias.md) | Lista plana de tareas con estado. |
| [progreso-auditar-y-corregir-inconsistencias.md](progreso-auditar-y-corregir-inconsistencias.md) | Log del avance. |
| [decisiones-auditar-y-corregir-inconsistencias.md](decisiones-auditar-y-corregir-inconsistencias.md) | Decisiones de diseno, hallazgos y verificacion post-ejecucion. |
