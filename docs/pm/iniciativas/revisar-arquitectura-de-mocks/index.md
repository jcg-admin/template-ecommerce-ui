# Iniciativa: revisar-arquitectura-de-mocks

| Campo | Valor |
|-------|-------|
| Slug | `revisar-arquitectura-de-mocks` |
| Estado | En ejecucion |
| Orden de backlog | (vacio: no esta en backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Fecha de paso a ejecucion | 2026-05-21 |
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

Iniciativa en **ejecucion**. Estado: `En ejecucion`. Plan producido
con 24 tareas atomicas T-NNN distribuidas en 8 fases (0 a 7), costo
agregado estimado ~645 min (~10.75 horas efectivas).

La Fase 0 (T-001 supersede ADR + T-002 enmienda procedimiento) se
ejecuta **antes** de cualquier tarea de implementacion. Bajo RUP
adaptado, la decision arquitectonica formal precede al codigo.

Las fases siguen el DAG declarado en `plan-*.md`:

```
Fase 0  ADR y procedimiento
  Fase 1  Setup MSW base
    Fase 2  Handlers tipados por dominio
      Fase 3  Activacion conditional via *_SOURCE
      Fase 4  Faker + factories
        Fase 5  Eliminar interceptor y limpieza
          Fase 6  Documentacion arc42
            Fase 7  Cierre
```

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-revisar-arquitectura-de-mocks.md](alcance-revisar-arquitectura-de-mocks.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance, listado de alternativas a evaluar. |
| [analisis-revisar-arquitectura-de-mocks.md](analisis-revisar-arquitectura-de-mocks.md) | Comparativo de las 9 alternativas contra los 7 criterios del template. Primera recomendacion: MSW + Faker. |
| [analisis-trade-off-service-worker.md](analisis-trade-off-service-worker.md) | Profundizacion del trade-off del Service Worker en `public/`. Conclusion: trade-off menor, gestionable. |
| [reconsideracion-bajo-rup-adaptado.md](reconsideracion-bajo-rup-adaptado.md) | Reconsideracion bajo disciplina RUP. Tres caminos posibles (A/B/C). Camino B aprobado. |
| [plan-revisar-arquitectura-de-mocks.md](plan-revisar-arquitectura-de-mocks.md) | Plan de ejecucion en 8 fases con 24 tareas atomicas T-NNN, DAG mermaid y trazabilidad. |
| [tareas-revisar-arquitectura-de-mocks.md](tareas-revisar-arquitectura-de-mocks.md) | Lista plana de las 24 tareas con su estado actual (pendiente, en curso, hecha). |
| [progreso-revisar-arquitectura-de-mocks.md](progreso-revisar-arquitectura-de-mocks.md) | Log temporal del avance, con una entrada por evento relevante. |
| [decisiones-revisar-arquitectura-de-mocks.md](decisiones-revisar-arquitectura-de-mocks.md) | Decisiones de diseno tomadas, hallazgos durante la ejecucion, verificacion post-ejecucion y que entrega la iniciativa. Obligatorio por PROC-GESTION-001. |
