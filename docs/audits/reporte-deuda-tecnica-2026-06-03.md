```yml
created_at: 2026-06-03T05:31:43
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
```

<!--
.. reporte::
   :agente: bug-sweep + deuda-tecnica
   :tarea: Barrido de bugs/errores y deuda tecnica (eslint, stylelint, tsc, act)
   :fecha: 2026-06-03
   :herramientas: tsc --noEmit, eslint, stylelint, grep, jest, build:demo
   :basado-en: template-ecommerce-ui @ 0b4669d
-->

# Reporte — Bugs y deuda técnica (2026-06-03)

## Resuelto en `0b4669d` (bugs reales + errores TS)

| ID | Tipo | Archivo | Estado |
|----|------|---------|--------|
| B-1 | Bug runtime | `src/mocks/handlers/catalog.ts` — `/catalogue/search/` referenciaba `total`/`page`/`pages` inexistentes (ReferenceError) | RESUELTO |
| B-2 | Bug runtime | `src/mocks/handlers/storefront.ts` — PATCH y DELETE de direcciones huérfanos dentro del array `_addresses` (no registrados en MSW; editar/eliminar dirección roto en DEMO_MODE) | RESUELTO |
| B-3 | Bug runtime | `src/mocks/handlers/admin.ts` — `GET /admin/orders/:id/` buscaba por `Number(id)` contra `Order.id` inexistente → siempre la primera orden. Ahora por `order_number` | RESUELTO |
| B-4 | Deuda TS | 14 errores `tsc --noEmit` (mocks) → **0**. `type-check` limpio | RESUELTO |

`tsc --noEmit` ahora pasa con **0 errores** (antes 14, silenciosos porque
`type-check` no está en el gate jest+check-scss+build:demo).

## Deuda técnica pendiente (requiere decisión o conlleva riesgo)

### D-1 — ESLint sin configuración — **RESUELTO en `1f59c5d` + `2600c75`**
Se añadió `.eslintrc.json` (eslint:recommended + react + react/jsx-runtime +
react-hooks + override TS; prop-types/display-name off por React 19 sin
PropTypes). `npm run lint` pasa ahora con **0 problems** (0 errores, 0 warnings).

Al correr el lint por primera vez (60 errores + 116 warnings) se encontraron
**bugs reales de producción** (corregidos en `1f59c5d`):
- CatalogPage: el `<select>` de "Ordenar" usaba `setSortOrder` inexistente y el
  padre no pasaba `sortOrder`/`onSort` al Toolbar → ordenar lanzaba error.
- adminSlice: clave `isLoadingVariants` duplicada en initialState.
- Dropdown: `className` y `onKeyDown` duplicados en el trigger.
- apiService: 2 `catch {}` vacíos.

Los 116 warnings (103 no-unused-vars + 9 exhaustive-deps + otros) se llevaron a
**0** en `2600c75`: dead-code eliminado vía codemod AST; exhaustive-deps con 8
`useMemo`/`useCallback` triviales + 1 disable-justificado (AdminReturnRefundPanel).

Verificado (árbol canónico): eslint 0, tsc 0, jest 1886/0, check-scss 185,
build:demo EXIT=0.

### D-2 — Stylelint: ~51 violaciones — **RESUELTO en `2a35a35`**
`npm run lint:style` ahora pasa con **0 violaciones** (antes ~51). Desglose
de lo corregido:
- **24 bloques vacíos** (`block-no-empty`) eliminados (reglas CSS muertas).
- **12 `!important`** (`declaration-no-important`) eliminados; la especificidad
  de los selectores basta (sin `stylelint-disable`).
- **11 hex hardcodeados** (`color-no-hex`) → tokens (`#fff`→`$white`,
  `#000`→`$black`) + 2 tokens semánticos nuevos en `_variables.scss`
  (`$star-gold` #f5a623, `$tooltip-bg` #1a1a2e).
- **4 otros**: `selector-not-notation` (Calendar) y `word-break` deprecado
  (ChatWidget) vía `--fix`; `:global`/`:local` de CSS Modules permitidos en
  `.stylelintrc.json` (`ignorePseudoClasses`).

Verificado: stylelint 0, check-scss 185 clean, tsc 0, jest 1886/0,
build:demo EXIT=0.

**Recomendación:** fixear los 24 bloques vacíos + auto-fixables ya; hex →
tokens y `!important` → revisión, bajo verificación visual (no romper estilos).

### D-3 — `act()` warnings en tests (BAJA, higiene)
~10 componentes emiten *"An update … was not wrapped in act(...)"* (AccountPage,
ProfilePage, Footer, Popover, AdminVoucherDetailPage, ExpressCheckoutPage,
PaymentReturnPage, PaymentFailedPage, AdminStaticPagesPage; raíz en
`usePublicSettings.js:28` setData async tras unmount/efecto). No son fallos
(suite verde) pero son deuda de higiene de tests. **Recomendación:** envolver
las actualizaciones async en `act`/`waitFor` o cancelar el setState tras unmount.

### D-4 — Drift de contrato del carrito — **RESUELTO en `0acb559`**
El UI usaba `name`/`price` por item y computaba totales en cliente con modelo
**tax-EXCLUSIVO** (`total = subtotal + 16%`, sobre-cobraba IVA), divergiendo del
backend real (`product_name`/`unit_price`, **tax-INCLUSIVO**: `total =
subtotal_net`, `tax_included` informativo). Alineado:
- Items → `product_name`, `unit_price`, `subtotal` (+ product_slug,
  variant_label, sku, available_stock, is_available, price_changed); `image_url`
  conservado como extensión documentada del template (el backend real no la tiene).
- Mock devuelve el objeto Cart real `{id, cart_token, items, totals}` con las 10
  keys de `totals`; `cartSlice` consume `cart.totals` (eliminado el
  `calculateTotals` cliente). Modelo tax-inclusivo correcto.
- Consumidores (CartPage, Checkout, ExpressCheckout, Header, generateInvoicePdf,
  selectors) leen los campos alineados; `CartItem` type actualizado.

Verificado (árbol canónico): jest 1886/0, eslint 0, tsc 0, check-scss 185,
build:demo EXIT=0, **e2e carrito 3/0/0** (add-to-cart, cart-freeship,
cart-shipping-calc). Detalle en `docs/pm/iniciativas/alinear-contrato-carrito/`.

## Verificación
- `tsc --noEmit` → 0 errores.
- `npx jest` → 1886 passed / 0 failed.
- `DEMO_MODE=true npm run build:demo` → EXIT=0.
- E2E → 20 pass / 5 warn / 0 fail.
