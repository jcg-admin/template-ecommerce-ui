# Iniciativa: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Artefacto | INI-UI-002 |
| Tipo | Iniciativa de project management |
| Submodulo | ui (template) |
| Estado | Cerrada |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-20T21:09:03 |
| Fecha de cierre | 2026-05-21 |
| Autor | NestorMonroy |
| Clasificacion | Interno |

## Filosofia rectora de esta iniciativa

**No queremos deuda tecnica salvo que se decida explicitamente lo
contrario.** Cada hallazgo registrado en `riesgos-y-deuda-tecnica/` y
en la iniciativa previa `analizar-ramas-pendientes-de-integracion`
sale de esta iniciativa con uno de tres veredictos, ninguno de los
cuales es "lo dejamos como esta":

1. **Resuelto** — se implementa el cambio que cierra el hallazgo.
2. **Retirado** — el hallazgo era especifico del repositorio fuente y
   no aplica al template; se retira del inventario.
3. **Aceptado con justificacion explicita** — el hallazgo se conserva
   pero se documenta por que se asume su costo. Este veredicto
   requiere aprobacion expresa.

## Que produce esta iniciativa

| Entregable | Estado actual |
|-----------|---------------|
| Analisis de cada hallazgo con opciones de resolucion | Producido. |
| Decision por hallazgo (resuelto / delegado / retirado / aceptado) | Aprobada por el usuario el 2026-05-20. Ver tabla de aprobacion en `analisis-*.md`. |
| Plan de ejecucion en fases con tareas atomicas | Aprobado. Ver `plan-*.md`. |
| Lista plana de tareas con estado | Producida en `tareas-*.md`. |
| Log de progreso | Producido en `progreso-*.md` con 21 cierres de tarea, 7 cierres de fase, 3 replanes, 1 cambio de alcance y 10 hallazgos durante la ejecucion. |
| Implementacion de cada hallazgo resuelto | Completa para H-01, H-03, H-04, H-08; parcial con delegacion para H-02; los 13 historicos retirados en T-001 y T-002. |
| Actualizacion del inventario de riesgos y deuda tras el cierre | Completa en T-024. |
| Documento de decisiones al cierre (obligatorio por PROC-GESTION-001) | Producido en T-025. Ver `decisiones-*.md`. |

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-resolver-hallazgos-de-deuda-del-template.md](alcance-resolver-hallazgos-de-deuda-del-template.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance, inventario de hallazgos H-01 a H-20. |
| [analisis-resolver-hallazgos-de-deuda-del-template.md](analisis-resolver-hallazgos-de-deuda-del-template.md) | Analisis por hallazgo con opciones de resolucion, recomendacion y decision aprobada. |
| [plan-resolver-hallazgos-de-deuda-del-template.md](plan-resolver-hallazgos-de-deuda-del-template.md) | Plan de ejecucion en 7 fases productivas mas cierre, con 21 tareas atomicas T-NNN, dependencias y diagrama mermaid del DAG. |
| [tareas-resolver-hallazgos-de-deuda-del-template.md](tareas-resolver-hallazgos-de-deuda-del-template.md) | Lista plana de las 21 tareas con su estado actual (pendiente, en curso, hecha). |
| [progreso-resolver-hallazgos-de-deuda-del-template.md](progreso-resolver-hallazgos-de-deuda-del-template.md) | Log temporal del avance, con una entrada por evento relevante. |
| [decisiones-resolver-hallazgos-de-deuda-del-template.md](decisiones-resolver-hallazgos-de-deuda-del-template.md) | Documento de cierre obligatorio por PROC-GESTION-001. 7 decisiones de diseno, 10 hallazgos durante la ejecucion, verificacion post-ejecucion y resumen de aportes. |

## Estado vs PROC-GESTION-001

Esta iniciativa esta **cerrada** desde 2026-05-21. Las 21 tareas
atomicas (tras el replan de Fase 5) fueron ejecutadas en orden de
fase, cada una con su commit Tim Pope que referencia el ID del
hallazgo H-NN. El documento de decisiones obligatorio quedo
producido en T-025. Los criterios de completitud declarados en el
alcance se verifican en la seccion 3 del documento de decisiones.
