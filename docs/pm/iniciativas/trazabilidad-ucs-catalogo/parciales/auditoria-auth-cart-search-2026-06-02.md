```yml
artefacto: Auditoria de trazabilidad UC -> codigo (AUTH / CART / WISH / SRCH / COM)
agente: auditor de trazabilidad UCs
tarea: Verificar que los artefactos citados en la matriz existen NOW en el codigo
fecha: 2026-06-02T20:22:58
repo: template-ecommerce-ui
rama: claude/brave-lamport-BUmBM
head: c3e8b98
fuentes:
  - docs/pm/iniciativas/trazabilidad-ucs-catalogo/matriz-trazabilidad-ucs.md (seccion AUTH / CART / WISH / SRCH / COM)
  - /tmp/references/e-comerce-docs/source/requisitos/casos-uso/{auth,cart,wishlist,catalogo,comms}/
herramientas: Bash (ls/find/grep/git), Read
status: completado
```

# Auditoria de trazabilidad — AUTH / CART / WISH / SRCH / COM

## Procedencia

- **Repo HEAD:** `c3e8b98` (rama `claude/brave-lamport-BUmBM`), verificado con
  `git rev-parse --short HEAD`.
- **Fecha:** `2026-06-02T20:22:58` (`date -u`).
- **Alcance:** las 30 filas UC de la seccion "AUTH / CART / WISH / SRCH / COM"
  de `matriz-trazabilidad-ucs.md` (lineas 35-65).
- **Metodo:** existencia de cada artefacto citado via `ls`/`find`; presencia de
  thunks/acciones citadas via `grep -n` sobre el slice; lectura de
  implementacion (`Read`/`sed`) para los dos UC marcados AUSENTE-UI->implementado.
- **Nota de snapshot:** la tabla por familia es un snapshot anterior al cierre
  de la iniciativa. El resumen (lineas 12-18) declara UC-AUTH-16 y UC-SRCH-02
  ya implementados. Esta auditoria confirma que **ambos estan implementados NOW**;
  por tanto las celdas "AUSENTE-UI" de esas dos filas son **stale** respecto al
  codigo actual (esperado, segun la nota del resumen).

## Tabla de verificacion

