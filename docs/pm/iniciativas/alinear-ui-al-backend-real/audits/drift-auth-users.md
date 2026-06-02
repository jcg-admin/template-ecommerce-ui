```yml
artefacto: audit
tipo: drift-table
dominio: auth/users
estado: completado
version: 1.0.0
fecha_creacion: 2026-06-02T22:56:44
autor: claude
clasificacion: PROVEN (file:line en ambos lados)
```

# Drift — UI auth/users vs backend real

> READ-ONLY audit. Compara la capa auth/users del UI
> (`template-ecommerce-ui`) contra el backend Django real.

## Procedencia

| Campo | Valor |
|-------|-------|
| Backend real | `/tmp/references/e-comerce/api/practicayoruba` |
| api branch | `develop` |
| api SHA | `d0cba50` (`git -C /tmp/references/e-comerce/api rev-parse --short HEAD`) |
| Mounts (config/urls.py) | `api/v1/auth/` → `apps.users.urls`; `api/v1/admin/` → `apps.users.admin_urls` (ns admin_users) |
| Fuentes UI | `src/redux/slices/{authSlice,addressesSlice,adminUsersSlice}.js`, `src/hooks/domain/{useAuth,useAddresses,useAdminUsers}.js`, `src/mocks/handlers/auth.ts` |
| Fuentes api | `apps/users/{urls.py,admin_urls.py,serializers.py,views.py,admin_views.py,tokens.py}` |

Nota de path: el UI llama con prefijo completo `/api/v1/auth/*`; el backend
monta `apps.users.urls` bajo `api/v1/auth/`, así que el path relativo del
backend (`register/`, `login/`, ...) corresponde a `/api/v1/auth/...` del UI.

---

## Tabla de drift

| UI file:line | UI endpoint/field | api file:line | Real | Drift | Sev |
|---|---|---|---|---|---|
| authSlice.js:27 | POST `/api/v1/auth/login/` body `{username, password}` | urls.py:14 / tokens.py:132 | POST `api/v1/auth/login/` (PYTokenObtainPairView) | path+verb OK; backend `username_field` acepta el username generado del email (tokens.py:85) | — CONFIRMED |
| authSlice.js:43 | POST `/api/v1/auth/logout/` `{}` | urls.py:16 / tokens.py:273 | POST `api/v1/auth/logout/` (blacklist) | path+verb OK (cuerpo requiere refresh token; UI lo maneja por cookie) | — CONFIRMED |
| authSlice.js:58 | POST `/api/v1/auth/register/` body `data` | urls.py:13 / serializers.py:40 | POST `api/v1/auth/register/` | path+verb OK; campos `{first_name,last_name,email,password,password_confirm,terms_accepted}` (serializers.py:51-56) | — CONFIRMED (path/verb) |
| authSlice.js:76 | GET `/api/v1/auth/profile/` | urls.py:18 / views.py:135 | GET `api/v1/auth/profile/` | path+verb OK | — CONFIRMED |
| authSlice.js:89 | PATCH `/api/v1/auth/profile/` formData | urls.py:18 / views.py:172 | PATCH `api/v1/auth/profile/` | path+verb OK; editables `{first_name,last_name,phone,avatar,remove_avatar}` (serializers.py:218) | — CONFIRMED |
| authSlice.js:103-107 | POST `/api/v1/auth/change-password/` body `{current_password, new_password, confirm_password}` | urls.py:19 / serializers.py:290-294 | serializer espera `{current_password, new_password, new_password_confirm}` | (c) FIELD DRIFT: UI envía `confirm_password`; serializer requiere `new_password_confirm` → campo requerido ausente, validación falla | ALTA |
| authSlice.js:127 | POST `/api/v1/auth/verify-email/` `{token}` | urls.py:24 / serializers.py:365-367 | POST `api/v1/auth/verify-email/` `{token}` | path+verb+field OK | — CONFIRMED |
| authSlice.js:142-145 | POST `/api/v1/auth/resend-verification/` `{email}` | urls.py:25 / serializers.py:370-372 | POST `api/v1/auth/resend-verification/` `{email}` | path+verb+field OK | — CONFIRMED |
| authSlice.js:161 | POST `/api/v1/auth/me/deactivate/` `{password}` | urls.py:27 / views.py:552-582 | POST `api/v1/auth/me/deactivate/` | path+verb OK (DeactivateAccountSerializer views.py:547) | — CONFIRMED |
| authSlice.js:329 | POST `/api/v1/auth/password-reset/` `{email}` | urls.py:22 / serializers.py:336-338 | POST `api/v1/auth/password-reset/` `{email}` | path+verb+field OK | — CONFIRMED |
| authSlice.js:339 | POST `/api/v1/auth/password-reset/confirm/` body `{uid, token, new_password}` | urls.py:23 / serializers.py:344-348 + views.py:433-447 | serializer espera `{token, new_password, new_password_confirm}` | (c) FIELD DRIFT: UI envía `uid` (inexistente, ignorado) y NO envía `new_password_confirm` (requerido) → validación falla. Backend es token-only, sin `uid` | ALTA |
| authSlice.js:322 | `logoutAllSessions = logoutUser` → POST `/api/v1/auth/logout/` | urls.py:29 / views.py:658 | existe `api/v1/auth/logout-all/` (LogoutAllSessionsView) | (e) MISSING + (a) PATH: el alias `logoutAllSessions` apunta a `/logout/` (una sesión), no al endpoint real `/logout-all/`. UI nunca llama `/logout-all/` | MEDIA |
| authSlice.js:351 | PATCH `/api/v1/auth/profile/avatar/` (FormData `avatar`) | (sin ruta en urls.py) | NO existe `/auth/profile/avatar/` | (d) INVENTED: el avatar real se sube por PATCH `/auth/profile/` con campo `avatar` (serializers.py:218). El sub-path `/profile/avatar/` no está ruteado → 404 | ALTA |
| useAuth.js:15,31 | dispatch `getCurrentUser` (importado de authSlice) | n/a | authSlice exporta `fetchProfile`, NO `getCurrentUser` (authSlice.js:72) | (UI-INTERNO) import roto: `getCurrentUser` es `undefined` → `refresh()` despacha undefined. No es drift de backend pero rompe el hook | ALTA |
| addressesSlice.js:15 / useAddresses.js:8 | GET `/api/v1/auth/addresses/` | urls.py:9,20 / views.py:185,229 | GET `api/v1/auth/addresses/` (router AddressViewSet) | path+verb OK | — CONFIRMED |
| addressesSlice.js:41 | POST `/api/v1/auth/addresses/` payload | views.py:242 | POST `api/v1/auth/addresses/` | path+verb OK; campos `{alias,recipient_name,street,exterior_number,interior_number,neighborhood,city,state,zip_code,country,phone,is_default}` (serializers.py:142-147) | — CONFIRMED |
| addressesSlice.js:54 | PATCH `/api/v1/auth/addresses/:id/` payload | views.py:265 | PATCH `api/v1/auth/addresses/:id/` (partial_update) | path+verb OK | — CONFIRMED |
| addressesSlice.js:67 | DELETE `/api/v1/auth/addresses/:id/` | views.py:282 | DELETE `api/v1/auth/addresses/:id/` | path+verb OK | — CONFIRMED |
| addressesSlice.js:17,80 | POST `/api/v1/auth/addresses/:id/set-default/` | views.py:299 (`url_path='set-default'`) | POST `api/v1/auth/addresses/:id/set-default/` | path+verb OK | — CONFIRMED |
| adminUsersSlice.js:23 | POST `/api/v1/admin/users/:id/role/` `{role}` | admin_urls.py / admin_views.py | NO existe action `role` en AdminUserViewSet (solo `suspend`@248, `reactivate`@291) | (d) INVENTED: no hay ruta `/admin/users/:id/role/`. El cambio de rol real va por update del ViewSet (DRF update / admin_views.py:140), no por sub-action `role/` → 404 | ALTA |
| adminUsersSlice.js:35 | POST `/api/v1/admin/users/:id/suspend/` | admin_views.py:248-249 (`url_path='suspend'`) | POST `api/v1/admin/users/:id/suspend/` | path+verb OK | — CONFIRMED |
| adminUsersSlice.js:47 | POST `/api/v1/admin/users/:id/reactivate/` | admin_views.py:290-291 (`url_path='reactivate'`) | POST `api/v1/admin/users/:id/reactivate/` | path+verb OK | — CONFIRMED |
| useAdminUsers.js:11 | GET `/api/v1/admin/users/` `?role&is_active&search&page` | admin_urls.py:8 / admin_views.py:183,216 | GET `api/v1/admin/users/` (router list) | path+verb OK | — CONFIRMED |
| (UI no llama) | — | admin_urls.py:12 / admin_views.py:358 | `api/v1/admin/audit-log/` (AuditLogView, GET) | (e) MISSING: ningún slice/hook del UI consume `/admin/audit-log/` | BAJA |
| (UI no llama) | — | urls.py:15 / tokens.py:265 | `api/v1/auth/refresh/` (PYTokenRefreshView) | INFO: refresh lo maneja apiService/cookie, no un thunk auth; no es gap funcional | INFO |

