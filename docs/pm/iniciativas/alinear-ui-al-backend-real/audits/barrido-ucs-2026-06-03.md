```yml
created_at: 2026-06-03T03:54:42
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
```

<!--
.. reporte::
   :agente: uc-sweep-audit (READ-ONLY)
   :tarea: Barrido de la matriz de trazabilidad de UCs vs backend Django real vs narrativas
   :fecha: 2026-06-03
   :herramientas: Read, Grep, Bash (grep -c, comm, test -f, git rev-parse)
   :basado-en: api develop @ d0cba50, docs e-comerce-docs @ b0b6489, UI @ 173fef1
-->

# Barrido de UCs — UI vs backend real vs narrativas (2026-06-03)

**SHAs:** backend `e-comerce/api` @ `d0cba50` · docs `e-comerce-docs` @ `b0b6489`
· UI `template-ecommerce-ui` @ `173fef1`.

**Conteos verificados de la matriz** (`grep -cE '\| ESTADO \|'` sobre
`docs/pm/iniciativas/trazabilidad-ucs-catalogo/matriz-trazabilidad-ucs.md`):
**127 IMPLEMENTADO, 7 AUSENTE-UI, 27 BACKEND-OPS**. UC-ids: catálogo canónico
129, matriz 158 (`grep -oE 'UC-[A-Z]+-[0-9]+' | sort -u | wc -l`).

> Origen: barrido en paralelo solicitado por el ejecutor (2026-06-03), junto con
> la fase F2 de `adaptar-gap-kno-react` (Switch). Read-only; este reporte lo
> persistió el orquestador.

--------

## DRIFT — endpoint UI inventado / divergente del mount real (vivo)

H-UI-PRO-03 — Vouchers `duplicate/` y `toggle/` no existen en el backend
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** ALTA
- **Archivos:** `src/redux/slices/adminSlice.js:747` (`POST /api/v1/admin/vouchers/${id}/duplicate/`)
  y `:755` (`POST /api/v1/admin/vouchers/${id}/toggle/`); cableados en vivo en
  `src/pages/admin/AdminVouchersPage.jsx:119,124` (botones Duplicar / activar-desactivar).
- **Backend real:** `apps/voucher/views.py:105,124,161` — el `VoucherViewSet`
  solo expone `@action` `activate`, `deactivate`, `report`. No hay `duplicate`
  ni `toggle` → 404.
- **Impacto:** es la única forma de activar/desactivar un voucher desde la lista.
- **Fix sugerido:** `toggleVoucherActive` → usar `activate`/`deactivate` según
  estado; `duplicateVoucher` → eliminar (no hay respaldo) o crear vía POST normal
  pre-poblado. **Estado:** DOCUMENTADO (sin fix inmediato).

H-UI-CAT-12 — price-sync: ruta de template y contrato preview/apply divergentes
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** ALTA
- **Archivos:** `src/pages/admin/AdminPriceSyncPage.jsx:14-16` importa de
  `adminSlice.js` (no del `priceSyncSlice.js` canónico). Divergencias vs
  `apps/catalogue/browse_admin_urls.py` + `apps/catalogue/price_sync_views.py:90-116`:
  1. `adminSlice.js:816` `GET /price-sync/template/` vs real `price-sync/template.csv` → 404.
  2. `preview-csv` real devuelve `{session_id, preview, valid_count}`
     (`price_sync_views.py:99-105`); la página lee `preview.sync_id`/`.diffs`/
     `.total_increase`/`.not_found` (`AdminPriceSyncPage.jsx:54,127,132,138`) → shape mismatch.
  3. `apply-csv` real espera `{session_id}` (`:115`); `confirmPriceSync`
     (`adminSlice.js:807`) envía `{sync_id: syncId}` con `syncId` undefined → 400.
- **Nota:** `priceSyncSlice.js` (NO cableado a la página) usa las rutas correctas
  `preview-csv/apply-csv/preview-percentage/apply-percentage`, pero su payload
  `{token}` tampoco coincide con `{session_id}`. Además el UI no expone la variante
  `percentage`.
