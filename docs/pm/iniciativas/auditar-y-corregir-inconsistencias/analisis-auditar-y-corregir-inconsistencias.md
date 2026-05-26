# Analisis: Auditar y corregir inconsistencias

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-y-corregir-inconsistencias |
| Fecha de creacion | 2026-05-26T00:39:04 |

## Metodologia

Comparacion sistematica entre:
1. Los paths que los handlers MSW interceptan (en `src/mocks/handlers/`)
2. Los paths que la app realmente llama (en `src/redux/slices/` y `src/hooks/domain/`)

## H-01 — catalog.ts: paths incorrectos

**Severidad**: CRITICA. El catalogo es la pagina principal de la app.

Los handlers de `catalog.ts` interceptan paths que la app ya no usa.
La migracion del interceptor original a MSW copio los paths del
interceptor legacy sin actualizarlos a los paths actuales del
`catalogSlice.js`.

| Handler actual | Path app real | Coincide |
|----------------|---------------|----------|
| `GET /api/products/` | `GET /api/v1/catalogue/` | NO |
| `GET /api/products/search/` | `GET /api/v1/catalogue/search/` | NO |
| `GET /api/products/:slug/` | `GET /api/v1/catalogue/:slug/` | NO |
| `GET /api/categories/` | `GET /api/v1/categories/` | NO |

**Evidencia codigo**:
- `src/mocks/handlers/catalog.ts` linea 31: `http.get('/api/products/search/', ...)`
- `src/redux/slices/catalogSlice.js` linea 5: comentario explícito
  `"Sprint 5: URLs corregidas a /api/v1/catalogue/*"` — la migracion
  del interceptor a MSW no actualizó los handlers.
- `src/redux/slices/catalogSlice.js` lineas 21, 33, 46: la app llama
  a `/api/v1/catalogue/`, `/api/v1/catalogue/:slug/` y
  `/api/v1/catalogue/search/`.

**Consecuencia**: con MSW activo (dev o demo), todas las requests de
catalogo pasan a `onUnhandledRequest: 'bypass'` y salen a la red.
En modo demo sin backend, todas fallan con error de red. La app no
muestra productos ni categorias.

## H-02 — auth.ts: handlers legacy no eliminados

**Severidad**: MEDIA. Los handlers correctos existen; los legacy
generan confusion y potenciales conflictos de precedencia en MSW.

`auth.ts` tiene dos conjuntos de handlers:

**Conjunto correcto** (coincide con la app):
- `POST /api/v1/auth/login/`
- `GET /api/v1/auth/profile/`
- `POST /api/v1/auth/logout/`
- etc.

**Conjunto legacy** (no coincide con la app actual):
- `POST /api/token/` — path del interceptor original, no del slice actual
- `POST /api/auth/logout/` — path legacy
- `POST /api/auth/register/` — path legacy
- `GET /api/auth/me/` — path legacy

La app llama a `/api/v1/auth/*` exclusivamente. Los handlers legacy
en `/api/token/` y `/api/auth/*` nunca seran invocados pero ocupan
espacio en el worker y pueden confundir a futuros mantenedores.

## H-03 — cart.ts: paths CORRECTOS (sin problema)

`cart.ts` intercepta `/api/cart/*` y la app llama a `/api/cart/*`.
Los handlers de carrito estan bien. El estado local del carrito
(variable `let cart`) funciona correctamente para desarrollo.

## H-04 — payments.ts: paths incorrectos

**Severidad**: MEDIA. Afecta al flujo de pago.

| Handler actual | Path app real | Coincide |
|----------------|---------------|----------|
| `POST /api/payments/mercadopago/create/` | `POST /api/v1/payments/mercadopago/checkout` | NO |
| `POST /api/payments/paypal/create/` | `POST /api/v1/payments/paypal/checkout` | NO |

Diferencias: prefijo `/v1/`, verbo `checkout` vs `create/`.

**Evidencia**:
- `src/mocks/handlers/payments.ts` lineas 19, 25
- `src/hooks/domain/` paths: `/api/v1/payments/mercadopago/checkout`

## H-05 — wishlist: path incorrecto

**Severidad**: BAJA. El wishlist es funcionalidad secundaria.

`cart.ts` intercepta `/api/wishlist/*` (sin `/v1/`).
La app llama a `/api/v1/wishlist/`.

| Handler actual | Path app real | Coincide |
|----------------|---------------|----------|
| `GET /api/wishlist/` | `GET /api/v1/wishlist/` | NO |
| `POST /api/wishlist/` | `POST /api/v1/wishlist/` | NO |
| `DELETE /api/wishlist/:product_id/` | `DELETE /api/v1/wishlist/:id/` | NO |

## H-06 — API_BASE en constants/index.js es codigo muerto

**Severidad**: BAJA. No afecta el funcionamiento pero es deuda.

`constants/index.js` exporta:
```js
export const API_BASE = process.env.API_URL || '';
```

`apiService.js` ya lee `process.env.API_URL` directamente en su
constructor (linea 36). `API_BASE` no se importa en ningun archivo
de `src/`. Verificacion:

```bash
grep -r "API_BASE" src/   # solo aparece en constants/index.js
```

La exportacion es codigo muerto desde INI-SRV-007 cuando se elimino
el fallback de `apiService.js`.

**Opciones**:
- (a) Eliminar `API_BASE` de constants — lo mas limpio.
- (b) Mantenerlo como conveniencia para adoptantes del template que
  quieran importar la URL base desde constants.

**Decision**: eliminar. Si alguien necesita la URL base puede leer
`process.env.API_URL` directamente o instanciar `apiService`.

## H-07 — Proxy de webpack-dev-server con fallback incorrecto

**Severidad**: BAJA en modo demo (MSW intercepta), MEDIA en modo dev
sin MSW (requests sin interceptar van a localhost:8000).

`webpack.config.js` linea 287:
```js
target: process.env.API_URL || 'http://localhost:8000',
```

Con el nuevo default `API_URL=''`, el proxy usa `localhost:8000`.
Este fallback es el mismo que eliminamos de `constants/index.js` y
de `apiService.js` en INI-SRV-007. El proxy lo tiene por herencia
y paso desapercibido.

En modo dev con MSW activo (`NODE_ENV=development`), las requests
interceptadas no llegan al proxy, asi que el bug es inocuo para los
dominios con handler. Para dominios sin handler (orders, admin,
etc.), las requests pasan al proxy y van a `localhost:8000` — que
puede o no existir en el entorno del desarrollador.

**Correccion**: el fallback de `localhost:8000` es correcto para
desarrollo local (el desarrollador corre el backend ahi). El bug
real es que el comentario no documenta esto. Se agrega comentario
explicando que el fallback es intencional para desarrollo.

## Resumen de hallazgos

| ID | Descripcion | Severidad | Archivos afectados |
|----|-------------|-----------|-------------------|
| H-01 | catalog.ts: 4 paths incorrectos | CRITICA | `src/mocks/handlers/catalog.ts` |
| H-02 | auth.ts: 4 handlers legacy no eliminados | MEDIA | `src/mocks/handlers/auth.ts` |
| H-03 | cart.ts: correcto | — | — |
| H-04 | payments.ts: 2 paths incorrectos | MEDIA | `src/mocks/handlers/payments.ts` |
| H-05 | wishlist: 3 paths incorrectos | BAJA | `src/mocks/handlers/cart.ts` |
| H-06 | API_BASE: codigo muerto | BAJA | `src/constants/index.js` |
| H-07 | Proxy devServer: fallback sin documentar | BAJA | `webpack.config.js` |
