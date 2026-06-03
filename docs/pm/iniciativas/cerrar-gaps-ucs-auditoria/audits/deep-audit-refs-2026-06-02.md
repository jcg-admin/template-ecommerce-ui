```yml
artefacto: deep-audit-refs
tipo: auditoria
dominio: ui
estado: completado
version: 1.0.0
fecha_creacion: 2026-06-02T21:58:46
autor: claude
clasificacion: PROVEN
iniciativa: cerrar-gaps-ucs-auditoria
```

# Deep Audit — Reuso de componentes + Contrato canonico (refs)

```rst
.. reporte::
   :agente: deep-audit (read-only sobre codigo)
   :tarea: Auditar reuso de componentes adaptados + contrato canonico de endpoints en los componentes/paginas NUEVOS de la iniciativa cerrar-gaps-ucs-auditoria
   :fecha: 2026-06-02
   :herramientas: Read, Grep, Bash
   :basado-en: ui@fa4c8d4 (claude/brave-lamport-BUmBM) + e-comerce-docs /tmp/references/e-comerce-docs/source
```

## Alcance

Dos ejes sobre los archivos cambiados por la iniciativa y su correccion de refs:

- **Eje 1 — Reuso de componentes:** detectar HTML crudo que duplica un
  componente adaptado existente en `src/components/common/`.
- **Eje 2 — Contrato canonico:** verificar que cada endpoint y payload
  coincide con el canon (`rest-api-conventions.rst` + UCs auth-16,
  ord-04, pro-04, cfg-05).

Modo solo-lectura sobre codigo: **no se modifico ningun archivo de codigo**.

---

## Eje 1 — Reuso de componentes (Componentes)

| Archivo:linea | Hallazgo | Severidad | Recomendacion |
|---|---|---|---|
| `src/pages/admin/AdminVoucherReportPage.jsx:107-114` | Tabla del reporte usa el componente adaptado `DataGrid` (import L17, render L107) con `columns/rows/pageSize/getRowKey/emptyText/ariaLabel`. CONFORME — alineado con AdminUsersPage/AdminVoucherDetailPage. | OK (CONFIRMADO) | Ninguna. Es el patron correcto para tablas. |
| `src/pages/admin/AdminVoucherReportPage.jsx:93-95` | Filtro "Estado" usa `<select>` crudo (single-select). No existe un componente adaptado equivalente a un `<select>` de formulario: `Dropdown` (`Dropdown.jsx:29` + `DropdownItem/DropdownDivider`) es un menu popover, NO un select de formulario controlado por `value/onChange`. `MultiSelect` es multi-seleccion (no aplica a single). El primitive `Field` (`primitives/index.jsx:54`) solo soporta input/textarea, no select. | NICE-TO-HAVE (no bloqueante) | Aceptable como `<select>` crudo. NO sustituir por `Dropdown` (semantica distinta). Si se quiere unificar, crear un primitive `Select` reutilizable — fuera del alcance de esta iniciativa. |
| `src/pages/admin/AdminVoucherReportPage.jsx:99,103` | Filtros "Desde"/"Hasta" usan `<input type="date">` crudo, pero existe el componente adaptado `DatePicker` (`DatePicker/DatePicker.jsx:48`, props `value/onChange`) que es el fit correcto para entrada de fechas. | NICE-TO-HAVE | Considerar `DatePicker` para consistencia visual con el resto del admin. No es must-fix: `<input type=date>` es funcional y accesible. Un `DateRangePicker` (existe en `DatePicker/DateRangePicker.jsx`) cubriria ambos filtros en un solo control. |
| `src/pages/account/OrderDetailPage.jsx:308-315` | Cancelacion de pedido usa `ConfirmModal` (import L17, render L308) con `open/message/confirmLabel/variant=danger/onConfirm/onClose`. CONFORME — patron correcto. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/account/OrderDetailPage.jsx:320-346` | El sub-modal "Reportar problema de envio" (UC-LOG-07) usa un overlay con estilos inline crudos (`position:fixed; inset:0; ...`) y `<textarea>` crudo en vez del componente adaptado `Modal` (`src/components/common/Modal/`). Esto es codigo PRE-EXISTENTE en `SupportCard`, no introducido por el boton de cancelar de esta iniciativa, pero convive en el mismo componente cambiado. | NICE-TO-HAVE (fuera de alcance) | Migrar a `Modal` en una iniciativa de limpieza separada. No es parte del gap UC-ORD-04 auditado. |
| `src/pages/account/SecurityPage.jsx:85-87` | Campos de cambio de contrasena usan el primitive adaptado `Field` (import L16) con `type=password`. CONFORME. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/account/SecurityPage.jsx:120-125` | Campo "Confirma tu contrasena" (reautenticacion de baja, UC-AUTH-16) usa el primitive `Field` `type=password`. CONFORME. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/account/SecurityPage.jsx:139-148` | Confirmacion de baja de cuenta usa `ConfirmModal` (import L15) con `variant=danger/loading`. CONFORME. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/account/SecurityPage.jsx:126-133` | Boton "Solicitar eliminacion" usa `<button>` crudo con clase SCSS local en vez del primitive `Button`. El resto de la pagina usa `Button` (L89, L108). Inconsistencia menor de estilo, no de contrato. | NICE-TO-HAVE | Usar `<Button variant="danger">` para consistencia. No bloqueante. |
| `src/pages/admin/AdminSystemSettingsPage.jsx:90-111` | Campos de contacto/generales se renderizan con `<input>` crudo dentro del loop `FIELDS` (no usan el primitive `Field`). Es un patron de form admin con `<label htmlFor>` + `<input>` correctamente asociados (accesible). El primitive `Field` soporta el caso text/email/tel/number pero NO `checkbox` (el loop incluye 2 checkboxes), por lo que migrar exigiria un branch. | NICE-TO-HAVE | Aceptable. El `<input>`+`<label>` es accesible y el `Field` no cubre checkbox sin extension. No es must-fix. |
| `src/pages/admin/AdminSystemSettingsPage.jsx:114-130` | Redes sociales en `<fieldset>`+`<legend>`+`<input type=url>` crudo. Semanticamente correcto para agrupar campos relacionados. No hay componente adaptado de "grupo de inputs". | OK (aceptable) | Ninguna. El `<fieldset>`/`<legend>` es la semantica HTML correcta. |
| `src/components/layout/Footer/index.jsx:100-101` | Enlaces sociales usan `<a target=_blank rel=noopener noreferrer>` crudo. Es lo correcto para enlaces externos de footer. | OK (CONFIRMADO esperado) | Ninguna. |

