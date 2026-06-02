# Registro de bugs — corregir-bugs-validacion-storefront

Bugs detectados al validar en el browser los flujos del storefront en
modo demo (DEMO_MODE=true + MSW) tras los fixes de la auditoría previa
(`corregir-bugs-auditoria`). Severidad ordenada de CRÍTICA a BAJA.

Cada bug indica el commit que lo corrigió y el estado de cobertura de
tests de regresión añadida en esta iniciativa.

---

## BUG-ACCOUNT-01 — /account queda en loading infinito post-login

**Severidad:** CRÍTICA
**Archivos:** `src/components/shared/ProtectedRoute/index.jsx`,
`src/components/shared/ProtectedRoute/AdminRoute.jsx`
**Síntoma:** Tras un login correcto, `/account` (y `/admin`) se quedan
mostrando el `PageLoader` indefinidamente.
**Causa:** El guard chequeaba `isLoading` ANTES de `isAuthenticated`. Al
entrar a la ruta protegida, `fetchProfile.pending` vuelve a poner
`isLoading=true` → el guard regresa al `PageLoader` aunque el usuario ya
esté autenticado, sin salir nunca de ese estado.
**Fix:** Invertir el orden — si `isAuthenticated` (y rol admin en
AdminRoute) renderizar `<Outlet />` aunque haya un fetch de auth en curso.
`isLoading` solo bloquea cuando aún no hay sesión conocida.
**Commit:** `f572673`
**Tests:** `ProtectedRoute.test.jsx` + `AdminRoute.test.jsx` — caso
`isAuthenticated:true` + `isLoading:true` → contenido visible.

---

## BUG-CART-03 — "Agregar a la bolsa" muestra el carrito vacío

**Severidad:** CRÍTICA
**Archivo:** `src/pages/catalog/ProductPage.jsx`
**Síntoma:** Al agregar un producto, navega a `/cart` pero el carrito
aparece vacío.
**Causa:** `handleAddToCart` no era `async` → `navigate('/cart')` ocurría
antes de que el `POST /api/cart/items/` terminara. `CartPage` montaba y
`fetchCart()` devolvía el estado aún vacío.
**Fix:** `async` + `await dispatch(addCartItem(...)).unwrap()` → navegar
solo después de que el item llegó al store.
**Commit:** `f572673`
**Tests:** `ProductPage.test.jsx` — navega a `/cart` solo tras add OK; no
navega si el POST falla.

---

## BUG-CART-04 — addCartItem recibía snake_case, el thunk esperaba camelCase

**Severidad:** CRÍTICA
**Archivo:** `src/pages/catalog/ProductPage.jsx`
**Síntoma:** Persistía el carrito vacío incluso con BUG-CART-03 corregido.
**Causa:** `ProductPage` despachaba `{ product_id, variant_id, quantity }`
pero el thunk `addToCart` espera `{ productId, variantId, quantity }`.
`productId` llegaba `undefined` → body vacío → MSW respondía 400 → el
`catch` silencioso → `navigate('/cart')` nunca ocurría.
**Fix:** `ProductPage` usa camelCase en el dispatch.
**Commit:** `c0493c9`
**Tests:** `ProductPage.test.jsx` — verifica el payload enviado al endpoint.

---

## BUG-WISHLIST-01 — el botón ♡ no funciona (handlers MSW duplicados)

**Severidad:** CRÍTICA
**Archivos:** `src/mocks/handlers/cart.ts`, `src/pages/catalog/ProductPage.jsx`
**Síntoma:** El botón de wishlist no responde o responde con datos mock
incorrectos.
**Causa 1:** `cart.ts` tenía handlers duplicados de `/api/v1/wishlist/`
(GET, POST, DELETE) registrados ANTES que `wishlist.ts` → MSW nunca llegaba
a `wishlist.ts`.
**Causa 2:** `ProductPage` llamaba `toggleWishlist` sin pasar `inWishlist`
→ siempre ejecutaba `addToWishlist`, nunca `removeFromWishlist`.
**Fix:** Eliminar de `cart.ts` los 3 handlers + interfaz `WishlistItem` +
estado wishlist (única fuente: `wishlist.ts`). Agregar `selectIsInWishlist`
en `ProductPage` y pasarlo al thunk.
**Commit:** `f572673`
**Tests:** cobertura indirecta vía `ProductCard.test.jsx` (rama remove) y
`wishlistSlice.test.js`.

---

## BUG-WISHLIST-02 — la wishlist nunca se cargaba al autenticarse

