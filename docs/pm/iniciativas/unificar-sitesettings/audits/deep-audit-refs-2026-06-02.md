```yml
reporte: deep-audit-refs
agente: deep-audit (read-only on code)
tarea: Auditoria DR-02 unificar-sitesettings — reuso de componentes + contrato canonico
fecha: 2026-06-02T21:58:25
herramientas: Bash(grep/sed/git), Read
basado-en: ui@fa4c8d4 (claude/brave-lamport-BUmBM); refs /tmp/references/e-comerce-docs
project: template-ecommerce-ui
status: completado
version: 1.0.0
```

# Deep Audit — unificar-sitesettings (DR-02)

Auditoria read-only sobre codigo. Dos ejes: (1) reuso de componentes
adaptados y (2) cumplimiento del contrato canonico (endpoint + nombres
de campo). **No se modifico codigo.**

## Procedencia

| Campo | Valor |
|-------|-------|
| Repo | `template-ecommerce-ui` |
| HEAD | `fa4c8d4` (`Use canonical refs: DataGrid + /config/settings/`) |
| Rama | `claude/brave-lamport-BUmBM` |
| Refs contrato | `/tmp/references/e-comerce-docs/source/backend/rest-api-conventions.rst`, `.../casos-uso/config/uc-cfg-03-*.rst`, `uc-cfg-05-*.rst` |
| Correccion fa4c8d4 verificada | SI — endpoint movido a `/api/v1/config/settings/` (ver Tabla Contrato C-01) |

## Eje 1 — Reuso de componentes

`AdminSystemSettingsPage.jsx` renderiza el formulario via un `.map` de
`FIELDS` con `<input>` crudo (`:90-111`) mas un `<fieldset>` para
`social_links` (`:114-130`). El proyecto dispone de un primitivo
`Field` (input con label + error + hint) en
`src/components/common/primitives/index.jsx:54`.

| ID | Componente / patron | Ubicacion (file:line) | Componente adaptado disponible | Veredicto |
|----|---------------------|------------------------|-------------------------------|-----------|
| CMP-01 | `<input>` crudo en `.map(FIELDS)` (text/email/tel/number) | `AdminSystemSettingsPage.jsx:102-108` | `Field` primitive — `primitives/index.jsx:54-97` | DISCREPANCIA (menor) — duplica label+input que `Field` ya encapsula |
| CMP-02 | `<input type="checkbox">` crudo | `AdminSystemSettingsPage.jsx:94-100` | `Field` no soporta checkbox (no hay `type='checkbox'` ni toggle de boolean en `primitives/index.jsx:54-97`) | CONFIRMADO — uso legitimo de `<input>` crudo; el primitivo no cubre checkbox |
| CMP-03 | `<fieldset>`+`<legend>` para social_links con `<input type="url">` crudo | `AdminSystemSettingsPage.jsx:114-130` | Ningun componente adaptado para grupos de campos / fieldset (no existe `Form`/`FieldGroup` en `src/components/common/`) | CONFIRMADO — fieldset es agrupacion semantica; no hay componente que lo duplique |
| CMP-04 | `<button type="submit">` crudo | `AdminSystemSettingsPage.jsx:144` | `Button` primitive — `primitives/index.jsx:102` (variant/loading) | DISCREPANCIA (menor) — `Button` ya provee estado `loading`/`disabled` que aqui se reimplementa con `disabled={isActioning}` |
| CMP-05 | `<button>` ya migrado a DataGrid en pagina hermana | `AdminVoucherReportPage` via DataGrid (commit fa4c8d4 C1) | `DataGrid` — `src/components/common/DataGrid/` | CONFIRMADO — fuera de scope de esta pagina; referencia de consistencia |

**Lectura del eje 1.** El formulario de settings es un caso de
formulario generico simple. Las reglas del proyecto admiten que un
formulario simple use primitivos. Los unicos `<input>` que duplican un
componente adaptado son los de tipo texto/email/tel/number (CMP-01),
que `Field` cubre, y el submit (CMP-04), que `Button` cubre. El checkbox
(CMP-02) y el fieldset de redes (CMP-03) **no** tienen componente
adaptado equivalente, por lo que su uso crudo es legitimo. No hay
DataGrid/TreeList/Modal/Tabs aplicables a un form de settings.

## Eje 2 — Contrato canonico

Fuente canonica del endpoint: `rest-api-conventions.rst:92`
(`GET /api/v1/config/settings/` — singleton de config global).
Sub-contrato de campos: `uc-cfg-03-*.rst:425` (`iva_rate`,
`free_shipping_threshold`, `support_email`, `phone`, `address`,
`social_links`) y `uc-cfg-05-*.rst:405-425`
(`support_email`, `phone`, `address`, `social_links{}`).

