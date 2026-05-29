# auditar-rutas-y-flujos

| Campo | Valor |
|-------|-------|
| Slug | auditar-rutas-y-flujos |
| Estado | En ejecucion |
| Fase activa | Fase 2 — Registrar páginas huérfanas en el router |
| Fecha de apertura | 2026-05-28 |
| Origen | Prueba visual en browser — rutas huérfanas, 404 mal manejados, flujos incompletos |

## Objetivo

Garantizar que cada URL del router tenga página JSX conectada, handler MSW
que responda a sus llamadas API, comportamiento correcto de 404, y protección
adecuada (pública / auth / admin).

## Estado por fase

| Fase | Descripción | Estado | Commits |
|------|-------------|--------|---------|
| F1 | SCSS Modules — clases faltantes y variables incorrectas | **COMPLETADA** | 9251a4f, eccdd4b |
| F2 | Registrar 12 páginas huérfanas en el router | PENDIENTE | — |
| F3 | Habilitar AdminConfigPage (depende de F2) | PENDIENTE | — |
| F4 | Fix loading infinito en 3 páginas | PENDIENTE | — |
| F5 | MSW handlers faltantes | PENDIENTE | — |
| F6 | Mejoras UX en páginas existentes | PENDIENTE | — |
| F7 | Verificación de 15 flujos en browser | En curso | — |

## Resultado de Fase 1

| Métrica | Valor |
|---------|-------|
| Archivos SCSS inspeccionados | 24 |
| Problema diagnosticado inicialmente | 11 archivos faltantes |
| Problema real encontrado | 33 clases sin definir en 10 archivos |
| Archivos creados desde cero | 0 |
| Archivos modificados | 12 |
| Variables SCSS incorrectas corregidas | 1 |
| check-scss | 146 entries, 0 issues |
| Tests | 1331 pasando, 0 fallos |

## Documentos

| Documento | Estado |
|-----------|--------|
| [auditoria-completa](auditoria-completa.md) | Completo |
| [auditoria-vistas-calidad](auditoria-vistas-calidad.md) | Completo |
| [hallazgos](hallazgos-auditar-rutas-y-flujos.md) | Actualizado Fase 1 |
| [plan-implementacion-completa](plan-implementacion-completa.md) | Activo |
| [plan-de-tareas](plan-de-tareas.md) | Activo |
