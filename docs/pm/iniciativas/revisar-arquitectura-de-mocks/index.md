# Iniciativa: revisar-arquitectura-de-mocks

| Campo | Valor |
|-------|-------|
| Slug | `revisar-arquitectura-de-mocks` |
| Estado | En analisis |
| Orden de backlog | (vacio: ya no esta en backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

El template actual implementa los mocks mediante un interceptor
dentro del cliente HTTP (`src/mocks/mockInterceptor.js`) con rama
`if (USE_MOCKS)` en `apiService.js`. Esta arquitectura funciona pero
acopla el codigo de produccion al modo mock.

Existen alternativas con trade-offs distintos:

- **Mock al nivel de Service Worker** (MSW): intercepta `fetch` y
  XHR en el navegador sin que el codigo cliente lo sepa.
- **Servidor mock separado** (json-server, Prism, WireMock, Mockoon):
  proceso aparte que sirve respuestas HTTP en un puerto local.
- **Mock con ORM interno** (MirageJS): servidor en memoria con
  factories y relaciones, embebido en el cliente.
- **Mantener el interceptor actual**: estatus quo, ningun cambio.

Esta iniciativa analiza las opciones contra los criterios del
template (ser adoptable por terceros, no acoplar el codigo de
produccion, mantener trazabilidad con el dominio), recomienda una,
la aplica si la decision es cambiar, y deja documentado el porque.

Precede a `validar-contrato-de-mocks-vs-backend-real`: primero se
decide como viven los mocks, despues se valida que su forma coincide
con el backend real cuando llegue.

## Estado actual

Iniciativa **abierta**. Estado: `En analisis`. Producido el
[alcance-revisar-arquitectura-de-mocks.md](alcance-revisar-arquitectura-de-mocks.md)
con el criterio de completitud verificable, las alternativas a
evaluar y el "fuera de alcance".

Siguiente paso del procedimiento: producir
`analisis-revisar-arquitectura-de-mocks.md` con una entrada por
cada alternativa listada en el alcance, comparada contra los
criterios del template, y una recomendacion final que el usuario
aprueba antes de pasar a `plan-*.md`.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-revisar-arquitectura-de-mocks.md](alcance-revisar-arquitectura-de-mocks.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance, listado de alternativas a evaluar. |
| analisis-revisar-arquitectura-de-mocks.md | Pendiente. Comparativo de las alternativas contra los criterios del template, con recomendacion final. |
| plan-revisar-arquitectura-de-mocks.md | Pendiente. Producido cuando se apruebe el analisis. |
| tareas-revisar-arquitectura-de-mocks.md | Pendiente. Producido al pasar a ejecucion. |
| progreso-revisar-arquitectura-de-mocks.md | Pendiente. Producido al pasar a ejecucion. |
| decisiones-revisar-arquitectura-de-mocks.md | Pendiente. Producido al cierre, obligatorio por PROC-GESTION-001. |
