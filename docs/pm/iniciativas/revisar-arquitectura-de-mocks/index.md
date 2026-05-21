# Iniciativa: revisar-arquitectura-de-mocks

| Campo | Valor |
|-------|-------|
| Slug | `revisar-arquitectura-de-mocks` |
| Estado | Backlog |
| Orden de backlog | 1 |
| Fecha de creacion (directorio) | 2026-05-21 |
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

Iniciativa registrada en backlog. **No abierta todavia**. No tiene
documentos canonicos (alcance, analisis, plan, tareas, progreso,
decisiones) porque esos se producen cuando la iniciativa transiciona
de `Backlog` a `En analisis`.

## Como se abre

1. Cambiar el estado en
   [indice-de-iniciativas.md](../indice-de-iniciativas.md) de
   `Backlog` a `En analisis`.
2. Producir `alcance-revisar-arquitectura-de-mocks.md` con el
   criterio de completitud verificable y el listado explicito de
   opciones a evaluar.
3. Seguir el procedimiento en
   [como-gestionar-iniciativas.md](../../como-gestionar-iniciativas.md).
4. El analisis debe ser comparativo: una entrada por alternativa,
   con sus trade-offs frente a los criterios del template, y
   recomendacion final. Decision aprobada por el usuario antes de
   pasar a plan.
