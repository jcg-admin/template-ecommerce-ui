# Deep analysis — 4 gaps funcionales de la auditoría de UCs

```yml
tipo: analisis-profundo
fecha: 2026-06-02T20:26:29
autor: claude
fuente_specs: /tmp/references/e-comerce-docs/source/requisitos/casos-uso/{auth,orders,promociones,config}/
metodo: lectura completa de cada UC .rst + código real + contrato MSW
```

## Hallazgo transversal

Los 4 gaps no son homogéneos. Al leer la spec canónica completa de cada UC y
compararla con el código + el mock MSW, aparece un patrón: **el UI se construyó
contra el mock MSW, y para varios endpoints el mock DRIFTA de la spec canónica
del UC.** Es decir, parte de lo "implementado" cumple el mock pero no el UC.
Esto matiza el veredicto: no basta con "cablear UI" — en 2 de 4 hay que
reconciliar el contrato (thunk + mock) con el catálogo.

| UC | Thunk/endpoint actual | Endpoint canónico (UC 7C) | ¿Mock alineado? |
|----|------------------------|----------------------------|-----------------|
| ORD-04 | `POST /api/v1/orders/<n>/cancel/` (`ordersSlice.js:20`) | `POST /api/v1/<order_number>/cancel/` | **SÍ** (`orders.ts:53`) — solo falta UI |
| AUTH-16 | `DELETE /api/v1/auth/account/` (`authSlice.js:159`) | `POST /api/v1/auth/me/deactivate/` con `{password}` | **NO** — verbo, path, payload y semántica difieren |
| PRO-04 | `GET /admin/vouchers/<id>/usage/` (`admin.ts:436`) | `GET /api/v1/admin/vouchers/report/` (agregado) | **NO** — no existe endpoint agregado |
| CFG-05 | `/admin/settings/` con `contact_email` plano | `PATCH /api/v1/config/settings/` con `support_email` + `social_links{}` | **NO** — nombres de campo y estructura difieren |

---

## UC-ORD-04 — Cancelar orden (cliente) · tamaño: PEQUEÑO · riesgo: BAJO

**Spec:** actor Comprador; desde el detalle de la orden solicita cancelar →
confirmación obligatoria → `POST /<order_number>/cancel/` con `{reason}` opcional.
Solo cancelable en estados PENDING/PROCESSING (≈ PAYMENT_PENDING/PAGADA antes de
envío). Idempotencia: segunda llamada sobre CANCELLED → 400.

**Estado real:** el thunk `cancelOrder` (`ordersSlice.js:44`) **ya usa el endpoint
canónico** y el mock (`orders.ts:53`) lo soporta; tiene tests de reducer. **Solo
falta la UI:** `OrderDetailPage.jsx` no importa ni dispara `cancelOrder`, y no hay
botón "Cancelar" gateado por estado.

**Fix:** en `OrderDetailPage`, botón "Cancelar pedido" visible solo si
`status ∈ {PENDING, PROCESSING}` → ConfirmModal → `dispatch(cancelOrder)` → toast.
~1 archivo de producción + test. **No toca contrato ni mock.**

---

## UC-AUTH-16 — Dar de baja cuenta · tamaño: MEDIO · riesgo: MEDIO

**Spec:** baja **lógica** (`is_active=False`, `reason='self_deleted'`), NO borrado
físico. Flujo: el comprador introduce su **password actual** →
`POST /api/v1/auth/me/deactivate/` con `{password}` → API valida `check_password`
→ 200 `{detail}`. AC-02: password incorrecto → 400, cuenta sigue activa. Rate-limit
(AC-03). UI sugerida: `DeactivateAccountPage` + entrada en AccountLayout.

**Estado real (drift en 3 capas):**
- `authSlice.js:159` usa `DELETE /api/v1/auth/account/` (sin password).
- `SecurityPage.jsx:118` → ConfirmModal → `deleteAccount` **sin pedir contraseña**.
- Mock `auth.ts:138` `http.delete('/auth/account/')` → 204, **sin validar password**.

Semánticamente es "eliminar" en vez de "baja lógica con reautenticación". Incumple
flujo pasos 3-5 y AC-02 (no se puede validar un password que nunca se envía).

