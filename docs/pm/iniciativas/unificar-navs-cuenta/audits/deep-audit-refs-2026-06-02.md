.. reporte::
   :agente: deep-audit (read-only sobre codigo)
   :tarea: Auditoria de la iniciativa unificar-navs-cuenta (reuso de componentes + contrato canonico)
   :fecha: 2026-06-02
   :herramientas: Read, Grep, Bash (git show, grep, sed), refs e-comerce-docs casos-uso
   :basado-en: HEAD fa4c8d4 (post fb73421 "Unify account nav into AccountLayout (DR-01)")

```yml
created_at: 2026-06-02 21:59:09
project: template-ecommerce-ui
iniciativa: unificar-navs-cuenta
status: Aprobado
version: 1.0.0
author: claude
```

# Deep audit — unificar-navs-cuenta (refs -progress/ui-core + casos-uso canonicos)

## Alcance verificado

- Commit de consolidacion: `fb73421` "Unify account nav into AccountLayout (DR-01)".
- Nav canonica unica: `src/layouts/AccountLayout.jsx` `NAV_ITEMS` (lineas 15-27)
  con `<NavLink>` (lineas 49-60).
- Componente `src/components/account/AccountSidebar` eliminado en `fb73421`
  (verificado: `grep -rn "AccountSidebar" src/` → 0 referencias en codigo de
  produccion).
- 8 paginas que perdieron el sidebar: AccountPage, AddressesPage, OrdersPage,
  ProfilePage, ReferralPage, SearchHistoryPage, SecurityPage, WishlistPage.

## Metodo de verificacion (PROVEN)

- Reuso de componentes: lectura de cada pagina + grep de widgets raw
  (`<progress`, `role="tab"`, `role="switch"`, `type="checkbox"`, `<select`,
  `completenessBar`) y de los imports de `@components/common`.
- Colapso de grid: `grep -n "grid-template-columns|\.layout"` en los 8 `.module.scss`
  + `grep "styles.(layout|sidebar|main)"` en los 8 `.jsx`.
- Contrato: resolucion de cada `to=` de `NAV_ITEMS` contra `path="..."` en
  `src/router/AppRouter.jsx`, y cotejo con UCs canonicos en
  `/tmp/references/e-comerce-docs/source/requisitos/casos-uso/`.

--------

## Tabla 1 — Componentes (Axis 1)

| Archivo:linea | Hallazgo | Severidad | Recomendación |
|---|---|---|---|
| `src/layouts/AccountLayout.jsx:48-60` | Nav canonica implementada con `<NavLink>` nativo dentro de `<nav aria-label="Menu de cuenta">`. Es el patron correcto para nav de ruteo: NO debe ser un componente adaptado (Tabs/TreeView no aplican a navegacion de rutas). CONFIRMADO. | — | Ninguna. Mantener `<NavLink>`. |
| `src/pages/account/*.jsx` (8 paginas) | Tras remover `AccountSidebar`, `grep -rn "AccountSidebar\|styles.sidebar" src/pages/account/` → 0 hits. No queda import muerto ni `<aside>` huerfano. Los `styles.sidebar` restantes (`CatalogPage.jsx:229`, `AdminStaticPageEditorPage.jsx:134`, `layout/Sidebar.jsx`, `AccountLayout.jsx:36`) son de otros contextos, validos. CONFIRMADO. | — | Ninguna. |
| `src/pages/account/AccountPage.jsx:49-117` / `AddressesPage.jsx:40` / `OrdersPage.jsx:49` / `ProfilePage.jsx:51` / `ReferralPage.jsx:68` / `SearchHistoryPage.jsx:38` / `SecurityPage.jsx:73` / `WishlistPage.jsx:33` | El `<div className={styles.layout}>` envuelve UN solo `<section>` hijo en cada pagina; el grid `.layout` se colapso de `260px 1fr` a `1fr`. No hay columna vacia ni hijo huerfano. CONFIRMADO. | — | Ninguna. |
| `src/pages/account/*.module.scss` (8) | `grid-template-columns: 1fr` en `.layout` de las 8 (AccountPage:50, AddressesPage:20, OrdersPage:23, ProfilePage:23, ReferralPage:22, SearchHistoryPage:22, SecurityPage:20, WishlistPage:24). Media query `$bp-md` tambien `1fr` (no-op redundante pero inofensivo). CONFIRMADO. | BAJA | Opcional: eliminar la regla `@media $bp-md { grid-template-columns: 1fr }` por redundante (ya es `1fr` en base). Cosmetico. |
| Render JSX (8 paginas) | No se produce `class="undefined"`: los 8 wrappers usan `styles.layout` (existe en cada modulo) y ningun JSX referencia una clase removida. CONFIRMADO (grep `styles.sidebar` en paginas = 0). | — | Ninguna. |
| `src/pages/account/AccountPage.jsx:60-62` | Barra de progreso construida a mano (`<div className={styles.completenessBar}><div style={{width: '${completeness}%'}}/></div>`) en vez del componente adaptado `ProgressBar` (existe en `src/components/common/ProgressBar`). PRE-EXISTENTE, no introducido por esta iniciativa (la consolidacion solo quito el sidebar). | BAJA | Fuera del alcance de unificar-navs-cuenta. Considerar migrar a `<ProgressBar value={completeness} />` en una iniciativa de design-system. |
| `src/pages/account/{SecurityPage,ProfilePage}.jsx` | Formularios usan los primitivos adaptados `Field`, `Button`, `MetaTag`, `Card` (SecurityPage:16,85-87,120; ProfilePage:13,81-84). No hay `<input>`/`<select>` raw que debiera ser componente adaptado. CONFIRMADO. | — | Ninguna. |

