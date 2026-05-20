# Iniciativa: Analizar ramas pendientes de integracion

| Campo | Valor |
|-------|-------|
| Artefacto | INI-UI-001 |
| Tipo | Iniciativa de project management |
| Submodulo | ui |
| Estado | COMPLETADA |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-20T19:12:38 |
| Fecha de cierre | 2026-05-20T19:32:31 |
| Autor | NestorMonroy |
| Clasificacion | Interno |

## Que produce esta iniciativa

Documentacion completa del estado de ramas del repositorio
`jcg-admin/e-comerce-ui`, distinguiendo:

- Ramas **pendientes de integracion** (delta real respecto a `develop`).
- Ramas **ya integradas** (PRs cerrados, conservadas como referencia).
- El **release candidate** acumulado en `develop` que aun no se ha
  promovido a `main`.

La iniciativa **no integra** las ramas; solo produce el material de
analisis necesario para decidir cuando y como integrarlas.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-analizar-ramas-pendientes-de-integracion.md](alcance-analizar-ramas-pendientes-de-integracion.md) | Que es la iniciativa, criterio de completitud verificable, fuera de alcance. |
| [analisis-ramas-pendientes-de-integracion.md](analisis-ramas-pendientes-de-integracion.md) | Resumen ejecutivo y matriz comparativa de las seis ramas remotas. |
| [analisis-rama-claude-resume-ecommerce-project.md](analisis-rama-claude-resume-ecommerce-project.md) | Detalle de la unica rama de feature realmente pendiente. |
| [analisis-rama-claude-fix-proxy-scope.md](analisis-rama-claude-fix-proxy-scope.md) | Detalle de la rama integrada en PR #2 (gran salto de UCs). |
| [analisis-rama-release-integrate-ui-css-fix.md](analisis-rama-release-integrate-ui-css-fix.md) | Detalle de la rama integrada en PR #3 (pipeline SCSS endurecido). |
| [analisis-rama-claude-fix-npm-build-css.md](analisis-rama-claude-fix-npm-build-css.md) | Detalle de la rama integrada en PR #4 (migracion masiva a tokens). |
| [analisis-delta-develop-a-main.md](analisis-delta-develop-a-main.md) | Detalle del release candidate pendiente de promover a main. |
| [tareas-analizar-ramas-pendientes-de-integracion.md](tareas-analizar-ramas-pendientes-de-integracion.md) | Tareas T-NNN con DAG y cobertura analisis -> tarea. |
| [progreso-analizar-ramas-pendientes-de-integracion.md](progreso-analizar-ramas-pendientes-de-integracion.md) | Lista de tareas con estado y conteo. |
| [decisiones-analizar-ramas-pendientes-de-integracion.md](decisiones-analizar-ramas-pendientes-de-integracion.md) | Decisiones tomadas durante la ejecucion (al cierre). |
