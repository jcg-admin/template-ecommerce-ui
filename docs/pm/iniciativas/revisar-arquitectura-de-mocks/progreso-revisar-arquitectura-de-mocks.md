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
| 2026-05-21T05:15:00 | Cierre de tarea | T-001 | ADR previa `dec-mock-first-via-feature-flags-por-dominio` marcada como **Superseded** con campo nuevo "Nota del supersede" que documenta explicitamente que la justificacion tecnica original sobre Jest era incorrecta en 2026 y referencia la iniciativa actual. Anadida nueva ADR `dec-mocks-via-msw-service-worker` con los 9 campos del formato canonico: Estado, Supersede, Decision (MSW + Faker + `*_SOURCE` como conditional handler registration), Contexto (que cambio respecto a la ADR previa), Alternativas (9 evaluadas con resumen), Razon, Trade-off del Service Worker (con referencia al analisis especifico), Consecuencias (incluye decision 3b-iii sobre tests embebidos), Evidencia (a llenar conforme avancen las tareas), Origen (esta iniciativa, T-001). El bloque "Como agregar una nueva decision" al final del archivo no se toca; T-002 anadira el paso de verificacion. |
| 2026-05-21T05:30:00 | Cierre de tarea | T-002 | Anadido el paso 2 al bloque "Como abrir una iniciativa nueva" de `docs/pm/como-gestionar-iniciativas.md`: exige inspeccionar `docs/decisiones-de-arquitectura/` antes de proponer cambios arquitectonicos, leer ADRs existentes y planificar superseder formalmente si la nueva decision contradice una previa. Pasos 3-10 renumerados. Bloque cita final documenta **por que** se anadio el paso (fallo de proceso de esta misma iniciativa). El paso se ubica como segundo del flujo (no enterrado) para garantizar visibilidad. |
| 2026-05-21T05:30:00 | Fase cerrada | Fase 0 | T-001 y T-002 cerradas. La decision arquitectonica esta registrada formalmente como ADR (con la previa superseded en el mismo registro) y el procedimiento esta enmendado para evitar la repeticion del fallo. Comienza Fase 1: Setup MSW base. |

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
| Cierre de tarea | 2 |
| Fase cerrada | 1 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
