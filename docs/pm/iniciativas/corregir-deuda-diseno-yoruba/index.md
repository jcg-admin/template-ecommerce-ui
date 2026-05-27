# Iniciativa: corregir-deuda-diseno-yoruba

| Campo | Valor |
|-------|-------|
| Slug | `corregir-deuda-diseno-yoruba` |
| Estado | En ejecucion |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-27T19:14:49 |
| Fecha de apertura formal | 2026-05-27T19:14:49 |
| Fecha de paso a ejecucion | 2026-05-27T19:14:49 |
| Iniciativa origen | adaptar-sistema-diseno-yoruba |

## Motivo de existencia

La iniciativa `adaptar-sistema-diseno-yoruba` documento tres bloques de
deuda tecnica al cerrar:

1. **197 tests de componentes fallan** en 18 suites. Los tests buscan
   texto, roles y shapes de datos del diseno anterior. El analisis
   (Gate 0b) revelo dos causas distintas: markup HTML cambiado Y shapes
   de datos incompatibles (ej. `item.name` vs `item.product_name` en
   CartPage).

2. **`_variables.scss` tiene 4 bloques de aliases de compatibilidad**
   con 18 variables del tema anterior (`$color-danger`, `$gray-*`,
   `$white`, `$bg-surface`, etc.) que mapean nombres heredados a la
   nueva paleta. Son 84 archivos SCSS con 149 ocurrencias. Sin
   corregirlos, el mapa semantico del tema queda fragmentado.

3. **`NotFoundPage` no fue adaptada** al diseno Yoruba. La referencia
   tiene 30 lineas (con `MetaTag`, `Button`, rutas EN, tipografia
   editorial). Nuestro repo tiene la version anterior de 19 lineas.

Esta iniciativa corrige los tres bloques sin crear nueva deuda.

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-27T19:14:49.
Siguiente: F1 — corregir tests de componentes.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-corregir-deuda-diseno-yoruba.md](alcance-corregir-deuda-diseno-yoruba.md) | Que cubre, criterio de completitud, fuera de alcance. |
| [analisis-corregir-deuda-diseno-yoruba.md](analisis-corregir-deuda-diseno-yoruba.md) | Hallazgos con evidencia de codigo y evidencia del Gate. |
| [plan-corregir-deuda-diseno-yoruba.md](plan-corregir-deuda-diseno-yoruba.md) | Fases y descripcion de entregables. |
| [tareas-corregir-deuda-diseno-yoruba.md](tareas-corregir-deuda-diseno-yoruba.md) | Lista plana de tareas con estado. |
| [progreso-corregir-deuda-diseno-yoruba.md](progreso-corregir-deuda-diseno-yoruba.md) | Log del avance con timestamps reales. |
