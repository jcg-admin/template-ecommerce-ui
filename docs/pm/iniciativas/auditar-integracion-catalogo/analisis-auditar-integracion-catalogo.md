# Analisis: Auditar integracion catalogo

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-integracion-catalogo |
| Fecha de creacion | 2026-05-26T01:21:26 |

## A-01 — browser.ts: comentario desactualizado

**Tipo**: Documentacion incorrecta
**Severidad**: BAJA (no afecta runtime)

`src/mocks/browser.ts` lineas 4-8:
```
Se importa desde `src/index.jsx` solo en `NODE_ENV=development`,
para que el bundle de produccion no incluya ni MSW ni los
handlers.
```

Esto fue verdad antes de `habilitar-msw-en-modo-demo`. Desde ese
cambio, `src/index.jsx` importa el worker cuando
`NODE_ENV !== 'production' || DEMO_MODE === 'true'`. En un build
con `DEMO_MODE=true`, `NODE_ENV=production` y el worker SI se
importa. El comentario en `browser.ts` no refleja esto.

**Correccion**: actualizar el JSDoc de `browser.ts`.

---

## A-02 — Handler search: paginacion de segunda pagina rota

**Tipo**: Bug funcional
**Severidad**: MEDIA

`src/mocks/handlers/catalog.ts` linea donde se construye `next`:
```typescript
next: results.length > PAGE_SIZE ? `?q=${q}&page=2` : null,
```

Dos problemas:
1. Hardcodea `page=2` — si el usuario esta en pagina 1 y hay 60
   resultados, `next` apunta a pagina 2. Pero si ya esta en pagina 2,
   `next` sigue apuntando a pagina 2 (bucle infinito).
2. El handler de search no recibe el parametro `page` — aunque `next`
   se enviara, la siguiente request llegaria al mismo handler con `page`
   ignorado, devolviendo siempre los primeros 20 resultados.
3. No incluye el parametro `category` en `next` si habia filtro activo.

La raiz: el handler de busqueda no implementa paginacion real. El
listado (`/api/v1/catalogue/`) si lo hace correctamente.

**Correccion**: el handler de search debe aceptar `?page=N` y construir
`next` correctamente, o simplemente retornar todos los resultados sin
paginacion (la busqueda tipicamente devuelve pocos resultados).

---

## A-03 — checkoutSlice.js legacy: handler inexistente

**Tipo**: Bug latente
**Severidad**: BAJA (codigo muerto verificado)

`src/redux/slices/checkoutSlice.js` llama a:
```javascript
apiService.post('/api/payments/mercadopago/create/', ...)
apiService.post('/api/payments/paypal/create/', ...)
```

Los handlers de payments se corrigieron en `auditar-y-corregir-inconsistencias`
(H-04) a `/api/v1/payments/*/checkout`. El `checkoutSlice.js` no se
actualizo. Grep confirma que ningun componente activo importa de
`checkoutSlice`. El riesgo es que un desarrollador futuro lo use.

**Correccion**: agregar comentario `@deprecated` en `checkoutSlice.js`
apuntando a `paymentsSlice.js`.

---

## A-04 — catalog.ts generado: conteo de slugs

**Tipo**: Inofensivo / aclaracion
**Severidad**: NINGUNA

El conteo de 270 ocurrencias de `"slug":` en `catalog.ts` se explica:
- 256 productos tienen campo `"slug": "..."`
- Cada variante tiene `"sku": "OJA-XXXXXXXX-01"` — no contiene `"slug"`
- Los 14 extras corresponden a la seccion `CATALOG_CATEGORIES` que
  tambien tiene `"slug":` en cada categoria

El dato es correcto. No requiere correccion.

---

## A-05 — transform-catalog.mjs: sin script npm

**Tipo**: Deuda de usabilidad
**Severidad**: BAJA

El script `scripts/transform-catalog.mjs` no tiene entrada en `package.json`.
El operador debe ejecutarlo como:
```bash
node scripts/transform-catalog.mjs <ruta-al-json>
```
No como `npm run transform-catalog`.

**Correccion**: agregar script en `package.json`. Sin embargo, el
script requiere un argumento (la ruta al JSON) que no es fijo.
La convencion de npm scripts no acepta argumentos facilmente.
Alternativa: documentar el uso en README y no agregar el script.

---

## A-06 — CATALOG_PRODUCTS as const: tipos readonly

**Tipo**: Potencial error TypeScript strict
**Severidad**: BAJA (no falla en runtime)

`src/mocks/data/catalog.ts` exporta:
```typescript
export const CATALOG_PRODUCTS = [...] as const;
```

`as const` hace el array y sus elementos `readonly`. El handler hace
`[...CATALOG_PRODUCTS]` (spread — correcto, crea un array mutable).
El `CATALOG_PRODUCTS.find()` retorna `typeof CATALOG_PRODUCTS[number]`
que es `readonly`. `HttpResponse.json()` acepta `unknown`, por lo que
no hay error en runtime. En modo TypeScript strict podria haber queja
si el tipo readonly se asigna a un tipo mutable.

**Correccion**: cambiar `as const` por tipado explicito en el script
de transformacion. La ventaja de `as const` (type narrowing extremo)
no se aprovecha en este contexto.

---

## A-07 — Filtro por categoria: 6 categorias con 0 resultados

**Tipo**: Bug funcional
**Severidad**: MEDIA

Este es el hallazgo mas importante de la auditoria.

**Causa raiz**: en `integrar-catalogo-oja-en-mocks` se documento que
`categoria_principal` tiene solo 8 valores en el JSON del scraper. Los
256 productos del catalogo tienen `category.slug` perteneciente a esas
8 categorias:
- `akoses-medicinas` (74 productos)
- `collares-y-pulseras` (51)
- `isan-iconos` (43)
- `complementos-y-herramientas` (38)
- `enseres` (23)
- `collares-de-orumila` (18)
- `lo-nuevo` (7)
- `ropa-y-telas` (2)

Las 6 categorias restantes tienen `product_count > 0` en
`CATALOG_CATEGORIES` (contado desde el array `categorias[]`) pero
ningun producto tiene `category.slug` igual a esos slugs:
- `ikoberes-amuletos` (product_count=14, pero 0 productos en category.slug)
- `semillas` (product_count=10, 0 productos)
- `varios` (product_count=7, 0 productos)
- `paquetes` (product_count=5, 0 productos)
- `mayoreo` (product_count=3, 0 productos)
- `titulos` (product_count=3, 0 productos)

**Consecuencia**: cuando el frontend filtra por `?category=semillas`,
el handler retorna `count: 0, results: []` aunque `CATALOG_CATEGORIES`
muestre `product_count: 10`. Inconsistencia visible para el usuario.

**Opciones de correccion**:
- (a) Asignar la categoria correcta a cada producto buscando en
  `categorias[]` del JSON fuente. Un producto que tiene `["Enseres",
  "Semillas"]` como categorias podria recibir `category.slug =
  "semillas"` si ese es su contexto principal.
- (b) Agregar un campo `tags` a cada producto con todos sus slugs de
  categoria, y filtrar por tags en el handler.
- (c) Aceptar la limitacion y documentarla — el filtro por las 6
  categorias secundarias retorna vacio en el modo demo.

**Decision**: opcion (b) — agregar campo `all_categories` (array de
slugs) al producto en el script de transformacion, y filtrar por
`all_categories.includes(catSlug)` en el handler. No requiere cambiar
el tipo `Product` de domain.ts (es un campo extra del shape de datos).