- **Fix sugerido:** cablear `AdminPriceSyncPage` al `priceSyncSlice` canónico,
  alinear payload a `{session_id}` y el shape de lectura a `{session_id, preview,
  valid_count}`, corregir `template.csv`, y considerar exponer `apply-percentage`.
  **Estado:** DOCUMENTADO (sin fix inmediato).

## HUECO DE COBERTURA — UC del catálogo canónico ausente de la matriz

H-UI-LOG-09 — "Calcular Costo de Envío" no está en la matriz
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** MEDIA
- **Evidencia:** `catalogo-ucs.rst:2073` (Capa 2 UC "Pendiente — fuera de alcance",
  `apps.orders`, criticidad ALTO). Ausente de la matriz (`comm -23`).
- **Acción:** decidir narrativa + UI, o marcar explícitamente server-only.
  **Estado:** DOCUMENTADO.

H-UI-PAY-10 — "Generar Recibo de Pago (PDF)" UC fantasma (no accionable)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** BAJA
- **Evidencia:** `catalogo-ucs.rst:1359` rotulado "[UC FANTASMA] / archivo no
  existe". Ausente de la matriz correctamente. Solo se reporta para cerrar el diff.

## CITA ROTA / staleness documental

H-DOC-01 — Filas snapshot marcan AUSENTE-UI pero ya están implementadas
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** BAJA
- **Evidencia:** `matriz...:77,106,162,163,167` marcan UC-LOG-01/02/06, UC-SRCH-02,
  UC-PRO-05 como AUSENTE-UI, pero el código existe y coincide con el backend:
  `logisticsSlice.js` (`/logistics/couriers/`, `/guides/`, `/guides/:id/confirm-delivery/`
  en `apps/logistics/urls.py:15-20`), `AdminCouriersPage.jsx`,
  `useSearchSuggestions.js` (`apps/catalogue/urls.py:18 autocomplete/`),
  `ReferralPage.jsx` + `referralSlice.js` (todos `test -f` OK). Drift documental,
  no de código.

H-DOC-02 — Conteos del resumen de la matriz no cuadran con las filas
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** BAJA
- **Evidencia:** el resumen dice 131/23/0 (IMPL/BACKEND-OPS/AUSENTE-UI); el conteo
  real por fila es 127/27/7 (`grep -cE`). Reconciliar en el cierre.

## GAP AUSENTE-UI con respaldo real

Tras la verificación, **0 AUSENTE-UI con respaldo real sin implementar**: los 7
del snapshot ya tienen UI + endpoint real (H-DOC-01). Los BACKEND-OPS (UC-SYS-*,
UC-OPS-*, UC-NOT-*, UC-INC-*, UC-DB-RPT-*, webhooks PAY-03/04/07) son
genuinamente server-only sin mount REST de UI — correcto.

## Limpio por muestreo (sin drift)

auth (login/register/profile/change-password/verify-email/deactivate/logout-all/
password-reset/addresses), cart, catalogue (list/detail/search/autocomplete/
categories), orders (checkout/cancel/address/shipping + admin status/cancel),
payments (initiate/history/admin refund/eligibility-express), returns, wishlist,
settings (`/api/v1/admin/settings/` en `settings_app/admin_urls.py:19`),
inventory import (`inventory/import/`), variant adjust.

## Top 5 a fixear primero

1. **UC-PRO-03 ALTA** — vouchers `duplicate/`+`toggle/` (`adminSlice.js:747,755`).
2. **UC-CAT-12 ALTA** — price-sync `template/` → `template.csv` (`adminSlice.js:816`).
3. **UC-CAT-12 ALTA** — price-sync contrato preview/apply (`session_id` vs `sync_id`).
4. **UC-LOG-09 MEDIA** — hueco de cobertura (decidir narrativa/UI o server-only).
5. **H-DOC-01/02 BAJA** — reconciliar snapshot + conteos de la matriz.
