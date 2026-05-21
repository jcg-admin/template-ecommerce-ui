# Progreso — `auditar-scss-completo`

Log temporal de la iniciativa. Una fila por evento relevante segun
las clases definidas en PROC-GESTION-001.

## Log

| Timestamp UTC | Clase | Sujeto | Detalle |
|---------------|-------|--------|---------|
| 2026-05-21T07:00:00 | Apertura iniciativa | auditar-scss-completo | Apertura directa en `En analisis` sin pasar por backlog. **Origen**: ampliacion de scope de la iniciativa cancelada `monitorear-y-reducir-allowlist-hex` por solicitud del usuario. El scope estrecho de aquella (allowlist hex + bloqueador pre-push + ritual trimestral) se subsume aqui como sub-objetivo de una auditoria integral del SCSS. Procedimiento paso 2 (verificacion de ADRs previas): se identifican dos ADRs activas que **forman parte del contexto**, no contradicen: `dec-stylelint-y-checkscss-en-pre-push` (PR #3, #4) y `dec-color-no-hex-con-allowlist-documentada` (PR #4). Esta iniciativa puede **ampliar o complementar** esas ADRs, no las invalida. Paso 2 limpio. **Inventario inicial pre-cargado en el index.md**: 125 archivos SCSS (101 modules), arquitectura `src/styles/` con 6 subdirectorios (`abstracts/`, `base/`, `components/`, `layouts/`, `accessibility/`, `utils/`), 76 hex literales actuales en SCSS. Alcance preliminar identifica 9 dimensiones a auditar. |
| 2026-05-21T07:00:01 | Hallazgo durante el analisis | auditar-scss-completo (preliminar) | **Discrepancia entre la ADR `dec-color-no-hex-con-allowlist-documentada` y el estado actual del repo**. La ADR declara que PR #4 redujo los hex literales de 525 a 17 en allowlist. El conteo actual `grep -roE "#[0-9a-fA-F]{3,8}" src/ --include="*.scss"` devuelve **76**. Tres explicaciones posibles a investigar formalmente en `analisis-auditar-scss-completo.md`: (a) la allowlist crecio de 17 a 76 sin proceso formal, lo cual justifica de raiz el bloqueador pre-push que la iniciativa cancelada queria construir; (b) el conteo del PR #4 era diferente (e.g. excluia .module.scss o solo contaba colores principales); (c) hay hex literales fuera de la allowlist que stylelint no esta detectando. Cualquiera de las tres es accionable. Esta evidencia preliminar valida la apertura de la iniciativa. |

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
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
