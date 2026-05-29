# corregir-bugs-detectados

| Campo | Valor |
|-------|-------|
| Slug | corregir-bugs-detectados |
| Estado | Abierta |
| Fecha de apertura | 2026-05-29 |
| Origen | Auditoría sistemática post-integración en browser |
| Metodología | Lectura de código + cruce automatizado selector vs initialState vs exports |

## Objetivo

Corregir los 16 bugs encontrados en la auditoría sistemática de las 99 páginas,
25 slices y handlers MSW. Ordenados por severidad e impacto en el flujo demo.

## Documentos

| Documento | Descripción |
|-----------|-------------|
| [registro-de-bugs](registro-de-bugs.md) | Ficha detallada de cada bug |
| [plan-de-correcciones](plan-de-correcciones.md) | Orden, agrupación y criterio de fix |

## Resumen

| Severidad | Bugs | Descripción |
|-----------|------|-------------|
| CRÍTICO | 1 | Flujo de compra roto — /confirmacion vs /confirmation |
| ALTO | 8 | Selectores y thunks incorrectos — páginas con datos vacíos |
| MEDIO | 5 | UX degradada, links rotos, ventana nativa de confirm |
| BAJO | 1 | console.error en producción |
| PARCIAL | 2 | Antipatrones no críticos — no causan crash |

## Estado de fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| F1 | BUG-RT-01 + BUG-RT-03 — rutas rotas (2 fixes) | COMPLETADA |
| F2 | BUG-TH-01 + BUG-TH-02 — thunks en slice equivocado | COMPLETADA |
| F3 | BUG-LB-01 — LoadingButton desde barrel incorrecto | PENDIENTE |
| F4 | BUG-SL-01..06 — selectores incorrectos (6 páginas) | PENDIENTE |
| F5 | BUG-TH-03 — addCase faltantes en adminSlice | PENDIENTE |
| F6 | BUG-RT-02 — 7 rutas /info/* sin registrar | PENDIENTE |
| F7 | BUG-CONF-01 — window.confirm en 10 páginas | PENDIENTE |
| F8 | BUG-MSW-01 — count incorrecto en handlers | PENDIENTE |
| F9 | BUG-LOG-01 + BUG-SL-06 — antipatrones menores | PENDIENTE |