**Severidad:** ALTA
**Archivo:** `src/layouts/StorefrontLayout.jsx`
**Síntoma:** El botón ♡ nunca mostraba ♥ aunque el producto estuviera en
favoritos; el toggle siempre añadía en vez de quitar.
**Causa:** `fetchWishlist` solo se llamaba en `WishlistPage`.
`selectIsInWishlist` siempre devolvía `false`.
**Fix:** `StorefrontLayout` despacha `fetchCart()` + `fetchWishlist()` al
montar y cuando cambia `isAuthenticated`.
**Commit:** `c0493c9`
**Tests:** cobertura indirecta vía `ProductCard.test.jsx` y selectores.

---

## BUG-WISHLIST-03 — toggleWishlist pasaba productId donde se esperaba itemId

**Severidad:** ALTA
**Archivo:** `src/redux/slices/wishlistSlice.js`
**Síntoma:** Quitar de favoritos no eliminaba el item correcto (o ninguno).
**Causa:** `toggleWishlist` pasaba `productId` a `removeFromWishlist`, que
espera el `itemId` (id del registro en la wishlist, distinto del product_id).
**Fix:** `toggleWishlist` convertido a thunk — usa `getState()` para
encontrar el item por `product_id` y pasa su `id` real al DELETE.
**Commit:** `c0493c9`
**Tests:** `wishlistSlice.test.js` (thunks) + `ProductCard.test.jsx`
(verifica el DELETE al itemId en la rama remove).

---

## BUG-PRODUCT-01 — ProductPage redirige a /404 por race condition

**Severidad:** ALTA
**Archivo:** `src/pages/catalog/ProductPage.jsx`
**Síntoma:** Al navegar del catálogo a un producto, salta a `/404` antes de
cargar.
**Causa:** ProductPage montaba con `currentProduct=null` del estado
anterior; `fetchProduct.pending` aún no llegaba e `isLoading=false` (del
fetch previo) → primer render: `!isLoading && !product` → `Navigate /404`.
**Fix:** Condición de loading robusta `if (isLoading || (!product && slug))`
+ cleanup `clearCurrentProduct` al desmontar.
**Commit:** `82d77ed`
**Tests:** `ProductPage.test.jsx` — describe "race /404 (BUG-PRODUCT-01)":
con `currentProduct=null` + `isLoading=false` + slug presente y un GET que
nunca resuelve, muestra "Cargando…" y NO monta el sentinel `/404`. Verificado
red→green (revertir el fix hace fallar el test).

---

## BUG-ORDER-01 — OrderDetailPage con el mismo race condition

**Severidad:** MEDIA
**Archivo:** `src/pages/account/OrderDetailPage.jsx`
**Síntoma:** El detalle del pedido parpadeaba a estado "no encontrado".
**Causa:** Mismo patrón que BUG-PRODUCT-01: `!isLoading && !order`.
**Fix:** `if (isLoading || (!order && id))`.
**Commit:** `03ed5b5`
**Tests:** `OrderDetailPage.test.jsx` — describe "race redirect (BUG-ORDER-01)":
con `current=null` + `isLoading=false` + id presente y un GET que nunca
resuelve, muestra "Cargando pedido…" y NO redirige a `/account/orders`.
Verificado red→green.

---

## BUG-CARD-01 — ProductCard despachaba toggleWishlist sin inWishlist

**Severidad:** MEDIA
**Archivo:** `src/components/catalog/ProductCard.jsx`
**Síntoma:** Desde la card del catálogo, el ♡ siempre añadía, nunca quitaba.
**Causa:** `dispatch(toggleWishlist({ productId: id }))` — faltaba el flag
`inWishlist` (que ya recibía como prop, default false).
**Fix:** `dispatch(toggleWishlist({ productId: id, inWishlist }))`.
**Commit:** `03ed5b5`
**Tests:** `ProductCard.test.jsx` (6 tests) — aria-label, clase activa y
despacho con `{ productId, inWishlist }` en ambas ramas.

---

## BUG-SEARCH-03 — los filtros desaparecían en estado de error, sin reintento

**Severidad:** MEDIA
**Archivo:** `src/pages/catalog/SearchResultsPage.jsx`
**Síntoma:** Si la búsqueda fallaba, el usuario quedaba sin filtros ni forma
de reintentar.
**Causa:** El bloque de error no ofrecía reintento; el mensaje era genérico.
**Fix:** Mensaje claro con el término + botón "Reintentar búsqueda"; el
bloque de error vive dentro del layout, así que encabezado y filtros
permanecen visibles.
**Commit:** `26dd600`
**Tests:** `SearchResultsPage.test.jsx` — botón presente; layout/filtros
visibles durante el error.

---

## BUG-SEARCH-04 — el botón "Reintentar" no disparaba un nuevo fetch

