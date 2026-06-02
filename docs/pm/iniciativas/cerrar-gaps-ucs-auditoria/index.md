# Iniciativa: cerrar-gaps-ucs-auditoria

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-02
**Origen:** 4 gaps funcionales MEDIA de la auditoría de UCs (`trazabilidad-ucs-catalogo/auditoria-ucs-2026-06-02.md` + `analisis-profundo-gaps-2026-06-02.md`).

## Premisa verificada (Premise Gate)

| Campo | Valor |
|-------|-------|
| Nivel de gate | 0c (deep analysis: spec .rst + código + mock MSW) |
| Red flags | RF-3 (contrato), RF-1 (drift documentado) |
| Resultado | **CONFIRMAR** |
| Evidencia | `analisis-profundo-gaps-2026-06-02.md` (commit ceaafa2) — file:line por gap |

## Alcance

Cerrar los 4 gaps con TDD, alineando el **contrato MSW** a la spec canónica del UC
donde aplique (decisión del usuario: los 4 completos, CFG-05 hasta footer+contacto).

| Fase | UC | Entregable |
|------|----|-----------|
| F1 | UC-ORD-04 | Botón "Cancelar pedido" en `OrderDetailPage` (gateado por estado) → `cancelOrder` + ConfirmModal + test |
| F2 | UC-AUTH-16 | Thunk → `POST /auth/me/deactivate/` `{password}`; campo password en SecurityPage; mock valida password; baja lógica + tests |
| F3 | UC-PRO-04 | `AdminVoucherReportPage` (agregado, ranking, ROI, CSV, filtros) + thunk + mock `/admin/vouchers/report/` + ruta + nav + tests |
| F4 | UC-CFG-05 | Campos `support_email`/`phone`/`address`/`social_links{}` en settings + mock; Footer + ContactPage dinámicos desde settings (POST-02) + tests |
| F5 | — | Verificación full (jest + check-scss + build:demo) + actualizar matriz (PARCIAL→IMPLEMENTADO) + cierre |

## Índice

| Archivo | Descripción |
|---------|-------------|
| `plan-cerrar-gaps-ucs-auditoria.md` | Fases con tareas atómicas TDD |
| `progreso-cerrar-gaps-ucs-auditoria.md` | Log por fase |
| `decisiones-cerrar-gaps-ucs-auditoria.md` | Decisiones + cierre |
