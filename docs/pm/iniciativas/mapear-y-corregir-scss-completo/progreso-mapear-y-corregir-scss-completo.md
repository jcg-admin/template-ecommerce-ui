# Progreso — `mapear-y-corregir-scss-completo`

Log temporal de la iniciativa. Una fila por evento relevante segun
las clases definidas en PROC-GESTION-001.

## Log

| Timestamp UTC | Clase | Sujeto | Detalle |
|---------------|-------|--------|---------|
| 2026-05-21T07:00:00 | Apertura iniciativa | auditar-scss-completo | Apertura directa en `En analisis` sin pasar por backlog. **Origen**: ampliacion de scope de la iniciativa cancelada `monitorear-y-reducir-allowlist-hex` por solicitud del usuario. El scope estrecho de aquella (allowlist hex + bloqueador pre-push + ritual trimestral) se subsume aqui como dimension 9 de una auditoria integral del SCSS. Procedimiento paso 2 (verificacion de ADRs previas): se identifican dos ADRs activas que **forman parte del contexto**, no contradicen: `dec-stylelint-y-checkscss-en-pre-push` (PR #3, #4) y `dec-color-no-hex-con-allowlist-documentada` (PR #4). Esta iniciativa puede **ampliar o complementar** esas ADRs, no las invalida. Paso 2 limpio. **Inventario inicial pre-cargado en el index.md**: 125 archivos SCSS (101 modules), arquitectura `src/styles/` con 6 subdirectorios (`abstracts/`, `base/`, `components/`, `layouts/`, `accessibility/`, `utils/`), 76 hex literales actuales en SCSS. Alcance preliminar identifica 9 dimensiones a auditar. **Nota**: la iniciativa se abrio con slug `auditar-scss-completo`; el rename a `mapear-y-corregir-scss-completo` ocurre en el commit siguiente al detectar que el scope correcto incluye correccion, no solo auditoria. |
| 2026-05-21T07:00:01 | Hallazgo durante el analisis | auditar-scss-completo (preliminar) | **Discrepancia entre la ADR `dec-color-no-hex-con-allowlist-documentada` y el estado actual del repo**. La ADR declara que PR #4 redujo los hex literales de 525 a 17 en allowlist. El conteo actual `grep -roE "#[0-9a-fA-F]{3,8}" src/ --include="*.scss"` devuelve **76**. Tres explicaciones posibles a investigar formalmente en `analisis-*.md`: (a) la allowlist crecio de 17 a 76 sin proceso formal, lo cual justifica de raiz el bloqueador pre-push que la iniciativa cancelada queria construir; (b) el conteo del PR #4 era diferente (e.g. excluia .module.scss o solo contaba colores principales); (c) hay hex literales fuera de la allowlist que stylelint no esta detectando. Cualquiera de las tres es accionable. Esta evidencia preliminar valida la apertura de la iniciativa. |
| 2026-05-21T07:30:00 | Cambio de alcance | auditar-scss-completo -> mapear-y-corregir-scss-completo | **Ampliacion de scope: de auditoria pura a mapeo + correccion**. Solicitud del usuario el 2026-05-21 tras revisar el alcance preliminar: "ajustar el alcance preliminar, porque no es solo auditar, es, mapear y corregir, todo lo relacionado con scss". El cambio es estructural, no cosmetico: (a) la iniciativa pasa de "documento con hallazgos" a "repo modificado"; (b) las 9 dimensiones se reformulan con dos fases cada una (mapeo: que se inventaria; correccion: que se considera arreglado); (c) las tareas del plan futuro pasan de ser investigativas a investigativas + correctivas; (d) el riesgo de regresion deja de ser cero (correcciones SCSS pueden romper componentes visualmente). **Tres opciones de slug evaluadas**: A `mapear-y-corregir-scss-completo` (literal de la instruccion del usuario), C `auditar-y-corregir-scss` (mas corto, "auditar" cubre "mapear"), otras descartadas (B con "arreglar" informal, D con "revisar"). El usuario eligio A explicitamente. **Cinco ediciones coordinadas en este commit**: (1) renombre del directorio `auditar-scss-completo/` -> `mapear-y-corregir-scss-completo/` via git mv; (2) renombre del archivo `progreso-auditar-*.md` -> `progreso-mapear-y-corregir-*.md` via git mv; (3) reescritura del index.md ajustando titulo, slug, motivo de existencia, alcance preliminar (cada dimension con criterios mapeo+correccion en tabla), nueva seccion "Por que mapear + corregir (no solo auditar)" con tres razones, nueva seccion "Disciplina de correccion" con cuatro reglas operativas; (4) actualizacion de la fila del indice global (`indice-de-iniciativas.md`) para reflejar nuevo slug y nuevo motivo; (5) actualizacion de la fila de `monitorear-y-reducir-allowlist-hex` (Cancelada) para que su referencia a la subsumidora apunte al nuevo slug. Las dos filas anteriores del log (Apertura y Hallazgo) conservan el slug viejo `auditar-scss-completo` como evidencia historica; el nuevo slug solo aplica desde este evento. |

## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura iniciativa | 1 |
| Analisis | 0 |
| Hallazgo durante el analisis | 1 |
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
| Cambio de alcance | 1 |
| Cierre de iniciativa | 0 |
