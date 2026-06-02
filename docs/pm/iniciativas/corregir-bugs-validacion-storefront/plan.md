# Plan de corrección — corregir-bugs-validacion-storefront

**Creado:** 2026-06-02
**Origen:** Validación en browser de los flujos del storefront (DEMO_MODE +
MSW) tras `corregir-bugs-auditoria`.
**Estrategia:** Los fixes se ejecutaron en serie durante la validación
(F1-F5, ya en `main`/rama). Esta iniciativa los documenta retroactivamente y
añade la fase de **tests de regresión** (F6) más el fix del bug nuevo
detectado durante esa pasada (F7).

---

## FASE 1 — Guards de auth y arranque de sesión (CRÍTICA)

**Commit:** `f572673`
**Bugs:** BUG-ACCOUNT-01, BUG-WISHLIST-01, BUG-CART-03, BUG-SEARCH-02.

- ProtectedRoute / AdminRoute: renderizar `<Outlet />` si ya autenticado,
  sin bloquear por `isLoading` (fetchProfile en curso).
- cart.ts: eliminar handlers MSW duplicados de wishlist.
- ProductPage: `handleAddToCart` async + await unwrap; pasar `inWishlist`.
- SearchModal: pulido de estilos (radios, sombra).

- [x] DONE

---

## FASE 2 — Race condition de navegación a ficha de producto (ALTA)

**Commit:** `82d77ed`
**Bug:** BUG-PRODUCT-01.

- ProductPage: `if (isLoading || (!product && slug))` + cleanup
  `clearCurrentProduct` al desmontar.

- [x] DONE

---

## FASE 3 — Wishlist desde la card + race en detalle de pedido (MEDIA)

**Commit:** `03ed5b5`
**Bugs:** BUG-CARD-01, BUG-ORDER-01.

- ProductCard: pasar `inWishlist` al thunk `toggleWishlist`.
- OrderDetailPage: `if (isLoading || (!order && id))`.

- [x] DONE

---

## FASE 4 — Contrato de carrito y favoritos (CRÍTICA/ALTA)

**Commit:** `c0493c9`
**Bugs:** BUG-CART-04, BUG-WISHLIST-02, BUG-WISHLIST-03.

- ProductPage: payload camelCase a `addCartItem`.
- StorefrontLayout: `fetchCart()` + `fetchWishlist()` al montar/autenticar.
- wishlistSlice: `toggleWishlist` como thunk que resuelve el `itemId` real.

- [x] DONE

---

## FASE 5 — Búsqueda y scroll del paginador (MEDIA/BAJA)

**Commit:** `26dd600`
**Bugs:** BUG-SEARCH-03, BUG-SCROLL-02, BUG-SEARCH-02 (animaciones).

- SearchResultsPage: bloque de error con botón "Reintentar" dentro del
  layout (filtros visibles).
- CatalogPage: `useEffect` separado `[products, currentPage]` para hacer
  `scrollTo` después del render.
- SearchModal: animaciones `fadeIn` / `slideDown`.

- [x] DONE

---

## FASE 6 — Tests de regresión (esta iniciativa)

**Impacto:** Blindar los fixes anteriores; convertir el checklist de
validación manual en cobertura automatizada donde jsdom lo permite.
**Estrategia:** Un test (o suite) por bug testeable. No se modifican fuentes
salvo el bug nuevo de F7.

### F6-T1 — ProductCard.test.jsx (BUG-CARD-01) — NUEVO archivo
6 tests: aria-label "Añadir/Quitar de deseos", clase condicional activa,
despacho `toggleWishlist({ productId, inWishlist })` en ambas ramas (add vs
remove con DELETE al itemId), `preventDefault` (no navega).
- [x] DONE — 6/6 verde

### F6-T2 — ProductPage.test.jsx (BUG-CART-03/04)
3 tests añadidos: payload camelCase al endpoint, navega a `/cart` solo tras
add OK, no navega si el POST falla.
- [x] DONE — 3/3 verde (24 skip legacy intactos)

### F6-T3 — SearchResultsPage.test.jsx (BUG-SEARCH-03)
3 tests añadidos: botón "Reintentar" presente en error; encabezado y filtros
visibles durante el error; botón cableado sin romper al pulsarlo.
- [x] DONE — verde

### F6-T4 — CatalogPage.test.jsx (BUG-SCROLL-02)
2 tests añadidos: `window.scrollTo({top:0, behavior:'instant'})` se invoca
cuando los productos están en el DOM y al cambiar de página. Limitación
jsdom: se verifica la invocación, no el efecto visual. (Bonus: se definió el
helper `makeStoreWithProducts` que estaba referenciado pero ausente.)
- [x] DONE — 2/2 verde

### F6-T5 — ProtectedRoute.test.jsx + AdminRoute.test.jsx (BUG-ACCOUNT-01)
2 tests añadidos: `isAuthenticated:true` + `isLoading:true` → contenido
visible (fallaría con el orden de chequeo viejo).
- [x] DONE — verde

### F6-T6 — ProductPage.test.jsx (BUG-PRODUCT-01)
1 test: reproduce el estado de la race (`currentProduct=null` +
`isLoading=false` + slug, GET que nunca resuelve) → muestra "Cargando…" y
NO monta el sentinel `/404`. No simula el timing: reproduce el estado que
la race produce. Verificado red→green (revertir el fix hace fallar el test).
- [x] DONE — verde

### F6-T7 — OrderDetailPage.test.jsx (BUG-ORDER-01)
1 test, mismo patrón: `current=null` + `isLoading=false` + id, GET que nunca
resuelve → "Cargando pedido…" sin redirigir a `/account/orders`. Verificado
red→green.
- [x] DONE — verde

### Pendientes NO unitarios
- BUG-SEARCH-02 (animaciones SearchModal): validación visual en browser
  (jsdom no evalúa CSS animations).

### Nota metodológica — verificación red→green
Los fixes ya existían, así que no es TDD literal (test antes que código).
Para cada test de regresión se aplicó el ciclo red→green: revertir el fix en
el fuente, confirmar que el test FALLA (red), restaurar con `git checkout`,
confirmar que PASA (green). Esto demuestra que el test atrapa la regresión y
no es un test trivialmente verde.

---

## FASE 7 — Fix del bug nuevo BUG-SEARCH-04 (esta iniciativa)

**Impacto:** El botón "Reintentar búsqueda" era cosmético — no re-fetcheaba.
Detectado al escribir F6-T3.

### F7-T1 — useSearch + SearchResultsPage: refetch real
- SearchResultsPage: destructurar `refetch` de `useSearch` y llamarlo en el
  `onClick` del botón, en vez de `setSearchParams` con los mismos params.
- Test BUG-SEARCH-04: el contador de llamadas a `/catalogue/search/`
  aumenta tras el click (el `it.failing` previo se convirtió en `it` normal).
- [x] DONE — verde

---

## Criterios de cierre de la iniciativa

- [x] `node scripts/check-scss.mjs` → 149 entries clean
- [x] `npm test` → 0 fallos (1349 passed, 109 skipped)
- [x] `DEMO_MODE=true npm run build:demo` sin errores (exit 0)
- [x] Todas las tareas de F6/F7 marcadas DONE
- [ ] Commit final + push a la rama
- [ ] Validación visual en browser (checklist) — fuera del alcance de CI
