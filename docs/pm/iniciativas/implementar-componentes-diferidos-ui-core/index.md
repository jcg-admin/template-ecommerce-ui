# implementar-componentes-diferidos-ui-core

| Campo | Valor |
|-------|-------|
| Slug | implementar-componentes-diferidos-ui-core |
| Estado | Cerrada |
| Fecha de apertura | 2026-05-28 |
| Origen | Auditoría de cobertura ui-core-5.25.0 — 11 componentes diferidos |

## Objetivo

Implementar los 11 componentes de ui-core-5.25.0 que quedaron diferidos en
`integrar-componentes-ui-core-js`, con toda su lógica, opciones y API.

## Componentes

| Componente | Complejidad | Grupo |
|-----------|-------------|-------|
| alert | Baja | Standalone |
| loading-button | Baja | Primitivo (mejora del existente) |
| popover | Baja | Extensión de Tooltip |
| chip | Media | Standalone |
| chip-input | Media | Depende de chip |
| offcanvas | Media | Overlay (<dialog>) |
| scrollspy | Media | Observador |
| calendar | Alta | Base de DatePicker |
| date-picker | Alta | Depende de Calendar |
| date-range-picker | Alta | Depende de Calendar + TimePicker |
| time-picker | Alta | Standalone |

## Documentos

| Documento | Estado |
|-----------|--------|
| [progreso](progreso-implementar-componentes-diferidos-ui-core.md) | Activo |
| [decisiones](decisiones-implementar-componentes-diferidos-ui-core.md) | Pendiente al cierre |
