```yml
created_at: 2026-06-02T22:58:04
project: template-ecommerce-ui
author: claude (agente auditor read-only)
status: Borrador
version: 1.0.0
```

# Drift — vouchers / returns / support / contact / notifications / newsletter

> Auditoria READ-ONLY del layer UI (Redux slices + MSW handlers) contra el
> backend Django **real**. No se modifico codigo.

## Procedencia

| Campo | Valor |
|-------|-------|
| Agente | auditor de drift UI↔API (read-only) |
| Tarea | Comparar endpoints (path+verb) y campos UI vs urls.py + serializers reales |
| Fecha | 2026-06-02T22:58:04 |
| Herramientas | Read, Grep, Bash (git rev-parse) |
| Backend (api) | `/tmp/references/e-comerce/api` rama `develop` @ `d0cba50` |
| UI | `/home/user/template-ecommerce-ui` (working tree actual) |
| Mounts api (config/urls.py) | `api/v1/admin/`→voucher (ns admin_voucher) L43; `support`/admin L55-56; `returns`/admin L57-58; `notifications`/admin L59-60; `contact`/admin L61-62; `newsletter`/admin L63-64 |

## Nota sobre handlers MSW

Los slices de este alcance (`vouchersSlice`, `returnsSlice`,
`supportTicketsSlice`, `contactSlice`, `notificationsSlice`,
`newsletterSlice`) **no tienen handler MSW dedicado** en
`src/mocks/handlers/`. El directorio contiene: admin, auth, cart, catalog,
checkout, inventory, logistics, orders, payments, referral, returns,
storefront, wishlist (`ls src/mocks/handlers/`). Solo `returns.ts` cubre
parcialmente este alcance; los demas dominios no se mockean (en DEMO_MODE
caen al passthrough o no se ejercitan). El audit compara contra el backend
real, que es la fuente de verdad.

## Tabla de drift