### Sintesis Eje 1

- **Must-fix de reuso: 0.** No hay ningun caso donde un componente adaptado
  sea claramente el fit correcto y se haya duplicado con HTML crudo. El unico
  candidato fuerte (tablas → `DataGrid`) YA esta corregido en
  AdminVoucherReportPage.
- **Nice-to-have: 4** (Estado→Select inexistente; fechas→DatePicker;
  boton baja→Button; sub-modal envio→Modal). Ninguno bloquea el cierre de
  la iniciativa; el `Dropdown` NO es sustituto valido del `<select>` de
  formulario (semantica de menu, no de control de form).

---

## Eje 2 — Contrato canonico (Contrato)

| Archivo:linea | Hallazgo | Severidad | Recomendacion |
|---|---|---|---|
| `src/redux/slices/authSlice.js:161` | `POST /api/v1/auth/me/deactivate/` con `{ password }`. Canon: `uc-auth-16:71` (`POST /api/v1/auth/me/deactivate/`) y `uc-auth-16:168` (`{password}`). COINCIDE exacto. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/account/SecurityPage.jsx:54` | `dispatch(deleteAccount({ password: deletePwd }))` — campo `password`. Canon `uc-auth-16:168`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/mocks/handlers/auth.ts:139-141` | Mock `POST /api/v1/auth/me/deactivate/` lee `body.password`, 400 si incorrecto (AC-02). COINCIDE con canon (path + campo + AC-02). | OK (CONFIRMADO) | Ninguna. |
| `src/redux/slices/ordersSlice.js:20,48` | `CANCEL_URL = /api/v1/orders/${orderNumber}/cancel/`, POST con `{ reason: reason || '' }`. Canon `uc-ord-04:445`: `/api/v1/<order_number>/cancel/` montado bajo `apps.orders.urls` (= `/api/v1/orders/`); `reason` opcional default `""` (`uc-ord-04:471`). COINCIDE (path efectivo + campo + opcionalidad). | OK (CONFIRMADO) | Ninguna. Ver nota sobre `rest-api-conventions:111` abajo. |
| `src/pages/account/OrderDetailPage.jsx:274` | `cancelOrder({ orderNumber: order.order_number, reason: '' })`. Usa `order_number` y `reason` vacio (opcional). COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/mocks/handlers/orders.ts:53` | Mock `http.post('/api/v1/orders/:orderNumber/cancel/')`. COINCIDE con path canonico. | OK (CONFIRMADO) | Ninguna. |
| `src/redux/slices/vouchersSlice.js:14,77` | `${ADMIN_VOUCHERS_URL}report/` = `/api/v1/admin/vouchers/report/` (GET con `params`). Canon `uc-pro-04:305,377-379`: `GET /api/v1/admin/vouchers/report/` (English identifiers, DEC-DOC-005). COINCIDE exacto. | OK (CONFIRMADO) | Ninguna. |
| `src/mocks/handlers/admin.ts:449` | Mock `GET /api/v1/admin/vouchers/report/`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/hooks/domain/useSystemSettings.js:11` | `URL = '/api/v1/config/settings/'` (GET). Canon `rest-api-conventions:92`, `uc-cfg-05:393`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/redux/slices/settingsSlice.js:16` | `PATCH /api/v1/config/settings/`. Canon `uc-cfg-05:397`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/hooks/domain/usePublicSettings.js:17` | `URL = '/api/v1/config/settings/'` (GET, lectura publica de contacto). Canon `uc-cfg-05:379,393`: el subconjunto publico se lee del MISMO singleton `/config/settings/`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/mocks/handlers/admin.ts:184,207` | Mock GET/PATCH `/api/v1/config/settings/` con `support_email`, `phone`, `address`, `social_links` (L195-203). Campos canon `uc-cfg-05:411-414,421-425`. COINCIDE. | OK (CONFIRMADO) | Ninguna. |
| `src/pages/admin/AdminSystemSettingsPage.jsx:27-29,61-63` | Campos `support_email`, `phone`, `address`, `social_links` (dict anidado). Canon `uc-cfg-05:395-396,421-425`. COINCIDE en nombres. | OK (CONFIRMADO) | Ninguna. |
| `social_links` keys: `Footer/admin.ts/AdminSystemSettingsPage` usan `facebook,instagram,youtube` | Canon `uc-cfg-05:414-417` ejemplo: `facebook,instagram,youtube` (keys comunes documentados `uc-cfg-05:425-427` incluyen tambien `twitter,tiktok`). `social_links` es dict de estructura libre. COINCIDE (subset valido). | OK (CONFIRMADO) | Ninguna. |
| Repo-wide | `grep -rn "admin/settings\|settings/public" src/` → **0 resultados**. No queda ningun path residual `/admin/settings/` ni `/settings/public/`. | OK (CONFIRMADO) | Ninguna. La correccion de refs esta completa. |

### Nota — `rest-api-conventions.rst:111` vs `uc-ord-04:445`

`rest-api-conventions:111` da un ejemplo GENERICO de la regla "sin verbos en
el path": `/orders/cancel/` (incorrecto) → `/orders/{id}/cancellations/`
(correcto). Sin embargo, el UC autoritativo de la operacion
(`uc-ord-04:443-445`) define explicitamente el endpoint real como
`POST /api/v1/<order_number>/cancel/`. El UC especifico prevalece sobre el
ejemplo ilustrativo de la convencion general; la API real implementa
`/cancel/`, y el UI/mock estan alineados con la API real. **No es una
discrepancia del UI** — es una tension documental entre el ejemplo generico
de la convencion y la decision concreta del UC. (Registrable como gap de
docs en `e-comerce-docs`, fuera del alcance de este repo UI.)

---

## Conclusion

| Eje | CONFIRMADOS | DISCREPANCIAS (must-fix) | NICE-TO-HAVE |
|---|---|---|---|
| Eje 1 — Componentes | 6 | 0 | 4 |
| Eje 2 — Contrato | 14 | 0 | 0 |
| **Total** | **20** | **0** | **4** |

- **0 discrepancias must-fix** en ambos ejes. Todos los endpoints y payloads
  del UI/mock coinciden con el canon; el reuso de los componentes adaptados
  criticos (DataGrid para tablas, ConfirmModal para confirmaciones, Field
  para inputs) es correcto.
- **4 nice-to-have de reuso**, ninguno bloqueante: filtro Estado (no existe
  Select adaptado; `Dropdown` no es valido como sustituto), filtros de fecha
  (DatePicker disponible), boton de baja (usar Button), y el sub-modal de
  reporte de envio pre-existente (usar Modal) — este ultimo fuera del alcance
  del gap UC-ORD-04.
- **Tension documental** registrada entre `rest-api-conventions:111` (ejemplo
  generico) y `uc-ord-04:445` (endpoint real `/cancel/`); el UI sigue el
  endpoint real, no es defecto del UI.
```
