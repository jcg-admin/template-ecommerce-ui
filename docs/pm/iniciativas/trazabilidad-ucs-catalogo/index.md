# Iniciativa: trazabilidad-ucs-catalogo

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — tomar el catálogo de UCs de la documentación de
e-commerce como referencia, mapear contra el template e implementar lo faltante.

## Motivo

El catálogo formal de UCs vive en la documentación de e-commerce (Sphinx) y no
existía un mapeo explícito catálogo→implementación en el UI. Esta iniciativa
produce esa **matriz de trazabilidad** y **cierra los huecos de UI** reales.

## Estado actual

Premise Gate 0c → **COLAPSAR**. De 158 UCs del catálogo:

| Estado | Total |
|--------|-------|
| IMPLEMENTADO | 123 |
| BACKEND-OPS (server, no UI) | 23 |
| **AUSENTE-UI** | **8** |

Los 8 huecos a implementar: UC-AUTH-16, UC-SRCH-02, UC-PRO-04, UC-PRO-05,
UC-LOG-01, UC-LOG-02, UC-LOG-06, UC-LOG-07.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-*.md` | Premisa verificada (gate 0c), qué cubre, criterio, fuera de alcance |
| `matriz-trazabilidad-ucs.md` | Los 158 UCs clasificados con evidencia |
| `parciales/` | Tablas por familia (salida de los 5 agentes clasificadores) |
| `plan-*.md` | Fases para implementar los 8 huecos UI |
| `tareas-*.md` | Tareas atómicas |
| `progreso-*.md` | Log |

> Nomenclatura: el término correcto es **e-commerce**.