| UC | Claim (artefacto principal) | Verificado | Evidencia file:line | Discrepancia |
|----|------------------------------|-----------|---------------------|--------------|
| UC-AUTH-01 | RegisterPage + `registerUser` + test | si | `src/pages/auth/RegisterPage.jsx` (existe); `registerUser` en `src/redux/slices/authSlice.js:53`; `tests/unit/pages/RegisterPage.test.jsx` (existe) | — |
| UC-AUTH-02 | LoginPage + `loginUser` + test | si | `src/pages/auth/LoginPage.jsx`; `loginUser` en `authSlice.js:20`; `tests/unit/pages/LoginPage.test.jsx` | — |
| UC-AUTH-03 | `logoutUser` + Header DropdownItem | si | `logoutUser` en `authSlice.js:39`; `src/components/layout/Header/index.jsx:131` `<DropdownItem onClick={handleLogout}>Cerrar sesión</DropdownItem>`, `:54` `dispatch(logoutUser())` | — |
| UC-AUTH-04 | useAuth refresh + 401 en apiService | si | `src/hooks/domain/useAuth.js` (existe); `src/services/apiService.js` (existe) | — |
| UC-AUTH-05 | ProfilePage + `fetchProfile` + test | si | `src/pages/account/ProfilePage.jsx`; `fetchProfile` en `authSlice.js:72`; `tests/unit/pages/ProfilePage.test.jsx` | — |
| UC-AUTH-06 | `updateProfile`/`uploadAvatar` + ProfilePage | si | `updateProfile` en `authSlice.js:85`; `uploadAvatar` en `authSlice.js:343` | — |
| UC-AUTH-07 | AddressesPage + useAddresses + addressesSlice | si | `src/pages/account/AddressesPage.jsx`; `src/hooks/domain/useAddresses.js`; `src/redux/slices/addressesSlice.js` (todos existen) | — |
| UC-AUTH-08 | ChangePasswordPage + `changePassword` | si | `src/pages/account/ChangePasswordPage.jsx`; `changePassword` en `authSlice.js:98` | — |
| UC-AUTH-09 | Forgot/ResetPasswordPage + thunks + tests | si | `src/pages/auth/ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`; `requestPasswordReset` `authSlice.js:323`, `confirmPasswordReset` `authSlice.js:333`; ambos tests existen | — |
| UC-AUTH-10 | VerifyEmailPage + verify/resend thunks | si | `src/pages/auth/VerifyEmailPage.jsx`; `verifyEmail` `authSlice.js:123`, `resendVerificationEmail` `authSlice.js:138` | — |
| UC-AUTH-11 | AdminUsersPage + adminSlice + test | parcial | `src/pages/admin/AdminUsersPage.jsx` (existe); `fetchUsers` en `adminSlice.js:22` | **Test citado ausente:** `tests/unit/pages/AdminUsersPage.test.jsx` no existe (`find tests -iname "*AdminUser*"` -> 0 hits). |
| UC-AUTH-12 | AdminUserDetailPage + adminSlice + test | parcial | `src/pages/admin/AdminUserDetailPage.jsx` (existe) | **Test citado ausente:** `tests/unit/pages/AdminUserDetailPage.test.jsx` no existe (`find` -> 0 hits). |
| UC-AUTH-13 | `suspendUser` en adminUsersSlice/adminSlice | si | `suspendUser` en `adminUsersSlice.js:31` y `adminSlice.js:47` | — |
| UC-AUTH-14 | `reactivateUser` en adminUsersSlice/adminSlice | si | `reactivateUser` en `adminUsersSlice.js:43` y `adminSlice.js:60` | — |
| UC-AUTH-15 | `createUser` en adminSlice + AdminUsersPage | si | `createUser` (`admin/createUser`) en `adminSlice.js:74` | Mismo test ausente que UC-AUTH-11 (`AdminUsersPage.test.jsx`). |
| UC-AUTH-16 | (snapshot: AUSENTE-UI) baja de cuenta | si (implementado NOW) | `deleteAccount` thunk `authSlice.js:155`; `SecurityPage.jsx:118` boton `onClick={() => setConfirmDelete(true)}` -> `:53` `dispatch(deleteAccount())` -> `:55` `navigate('/auth/login')`; ConfirmModal `:127` | **Snapshot stale** (ya implementado). **Drift vs UC canonico:** thunk usa `DELETE /api/v1/auth/account/` (`authSlice.js:160`), el UC-AUTH-16 especifica `POST /api/v1/auth/me/deactivate/` con body `{password}` (rst:71,168,367). La UI **no pide ni envia password** (ConfirmModal sin campo), incumpliendo flujo paso 3 y AC-02 (reautenticacion). |
| UC-CART-01 | `addToCart` + CartPage + test | parcial | `addToCart` en `cartSlice.js:48`; `src/pages/cart/CartPage.jsx` (existe); `tests/unit/reducers/cartSlice.test.js` (existe) | Cita ademas `CartPage.test.jsx`: ese test de pagina **no existe** (ver CART-02). El test de slice si existe. |
| UC-CART-02 | CartPage + `fetchCart` + CartPage.test | parcial | `src/pages/cart/CartPage.jsx`; `fetchCart` en `cartSlice.js:36` | **Test citado ausente:** `tests/unit/pages/CartPage.test.jsx` no existe (`find` -> solo `cartSlice.test.js`, `cartSlice.applyVoucher.test.js`, e2e). |
| UC-CART-03 | `removeCartItem` + CartPage.test | parcial | `removeCartItem` en `cartSlice.js:76` | **Test de pagina citado ausente** (`CartPage.test.jsx`). |
| UC-CART-04 | `applyVoucher`/`removeVoucher` + CartPage.test | si | `applyVoucher` `cartSlice.js:88`, `removeVoucher` `cartSlice.js:104`; cobertura real en `tests/unit/reducers/cartSlice.applyVoucher.test.js` (existe) | El test citado nominalmente (`CartPage.test.jsx`) no existe, pero `cartSlice.applyVoucher.test.js` cubre el thunk. |
| UC-CART-05 | `saveCartForLater` + CartPage.test | parcial | `saveCartForLater` (`UC-CART-05`) `cartSlice.js:116-117` | **Test de pagina citado ausente** (`CartPage.test.jsx`). |
| UC-CART-06 | `syncCartOnLogin` + cartSlice.test | si | `syncCartOnLogin` `cartSlice.js:130`; `tests/unit/reducers/cartSlice.test.js` (existe) | — |
| UC-WISH-01 | AddToWishlistButton + wishlistSlice | si | `src/components/wishlist/AddToWishlistButton.jsx`; `addToWishlist` en `wishlistSlice.js:41` | — |
| UC-WISH-02 | WishlistPage + useWishlist + tests | parcial | `src/pages/account/WishlistPage.jsx`; `src/hooks/domain/useWishlist.js` (existen) | **Tests citados ausentes:** `tests/unit/pages/WishlistPage.test.jsx` y `tests/unit/hooks/useWishlist.test.jsx` no existen (`find tests -iname "*ishlist*"` -> solo e2e). |
| UC-WISH-03 | move-to-cart + WishlistPage.test + wishlistSlice.test | parcial | `moveWishlistItemToCart` (`wishlist/moveToCart`) `wishlistSlice.js:69`; alias `moveToCart` `:200` | **Tests citados ausentes:** `WishlistPage.test.jsx` y `tests/unit/reducers/wishlistSlice.test.js` no existen. |
| UC-SRCH-01 | SearchBar + useSearch | si | `src/components/catalog/SearchBar.jsx`; `src/hooks/domain/useSearch.js` (existen) | — |
| UC-SRCH-02 | (snapshot: AUSENTE-UI) autocomplete | si (implementado NOW) | `src/hooks/domain/useSearchSuggestions.js` (debounce 250ms, MIN_LENGTH 2, `GET /api/v1/catalogue/search/suggestions/`); `SearchBar.jsx:25` `useSearchSuggestions(value)`, `:127-134` dropdown `role="listbox"` con sugerencias, `:55-57` select->runSearch | **Snapshot stale** (ya implementado). **Drift menor vs UC canonico:** endpoint impl `/api/v1/catalogue/search/suggestions/` vs UC `/api/v1/catalogue/autocomplete/` (rst:404); debounce 250ms vs 300ms especificado (rst:64,133). Funcionalmente cumple el flujo (sugerencias en vivo, debounce, dropdown <=N, Enter->SRCH-01). |
| UC-SRCH-03 | SearchHistoryPage + hook + slice | si | `src/pages/account/SearchHistoryPage.jsx`; `src/hooks/domain/useSearchHistory.js`; `src/redux/slices/searchHistorySlice.js` (existen) | — |
| UC-COM-01 | ContactPage + contactSlice + test | parcial | `src/pages/ContactPage.jsx`; `sendContactMessage` en `contactSlice.js:28` | **Test citado ausente:** `tests/unit/pages/ContactPage.test.jsx` no existe (`find tests -iname "*ontact*"` -> 0 hits). |
| UC-COM-02 | AdminContactMessagesPage + useContactMessages + slice | si | `src/pages/admin/AdminContactMessagesPage.jsx`; `src/hooks/domain/useContactMessages.js`; `markContactMessageRead` `contactSlice.js:46` | — |
| UC-COM-03 | AdminContactMessageDetailPage + slice | si | `src/pages/admin/AdminContactMessageDetailPage.jsx`; `replyContactMessage` `contactSlice.js:59` | — |

