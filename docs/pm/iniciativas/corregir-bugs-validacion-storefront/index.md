# Iniciativa: corregir-bugs-validacion-storefront

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-02
**Origen:** Validación en browser de los flujos del storefront en modo demo
(DEMO_MODE=true + MSW) tras `corregir-bugs-auditoria`.
**Rama:** claude/brave-lamport-BUmBM

## Motivo

Tras cerrar `corregir-bugs-auditoria` (CSS vars, keys, a11y, z-index,
handlers admin) se ejecutó una pasada de validación de los flujos reales del
comprador sobre el bundle demo: login → cuenta, catálogo → ficha → carrito,
favoritos, búsqueda y paginación. Esa pasada destapó 13 bugs de
**integración en runtime** — race conditions, desajustes de contrato/estado
(snake_case vs camelCase, itemId, handlers MSW duplicados), guards de auth y
UX — que no se ven en el código aislado, solo con la app corriendo.

El nombre de la iniciativa es por su **origen** (la validación del
storefront), con scope abierto: pueden aparecer más bugs en sucesivas
pasadas y caben aquí sin renombrar el directorio.

## Estado actual

Los fixes F1-F5 ya están en la rama (commits `f572673` → `26dd600`). Esta
iniciativa los documenta retroactivamente y añade:

- **F6** — tests de regresión que blindan los fixes y convierten el
  checklist de validación manual en cobertura automatizada, cada uno
  verificado red→green.
- **F7** — fix de **BUG-SEARCH-04**, un bug nuevo detectado al escribir los
  tests: el botón "Reintentar búsqueda" no re-fetcheaba (queryKey idéntica).
- **F8** — harness de **validación E2E en browser real** (Playwright +
  Chromium headless sobre el build demo con MSW): `tests/e2e/`. Convierte el
  checklist manual de WSL2 en una corrida reproducible (`npm run test:e2e`).
- **F9** — fix de 2 bugs nuevos que **solo** se vieron en browser:
  **BUG-CARD-02** (la grilla no pasaba `inWishlist` a las cards) y
  **BUG-WISHLIST-05** (`toggleWishlist` agregaba con `product_id` undefined).

Suite jest: 1352 passed / 0 fallos. SCSS: 149 entries clean. Build demo: OK.
Validación E2E: 5 pass + 1 warn (persistencia de wishlist tras reload, limitación
de MSW en memoria) / 0 fail.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `plan.md` | Fases (fixes F1-F5 + tests F6 + bugs nuevos F7/F9 + E2E F8) |
| `registro-de-bugs.md` | Detalle técnico de los 15 bugs |
| `../../../tests/e2e/README.md` | Harness de validación en browser |

## Resumen de bugs

| Bug | Severidad | Commit | Test de regresión |
|-----|-----------|--------|-------------------|
| BUG-ACCOUNT-01 | CRÍTICA | f572673 | ProtectedRoute + AdminRoute |
| BUG-CART-03 | CRÍTICA | f572673 | ProductPage |
| BUG-CART-04 | CRÍTICA | c0493c9 | ProductPage |
| BUG-WISHLIST-01 | CRÍTICA | f572673 | indirecto (ProductCard) |
| BUG-WISHLIST-02 | ALTA | c0493c9 | indirecto |
| BUG-WISHLIST-03 | ALTA | c0493c9 | wishlistSlice + ProductCard |
| BUG-PRODUCT-01 | ALTA | 82d77ed | ProductPage |
| BUG-ORDER-01 | MEDIA | 03ed5b5 | OrderDetailPage |
| BUG-CARD-01 | MEDIA | 03ed5b5 | ProductCard |
| BUG-SEARCH-03 | MEDIA | 26dd600 | SearchResultsPage |
| BUG-SEARCH-04 | MEDIA | (esta iniciativa) | SearchResultsPage |
| BUG-SCROLL-02 | BAJA | b268ca4 | CatalogPage + E2E |
| BUG-SEARCH-02 | BAJA | f572673 + 26dd600 | E2E (visual) |
| BUG-CARD-02 | MEDIA | (esta iniciativa) | CatalogPage + E2E |
| BUG-WISHLIST-05 | ALTA | (esta iniciativa) | wishlistSlice + E2E |

## Validación en browser (F8 — automatizada)

Los 6 ítems del checklist se validaron en un **Chromium real headless**
(Playwright) sobre el build demo con MSW. Corrida: `npm run test:e2e`
(harness en `tests/e2e/`). Resultado:

| # | Check | Resultado | Cubre |
|---|-------|-----------|-------|
| 1 | login → /account sin loading infinito | ✅ PASS | BUG-ACCOUNT-01 |
| 2 | ♡ alterna ♥/♡ | ⚠️ WARN | BUG-CARD-01/02, WISHLIST-05 |
| 3 | "Agregar a la bolsa" → /cart con item | ✅ PASS | BUG-CART-03/04 |
| 4 | SearchModal abre con bordes redondeados | ✅ PASS | BUG-SEARCH-02 |
| 5 | /search?q=medicina → resultados o Reintentar (refetch real) | ✅ PASS | BUG-SEARCH-03/04 |
| 6 | paginador scrollea al inicio tras el render | ✅ PASS | BUG-SCROLL-02 |

El WARN de #2: el toggle ♡→♥ **sí se refleja** en la UI; lo que no persiste es
el estado tras `reload()`, porque el estado de MSW vive en memoria por carga de
página (limitación del modo demo, no un bug). Las animaciones (#4) y el scroll
visual (#6) quedan como evidencia en `tests/e2e/screenshots/`.

La validación destapó 2 bugs que jsdom no podía ver: **BUG-CARD-02** y
**BUG-WISHLIST-05** (ver registro). Ambos corregidos con test unitario + E2E.

## Fuera de alcance

- **Persistencia de la wishlist tras recargar**: limitación del estado MSW en
  memoria (demo), no un defecto de la app. Requeriría persistir el estado del
  worker o un backend real.

Nota: BUG-PRODUCT-01 / BUG-ORDER-01 quedaron cubiertos por unit test (F6-T6/T7,
reproduciendo el *estado* de la race, no su timing) — no por E2E.