## Tabla 2 — Contrato canonico (Axis 2)

| Archivo:linea | Hallazgo | Severidad | Recomendación |
|---|---|---|---|
| `AccountLayout.jsx:16` `/account` | Resuelve a `AppRouter.jsx:207` `path="account"`. CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:17` `/account/orders` | Resuelve a `AppRouter.jsx:208`. CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:18` `/account/wishlist` | Resuelve a `AppRouter.jsx:212`. CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:19` `/account/addresses` | Resuelve a `AppRouter.jsx:218` (UC-AUTH-07, `:test: AddressesPage.test.jsx`). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:20` `/account/returns` | Resuelve a `AppRouter.jsx:221`. CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:21` `/support/tickets` | Resuelve a `AppRouter.jsx:242` (bajo AccountLayout). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:22` `/account/notifications/preferences` | Resuelve a `AppRouter.jsx:229` (UC-NOT-06 "Gestionar Preferencias de Notificacion"). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:23` `/account/profile` | Resuelve a `AppRouter.jsx:213` (UC-AUTH-05/06). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:24` `/account/change-password` | Resuelve a `AppRouter.jsx:216` (UC-AUTH-08, `:test: ChangePasswordPage.test.jsx`). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:25` `/account/referral` | Resuelve a `AppRouter.jsx:214` (UC-PRO-05 "Codigo Referral", panel «Mis Referidos» desde el perfil). CONFIRMADO. | — | Ninguna. |
| `AccountLayout.jsx:26` `/account/search-history` | Resuelve a `AppRouter.jsx:220` (UC-SRCH-03 historial-busquedas). CONFIRMADO. | — | Ninguna. |
| `AppRouter.jsx:211` `account/security` (SecurityPage) vs `AccountLayout.jsx:15-27` | DISCREPANCIA: la ruta `/account/security` (SecurityPage: cambio de contrasena + sesiones activas + baja de cuenta) existe y esta protegida, pero NO tiene entrada en `NAV_ITEMS`. La nav apunta a `/account/change-password` (`ChangePasswordPage`, otra pagina). `SecurityPage` queda navegable solo por URL directa y por el QuickCard `AccountPage.jsx:117`. El sidebar viejo SI listaba "Seguridad" → `/account/security` (`git show fb73421~1:src/components/account/AccountSidebar/index.jsx`). | MEDIA | Decidir el contrato: (a) anadir entrada "Seguridad" → `/account/security` a `NAV_ITEMS` y quitar el solapamiento con change-password, o (b) consolidar `SecurityPage`/`ChangePasswordPage` en una sola. Documentar la decision. |
| `AccountPage.jsx:117` QuickCard `/account/security` vs nav `/account/change-password` | Drift de coherencia: el dashboard ofrece "Seguridad" (`/account/security`) mientras la nav lateral ofrece "Cambiar contrasena" (`/account/change-password`). Dos rutas distintas para una intencion solapada (cambio de password). | MEDIA | Alinear ambos destinos a la misma ruta canonica una vez resuelta la discrepancia anterior. |
| UC-AUTH-16 (`uc-auth-16-dar-de-baja-cuenta.rst`) → `ui/src/pages/account/DeactivateAccountPage.jsx` vs `SecurityPage.jsx` | El UC canonico nombra `DeactivateAccountPage.jsx` (no presente en este repo: `ls` → NOT PRESENT); la baja de cuenta vive inline en `SecurityPage`. Drift doc↔codigo pre-existente, no introducido por esta iniciativa. | BAJA | Fuera de alcance de unificar-navs-cuenta. Registrar como drift UC-AUTH-16 para una iniciativa de alineacion UC↔UI. |

--------

## Conclusion

- **CONFIRMED:** 17 items.
  - Axis 1 (Componentes): 6 confirmados (nav con `<NavLink>` correcta; 0 refs
    muertas a AccountSidebar; `.layout` colapsado a `1fr` en 8 paginas sin
    columna vacia; sin `class="undefined"`; primitivos adaptados en formularios).
  - Axis 2 (Contrato): 11/11 entradas de `NAV_ITEMS` resuelven a rutas reales
    en `AppRouter.jsx`, y las rutas canonicas (UC-AUTH-07/08, UC-NOT-06,
    UC-PRO-05, UC-SRCH-03) coinciden con las paginas referenciadas por los UCs.

- **DISCREPANCIES:** 4 items.
  - MEDIA x2: `/account/security` (SecurityPage, una de las 8 paginas que
    perdio el sidebar) NO esta en la nav canonica; ademas dashboard QuickCard
    (`/account/security`) y nav (`/account/change-password`) divergen para la
    misma intencion. Esto es deuda de contrato del area de cuenta que la
    unificacion de nav dejo expuesta (el sidebar viejo SI listaba Seguridad).
  - BAJA x2: `completenessBar` raw en vez de `ProgressBar` adaptado
    (pre-existente); drift UC-AUTH-16 (`DeactivateAccountPage.jsx` inexistente,
    baja inline en SecurityPage). Ambos fuera del alcance de esta iniciativa.

El nucleo de la iniciativa (nav unica en AccountLayout, eliminacion de
AccountSidebar, colapso de grids) esta CORRECTO y limpio. La discrepancia MEDIA
mas relevante es la cobertura de `/account/security` por la nav canonica.
