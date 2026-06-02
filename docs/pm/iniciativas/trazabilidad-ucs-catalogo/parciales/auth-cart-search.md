## AUTH / CART / WISH / SRCH / COM

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-AUTH-01 | registrar | IMPLEMENTADO | `src/pages/auth/RegisterPage.jsx` + `registerUser` en `src/redux/slices/authSlice.js`; tests `tests/unit/pages/RegisterPage.test.jsx`. |
| UC-AUTH-02 | login | IMPLEMENTADO | `src/pages/auth/LoginPage.jsx` + `loginUser` en `src/redux/slices/authSlice.js`; test `tests/unit/pages/LoginPage.test.jsx`. |
| UC-AUTH-03 | logout | IMPLEMENTADO | `logoutUser` en `src/redux/slices/authSlice.js`; disparado desde `src/components/layout/Header/index.jsx` (DropdownItem "Cerrar sesión"). |
| UC-AUTH-04 | renovar sesion | IMPLEMENTADO | `src/hooks/domain/useAuth.js` (`refresh` -> `getCurrentUser`) y manejo de 401 en `src/services/apiService.js`; tokens JWT en cookies httpOnly gestionados por backend (parte server es BACKEND). El gancho de revalidación de sesión sí existe en UI. |
| UC-AUTH-05 | ver perfil | IMPLEMENTADO | `src/pages/account/ProfilePage.jsx` + `fetchProfile` en `authSlice.js`; test `tests/unit/pages/ProfilePage.test.jsx`. |
| UC-AUTH-06 | editar perfil | IMPLEMENTADO | `updateProfile`/`uploadAvatar` en `authSlice.js`; `ProfilePage.jsx` y test asociado. |
| UC-AUTH-07 | gestionar direcciones | IMPLEMENTADO | `src/pages/account/AddressesPage.jsx`, `src/hooks/domain/useAddresses.js`, `src/redux/slices/addressesSlice.js`; ruta en `src/router/AppRouter.jsx`. |
| UC-AUTH-08 | cambiar contrasena | IMPLEMENTADO | `src/pages/account/ChangePasswordPage.jsx` + `changePassword` en `authSlice.js`; ruta en `AppRouter.jsx`. |
| UC-AUTH-09 | recuperar contrasena | IMPLEMENTADO | `src/pages/auth/ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx` + `requestPasswordReset`/`confirmPasswordReset` en `authSlice.js`; tests `tests/unit/pages/ForgotPasswordPage.test.jsx` y `ResetPasswordPage.test.jsx`. |
| UC-AUTH-10 | verificar email | IMPLEMENTADO | `src/pages/auth/VerifyEmailPage.jsx` + `verifyEmail`/`resendVerificationEmail` en `authSlice.js`; ruta en `AppRouter.jsx`. (Envío real del correo = BACKEND.) |
| UC-AUTH-11 | ver usuarios admin | IMPLEMENTADO | `src/pages/admin/AdminUsersPage.jsx` + `src/redux/slices/adminSlice.js` (listado); test `AdminUsersPage.test.jsx`. |
| UC-AUTH-12 | ver perfil usuario admin | IMPLEMENTADO | `src/pages/admin/AdminUserDetailPage.jsx` + `adminSlice.js`; test `AdminUserDetailPage.test.jsx`. |
| UC-AUTH-13 | suspender usuario | IMPLEMENTADO | `suspendUser` en `src/redux/slices/adminUsersSlice.js`/`adminSlice.js`; acción desde `AdminUserDetailPage.jsx`. |
| UC-AUTH-14 | reactivar usuario | IMPLEMENTADO | `reactivateUser` en `adminUsersSlice.js`/`adminSlice.js`; `AdminUserDetailPage.jsx`. |
| UC-AUTH-15 | crear usuario admin | IMPLEMENTADO | `createUser` en `src/redux/slices/adminSlice.js`; flujo en `AdminUsersPage.jsx`; test `AdminUsersPage.test.jsx`. |
| UC-AUTH-16 | dar de baja cuenta | AUSENTE-UI | `src/pages/account/SecurityPage.jsx` muestra una tarjeta "Eliminar cuenta" con botón "Solicitar eliminación" pero sin `onClick`/thunk; no existe acción `deleteAccount`/`deactivateAccount` en `authSlice.js`. Faltaría: cablear el botón a un thunk de baja + confirmación. |
| UC-CART-01 | agregar producto | IMPLEMENTADO | `addToCart` en `src/redux/slices/cartSlice.js`; usado en `src/pages/cart/CartPage.jsx`; tests `cartSlice.test.js`. |
| UC-CART-02 | ver carrito | IMPLEMENTADO | `src/pages/cart/CartPage.jsx` + `fetchCart` en `cartSlice.js`; test `CartPage.test.jsx`. |
| UC-CART-03 | eliminar item | IMPLEMENTADO | `removeCartItem` en `cartSlice.js`; cubierto en `CartPage.test.jsx`. |
| UC-CART-04 | aplicar cupon | IMPLEMENTADO | `applyVoucher`/`removeVoucher` en `cartSlice.js` (equivalencia cupon=voucher); test `CartPage.test.jsx`. |
| UC-CART-05 | guardar carrito | IMPLEMENTADO | `saveCartForLater` en `cartSlice.js` (marcado UC-CART-05); test `CartPage.test.jsx`. |
| UC-CART-06 | sincronizar carrito | IMPLEMENTADO | `syncCartOnLogin` en `cartSlice.js`; test `cartSlice.test.js`. |
| UC-WISH-01 | agregar a wishlist | IMPLEMENTADO | `src/components/wishlist/AddToWishlistButton.jsx` + `wishlistSlice.js`; tests asociados. |
| UC-WISH-02 | ver lista deseos | IMPLEMENTADO | `src/pages/account/WishlistPage.jsx`, `src/hooks/domain/useWishlist.js`, `wishlistSlice.js`; tests `WishlistPage.test.jsx`, `useWishlist.test.jsx`. |
| UC-WISH-03 | mover wishlist carrito | IMPLEMENTADO | Acción de mover a carrito en `wishlistSlice.js`; cubierto en `WishlistPage.test.jsx` y `wishlistSlice.test.js`. |
| UC-SRCH-01 | fulltext search | IMPLEMENTADO | `src/components/catalog/SearchBar.jsx` + `src/hooks/domain/useSearch.js` (GET `/api/v1/catalogue/search/`). |
| UC-SRCH-02 | autocomplete | AUSENTE-UI | Existe el primitivo genérico `src/components/common/Autocomplete/Autocomplete.jsx` y se importa en `SearchBar.jsx`, pero el campo real es un `<input type="search">` con búsqueda solo al submit; ni `SearchBar` ni `SearchModal` cablean sugerencias en vivo a un endpoint. Faltaría: conectar el Autocomplete a un thunk/endpoint de sugerencias con debounce. |
| UC-SRCH-03 | historial busquedas | IMPLEMENTADO | `src/pages/account/SearchHistoryPage.jsx`, `src/hooks/domain/useSearchHistory.js`, `src/redux/slices/searchHistorySlice.js`; ruta en `AppRouter.jsx`. |
| UC-COM-01 | formulario contacto | IMPLEMENTADO | `src/pages/ContactPage.jsx` + `src/redux/slices/contactSlice.js`; ruta en `AppRouter.jsx`; test `ContactPage.test.jsx`. |
| UC-COM-02 | ver mensajes contacto | IMPLEMENTADO | `src/pages/admin/AdminContactMessagesPage.jsx` + `src/hooks/domain/useContactMessages.js` + `contactSlice.js`; test asociado. |
| UC-COM-03 | responder mensaje contacto | IMPLEMENTADO | `src/pages/admin/AdminContactMessageDetailPage.jsx` + `useContactMessages.js` + `contactSlice.js`; test asociado. (Envío real del correo de respuesta = BACKEND.) |
