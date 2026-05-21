# Progreso — `completar-dominio-de-ecommerce`

Log temporal de la iniciativa. Una fila por evento relevante segun
las clases definidas en PROC-GESTION-001. Las filas se anaden al
final; los contadores al pie se actualizan en cada commit.

## Log

| Timestamp UTC | Clase | Sujeto | Detalle |
|---------------|-------|--------|---------|
| 2026-05-21T05:00:00 | Apertura iniciativa | completar-dominio-de-ecommerce | Apertura formal: estado en indice-de-iniciativas.md cambia de `Backlog` a `En analisis`. Iniciativa antes #2 en backlog. Apertura motivada por (a) iniciativa orden 1 (`validar-contrato-de-mocks-vs-backend-real`) bloqueada por falta de backend Django en el entorno actual; (b) deuda concreta registrada por la iniciativa recien cerrada `revisar-arquitectura-de-mocks` (path families duales, fetch directo vs apiService, divergencia Product type vs runtime). Index.md de la iniciativa actualizado: cabecera con `Estado: En analisis`, `Fecha de apertura formal: 2026-05-21`, nueva fila "Iniciativa que aporto deuda registrada". Seccion "Estado actual" reescrita; seccion "Como se abre" eliminada (ya abierta); seccion nueva "Documentos esperados" con tabla de los 6 documentos canonicos pendientes. Verificacion previa (paso 2 del procedimiento extendido en T-002 de la iniciativa anterior): grep en `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` de "User", "Address", "ProductVariant", "Review", "dominio" no muestra ADR previa que contradiga abrir esta iniciativa. Las 11 ADRs activas son sobre auth (JWT cookies), mocks (MSW), estado (Redux + RQ), build (API_URL build-time, no SSR, lazy loading), pipeline SCSS, color hex, y rename rutas; ninguna toca modelado de entidades del dominio. Paso 2 limpio. |

## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura iniciativa | 1 |
| Analisis | 0 |
| Hallazgo durante el analisis | 0 |
| Reconsideracion | 0 |
| Decisiones aprobadas | 0 |
| Plan | 0 |
| Cambio de estado | 0 |
| Replan | 0 |
| Hallazgo durante la ejecucion | 0 |
| Inicio de tarea | 0 |
| Cierre de tarea | 0 |
| Fase cerrada | 0 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
