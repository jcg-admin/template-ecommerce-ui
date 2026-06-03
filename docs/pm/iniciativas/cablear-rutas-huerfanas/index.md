# Iniciativa: cablear-rutas-huerfanas

**Estado:** CERRADA (2026-06-02T19:00:32)
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — auditar rutas/UCs huérfanas y conectarlas.

## Motivo

De 102 rutas en `AppRouter`, **22 no tienen enlace en la UI** (alcanzables solo
tecleando la URL). Es código muerto desde la UX. Complementa
`auditar-rutas-y-flujos` (esa registró páginas sin ruta; esta conecta rutas sin
enlace a la navegación).

## Resultado

Premise Gate por grupo corrigió el alcance: de 22 supuestas, **3 ya estaban
enlazadas** (change-password, notifications/preferences,
variants/:variantId/price), quedando **19 huérfanas reales**, todas cableadas:
2 → AccountLayout (F1), 12 → AdminSidebar (F2), 5 → enlace desde página padre
(F3). Verificación F4: jest 1694/0, check-scss clean, build:demo EXIT=0.
Matriz completa y decisiones en `decisiones-cablear-rutas-huerfanas.md`.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-*.md` | Premisa verificada, qué cubre, fuera de alcance |
| `analisis-rutas-huerfanas.md` | Las huérfanas + clasificación + correcciones de gate |
| `plan-*.md` | Fases F1-F4 (estado HECHA) |
| `progreso-*.md` | Log de ejecución por fase |
| `decisiones-*.md` | Matriz final, decisiones D-01..03, drifts, gates F4 |

## Relación con otras iniciativas

- `auditar-rutas-y-flujos` (En ejecución): complementaria, no solapa.
