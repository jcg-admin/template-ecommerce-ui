# Análisis — unificar-navs-cuenta (DR-01)

## Las dos navs (verbatim del código)

### AccountLayout.jsx (canónica, router-level, con test) — 9 entradas
`/account` · `/account/orders` · `/account/wishlist` · `/account/returns` ·
`/support/tickets` · `/account/notifications/preferences` · `/account/profile` ·
`/account/change-password` · `/account/referral` · `/account/search-history`

### AccountSidebar/index.jsx (legacy, embebida en 8 páginas) — 6 entradas
`/account` · `/account/orders` (counter) · `/account/wishlist` (counter) ·
`/account/addresses` (counter) · `/account/profile` · `/account/security`

## Diferencias relevantes

| Item | AccountLayout | AccountSidebar |
|------|---------------|----------------|
| Labels | "Mis favoritos", "Mi perfil" | "Lista de deseos", "Datos personales" |
| `/account/addresses` | **ausente** | presente ("Mis direcciones") |
| `/account/security` | ausente (usa change-password) | presente |
| Contadores | no | sí (orders, wishlist, addresses) |
| returns / support / referral / search-history / notifications | sí | no |

**Conclusión:** AccountLayout es más completa y es la canónica (router-level +
tested). El único item que se perdería al eliminar AccountSidebar es
**`/account/addresses`** → debe agregarse a AccountLayout. La entrada
`/account/security` de AccountSidebar es redundante con `change-password`
(misma página de seguridad); no se migra salvo que se quiera el label.

## Páginas que renderizan AccountSidebar (8)

`AccountPage`, `OrdersPage`, `WishlistPage`, `AddressesPage`, `ProfilePage`,
`ReferralPage`, `SecurityPage`, `SearchHistoryPage`.

Ninguna importa Header/Footer propios (no hay doble chrome), pero sí
renderizan `<AccountSidebar/>` dentro de su contenido → segundo menú.

## Impacto en tests

- `AddressesPage.test.jsx` y `WishlistPage.test.jsx` afirman contenido de
  AccountSidebar ("Mis direcciones", "Lista de deseos"). Hay que ajustarlos
  al quitar el componente.
- `AccountLayout.test.jsx` se amplía con la nueva entrada `addresses`.

## Riesgos

- Cada página tiene un grid (sidebar + contenido). Al quitar el sidebar hay
  que ajustar el markup/grid para que el contenido ocupe el ancho. Revisar el
  `.module.scss` de cada página.