**Fix:** (1) thunk → `POST /auth/me/deactivate/` con `{password}`; (2) UI: campo de
contraseña en el card de baja de `SecurityPage` (o `DeactivateAccountPage`
dedicada); (3) mock: validar password (200 ok / 400 incorrecto). + tests
red→green. **Reconcilia contrato con el catálogo.**

---

## UC-PRO-04 — Reporte de uso de vouchers · tamaño: MEDIO-GRANDE · riesgo: BAJO

**Spec:** actor Admin. Reporte **agregado** por voucher: `current_uses`, suma de
`voucher_discount`, suma de `total` (órdenes DELIVERED/SHIPPED), **ordenado por
`-current_uses`**; filtros por rango de fechas/estado; **ROI** por voucher
(`revenue/discount`); **export CSV** (Alt B/C). Endpoint
`GET /api/v1/admin/vouchers/report/` (staff).

**Estado real:** existe vista **por-voucher** (`AdminVoucherDetailPage.jsx:186` →
`/admin/vouchers/<id>/usage/`) — cubre el paso 4 (detalle), pero NO los pasos 1-3
y 5 (lista agregada, ranking, filtros, ROI) ni el export. No hay endpoint
`/vouchers/report/` mockeado.

**Fix:** nueva `AdminVoucherReportPage` (tabla agregada + ranking + ROI + filtros +
botón CSV) + thunk `fetchVoucherReport` + handler MSW agregado + ruta
`admin/vouchers/report` + entrada en AdminSidebar + tests. La vista por-voucher se
conserva. **Feature nueva, aislada (no rompe nada existente).**

---

## UC-CFG-05 — Gestionar datos de contacto · tamaño: GRANDE · riesgo: MEDIO-ALTO

**Spec:** campos `support_email`, `phone`, `address`, `social_links` (dict
`{facebook, instagram, youtube, ...}`). Endpoint `PATCH /api/v1/config/settings/`.
**POST-02 (crítico):** los cambios son visibles **de inmediato en el footer y la
página de contacto**. Alt A/B/C: agregar/quitar redes, plataforma custom.

**Estado real (el más incompleto):**
- Tras DR-02, `AdminSystemSettingsPage` tiene `contact_email` + `support_phone`,
  pero **perdió** `support_email`/`facebook_url`/`instagram_url`/`support_hours`.
- Ni antes ni ahora hubo `address` ni `social_links` como **dict**.
- **Footer y ContactPage NO consumen settings** (grep → 0): aunque se agreguen los
  campos al admin, POST-02 no se cumpliría sin cablear el storefront.

**Fix (cross-cutting):** (1) sección "Datos de contacto" en el settings page con
`support_email`, `phone`, `address`, `social_links{}`; (2) alinear nombres al
sub-contrato canónico; (3) mock con esos campos; (4) **wire Footer + ContactPage**
para leerlos (POST-02). Toca storefront + admin + mock. **Mayor alcance y la
decisión de producto más abierta** (¿social como dict editable? ¿footer dinámico?).

---

## Síntesis y recomendación

| UC | Tamaño | Riesgo | Toca contrato/mock | Toca storefront |
|----|--------|--------|--------------------|-----------------|
| ORD-04 | Pequeño | Bajo | No | No |
| AUTH-16 | Medio | Medio | Sí (auth) | No |
| PRO-04 | Medio-grande | Bajo | Sí (nuevo endpoint) | No |
| CFG-05 | Grande | Medio-alto | Sí (settings) | Sí (footer+contacto) |

**Orden sugerido:** ORD-04 → AUTH-16 → PRO-04 → CFG-05. Los dos primeros son
acotados y de alto valor (flujos de comprador). PRO-04 es feature aislada. CFG-05
requiere una decisión de producto sobre el footer dinámico antes de ejecutar.

**Decisión calibrada:** ORD-04, AUTH-16 y PRO-04 son ejecutables con TDD sin
ambigüedad de producto. CFG-05 conviene acotarlo (¿incluye cablear footer/contacto
o solo el admin + mock?) antes de tocar código.