## Detalle de los dos UC marcados AUSENTE-UI -> implementado

### UC-AUTH-16 — Dar de baja la cuenta (RST: `auth/uc-auth-16-dar-de-baja-cuenta.rst`)

- **Flujo canonico (rst:156-189):** boton "Dar de baja" -> pagina de
  confirmacion con advertencia -> usuario **introduce su password** y confirma
  -> `POST /api/v1/auth/me/deactivate/ {password}` -> 200 -> limpia auth y
  redirige al home.
- **Implementacion NOW:** `SecurityPage.jsx` tiene la tarjeta "Eliminar cuenta"
  con boton cableado (`:118`) que abre `ConfirmModal` (`:127`); al confirmar,
  `handleDeleteAccount` (`:50-60`) despacha `deleteAccount()` y navega a
  `/auth/login`. El thunk `deleteAccount` (`authSlice.js:155-164`) llama
  `apiService.delete('/api/v1/auth/account/')`.
- **Veredicto:** la accion de baja existe en UI y esta cableada (la celda
  AUSENTE-UI del snapshot es stale). **Acceptance parcialmente satisfecha:**
  - Falla la **reautenticacion por password** (flujo paso 3, AC-02): la UI no
    presenta campo de password ni lo envia.
  - **Drift de endpoint:** UI usa `DELETE /api/v1/auth/account/`, el UC
    especifica `POST /api/v1/auth/me/deactivate/`. Drift codigo<->UC sin cerrar.

