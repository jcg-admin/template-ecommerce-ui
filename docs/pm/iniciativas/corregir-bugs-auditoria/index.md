# Iniciativa: corregir-bugs-auditoria

**Estado:** EN CURSO
**Creada:** 2026-05-30
**Origen:** Auditoría post-deploy — 8 capas (imports, React, Redux, MSW, SCSS, a11y, seguridad, rendimiento)
**Rama:** main

## Contexto

Auditoría completa ejecutada tras corregir los bugs de la sesión anterior
(BUG-LOGIN, BUG-SEARCH, BUG-SCROLL, BUG-PAG, BUG-SASS, BUG-NAV, BUG-CART).
Se detectaron bugs residuales en CSS custom properties, keys de React,
accesibilidad, SCSS y cobertura MSW del panel admin.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `plan.md` | Fases y tareas atómicas |
| `registro-de-bugs.md` | Detalle técnico de cada bug |

## Resumen de fases

| Fase | Severidad | Bugs | Estado |
|------|-----------|------|--------|
| F1 | CRÍTICA | BUG-CSS-01, BUG-CSS-02 | COMPLETADA |
| F2 | MEDIA | BUG-KEY-01 (28 ocurrencias) | COMPLETADA |
| F3 | BAJA | BUG-ACC-01 (10 inputs) | COMPLETADA |
| F4 | BAJA | BUG-SCSS-01 (16 ocurrencias) | COMPLETADA |
| F5 | BAJA | BUG-MSW-01 (28 endpoints) | PENDIENTE |
| F6 | INFO | BUG-SCSS-02 (12 archivos) | PENDIENTE |
