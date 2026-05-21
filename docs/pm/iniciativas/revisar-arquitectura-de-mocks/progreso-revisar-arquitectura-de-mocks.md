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
| 2026-05-21T05:45:00 | Cierre de tarea | T-003 | (a) `npm install --save-dev msw` instalado msw v2.14.6 (34 paquetes anadidos). (b) `npx msw init public/ --save` creo `public/mockServiceWorker.js` (9120 bytes) y anadio `"msw": { "workerDirectory": ["public"] }` a `package.json` para regeneracion automatica. (c) Smoke test: webpack dev server arranca limpio y sirve el archivo desde `public/`. (d) Tests: 27 suites, 184 tests verdes (sin handlers aun, MSW deja pasar todo y el interceptor actual sigue funcionando). |
| 2026-05-21T06:00:00 | Hallazgo durante la ejecucion | T-004 | (a) Mapa de endpoints reales: el interceptor maneja **dos prefijos distintos** que conviven: sin version (`/api/auth/*`, `/api/cart/*`, `/api/products/*`, `/api/categories/*`, `/api/orders/*`, `/api/payments/*`, `/api/token/*`, `/api/wishlist/*`) y con version (`/api/v1/admin/inventory/*`, `/api/v1/admin/returns/*`, `/api/v1/returns/*`, `/api/v1/orders/*`). Los handlers MSW se escriben contra los paths reales, no contra los que el plan asumia (`/api/v1/catalog/...`). Inconsistencia heredada del template, no introducida por esta iniciativa. Se documentara como deuda menor en el documento de decisiones de cierre. (b) El alias TypeScript `@types/*` configurado en `tsconfig.json` colisiona con la convencion reservada de DefinitelyTyped: `tsc` rechaza importar tipos desde rutas que empiezan con `@types/`. Solucion provisional: los handlers usan import relativo `'../../types/domain'`. Deuda menor: renombrar el alias a `@app-types/*` u otro no reservado en una iniciativa futura. |
| 2026-05-21T06:05:00 | Cierre de tarea | T-004 | Creados `src/mocks/handlers/index.ts` (array `handlers: HttpHandler[]` vacio inicial, con JSDoc explicando que T-008..T-012 lo poblaran y T-013 cambiara la exportacion a `buildHandlers()`) y `src/mocks/handlers/types.ts` (re-export central de los 12 tipos del dominio usados por handlers desde `../../types/domain`). `tsc --noEmit` exit 0. |
| 2026-05-21T06:15:00 | Cierre de tarea | T-005 | Creados `src/mocks/browser.ts` (importa `setupWorker` de `msw/browser` y exporta `worker = setupWorker(...handlers)`) y `src/mocks/node.ts` (importa `setupServer` de `msw/node` y exporta `server = setupServer(...handlers)`). Ambos consumen el array `handlers` desde `./handlers`. JSDoc explicando cuando se importan: el worker desde `src/index.jsx` con guard `NODE_ENV=development` (T-006), el server desde `tests/setup-msw.ts` (T-007). `tsc --noEmit` exit 0. |

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
| Hallazgo durante la ejecucion | 1 |
| Inicio de tarea | 0 |
| Cierre de tarea | 5 |
| Fase cerrada | 1 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
