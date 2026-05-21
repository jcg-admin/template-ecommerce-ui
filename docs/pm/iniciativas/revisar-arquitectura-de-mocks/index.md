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

Iniciativa **abierta**. Estado: `En analisis`. Producidos los
documentos de analisis tras tres iteraciones:

1. `alcance-revisar-arquitectura-de-mocks.md` definio los criterios
   y las 9 alternativas a evaluar.
2. `analisis-revisar-arquitectura-de-mocks.md` comparo las 9
   alternativas contra 7 criterios y produjo una primera
   recomendacion (MSW + Faker).
3. `analisis-trade-off-service-worker.md` profundizo en el trade-off
   especifico del Service Worker en `public/`.
4. `reconsideracion-bajo-rup-adaptado.md` reconsidero la decision
   incorporando la disciplina RUP del proyecto. Detecto la ADR
   previa `dec-mock-first-via-feature-flags-por-dominio` que el
   analisis general no habia inspeccionado.

**Decision final aprobada**: Camino B. Superseder la ADR previa y
migrar a MSW + Faker. La premisa tecnica de la ADR vigente
(*"MSW agrega un service worker que complica el setup de Jest"*) es
incorrecta en 2026 y se corrige formalmente como parte de esta
iniciativa.

Siguiente paso del procedimiento: producir `plan-*.md` con las
tareas atomicas T-NNN del Camino B, seguido del commit que
supersede la ADR previa, y luego ejecutar las tareas.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-revisar-arquitectura-de-mocks.md](alcance-revisar-arquitectura-de-mocks.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance, listado de alternativas a evaluar. |
| [analisis-revisar-arquitectura-de-mocks.md](analisis-revisar-arquitectura-de-mocks.md) | Comparativo de las 9 alternativas contra los 7 criterios del template. Primera recomendacion: MSW + Faker. |
| [analisis-trade-off-service-worker.md](analisis-trade-off-service-worker.md) | Profundizacion del trade-off del Service Worker en `public/`. Conclusion: trade-off menor, gestionable con documentacion + guards. |
| [reconsideracion-bajo-rup-adaptado.md](reconsideracion-bajo-rup-adaptado.md) | Reconsideracion final bajo disciplina RUP del proyecto. Tres caminos posibles (A/B/C). Camino B aprobado. |
| plan-revisar-arquitectura-de-mocks.md | Pendiente. Producido tras aprobacion del Camino B. |
| tareas-revisar-arquitectura-de-mocks.md | Pendiente. Producido al pasar a ejecucion. |
| progreso-revisar-arquitectura-de-mocks.md | Pendiente. Producido al pasar a ejecucion. |
| decisiones-revisar-arquitectura-de-mocks.md | Pendiente. Producido al cierre, obligatorio por PROC-GESTION-001. |
