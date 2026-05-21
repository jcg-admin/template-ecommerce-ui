# Progreso — `completar-dominio-de-ecommerce`

Log temporal de la iniciativa. Una fila por evento relevante segun
las clases definidas en PROC-GESTION-001. Las filas se anaden al
final; los contadores al pie se actualizan en cada commit.

## Log

| Timestamp UTC | Clase | Sujeto | Detalle |
|---------------|-------|--------|---------|
| 2026-05-21T05:00:00 | Apertura iniciativa | completar-dominio-de-ecommerce | Apertura formal: estado en indice-de-iniciativas.md cambia de `Backlog` a `En analisis`. Iniciativa antes #2 en backlog. Apertura motivada por (a) iniciativa orden 1 (`validar-contrato-de-mocks-vs-backend-real`) bloqueada por falta de backend Django en el entorno actual; (b) deuda concreta registrada por la iniciativa recien cerrada `revisar-arquitectura-de-mocks` (path families duales, fetch directo vs apiService, divergencia Product type vs runtime). Index.md de la iniciativa actualizado: cabecera con `Estado: En analisis`, `Fecha de apertura formal: 2026-05-21`, nueva fila "Iniciativa que aporto deuda registrada". Seccion "Estado actual" reescrita; seccion "Como se abre" eliminada (ya abierta); seccion nueva "Documentos esperados" con tabla de los 6 documentos canonicos pendientes. Verificacion previa (paso 2 del procedimiento extendido en T-002 de la iniciativa anterior): grep en `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` de "User", "Address", "ProductVariant", "Review", "dominio" no muestra ADR previa que contradiga abrir esta iniciativa. Las 11 ADRs activas son sobre auth (JWT cookies), mocks (MSW), estado (Redux + RQ), build (API_URL build-time, no SSR, lazy loading), pipeline SCSS, color hex, y rename rutas; ninguna toca modelado de entidades del dominio. Paso 2 limpio. |

| 2026-05-21T05:05:05 | Analisis | alcance | Producido alcance-completar-dominio-de-ecommerce.md (7 secciones, ~140 lineas): 7 items dentro del alcance (4 gaps de modelado declarados en el JSDoc de domain.ts + 3 deudas heredadas de la iniciativa anterior), 6 criterios de evaluacion del template, 8 criterios verificables de completitud, lista de fuera de alcance, decisiones de proceso (una entidad = una fase, tipo primero runtime despues, backend out-of-scope, sin cambio de scope sin replan formal). index.md actualizado: fila del alcance pasa de Pendiente a link al documento. |
| 2026-05-21T05:07:49 | Hallazgo durante el analisis | analisis | **Hallazgo central durante el analisis**: el alcance se redacto asumiendo que `Address`, `ProductVariant`, `Review` no existian en el template. La inspeccion mostro que **todas existen en runtime** (slices, hooks, componentes, paginas, tests) pero **ninguna esta declarada en `domain.ts`**. El gap es de tipado, no de dominio. Esto reduce el esfuerzo de ~10h tipicas a ~4.5h estimadas, y alinea con el item 7 del alcance (divergencia tipo vs runtime) que resulta ser el item central. Evidencia: addressesSlice.js con UC-AUTH-07 y 5 thunks; AddressesPage.jsx con 11 campos; reviewsSlice.js + useReviews.js + ProductReviewsListPage + AdminReviewsModerationPage; VariantSelector component + useAddProductWithVariant hook + cartSlice envia variant_id. **No hay UCs nuevos**; hay UCs ejecutandose sin tipo. |
| 2026-05-21T05:07:49 | Analisis | analisis | Producido analisis-completar-dominio-de-ecommerce.md (~280 lineas). Metodologia: por cada uno de los 7 items, recoge estado real con evidencia citada, estado en domain.ts, gap, y decision de modelado propuesta. Items con esfuerzo: 1 User (20min, 3 campos), 2 Address (20min, 12 campos), 3 ProductVariant (40min, 5 campos + factory), 4 Review (60min, incluye inspeccion del slice antes), 5 aliases auth legacy (25min, eliminar 4 handlers), 6 fetch directo (60min, 2 thunks + refactor), 7 Product divergence (50min, anadir 3 campos + ProductImage tipo + limpiar `as unknown as`). Esfuerzo total ~4.5h. index.md actualizado: fila analisis pasa de Pendiente a link al documento. |
| 2026-05-21T05:09:49 | Plan | plan + tareas | Producido plan-completar-dominio-de-ecommerce.md y tareas-completar-dominio-de-ecommerce.md. **18 tareas atomicas T-001 a T-018** en **8 fases** siguiendo el DAG declarado. Coste agregado estimado ~360 min (~6h). Disciplina: una entidad por fase, tipo primero runtime despues. Trazabilidad tabla item-alcance -> fase -> tareas declarada al final del plan. Fase 0 (ADRs) marcada como ejecutada en la apertura (verificacion del paso 2 del procedimiento ya hecha; ninguna ADR previa contradice). |
| 2026-05-21T05:09:49 | Cambio de estado | completar-dominio-de-ecommerce | En analisis -> En ejecucion. Plan y tareas producidos; estado movido a En ejecucion en indice global e index.md de la iniciativa. Working tree limpio. Lista para iniciar T-001. |
## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura iniciativa | 1 |
| Analisis | 2 |
| Hallazgo durante el analisis | 1 |
| Reconsideracion | 0 |
| Decisiones aprobadas | 0 |
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
