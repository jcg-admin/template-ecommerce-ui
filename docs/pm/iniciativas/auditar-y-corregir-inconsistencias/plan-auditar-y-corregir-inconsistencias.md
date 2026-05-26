# Plan: Auditar y corregir inconsistencias

## DAG de fases

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'background': '#0f172a',
  'primaryColor': '#1e293b',
  'primaryTextColor': '#f1f5f9',
  'primaryBorderColor': '#94a3b8',
  'lineColor': '#cbd5e1',
  'fontSize': '13px'
}}}%%
flowchart LR
    f0["<b>F0</b><br/>Analisis<br/>+ PM docs<br/><i>25 min</i>"]
    f1["<b>F1</b><br/>catalog.ts<br/>H-01<br/><i>15 min</i>"]
    f2["<b>F2</b><br/>auth.ts<br/>H-02<br/><i>10 min</i>"]
    f3["<b>F3</b><br/>payments.ts<br/>wishlist H-04/05<br/><i>15 min</i>"]
    f4["<b>F4</b><br/>constants<br/>proxy H-06/07<br/><i>10 min</i>"]
    f5["<b>F5</b><br/>Verificacion<br/>y cierre<br/><i>15 min</i>"]

    f0 --> f1
    f1 --> f2
    f2 --> f3
    f3 --> f4
    f4 --> f5

    classDef doneNode fill:#14532d,stroke:#4ade80,stroke-width:2px,color:#f0fdf4
    classDef stepNode fill:#1e293b,stroke:#60a5fa,stroke-width:2px,color:#f1f5f9

    class f0 doneNode
    class f1,f2,f3,f4,f5 stepNode
```

## F0 - Analisis + PM docs (25 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-001 | Comparar paths de handlers MSW vs paths reales de la app | 15 min |
| T-002 | Crear 5 documentos PM | 10 min |

## F1 - Corregir catalog.ts — H-01 (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-101 | Actualizar path `/api/products/` -> `/api/v1/catalogue/` en `catalog.ts` | 3 min |
| T-102 | Actualizar path `/api/products/search/` -> `/api/v1/catalogue/search/` | 2 min |
| T-103 | Actualizar path `/api/products/:slug/` -> `/api/v1/catalogue/:slug/` | 2 min |
| T-104 | Actualizar path `/api/categories/` -> `/api/v1/categories/` | 2 min |
| T-105 | Actualizar comentario JSDoc de `catalog.ts` con los paths correctos | 3 min |
| T-106 | Verificar que `catalogSlice.js` y `useCategories.js` usan los mismos paths | 3 min |

## F2 - Limpiar auth.ts — H-02 (10 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-201 | Eliminar handlers legacy `/api/token/`, `/api/auth/logout/`, `/api/auth/register/`, `/api/auth/me/` de `auth.ts` | 5 min |
| T-202 | Actualizar comentario JSDoc de `auth.ts` | 5 min |

## F3 - Corregir payments.ts y wishlist — H-04, H-05 (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-301 | Actualizar path `/api/payments/mercadopago/create/` -> `/api/v1/payments/mercadopago/checkout` en `payments.ts` | 3 min |
| T-302 | Actualizar path `/api/payments/paypal/create/` -> `/api/v1/payments/paypal/checkout` en `payments.ts` | 3 min |
| T-303 | Actualizar comentario JSDoc de `payments.ts` | 3 min |
| T-304 | Actualizar path `/api/wishlist/*` -> `/api/v1/wishlist/*` en `cart.ts` | 5 min |

## F4 - Limpiar constants y proxy — H-06, H-07 (10 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-401 | Eliminar exportacion `API_BASE` de `constants/index.js` | 3 min |
| T-402 | Agregar comentario explicativo al proxy de devServer en `webpack.config.js` | 3 min |
| T-403 | Verificar que eliminar `API_BASE` no rompe ninguna importacion | 4 min |

## F5 - Verificacion y cierre (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-501 | Confirmar que todos los paths de handlers coinciden con los paths de la app | 5 min |
| T-502 | Crear `decisiones-*.md`; actualizar index e indice; commit | 10 min |
