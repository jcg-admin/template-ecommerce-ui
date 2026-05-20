# Progreso: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Iniciativa | resolver-hallazgos-de-deuda-del-template |
| Tipo | Log temporal del avance |
| Fecha de creacion | 2026-05-20T21:30:00 |

> **Como leer este documento.** Una fila por evento. Los eventos
> que se registran: apertura de la iniciativa, inicio de tarea,
> cierre de tarea (con hash de commit), bloqueos y desbloqueos,
> cambios de alcance, cierre de la iniciativa. El orden es
> cronologico ascendente: el evento mas reciente al final.

## Log

| Fecha (UTC) | Evento | Tarea | Detalle |
|-------------|--------|-------|---------|
| 2026-05-20T21:09:03 | Apertura iniciativa | (n/a) | Creacion de directorio y documentos `index.md`, `alcance-*.md`. Estado: En analisis. |
| 2026-05-20T21:16:00 | Analisis | (n/a) | Producido `analisis-*.md` con opciones por hallazgo H-01 a H-20 y tabla de aprobacion. |
| 2026-05-20T21:26:00 | Plan | (n/a) | Producido `plan-*.md` con 8 fases y 29 tareas atomicas. |
| 2026-05-20T21:30:00 | Decisiones aprobadas | (n/a) | Usuario aprobo: Opcion A para H-01, H-02, H-04. Opcion B para H-03. Opciones A+C para H-08. Diferida a iniciativa propia para H-05 (slug `monitorear-y-reducir-allowlist-hex`) y H-07 (slug `validar-contrato-de-mocks-vs-backend-real`, proxima iniciativa). Retirada mecanica para H-06 y H-09 a H-20. |
| 2026-05-20T21:30:00 | Replan | (n/a) | Plan revisado a 7 fases productivas mas cierre, 25 tareas. Eliminadas T-004 (era para H-07) y T-024/T-025/T-026 (eran para H-05). Renumeradas las tareas posteriores. Costo agregado paso de ~10 a ~9 horas. |
| 2026-05-20T21:30:00 | Cambio de estado | (n/a) | Iniciativa transiciona de "En analisis" a "En ejecucion". Creados `tareas-*.md` (lista plana de las 25 tareas) y `progreso-*.md` (este documento). |
| 2026-05-20T21:42:00 | Hallazgo durante la ejecucion | T-001, T-002 | Al verificar el contenido de los archivos a tocar antes de ejecutar T-001, se descubre que los 13 hallazgos a retirar y consolidar viven en **dos archivos** distintos, pero T-001 y T-002 estaban agrupadas por categoria conceptual (historicos vs duplicados) sin tener en cuenta la distribucion fisica. Reparto correcto: `riesgos-y-deuda-tecnica.md` contiene 5 entradas a retirar (H-06, H-09, H-10, H-11, H-12); `decisiones-analizar-ramas-pendientes-*.md` contiene 8 entradas (4 historicos H-13, H-14, H-15, H-20 + 4 duplicados H-16, H-17, H-18, H-19). Se redistribuyen las tareas por archivo. Total de tareas y hallazgos cubiertos no cambia. |
| 2026-05-20T21:42:00 | Replan | T-001, T-002 | Ajustadas las descripciones de T-001 y T-002 en `plan-*.md` y `tareas-*.md` para reflejar la distribucion por archivo. T-001 pasa de 9 hallazgos a 5; T-002 pasa de 4 a 8. Costo agregado de Fase 0 sube de 40 min a 50 min (T-002 sube de 10 a 20 min). Costo total de la iniciativa pasa de ~535 min a ~545 min. |
| 2026-05-20T21:50:00 | Cierre de tarea | T-001 | Eliminadas las 5 secciones (`riesgo-ausencia-de-ci-cd-automatizado`, `riesgo-rama-pendiente-no-integrada`, `riesgo-release-candidate-acumulado-en-develop`, `riesgo-sin-cobertura-de-tests-medida`, `deuda-de-tareas-sprint-4-sin-trazar`) de `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md`. Cubre H-06, H-09, H-10, H-11, H-12. |
| 2026-05-20T21:55:00 | Cierre de tarea | T-002 | Eliminadas las 8 subsecciones de "Seccion 2 — Hallazgos durante la ejecucion" de `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/decisiones-analizar-ramas-pendientes-de-integracion.md`, sustituidas por una unica subseccion `Hallazgos historicos retirados del log` con tabla resumen y referencia cruzada a esta iniciativa. Contenido detallado preservado en historia git. Cubre H-13, H-14, H-15, H-16, H-17, H-18, H-19, H-20. |
| 2026-05-20T22:00:00 | Cierre de tarea | T-003 | Marcadas las secciones de `riesgo-divergencia-mocks-vs-contrato-real` y `deuda-de-allowlist-color-no-hex` en `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` con estado **Delegado a iniciativa propia**, fecha de delegacion (2026-05-20), slug de la iniciativa destino y razon. Cubre H-05 y H-07. |
| 2026-05-20T22:00:00 | Fase cerrada | Fase 0 | Las tres tareas de la fase 0 (T-001, T-002, T-003) cerradas. Inventario heredado limpio: 5 entradas retiradas del inventario de riesgos y deuda, 8 entradas del log de la iniciativa previa retiradas o consolidadas (4 historicas + 4 duplicados), 2 entradas (H-05, H-07) marcadas como delegadas. Las 5 entradas vivas restantes (H-01, H-02, H-03, H-04, H-08) se resuelven en las fases 1 a 6. |
| 2026-05-20T22:15:00 | Cierre de tarea | T-004 | Reemplazada la seccion "Documentacion" del `README.md` raiz. La seccion ahora se estructura en cuatro bloques: punto de entrada para adoptantes (`docs/como-adaptar-este-template.md`), arquitectura (`docs/README.md` con el indice arc42, decisiones, riesgos), project management (`docs/pm/`), pipeline de estilos (docs `scss-*`). `grep -cE 'como-adaptar\|docs/README\|pm/' README.md` retorna 5, criterio del plan satisfecho. La entrada `deuda-readme-sin-actualizar-tras-cambios` en `riesgos-y-deuda-tecnica.md` se marca como **resuelta** con referencia a esta tarea. Cubre H-04. |
| 2026-05-20T22:15:00 | Fase cerrada | Fase 1 | T-004 es la unica tarea de la fase 1. Cerrada. Continua fase 2 (preparar TypeScript progresivo). |