**Severidad:** MEDIA
**Archivos:** `src/pages/catalog/SearchResultsPage.jsx`, `src/hooks/domain/useSearch.js`
**Síntoma:** Pulsar "Reintentar búsqueda" no hacía nada visible: el error
permanecía aunque la API ya pudiera responder.
**Causa:** El handler hacía `setSearchParams(new URLSearchParams(searchParams))`,
re-aplicando los MISMOS parámetros. La `queryKey` de `useSearch`
(`[...SEARCH_KEY, normalized, rest]`) no cambiaba → React Query v5 reusaba
el estado de error cacheado (`retry:false`) y NO re-ejecutaba `queryFn`.
El botón era cosmético.
**Fix:** Exponer `refetch` de `useSearch` (ya disponible en el resultado de
`useQuery`) y llamarlo en el `onClick`, forzando una nueva petición sin
depender de la queryKey.
**Detección:** Hallazgo de la pasada de tests de esta iniciativa (el test de
re-fetch quedaba en `it.failing`). Corregido en el momento.
**Estado:** FIXED en esta iniciativa (pendiente de commit).
**Tests:** `SearchResultsPage.test.jsx` — `BUG-SEARCH-04`: el contador de
llamadas a `/catalogue/search/` aumenta tras el click.

---

## BUG-SEARCH-02 — SearchModal con estilos poco pulidos

**Severidad:** BAJA
**Archivo:** `src/components/common/SearchModal/SearchModal.module.scss`
**Síntoma:** El modal de búsqueda se sentía tosco: bordes rectos, poca
sombra, sin animación de entrada.
**Causa:** Falta de pulido visual.
**Fix:** `border-radius` md → xl en input/botones/panel; padding-y
reforzado; sombra más profunda; `border-bottom` accent; animaciones de
entrada `fadeIn` (backdrop) y `slideDown` (panel).
**Commits:** `f572673` (radios/sombra) + `26dd600` (animaciones).
**Tests:** NO testeable como unit — jsdom no evalúa animaciones ni estilos
CSS computados. Validado en browser real (`tests/e2e/checks/04-search-modal.mjs`):
el modal abre con bordes redondeados; la animación queda como evidencia en
`tests/e2e/screenshots/search-modal.png`.

---

## BUG-CARD-02 — la grilla del catálogo/búsqueda no reflejaba la wishlist

**Severidad:** MEDIA
**Archivos:** `src/pages/catalog/CatalogPage.jsx`, `src/pages/catalog/SearchResultsPage.jsx`
**Síntoma:** En el catálogo y en resultados de búsqueda, el ♡ de las cards
nunca pasaba a ♥ aunque el producto estuviera (o se agregara) a la wishlist.
**Causa:** BUG-CARD-01 hizo que `ProductCard` despache `toggleWishlist` con
`inWishlist`, pero los padres renderizaban `<ProductCard product={p} />` **sin**
pasar la prop `inWishlist` (default `false`). El componente nunca recibía el
estado real. El unit test de `ProductCard` no lo cazó porque probaba el
componente CON la prop ya pasada.
**Fix:** Cada página selecciona `s.wishlist.items` y pasa
`inWishlist={items.some((i) => i.product_id === p.id)}` a cada card.
**Detección:** Validación E2E en browser (`tests/e2e/checks/02-wishlist.mjs`).
**Estado:** FIXED en esta iniciativa.
**Tests:** `CatalogPage.test.jsx` — describe "wishlist en las cards
(BUG-CARD-02)": con un producto en `wishlist.items` la card muestra "Quitar de
deseos". + cobertura E2E.

---

## BUG-WISHLIST-05 — toggleWishlist agregaba con product_id undefined

**Severidad:** ALTA
**Archivo:** `src/redux/slices/wishlistSlice.js`
**Síntoma:** Agregar a favoritos no reflejaba el estado: el item guardado tenía
`product_id: undefined`, así que ninguna card lo matcheaba.
**Causa:** El thunk `toggleWishlist` (rama agregar) invocaba
`addToWishlist({ product_id: productId })`, pero `addToWishlist` destructura
`{ productId }` (camelCase) → `productId` llegaba `undefined` → el POST mandaba
`product_id: undefined`. Segundo desajuste snake_case vs camelCase tras
BUG-CART-04.
**Fix:** `dispatch(addToWishlist({ productId }))`.
**Detección:** Triaje del FAIL de wishlist en la validación E2E (la causa que el
check reportaba —los padres sin `inWishlist`— era real pero parcial: faltaba
este segundo desajuste para que el store recibiera el product_id correcto).
**Estado:** FIXED en esta iniciativa.
**Tests:** `wishlistSlice.test.js` — "toggleWishlist (no en lista) agrega con
productId correcto (BUG-WISHLIST-05)" + cobertura E2E (toggle ♡→♥ refleja).