| ID | Claim | Evidencia (file:line) | Fuente canonica | Veredicto |
|----|-------|------------------------|-----------------|-----------|
| C-01 | `useSystemSettings.js` usa `/api/v1/config/settings/` | `useSystemSettings.js:11` (`const URL = '/api/v1/config/settings/'`) | `rest-api-conventions.rst:92` | CONFIRMADO |
| C-02 | `settingsSlice.js` PATCH a `/api/v1/config/settings/` | `settingsSlice.js:16` (`apiService.patch('/api/v1/config/settings/', ...)`) | `rest-api-conventions.rst:92` | CONFIRMADO |
| C-03 | `AdminSystemSettingsPage.jsx` documenta/usa endpoint canonico | `AdminSystemSettingsPage.jsx:6-7` (GET/PATCH `/api/v1/config/settings/`) | `rest-api-conventions.rst:92` | CONFIRMADO |
| C-04 | MSW mock `admin.ts` sirve `/api/v1/config/settings/` GET+PATCH | `admin.ts:184` (get), `admin.ts:207` (patch) | `rest-api-conventions.rst:92` | CONFIRMADO |
| C-05 | `usePublicSettings.js` usa endpoint canonico (no inventado `/settings/public/`) | `usePublicSettings.js:17` (`const URL = '/api/v1/config/settings/'`) | `rest-api-conventions.rst:92` | CONFIRMADO |
| C-06 | Sin residual `/api/v1/admin/settings/` | `grep -rn "admin/settings" src/` → 0 hits | — | CONFIRMADO |
| C-07 | Sin residual inventado `/api/v1/settings/public/` | `grep -rn "settings/public" src/` → 0 hits | — | CONFIRMADO (eliminado en fa4c8d4) |
| C-08 | Campos contacto alineados: `support_email`, `phone`, `address` | `AdminSystemSettingsPage.jsx:27-29`; mock `admin.ts:194-196` | `uc-cfg-05-*.rst:411-413`, `:421-424` | CONFIRMADO |
| C-09 | `social_links{}` como dict anidado (facebook/instagram/youtube) | `AdminSystemSettingsPage.jsx:61-64,116-129`; mock `admin.ts:198-202` | `uc-cfg-05-*.rst:414`, `:425`; `uc-cfg-03-*.rst:433` | CONFIRMADO |
| C-10 | Nombre de campo de IVA alineado al contrato | `AdminSystemSettingsPage.jsx:30` (`tax_rate`); mock `admin.ts:189` (`tax_rate`) | `uc-cfg-03-*.rst:425,451` define **`iva_rate`** | **DISCREPANCIA** — la UI usa `tax_rate`; el contrato canonico (SiteSettingsSerializer) usa `iva_rate`. Drift de nombre de campo cross-repo. |
| C-11 | `adminSlice.js` sin codigo muerto de siteSettings | `grep -ni "settings" src/redux/slices/adminSlice.js` → 0 hits (1299 lineas) | — | CONFIRMADO |

**Detalle C-10 (la unica discrepancia de contrato).** El request body y
el response del SiteSettingsSerializer en el contrato canonico nombran el
campo de impuesto como `iva_rate`:

```
uc-cfg-03-configurar-sitesettings--iva-.rst:425
    "iva_rate": "0.16",
uc-cfg-03-configurar-sitesettings--iva-.rst:451   (Response 200 OK)
    "iva_rate": "0.16",
```

La UI lo declara como `tax_rate` en dos lugares:

```
AdminSystemSettingsPage.jsx:30   { key: 'tax_rate', label: 'Tasa de IVA (%)', type: 'number' }
admin.ts:189                     tax_rate: 0.16,
```

Como el mock MSW tambien usa `tax_rate`, los tests en modo DEMO pasan,
pero el campo **no coincide con el serializer real del backend**: un PATCH
contra el API real con `tax_rate` no actualizaria `iva_rate`. Severidad
MEDIA (drift de contrato funcional, enmascarado por el mock). Patron de
red flag RF-3 (cross-repo) + RF-5 (mock contradice el contrato real).

## Conclusion

| Metrica | Conteo |
|---------|--------|
| Items eje 1 (Componentes) | 5 |
| — CONFIRMADO (uso legitimo / fuera scope) | 3 (CMP-02, CMP-03, CMP-05) |
| — DISCREPANCIA (menor, opcional) | 2 (CMP-01, CMP-04) |
| Items eje 2 (Contrato) | 11 |
| — CONFIRMADO | 10 (C-01..C-09, C-11) |
| — DISCREPANCIA | 1 (C-10: `tax_rate` vs canonico `iva_rate`) |
| **Total CONFIRMED** | **13** |
| **Total DISCREPANCIES** | **3** (2 reuso menor + 1 contrato) |

**Veredicto global.** La unificacion DR-02 esta esencialmente correcta:
endpoint canonico `/api/v1/config/settings/` consistente en los 5 puntos
de consumo, sin residuos de `/api/v1/admin/settings/` ni del inventado
`/api/v1/settings/public/`, sin codigo muerto de siteSettings en
`adminSlice.js`, y campos de contacto + `social_links{}` alineados a
UC-CFG-05. La correccion fa4c8d4 aterrizo.

**Unica discrepancia de contrato (accionable):** C-10 — la UI usa
`tax_rate` donde el SiteSettingsSerializer canonico usa `iva_rate`
(uc-cfg-03:425). El mock perpetua el nombre incorrecto, ocultando el
drift. Recomendado renombrar `tax_rate` → `iva_rate` en
`AdminSystemSettingsPage.jsx:30` y `admin.ts:189` (mas tests asociados).

**Discrepancias de reuso (opcionales, no bloqueantes):** CMP-01 y CMP-04
podrian usar los primitivos `Field`/`Button`; un formulario simple usando
`<input>`/`<button>` crudos es admisible por convencion del proyecto, por
lo que se clasifican como mejora de consistencia, no como defecto.
