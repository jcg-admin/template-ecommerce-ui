# Alcance — unificar-navs-cuenta (DR-01)

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0b |
| Red flags activos | RF-5 (estructura contradice comportamiento esperado: dos navs) |
| Resultado | **CONFIRMAR** |
| Evidencia | `grep "to: '/account" src/layouts/AccountLayout.jsx` → 9 entradas (router-level). `grep "to: '/account" src/components/account/AccountSidebar/index.jsx` → 6 entradas. `grep -rln AccountSidebar src/pages/account/` → 8 páginas la renderizan dentro de su contenido. `AccountSidebar` no se usa fuera de `pages/account/`. |
| Iniciativas previas revisadas | `cablear-rutas-huerfanas` @ `f6391a7` (documentó el drift DR-01) |

## Qué cubre

- Migrar a `AccountLayout.NAV_ITEMS` lo único que AccountSidebar aporta y no
  está ya: la entrada **`addresses`** (`/account/addresses`, "Mis direcciones")
  y, si se decide conservarlos, los **contadores** (pedidos, deseos,
  direcciones).
- Eliminar `<AccountSidebar/>` (import + uso) de las 8 páginas de cuenta.
- Eliminar el componente `AccountSidebar/` (index.jsx + .module.scss).
- Actualizar tests de página que afirmaban contenido de AccountSidebar
  (`AddressesPage.test.jsx`, `WishlistPage.test.jsx`).

## Fuera de alcance

- Rediseño visual del AccountLayout (solo se unifica la fuente de nav).
- Tocar la nav admin (esa ya es fuente única, BUG-S03).

## Criterio de completitud

- Una sola nav de cuenta renderizada (AccountLayout); 0 referencias a
  `AccountSidebar` en `src/`.
- Ninguna entrada de nav perdida (addresses presente en AccountLayout).
- Gates verdes: jest completo, check-scss, build:demo.