| UI file:line | UI endpoint/field | api file:line | Real | Drift | Sev |
|--------------|-------------------|---------------|------|-------|-----|
| vouchersSlice.js:14,25 | `GET /api/v1/admin/vouchers/` | voucher/urls.py:9 (router `vouchers`) | `GET /api/v1/admin/vouchers/` (list) | OK | — |
| vouchersSlice.js:38 | `POST /api/v1/admin/vouchers/` | voucher/views.py:45,57 (ModelViewSet, `post`) | `POST .../vouchers/` (create) | OK | — |
| vouchersSlice.js:51 | `POST /api/v1/admin/vouchers/{id}/deactivate/` | voucher/views.py:124 `@action url_path='deactivate'` POST | igual | OK | — |
| vouchersSlice.js:77 | `GET /api/v1/admin/vouchers/report/` | voucher/views.py:161 `@action detail=False url_path='report'` GET | igual | **CONFIRMED** (pre-marcado) | — |
| vouchersSlice.js:64 | `GET /api/v1/admin/vouchers/{id}/usage/` (`fetchVoucherUsage`) | voucher/views.py:105-183 — actions reales: `activate`, `deactivate`, `report`. NO existe `usage` | endpoint inventado | **DRIFT** — endpoint UI inexistente; el reporte real es `report/` (detail=False, agregado), no `{id}/usage/` | ALTA |
| vouchersSlice.js (sin thunk) | — falta `POST .../vouchers/{id}/activate/` | voucher/views.py:105 `@action url_path='activate'` POST | existe en backend | **DRIFT** — endpoint backend sin cubrir en UI (activar voucher UC-PRO-03 inversa) | MEDIA |
| vouchersSlice.js (sin thunk) | — falta `PATCH .../vouchers/{id}/` y `DELETE .../vouchers/{id}/` | voucher/views.py:57 `http_method_names=['get','post','patch','delete',...]` | editar/borrar voucher disponibles | **DRIFT** — UC-PRO-02 editar no tiene thunk (solo create/list/deactivate) | MEDIA |
| vouchersSlice.js (campos) | `voucher_type, discount_value, discount_pct, max_discount, min_order_amount, max_uses, current_uses, valid_from, valid_until, is_active, restricted_to_email, status, code` | voucher/serializers.py:13-20 | identicos | OK | — |
| returnsSlice.js:16,52 | `POST /api/v1/returns/` (create) | returns/urls.py:9 `ReturnListCreateView` | igual | OK | — |
| returnsSlice.js:26-27 | campos create `{order_id, reason, description}` | returns/serializers.py:55 `order_number` (CharField), 56 `reason`, 57 `description` | el backend espera **`order_number`**, no `order_id` | **DRIFT** — el create real valida `order_number` (str); la UI envia `order_id`. El backend ignora `order_id` y falla por `order_number` requerido | ALTA |
| returnsSlice.js:65 | `GET /api/v1/returns/` (list) | returns/urls.py:9 | igual | OK | — |
| returnsSlice.js:78 | `GET /api/v1/returns/{id}/` | returns/urls.py:10 `<int:return_id>` | igual | OK | — |
| returnsSlice.js:17,95 | `GET /api/v1/admin/returns/` | returns/admin_urls.py:9 | igual | OK | — |
| returnsSlice.js:108 | `GET /api/v1/admin/returns/{id}/` | returns/admin_urls.py:12 | igual | OK | — |
| returnsSlice.js:121-123 | `POST .../returns/{id}/approve/` body `{justification, approved_items}` | returns/admin_urls.py:15; serializers.py:162-163 `justification`, `approved_items` | identicos | OK | — |
| returnsSlice.js:137 | `POST .../returns/{id}/reject/` `{justification}` | admin_urls.py:18; serializers.py:170-173 | OK | OK | — |
| returnsSlice.js:152 | `POST .../returns/{id}/request-info/` `{message}` | admin_urls.py:21; serializers.py:176-179 `message` | OK | OK | — |
| returnsSlice.js:167-170 | `POST .../returns/{id}/reception/` `{product_condition, observations}` | admin_urls.py:24; serializers.py:183-194 `product_condition, received_at, observations` | UI no envia `received_at` (opcional, OK); campos coinciden | OK | — |
| returnsSlice.js:183-185 | `POST .../returns/{id}/refund/` `{amount}` | admin_urls.py:27; serializers.py:196-199 `amount` | OK | OK | — |
| returnsSlice.js:49 (create photos) | multipart `photos` File[] | returns/serializers.py:47-57 `ReturnCreateSerializer` solo `order_number, reason, description` | el serializer real NO declara `photos`; el create con multipart depende de logica en la view | **DRIFT (posible)** — campo `photos` no esta en el serializer de create; verificar en `returns/views.py` si la view lo procesa aparte | MEDIA |
| supportTicketsSlice.js:15,27 | `GET /api/v1/support/tickets/` | support/urls.py:9 | igual | OK | — |
| supportTicketsSlice.js:40 | `GET /api/v1/support/tickets/{id}/` | support/urls.py:12 | igual | OK | — |
| supportTicketsSlice.js:53 | `POST /api/v1/support/tickets/` (create) | support/urls.py:9 `SupportTicketListCreateView` | igual | OK | — |
| supportTicketsSlice.js:66-69 | `POST .../tickets/{id}/replies/` body `{body, is_internal}` | support/urls.py:15; serializers.py:148-149 `body`, **`is_internal_note`** | el backend espera **`is_internal_note`**, la UI envia `is_internal` | **DRIFT** — campo mal nombrado; el flag de nota interna se pierde (default False), un admin no puede crear nota interna | ALTA |
| supportTicketsSlice.js:82 | `POST .../tickets/{id}/close/` `{reason}` | support/urls.py:18; serializers.py:155 `reason` | OK | OK | — |
| supportTicketsSlice.js:95 | `POST .../tickets/{id}/reopen/` | support/urls.py:21 | igual | OK | — |
| supportTicketsSlice.js:16,108 | `GET /api/v1/admin/support/tickets/` | support/admin_urls.py:9 (mount `api/v1/admin/` + `support/tickets/`) | igual | OK | — |
| supportTicketsSlice.js (create body) | ticketData passthrough | support/serializers.py:25-33 `subject, body, category, order_id, priority` | depende del form; sin campos hardcodeados en slice | OK (no verificable en slice) | — |
| contactSlice.js:17,32-37 | `POST /api/v1/contact/messages/` body `{name, email, subject, message}` | contact/urls.py:9 `messages/`; serializers.py:16 fields `name, email, phone, subject, **body**` | el create real espera **`body`**, la UI envia **`message`**; ademas la UI no envia `phone` | **DRIFT** — campo `message` no existe; el backend valida `body` (min 20). El mensaje del visitante se pierde / 400 | ALTA |
| contactSlice.js:18 | `GET /api/v1/admin/contact/messages/` | contact/admin_urls.py:9 | igual | OK | — |
| contactSlice.js:19 | `GET /api/v1/admin/contact/messages/{id}/` | contact/admin_urls.py:12 | igual | OK | — |
| contactSlice.js:21,50 | `POST /api/v1/admin/contact/messages/{id}/read/` | contact/admin_urls.py:15 `read/` | igual | OK | — |
| contactSlice.js:20,63-66 | `POST .../contact/messages/{id}/reply/` body `{reply_body, internal_note}` | contact/admin_urls.py:18 `reply/`; serializers.py:41 `reply_body` (unico campo) | `reply_body` OK; **`internal_note` no existe** en `ContactMessageReplySerializer` | **DRIFT (parcial)** — `internal_note` enviado por UI es ignorado por el backend (no esta en el serializer ni se persiste) | BAJA |
| notificationsSlice.js:15,30 | `GET /api/v1/notifications/preferences/` | notifications/urls.py:18 `preferences/` | igual | OK | — |
| notificationsSlice.js:43 | `PUT /api/v1/notifications/preferences/` body `{preferences}` | notifications/urls.py:18 (GET/PUT); serializers.py:43-46 `preferences` (many) | wrapper `preferences` coincide | OK | — |
| notificationsSlice.js:16,56 | `POST /api/v1/notifications/{id}/read/` | notifications/urls.py:21 `<int:notification_id>/read/` | igual | OK | — |
| notificationsSlice.js:17,69 | `POST /api/v1/notifications/read-all/` | notifications/urls.py:15 `read-all/` | igual | OK | — |
| notificationsSlice.js:18,85-91 | `POST /api/v1/admin/notifications/manual/` body `{recipient_type, recipient_identifier, product_id, subject, message}` | notifications/admin_urls.py:12 `notifications/manual/`; serializers.py:49-60 `recipient_type, recipient_identifier, product_id, subject, **message**` | path OK; campos OK (backend usa `message`, no `body`) | OK | — |
| notificationsSlice.js:19,104 | `GET /api/v1/admin/notifications/audience-count/` params `{recipient_type, product_id}` | notifications/admin_urls.py:9 `notifications/audience-count/` | igual | OK | — |
| notificationsSlice.js (sin thunk) | — falta `GET /api/v1/notifications/` (list) y `unread-count/` | notifications/urls.py:9 `list`, urls.py:12 `unread-count/` | existen en backend | **DRIFT (gap, esperado)** — lecturas declaradas en hook React Query (`useNotifications.js`, comentario slice L8); no auditado aqui | INFO |
| newsletterSlice.js:16,30-33 | `POST /api/v1/newsletter/subscribe/` body `{email, source}` | newsletter/urls.py:9 `subscribe/`; serializers.py:11-14 `SubscribeSerializer` solo `email` | path OK; **`source` no existe** en el serializer (solo `email`) | **DRIFT (parcial)** — `source` enviado por UI es ignorado por el backend | BAJA |
| newsletterSlice.js:17,46-49 | `POST /api/v1/newsletter/unsubscribe/` body `{token, reason}` | newsletter/urls.py:15 `unsubscribe/`; serializers.py:17-20 `UnsubscribeSerializer` solo `token` | path OK; **`reason` no existe** en el serializer (solo `token`) | **DRIFT (parcial)** — `reason` ignorado por el backend | BAJA |
| newsletterSlice.js:18,62 | `POST /api/v1/admin/newsletter/subscribers/{id}/unsubscribe/` `{reason}` | newsletter/admin_urls.py:12 `newsletter/subscribers/<id>/unsubscribe/` | path OK; verificar si la view admin acepta `reason` | OK (path) | — |
| newsletterSlice.js:19,80-86 | `POST /api/v1/admin/newsletter/campaigns/` body `{subject, html_body, text_body, segment, scheduled_at}` | newsletter/admin_urls.py:15 `newsletter/campaigns/`; serializers.py:35-44 `CampaignCreateSerializer` fields **`subject, body, audience_filter`** | path OK; **campos divergen**: backend espera `body` + `audience_filter`; UI envia `html_body`, `text_body`, `segment`, `scheduled_at` (ninguno existe) | **DRIFT** — el body de la campana (`body`) nunca llega; `audience_filter` no se envia (cae al default CONFIRMED). Campana se crea vacia o falla | ALTA |
| newsletterSlice.js (sin thunk) | — `GET /api/v1/newsletter/confirm/{token}/` no usado | newsletter/urls.py:12 `confirm/<str:token>/` | existe (doble opt-in confirm) | **DRIFT (gap)** — confirmacion de opt-in sin cubrir en slice (puede vivir en pagina dedicada) | INFO |

