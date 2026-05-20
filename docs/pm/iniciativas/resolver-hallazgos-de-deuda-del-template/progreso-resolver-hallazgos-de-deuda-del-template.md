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

## Eventos por tipo

| Tipo | Conteo |
|------|--------|
| Apertura iniciativa | 1 |
| Analisis | 1 |
| Plan | 1 |
| Decisiones aprobadas | 1 |
| Replan | 1 |
| Cambio de estado | 1 |
| Inicio de tarea | 0 |
| Cierre de tarea | 0 |
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
- `Bloqueo`: la tarea T-NNN pasa a `bloqueada`. **Detalle** lleva la
  razon.
- `Desbloqueo`: la tarea T-NNN sale de `bloqueada` a `pendiente` o `en
  curso`.
- `Cambio de alcance`: cualquier cambio al documento `alcance-*.md`
  posterior a la apertura.
- `Cierre de iniciativa`: ejecutado por T-025.
