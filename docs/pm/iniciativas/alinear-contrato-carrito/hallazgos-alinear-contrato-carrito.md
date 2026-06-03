```yml
created_at: 2026-06-03T07:39:24
project: template-ecommerce-ui
author: Nestor Monroy
status: completado
submodulo: ui
iniciativa: alinear-contrato-carrito
```

# Hallazgos — Alinear contrato del carrito (D-4)

## H-UI-01 — Drift tax-exclusivo en el cliente sobre-cobraba IVA

- **Severidad:** ALTA
- **Archivo:** `src/redux/slices/cartSlice.js:144-155` (pre-cambio)
- **Descripcion:** `calculateTotals` calculaba `tax = (subtotal−discount)·0.16`
  y `total = (subtotal−discount) + tax`, modelo tax-EXCLUSIVO. El backend real
  (`apps/cart/models.py:75,85`) es tax-INCLUSIVO: `total = subtotal_net` y el
  IVA ya esta dentro de `unit_price` (`tax_included` es informativo). El cliente
  mostraba un total ~16% mayor al del server.
- **Estado:** RESUELTO — `totals` ahora se toma de `cart.totals` (server);
  `total = subtotal_net`, `tax_included` informativo.

## H-UI-02 — Nombres de campo de item divergentes del contrato

- **Severidad:** ALTA
- **Archivo:** `src/redux/slices/cartSlice.js:145`,
  `src/components/layout/Header/index.jsx:188-190`,
  `src/mocks/handlers/cart.ts`, `src/mocks/factories/cart.ts` (pre-cambio)
- **Descripcion:** El UI usaba `item.name` / `item.price`; el contrato real
  (`CartItemSerializer`) usa `product_name` / `unit_price` (+ `subtotal`,
  `sku`, `variant_label`, `available_stock`, `is_available`, `price_changed`).
- **Estado:** RESUELTO — mock, factory, slice y Header migrados; `domain.ts`
  ya estaba alineado en el worktree.

## H-UI-03 — `item_count`: Σ(qty) (task) vs items.count() (backend)

- **Severidad:** BAJA
- **Archivo:** `src/mocks/handlers/cart.ts` (`buildCart`) vs
  `/tmp/references/.../apps/cart/models.py:92`
- **Descripcion:** El backend define `item_count = self.items.count()` (numero
  de lineas distintas). La especificacion de la tarea D-4 pide
  `item_count = Σ qty` (suma de cantidades). Se siguio la tarea como autoridad:
  el mock y el slice usan `Σ qty`. Divergencia menor de semantica; el storefront
  (Header, badge) espera "piezas" = Σ qty, consistente con el resto del UI.
- **Estado:** DOCUMENTADO — se adopta `Σ qty` por directiva de la tarea.

## H-UI-04 — Gate E2E del carrito no aplicable en este repo

- **Severidad:** INFORMATIVO
- **Archivo:** n/a
- **Descripcion:** El gate pedia `node tests/e2e/run.mjs cart add-to-cart` y los
  specs `cart-freeship`/`add-to-cart`/`cart-shipping-calc`. Verificado: no existe
  `tests/e2e/`, ni `run.mjs`, ni script `test:e2e` en `package.json` (solo
  `tests/unit/`). El repo standalone aun no tiene capa Playwright. Gate E2E
  OMITIDO por ausencia de infraestructura, no por fallo.
- **Estado:** DOCUMENTADO — gate no aplicable.

## H-UI-05 — `generateInvoicePdf.js` no existe en el repo

- **Severidad:** INFORMATIVO
- **Archivo:** n/a
- **Descripcion:** El consumidor `src/utils/generateInvoicePdf.js` listado en la
  tarea no existe (`find`/`grep` sin resultados). Nada que migrar.
- **Estado:** DOCUMENTADO — consumidor inexistente.

## H-UI-06 — Errores tsc pre-existentes ajenos al carrito

- **Severidad:** INFORMATIVO
- **Archivo:** `src/mocks/handlers/{admin,catalog,inventory,storefront}.ts`
- **Descripcion:** `npx tsc --noEmit` reporta 15 errores en admin/catalog/
  inventory/storefront. Verificado con `git stash` que reproducen en HEAD sin
  mis cambios — son pre-existentes y ajenos al carrito. Tras el fix, 0 errores
  tsc relacionados con cart.
- **Estado:** DOCUMENTADO — fuera de alcance D-4.

## H-UI-07 — `npm run lint` (`eslint src`) falla por config del repo

- **Severidad:** INFORMATIVO
- **Archivo:** `package.json` script `lint`, `.eslintignore`
- **Descripcion:** `eslint src` aborta con "all files matching glob 'src' are
  ignored" (ESLint 8 + .eslintignore). Reproduce en HEAD. Lint explicito de los
  archivos tocados con `--no-ignore`: 0 errores (solo 3 warnings pre-existentes
  de `no-unused-vars`). Gate de lint satisfecho para los cambios.
- **Estado:** DOCUMENTADO — issue de config pre-existente.
```