---

## Notas de campos (response shape)

- **login response** (tokens.py:120-123): backend devuelve `data['user'] = {id, username, email, ...}`. authSlice.js:200 lee `action.payload.user ?? action.payload` → compatible.
- **profile response** (serializers.py:182-187 ProfileSerializer): `{id, username, email, first_name, last_name, phone, avatar_url, date_joined, profile_completeness, pending_fields}`. El comentario del estado UI (authSlice.js:174-175) lista `is_staff` — el ProfileSerializer NO expone `is_staff` (sí lo expone AdminUserListSerializer). Posible drift menor en lo que el UI espera de `/profile/`; no se cuenta como fila por ser comentario, no payload.
- **admin user list** (AdminUserListSerializer serializers.py:392-399): expone `is_admin` (source `is_superuser`), `email_verified`, `order_count`, `avatar_url`, `full_name`, `is_active`, `is_staff` — consumidos por AdminUsersPage según comentario H-CICLO40-03.

---

## Resumen de conteo

- **CONFIRMED (path+verb alineados):** 16
- **DRIFT (backend-comparables):** 6
  - (c) field-name drift: 2 — change-password `confirm_password`; password-reset/confirm `uid`/falta `new_password_confirm`
  - (d) invented (sin ruta backend): 2 — `profile/avatar/`; `admin/users/:id/role/`
  - (e) missing backend endpoint: 2 — `logout-all/`; `admin/audit-log/`
  - (a) path mismatch: 1 — `logoutAllSessions` apunta a `/logout/` (subsumido en fila MISSING de logout-all)
- **UI-INTERNO (no backend drift):** 1 — `getCurrentUser` import roto en useAuth.js
- **INFO (no gap):** 1 — `auth/refresh/`