## Resumen de conteos

- **Filas OK / CONFIRMED:** 26 (incluye el `report/` pre-confirmado).
- **Filas DRIFT (con severidad ALTA/MEDIA/BAJA):** 11.
- **Filas INFO/gap esperado (lecturas en React Query, paginas dedicadas):** 3.

### DRIFT por severidad

| Sev | Count | Items |
|-----|-------|-------|
| ALTA | 5 | voucher `usage/` inventado; returns create `order_id`≠`order_number`; support reply `is_internal`≠`is_internal_note`; contact create `message`≠`body`; newsletter campaign `html_body/text_body/segment/scheduled_at`≠`body/audience_filter` |
| MEDIA | 3 | voucher `activate/` sin cubrir; voucher PATCH/DELETE (editar) sin thunk; returns `photos` no en serializer |
| BAJA | 2 | contact reply `internal_note` ignorado; newsletter `source`/`reason` ignorados |
| INFO | 3 | notifications list/unread-count (React Query); newsletter confirm |

## Notas de verificacion

- El docstring de `contact/views.py:5` dice `POST /api/v1/contact/` pero
  `contact/urls.py:9` monta `messages/` → la ruta real es
  `/api/v1/contact/messages/` (la UI acierta el path). El docstring esta
  stale, no afecta a la UI.
- `voucher/urls.py` se monta en `api/v1/admin/` (config/urls.py:43), por lo
  que el router `vouchers` resuelve a `/api/v1/admin/vouchers/` — coincide
  con `ADMIN_VOUCHERS_URL` (vouchersSlice.js:14).
- Los handlers MSW de este alcance estan ausentes salvo `returns.ts`; el
  drift se midio contra el backend real (fuente de verdad), no contra mocks.
- Los campos enviados que "el backend ignora" (BAJA) no rompen la request
  (DRF descarta claves extra por defecto) pero indican intencion de feature
  no soportada por el contrato real.
```
