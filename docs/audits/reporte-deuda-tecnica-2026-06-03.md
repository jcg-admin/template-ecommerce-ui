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

### D-1 — ESLint sin configuración (MEDIA)
`npm run lint` falla: *"ESLint couldn't find a configuration file"*. No existe
`.eslintrc*` ni `eslint.config.*` ni `eslintConfig` en `package.json`, pese a
tener las deps (`eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`,
`@typescript-eslint/*`). **El lint nunca ha corrido.** Crear la config es una
decisión (ruleset) y probablemente destape muchos hallazgos en código no
lintado. **Recomendación:** iniciativa dedicada — añadir config base
(react + react-hooks + typescript-eslint recomendado), correr, y triar/fixear
por dominio.

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

### D-4 — Drift de contrato del carrito (MEDIA)
El `CartItemSerializer` real expone `product_name`, `unit_price` y **no tiene
campo de imagen**; el UI/mocks usan `name`, `price` e `image_url`. Funciona en
demo pero diverge del backend. **Recomendación:** iniciativa para alinear el
contrato del carrito (renombrar a `product_name`/`unit_price`, decidir si la
imagen es extensión del template) tocando UI + slice + mocks + tests con TDD.

## Verificación
- `tsc --noEmit` → 0 errores.
- `npx jest` → 1886 passed / 0 failed.
- `DEMO_MODE=true npm run build:demo` → EXIT=0.
- E2E → 20 pass / 5 warn / 0 fail.
