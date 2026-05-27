# Iniciativa: adaptar-sistema-diseno-yoruba

| Campo | Valor |
|-------|-------|
| Slug | `adaptar-sistema-diseno-yoruba` |
| Estado | Cerrada |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-27T07:41:35 |
| Fecha de apertura formal | 2026-05-27T07:41:35 |
| Fecha de paso a ejecucion | 2026-05-27T07:41:35 |
| Fecha de cierre | 2026-05-27T22:15:00 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

El template tiene el sistema de diseno generico del bootstrap inicial.
Se recibe el paquete de referencia `dist-yoruba-ui` (8 versiones de
migracion, 102 archivos) con el sistema de diseno editorial de
**Practica Yoruba**: paleta del brazalete (verde lima + rojo vino +
bronce + coral), tipografia Fraunces + IBM Plex, tema oscuro completo
(`$bg-page: #0E1400`), y componentes y paginas re-skinadas.

El paquete no es un drop-in directo. No se puede aplicar con `cp -R`
porque tiene rutas en espanol vs nuestras rutas en ingles, un shape
de producto distinto (`image_url` vs `images[0].url`), action creators
que no existen en nuestros slices, y un `_variables.scss` que es un
reemplazo total del tema. La adaptacion es selectiva por fases.

Ver analisis completo en `analisis-adaptar-sistema-diseno-yoruba.md`.

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-27T07:41:35. F0 completada.
Iniciativa cerrada. Ver decisiones-adaptar-sistema-diseno-yoruba.md.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-adaptar-sistema-diseno-yoruba.md](alcance-adaptar-sistema-diseno-yoruba.md) | Que cubre, criterio de completitud, fuera de alcance. |
| [analisis-adaptar-sistema-diseno-yoruba.md](analisis-adaptar-sistema-diseno-yoruba.md) | Inventario del paquete, 8 hallazgos, decisiones pendientes. |
| [plan-adaptar-sistema-diseno-yoruba.md](plan-adaptar-sistema-diseno-yoruba.md) | Fases, DAG y descripcion de entregables por fase. |
| [tareas-adaptar-sistema-diseno-yoruba.md](tareas-adaptar-sistema-diseno-yoruba.md) | Lista plana de tareas con estado. |
| [decisiones-adaptar-sistema-diseno-yoruba.md](decisiones-adaptar-sistema-diseno-yoruba.md) | Decisiones de diseno, hallazgos de ejecucion, verificacion post-ejecucion. |
| [progreso-adaptar-sistema-diseno-yoruba.md](progreso-adaptar-sistema-diseno-yoruba.md) | Log del avance con timestamps reales. |
