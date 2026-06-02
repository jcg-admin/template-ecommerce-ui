# Iniciativa: unificar-navs-cuenta (DR-01)

**Estado:** PLANEADA (sin ejecutar)
**Creada:** 2026-06-02
**Origen:** Drift DR-01 documentado al cerrar `cablear-rutas-huerfanas`.

## Motivo

El área `/account/*` renderiza **dos navegaciones simultáneas** con listas
distintas:

- `src/layouts/AccountLayout.jsx` — nav **canónica**, a nivel de router
  (`<Route element={<AccountLayout/>}>`), con test (`AccountLayout.test.jsx`).
  9 entradas.
- `src/components/account/AccountSidebar/index.jsx` — componente **legacy**
  embebido dentro de 8 páginas de cuenta. 6 entradas, con contadores.

El comprador ve dos menús de cuenta que no coinciden (labels y items
distintos). Es un drift de UX/arquitectura.

## Objetivo

Una sola fuente de navegación de cuenta: **AccountLayout**. Eliminar
`AccountSidebar` migrando lo único que aporta (entrada `addresses` y los
contadores) a AccountLayout.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-unificar-navs-cuenta.md` | Premisa verificada + alcance |
| `analisis-unificar-navs-cuenta.md` | Comparación de ambas navs + impacto |
| `plan-unificar-navs-cuenta.md` | Fases F1-F4 con tareas atómicas |