## Eventos por tipo

| Tipo | Conteo |
|------|--------|
| Apertura iniciativa | 1 |
| Analisis | 1 |
| Plan | 1 |
| Decisiones aprobadas | 1 |
| Replan | 2 |
| Cambio de estado | 1 |
| Hallazgo durante la ejecucion | 1 |
| Inicio de tarea | 0 |
| Cierre de tarea | 4 |
| Fase cerrada | 2 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |

## Tipos de evento validos

- `Apertura iniciativa`: creacion del directorio y primer documento.
- `Analisis`: producto del documento `analisis-*.md`.
- `Plan`: producto del documento `plan-*.md`.
- `Decisiones aprobadas`: registro de la aprobacion del usuario sobre
  el plan y sus recomendaciones.
- `Replan`: cambio en el plan tras decisiones (eliminacion o
  reorganizacion de tareas).
- `Cambio de estado`: el campo `Estado` del index pasa de un valor a
  otro (En analisis -> En ejecucion -> Cerrada).
- `Inicio de tarea`: la tarea T-NNN pasa de `pendiente` a `en curso`.
- `Cierre de tarea`: la tarea T-NNN pasa de `en curso` a `hecha`. La
  columna **Detalle** lleva el hash corto del commit Tim Pope que la
  cerro.
- `Fase cerrada`: todas las tareas de una fase pasan a `hecha`. Punto
  natural de revision antes de comenzar la siguiente fase.
- `Bloqueo`: la tarea T-NNN pasa a `bloqueada`. **Detalle** lleva la
  razon.
- `Desbloqueo`: la tarea T-NNN sale de `bloqueada` a `pendiente` o `en
  curso`.
- `Cambio de alcance`: cualquier cambio al documento `alcance-*.md`
  posterior a la apertura.
- `Cierre de iniciativa`: ejecutado por T-025.
