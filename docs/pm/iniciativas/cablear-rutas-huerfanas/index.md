# Iniciativa: cablear-rutas-huerfanas

**Estado:** EN ANÁLISIS
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — auditar rutas/UCs huérfanas y conectarlas.

## Motivo

De 102 rutas en `AppRouter`, **22 no tienen enlace en la UI** (alcanzables solo
tecleando la URL). Es código muerto desde la UX. Complementa
`auditar-rutas-y-flujos` (esa registró páginas sin ruta; esta conecta rutas sin
enlace a la navegación).

## Estado actual

Premise Gate 0b → **CONFIRMAR**. 22 huérfanas reales clasificadas por destino:
4 → AccountSidebar, 12 → AdminSidebar, 6 → enlace desde página padre. Detalle y
evidencia en `analisis-rutas-huerfanas.md`.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-*.md` | Premisa verificada, qué cubre, fuera de alcance |
| `analisis-rutas-huerfanas.md` | Las 22 huérfanas + clasificación + no-huérfanas |
| `plan-*.md` | Fases para cablear cada grupo |

## Relación con otras iniciativas

- `auditar-rutas-y-flujos` (En ejecución): complementaria, no solapa.
