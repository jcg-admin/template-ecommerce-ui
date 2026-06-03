# Auditoría de UCs — consolidado (2026-06-02)

```yml
tipo: auditoria-trazabilidad
fecha: 2026-06-02T20:26:29
autor: claude
metodo: 5 agentes en paralelo (1 por familia) verificando la matriz contra el
        catalogo canonico /tmp/references/e-comerce-docs y el codigo a HEAD c3e8b98
fuente_catalogo: /tmp/references/e-comerce-docs/source/requisitos/casos-uso/ (155 UC ids)
parciales: parciales/auditoria-{auth-cart-search,catalogo-promo-reviews,orders-returns-payments,logistics-notif-config,admin-system-reports}-2026-06-02.md
```

## Veredicto

**154 filas de la matriz auditadas. ~150 correctas; 4 gaps funcionales reales
(UC marcado IMPLEMENTADO pero aceptación del UC no cumplida del todo); 0
artefactos faltantes.** El resto de "discrepancias" reportadas por los agentes
son **drift documental** (citas), no defectos de código.

| Familia | Filas | Confirmadas | Gaps funcionales | Drift documental |
|---------|-------|-------------|------------------|------------------|
| AUTH/CART/WISH/SRCH/COM | 30 | 28 | 1 (AUTH-16) | 10 citas de test con ruta vieja + SRCH-02 endpoint menor |
| CAT/PRO/QST/REV/NEW | 32 | 31 | 1 (PRO-04) | CAT-11 status vs is_active (equiv.) |
| ORD/RET/PAY | 26 | 25 | 1 (ORD-04) | shorthands de thunk |
| LOG/NOT/CFG/SUPP/CHT | 27 | 25 | 1 (CFG-05) | CFG-03 cita stale; LOG-01/02/06/07 labels snapshot |
| ADM/SYS/INV/REP/… | 39 | 39 | 0 | — |

## Gaps funcionales reales (4) — código, no documentación

| UC | Severidad | Hallazgo (PROVEN) | Recomendación |
|----|-----------|-------------------|---------------|
| **UC-AUTH-16** dar de baja cuenta | MEDIA | `authSlice.js:159` usa `DELETE /api/v1/auth/account/` sin contraseña. El UC exige reautenticación `POST .../deactivate/` con `{password}` (AC-02). La UI (`SecurityPage`) nunca pide la contraseña. | Cablear campo de contraseña + alinear endpoint, o ajustar el UC si el contrato real difiere. |
| **UC-PRO-04** reporte uso vouchers | MEDIA | Hay vista **por-voucher** (`AdminVoucherDetailPage.jsx:186` → `/admin/vouchers/<id>/usage/`). El UC pide reporte **agregado** (`/admin/vouchers/report/`, ranking, ROI, export CSV) — ausente. POST-01 (admin ve métricas) sí se cumple a nivel detalle. | Añadir página de reporte agregado, o reducir el alcance del UC. |
| **UC-ORD-04** cancelar orden (cliente) | MEDIA | Thunk `cancelOrder` existe y testeado (`ordersSlice.js:44` + `ordersSlice.cancel.test.js`), pero `OrderDetailPage.jsx` **no importa ni dispara** `cancelOrder` (grep → 0); el botón visible es "Solicitar reembolso" sin `onClick`. Capa redux lista, UI sin cablear. | Cablear botón "Cancelar" en OrderDetailPage al thunk. |
| **UC-CFG-05** gestionar datos de contacto | MEDIA | Tras DR-02 (consolidación SiteSettings), `AdminSystemSettingsPage` cubre `contact_email`+`support_phone` pero **perdió** `support_email`, `facebook_url`, `instagram_url`, `support_hours` (grep → 0) que tenía el `AdminSiteSettingsPage` borrado. Decisión DR-02 fue contract-driven (no están en el mock MSW). | Si el UC exige redes: añadirlas al contrato + página; si no, ajustar el UC. |

## Drift documental (corregido en este commit)

- **CFG-03 / CFG-05**: la matriz citaba `AdminSiteSettingsPage.jsx` + ruta
  `admin/config/site` (borrados hoy en DR-02). UC-CFG-03 **sigue satisfecho**
  por `AdminSystemSettingsPage` (tax_rate/currency/maintenance_mode). Evidencia
  actualizada en la matriz.
- **LOG-01/02/06/07**: filas snapshot decían AUSENTE-UI; la nota de cierre de la
  matriz (líneas 12-19) ya las daba por implementadas. Verificado implementadas
  (`logisticsSlice.js`, `AdminCouriersPage.jsx`, etc.).
- **Citas de test con ruta vieja (10)**: AUTH-11/12/15, CART-01/02/03/05,
  WISH-02/03, COM-01. Los tests **sí existen**, colocados en `src/` (p. ej.
  `src/pages/cart/CartPage.test.jsx`), no en `tests/unit/pages/`. Cobertura OK;
  solo la ruta citada quedó vieja. (No es defecto de UC.)
- **CAT-11** (status vs is_active) y **SRCH-02** (endpoint/debounce) — equivalentes
  funcionales, aceptación cumplida.

## Conclusión

La implementación de UCs está **sustancialmente correcta**: 0 UCs sin artefacto,
los 8 ex-huecos cerrados existen, y las 4 iniciativas recientes
(cablear-rutas-huerfanas, unificar-navs-cuenta, unificar-sitesettings) no
rompieron ningún UC salvo el efecto documentado en CFG-05 (campos de redes).
Quedan **4 gaps funcionales** de severidad MEDIA, candidatos a una iniciativa de
remediación `cerrar-gaps-ucs-auditoria`.
