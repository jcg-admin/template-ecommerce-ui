# Tareas: Auditar y corregir inconsistencias

## F0 - Analisis + PM docs (25 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-001 | Comparar paths de handlers MSW vs paths reales de la app | Hecha |
| T-002 | Crear 5 documentos PM | Hecha |

## F1 - Corregir catalog.ts — H-01 (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-101 | `/api/products/` -> `/api/v1/catalogue/` en `catalog.ts` | Hecha |
| T-102 | `/api/products/search/` -> `/api/v1/catalogue/search/` | Hecha |
| T-103 | `/api/products/:slug/` -> `/api/v1/catalogue/:slug/` | Hecha |
| T-104 | `/api/categories/` -> `/api/v1/categories/` | Hecha |
| T-105 | Actualizar comentario JSDoc de `catalog.ts` | Hecha |
| T-106 | Verificar paths en `catalogSlice.js` y `useCategories.js` | Hecha |

## F2 - Limpiar auth.ts — H-02 (10 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-201 | Eliminar handlers legacy `/api/token/`, `/api/auth/*` de `auth.ts` | Hecha |
| T-202 | Actualizar comentario JSDoc de `auth.ts` | Hecha |

## F3 - Corregir payments.ts y wishlist — H-04, H-05 (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-301 | `/api/payments/mercadopago/create/` -> `/api/v1/payments/mercadopago/checkout` | Hecha |
| T-302 | `/api/payments/paypal/create/` -> `/api/v1/payments/paypal/checkout` | Hecha |
| T-303 | Actualizar comentario JSDoc de `payments.ts` | Hecha |
| T-304 | `/api/wishlist/*` -> `/api/v1/wishlist/*` en `cart.ts` | Hecha |

## F4 - Limpiar constants y proxy — H-06, H-07 (10 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-401 | Eliminar `API_BASE` de `constants/index.js` | Hecha |
| T-402 | Comentario explicativo al proxy de devServer | Hecha |
| T-403 | Verificar que no hay importaciones de `API_BASE` | Hecha |

## F5 - Verificacion y cierre (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-501 | Confirmar coincidencia de paths handlers vs app | Hecha |
| T-502 | `decisiones-*.md`; cerrar index e indice; commit | Hecha |