### UC-SRCH-02 — Autocomplete (RST: `catalogo/uc-srch-02-autocomplete.rst`)

- **Flujo canonico (rst:128-152, alcance rst:60-64):** >=2 chars -> debounce
  300ms -> consulta sugerencias -> dropdown con hasta 5 sugerencias ->
  seleccionar/Enter ejecuta UC-SRCH-01.
- **Implementacion NOW:** `useSearchSuggestions` aplica debounce (250ms),
  `MIN_LENGTH=2`, query deshabilitada bajo el minimo, golpea
  `GET /api/v1/catalogue/search/suggestions/?q=`. `SearchBar` consume el hook
  (`:25`), renderiza dropdown `role="listbox"` (`:127`), navegacion por teclado
  (`:64-70`) y `handleSelect` -> `runSearch` (`:55-57`).
- **Veredicto:** acceptance **satisfecha funcionalmente** (sugerencias en vivo,
  debounce, dropdown, seleccion->busqueda completa). La celda AUSENTE-UI del
  snapshot es stale. **Drift menor de documentacion:** endpoint y debounce
  difieren del UC (`/search/suggestions/` vs `/autocomplete/`; 250ms vs 300ms).

## Observacion de contexto (refactor de HEAD)

- `AccountSidebar` fue **eliminado**: `find src -iname "*AccountSidebar*"` -> 0
  hits y `grep -rn "AccountSidebar" src/` -> 0 referencias. Ningun row de esta
  familia lo cita, asi que no afecta a una fila UC concreta; confirma el refactor
  de cuentas mencionado.

## Conclusion

- **Filas UC auditadas:** 30.
- **CONFIRMED (artefacto principal + evidencia citada coinciden, sin drift de
  acceptance):** 18 — UC-AUTH-01..10, AUTH-13, AUTH-14, CART-04, CART-06,
  WISH-01, SRCH-01, SRCH-03, COM-02, COM-03.
- **DISCREPANCIES:** 12.

### Lista de discrepancias

1. **UC-AUTH-11** — test citado `tests/unit/pages/AdminUsersPage.test.jsx` no
   existe (codigo principal si existe).
2. **UC-AUTH-12** — test citado `tests/unit/pages/AdminUserDetailPage.test.jsx`
   no existe (codigo principal si existe).
3. **UC-AUTH-15** — test citado `AdminUsersPage.test.jsx` no existe.
4. **UC-AUTH-16** — snapshot AUSENTE-UI stale (ya implementado); ademas drift:
   thunk usa `DELETE /api/v1/auth/account/` vs UC `POST /me/deactivate/` y la UI
   no reautentica por password (incumple flujo paso 3 / AC-02).
5. **UC-CART-01** — test de pagina citado `CartPage.test.jsx` no existe (test de
   slice si).
6. **UC-CART-02** — test citado `tests/unit/pages/CartPage.test.jsx` no existe.
7. **UC-CART-03** — test de pagina citado `CartPage.test.jsx` no existe.
8. **UC-CART-05** — test de pagina citado `CartPage.test.jsx` no existe.
9. **UC-WISH-02** — tests citados `WishlistPage.test.jsx` y
   `useWishlist.test.jsx` no existen.
10. **UC-WISH-03** — tests citados `WishlistPage.test.jsx` y
    `tests/unit/reducers/wishlistSlice.test.js` no existen.
11. **UC-SRCH-02** — snapshot AUSENTE-UI stale (ya implementado); drift menor de
    endpoint (`/search/suggestions/` vs `/autocomplete/`) y debounce (250 vs
    300ms). Acceptance funcional satisfecha.
12. **UC-COM-01** — test citado `tests/unit/pages/ContactPage.test.jsx` no
    existe (codigo principal si existe).

> Patron dominante de discrepancia: **evidencia de test stale** — la matriz cita
> archivos de test (`*Page.test.jsx`, varios `*Slice.test.js`/`*.test.jsx`) que
> no existen en el arbol NOW; el componente/slice/hook principal de cada fila SI
> existe en todos los casos. Las dos filas AUSENTE-UI del snapshot estan ahora
> implementadas (con drifts documentados frente al UC canonico).
