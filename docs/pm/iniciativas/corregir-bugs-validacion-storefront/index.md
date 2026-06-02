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
  checklist de validación manual en cobertura automatizada (19 tests nuevos),
  cada uno verificado red→green.
- **F7** — fix de **BUG-SEARCH-04**, un bug nuevo detectado al escribir los
  tests: el botón "Reintentar búsqueda" no re-fetcheaba (queryKey idéntica).

Suite: 1349 passed / 0 fallos. SCSS: 149 entries clean. Build demo: OK.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `plan.md` | Fases (fixes F1-F5 + tests F6 + bug nuevo F7) |
| `registro-de-bugs.md` | Detalle técnico de los 13 bugs |

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
| BUG-SCROLL-02 | BAJA | b268ca4 | CatalogPage |
| BUG-SEARCH-02 | BAJA | f572673 + 26dd600 | — (visual, no jsdom) |

## Fuera de alcance

- **Validación visual en browser** (animaciones de SearchModal, scroll real,
  persistencia del ♥ tras recargar): no reproducible en jsdom/CI; queda en el
  checklist manual de WSL2.

Nota: BUG-PRODUCT-01 / BUG-ORDER-01 sí quedaron cubiertos (F6-T6/T7). No se
simula el timing de la race, sino el *estado* que produce (`product`/`order`
null + `isLoading` false), que distingue de forma determinista el código con
bug del corregido.

## Checklist de validación en browser (WSL2)

1. Login `comprador@test.mx` / `Test1234!` → `/account` sin loading infinito.
2. Catálogo → producto → ♡ alterna ♥/♡ y persiste al recargar.
3. Producto → "Agregar a la bolsa" → carrito con el item.
4. Modal de búsqueda (lupa o ⌘K) → animación de entrada + bordes redondeados.
5. `/search?q=medicina` → resultados o mensaje claro con botón "Reintentar"
   (que ahora sí re-busca — BUG-SEARCH-04).
6. Paginador del catálogo → al cambiar de página scrollea al inicio tras el
   render.
