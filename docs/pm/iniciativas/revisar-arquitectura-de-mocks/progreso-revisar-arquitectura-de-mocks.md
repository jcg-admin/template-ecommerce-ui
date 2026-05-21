# Progreso: Revisar arquitectura de mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Tipo | Log temporal del avance |
| Fecha de creacion | 2026-05-21 |

> **Como leer este documento.** Una fila por evento. Los eventos
> que se registran: apertura de la iniciativa, inicio de tarea,
> cierre de tarea (con hash de commit), bloqueos y desbloqueos,
> cambios de alcance, cierre de la iniciativa. El orden es
> cronologico ascendente: el evento mas reciente al final.

## Log

| Fecha (UTC) | Evento | Tarea | Detalle |
|-------------|--------|-------|---------|
| 2026-05-21T02:30:00 | Apertura iniciativa | (n/a) | Creacion de directorio y documentos `index.md`, `alcance-*.md`. Estado: En analisis. Origen: (raiz). Decidida abrir antes que `validar-contrato-de-mocks-vs-backend-real` porque la decision de arquitectura de mocks precede a la validacion del contrato. |
| 2026-05-21T03:30:00 | Analisis | (n/a) | Producido `analisis-revisar-arquitectura-de-mocks.md` con comparativo de 9 alternativas contra 7 criterios, datos web 2026 (MSW 17925 stars, 6M+ weekly downloads, etc.) y primera recomendacion: MSW + Faker. |
| 2026-05-21T03:50:00 | Analisis adicional | (n/a) | Producido `analisis-trade-off-service-worker.md` profundizando el trade-off de `mockServiceWorker.js` en `public/`. Verificado que la configuracion actual del webpack (sin `copy-webpack-plugin`) NO copia `public/` a `dist/`, lo que reduce el trade-off significativamente. Plan de 5 mitigaciones documentado. |
| 2026-05-21T04:10:00 | Hallazgo durante el analisis | (n/a) | Al revisar bajo metodologia RUP del proyecto, se inspecciono `docs/decisiones-de-arquitectura/` y se descubrio la ADR previa `dec-mock-first-via-feature-flags-por-dominio` que ya habia descartado MSW. El analisis general no la habia inspeccionado. **Fallo de proceso**: bajo RUP, proponer cambios a decisiones arquitectonicas registradas requiere leer la ADR previa y planificar el supersede formal. La ADR previa contenia ademas una premisa tecnica incorrecta sobre MSW en Jest. |
| 2026-05-21T04:20:00 | Reconsideracion | (n/a) | Producido `reconsideracion-bajo-rup-adaptado.md` con mapeo del problema bajo principios RUP adaptados (architecture-centric, risk-driven, driven by use cases, SAD 4+1) y tres caminos posibles: A (mantener interceptor + corregir ADR + Faker), B (superseder ADR + migrar a MSW + Faker), C (no tocar). |
| 2026-05-21T04:30:00 | Decisiones aprobadas | (n/a) | Usuario aprobo **Camino B**. Adicionalmente: **3a-ii** (conservar variables `*_SOURCE` como conditional handlers MSW), **3b-iii** (eliminar tests embebidos del interceptor verificando cobertura caso por caso). Se acuerda commitear los tres documentos del analisis juntos como evidencia honesta del proceso. |
| 2026-05-21T04:45:00 | Plan | (n/a) | Producido `plan-*.md` con 8 fases y 24 tareas atomicas, costo agregado estimado ~645 min (~10.75 horas efectivas). Diagrama mermaid del DAG. Fase 0 contiene 2 tareas (T-001 supersede ADR, T-002 enmienda procedimiento) que **deben ejecutarse antes** que cualquier tarea de implementacion. |
| 2026-05-21T04:50:00 | Cambio de estado | (n/a) | Iniciativa transiciona de "En analisis" a "En ejecucion". Creados `tareas-*.md` (lista plana de las 24 tareas) y `progreso-*.md` (este documento). |

## Contadores

| Evento | Conteo |
|--------|--------|
| Apertura iniciativa | 1 |
| Analisis | 3 |
| Hallazgo durante el analisis | 1 |
| Reconsideracion | 1 |
| Decisiones aprobadas | 1 |
| Plan | 1 |
| Cambio de estado | 1 |
| Replan | 0 |
| Hallazgo durante la ejecucion | 0 |
| Inicio de tarea | 0 |
| Cierre de tarea | 0 |
| Fase cerrada | 0 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
