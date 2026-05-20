# Iniciativa: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Artefacto | INI-UI-002 |
| Tipo | Iniciativa de project management |
| Submodulo | ui (template) |
| Estado | En ejecucion |
| Version | 0.1.0 |
| Fecha de creacion | 2026-05-20T21:09:03 |
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
| Log de progreso | Iniciado en `progreso-*.md`. |
| Implementacion de cada hallazgo resuelto | Pendiente (T-001 a T-023). |
| Actualizacion del inventario de riesgos y deuda tras el cierre | Pendiente (T-024). |
| Documento de decisiones al cierre (obligatorio por PROC-GESTION-001) | Pendiente (T-025). |

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-resolver-hallazgos-de-deuda-del-template.md](alcance-resolver-hallazgos-de-deuda-del-template.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance, inventario de hallazgos H-01 a H-20. |
| [analisis-resolver-hallazgos-de-deuda-del-template.md](analisis-resolver-hallazgos-de-deuda-del-template.md) | Analisis por hallazgo con opciones de resolucion, recomendacion y decision aprobada. |
| [plan-resolver-hallazgos-de-deuda-del-template.md](plan-resolver-hallazgos-de-deuda-del-template.md) | Plan de ejecucion en 7 fases productivas mas cierre, con 21 tareas atomicas T-NNN, dependencias y diagrama mermaid del DAG. |
| [tareas-resolver-hallazgos-de-deuda-del-template.md](tareas-resolver-hallazgos-de-deuda-del-template.md) | Lista plana de las 21 tareas con su estado actual (pendiente, en curso, hecha). |
| [progreso-resolver-hallazgos-de-deuda-del-template.md](progreso-resolver-hallazgos-de-deuda-del-template.md) | Log temporal del avance, con una entrada por evento relevante. |
| decisiones-resolver-hallazgos-de-deuda-del-template.md | Pendiente. Se crea al cierre con las tres secciones obligatorias por PROC-GESTION-001. |

## Estado vs PROC-GESTION-001

Esta iniciativa esta en la fase **ejecucion de tareas**. El plan
fue aprobado el 2026-05-20 con las decisiones recogidas en la
tabla de aprobacion del documento de analisis. Las tareas T-001 a
T-025 se ejecutan en orden de fase, cada una con su commit Tim
Pope que referencia el ID del hallazgo H-NN. La iniciativa cierra
con T-025, que produce el documento de decisiones obligatorio.
