# Alcance: Auditar y corregir inconsistencias

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-y-corregir-inconsistencias |
| Estado | En ejecucion |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-26 |
| Iniciativa origen | (raiz) |

## Por que existe esta iniciativa

Con `habilitar-msw-en-modo-demo` cerrada, el modo demo deberia
mostrar datos. Pero incluso con MSW activo (DEMO_MODE=true) la app
no muestra nada porque los handlers MSW interceptan paths distintos
a los que la app realmente llama.

El analisis sistematico del codigo revela 7 inconsistencias:
6 en `src/mocks/handlers/` (paths incorrectos) y 1 en
`src/constants/index.js` (codigo muerto) y 1 en
`webpack.config.js` (fallback incorrecto en proxy).

## Que esta dentro del alcance

### Correcciones de handlers MSW (H-01, H-02, H-04, H-05)

Corregir los paths de los handlers para que coincidan con los
paths reales que la app llama:

| Hallazgo | Handler | Path actual (incorrecto) | Path correcto |
|----------|---------|--------------------------|---------------|
| H-01 | `catalog.ts` | `/api/products/` | `/api/v1/catalogue/` |
| H-01 | `catalog.ts` | `/api/categories/` | `/api/v1/categories/` |
| H-01 | `catalog.ts` | `/api/products/search/` | `/api/v1/catalogue/search/` |
| H-01 | `catalog.ts` | `/api/products/:slug/` | `/api/v1/catalogue/:slug/` |
| H-02 | `auth.ts` | `/api/token/`, `/api/auth/*` | Eliminar handlers legacy |
| H-04 | `payments.ts` | `/api/payments/mercadopago/create/` | `/api/v1/payments/mercadopago/checkout` |
| H-04 | `payments.ts` | `/api/payments/paypal/create/` | `/api/v1/payments/paypal/checkout` |
| H-05 | `handlers/index.ts` | `/api/wishlist/*` (en returns?) | Verificar donde vive el handler |

### Limpieza de codigo muerto (H-06)

Eliminar o corregir `API_BASE` en `constants/index.js` — no se
importa en ningun archivo, es codigo muerto.

### Correguir proxy de webpack-dev-server (H-07)

El proxy de devServer tiene `target: process.env.API_URL || 'http://localhost:8000'`.
Con el nuevo default `API_URL=''`, el proxy va a `localhost:8000`.
Debe usar `http://localhost:8000` solo como fallback explicito de
desarrollo, documentado como tal.

## Criterio de completitud

1. Los handlers de MSW interceptan exactamente los paths que la app
   llama para los dominios: catalog, auth, cart, payments, wishlist.
2. `npm run dev` con `*_SOURCE=mock` muestra datos en el catalogo.
3. `npm run build:demo` + Nginx muestra datos en el catalogo.
4. `API_BASE` en `constants/index.js` eliminado o tiene un
   importador real.
5. El proxy de devServer tiene el fallback correcto documentado.
6. `npm test` sin regresiones.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Implementar handlers para dominios sin handler (`/api/v1/orders/`, `/api/v1/admin/*`, etc.) | Cada dominio merece su propia tarea; esta iniciativa solo corrige los paths de los handlers existentes |
| Validar el contrato de los mocks vs backend real | Es la iniciativa `validar-contrato-de-mocks-vs-backend-real` (Backlog) |
| Agregar tests para los handlers | Mejora futura; los tests de slices que usan `server.use(handlers)` ya cubren el comportamiento |

## Estimacion de esfuerzo

| Fase | Descripcion | Esfuerzo |
|------|-------------|----------|
| F0 | Analisis + PM docs | 25 min |
| F1 | Corregir catalog.ts (H-01) | 15 min |
| F2 | Corregir auth.ts (H-02) | 10 min |
| F3 | Corregir payments.ts (H-04) y wishlist (H-05) | 15 min |
| F4 | Limpiar constants/index.js (H-06) y proxy (H-07) | 10 min |
| F5 | Verificacion y cierre | 15 min |
| Total | | ~90 min |
