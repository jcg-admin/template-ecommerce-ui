.. reporte::
   :agente: deep-audit (read-only sobre codigo)
   :tarea: Auditar cablear-rutas-huerfanas en dos ejes (reuso de componentes + contrato canonico)
   :fecha: 2026-06-02
   :herramientas: Read, Bash (grep), git
   :basado-en: template-ecommerce-ui @ fa4c8d4 (rama claude/brave-lamport-BUmBM); refs /tmp/references/e-comerce-docs/source/backend/rest-api-conventions.rst v1.0.0 + source/requisitos/casos-uso/

```yml
created_at: 2026-06-02 21:58:29
project: template-ecommerce-ui
iniciativa: cablear-rutas-huerfanas
author: claude
status: Aprobado
version: 1.0.0
```

# Deep Audit — cablear-rutas-huerfanas (refs)

Auditoria de solo lectura sobre los archivos cambiados por la iniciativa
`cablear-rutas-huerfanas`. Dos ejes: (1) reuso de componentes adaptados en
`src/components/common/`; (2) conformidad de rutas/endpoints con el contrato
canonico. NO se modifico codigo.

## Archivos auditados

| Archivo | Lineas | Naturaleza |
|---------|--------|------------|
| `src/components/admin/AdminSidebar/index.jsx` | 91 | NAV array + NavLink |
| `src/layouts/AccountLayout.jsx` | 72 | NAV array + NavLink |
| `src/pages/admin/AdminConfigPage.jsx` | 98 | Hub de tarjetas (Link) |
| `src/pages/admin/AdminInventoryPage.jsx` | 142 | Tabla + filtro + consumo useInventory |
| `src/pages/admin/AdminProductsPage.jsx` | 160 | Tabla + filtros + acciones CRUD |

Los `.test`/`.scss` hermanos no contienen logica de routing ni widgets;
se inspeccionaron solo donde fue relevante (existencia de `DataGrid`,
`Dropdown`).

---

## AXIS 1 — Reuso de componentes

Contexto de convencion del repo (verificado para calibrar severidad):

- Paginas que importan `common/DataGrid`: **3** de **105** paginas admin
  (`grep -rln "common/DataGrid" src/pages/` → AdminUsersPage,
  AdminVoucherDetailPage, AdminVoucherReportPage).
- Paginas admin con `<table>` crudo: **33**
  (`grep -rln "<table" src/pages/admin/ | wc -l`).
- Paginas que importan `common/Dropdown`: **0**
  (`grep -rln "common/Dropdown" src/pages/` → vacio).
- Paginas admin con `<select>` crudo: **23**
  (`grep -rln "<select" src/pages/admin/ | wc -l`).

Conclusion de contexto: el HTML crudo (`<table>`, `<select>`) es la
convencion dominante de facto en el backoffice; `DataGrid` es minoritario
y `Dropdown` no se usa en ninguna pagina. Por tanto los hallazgos de este
eje son **oportunidades de reuso** (LOW/INFO), no regresiones introducidas
por esta iniciativa — la iniciativa siguio el patron existente, no creo un
patron divergente nuevo.

| Archivo:linea | Hallazgo | Severidad | Recomendacion |
|---|---|---|---|
| `src/pages/admin/AdminInventoryPage.jsx:100-138` | `<table>` crudo (thead/tbody, 6 columnas) donde encaja `common/DataGrid` (`src/components/common/DataGrid/index.jsx:30` acepta `columns`/`rows`/`filterable`). Hay columna "Acciones" con `<Link>` por fila, que DataGrid soporta via celdas custom. | BAJA | Migrar a `DataGrid` para sort/paginacion consistentes. No bloqueante: 33 paginas admin usan `<table>` crudo (convencion dominante). |
| `src/pages/admin/AdminInventoryPage.jsx:76-83` | `<select>` crudo de filtro de estado (`STATUS_OPTIONS`) donde encaja `common/Dropdown` (`src/components/common/Dropdown/Dropdown.jsx`). | INFO | Opcional: usar `Dropdown`. 0 paginas usan `Dropdown` hoy; el `<select>` nativo es accesible y consistente con las otras 23 paginas. |
| `src/pages/admin/AdminProductsPage.jsx:75-146` | `<table>` crudo (9 columnas) donde encaja `common/DataGrid`. Incluye celdas ricas (thumb, Price, badges, acciones) — soportables en DataGrid pero con mas trabajo. | BAJA | Migrar a `DataGrid` si se requiere sort/paginacion del catalogo; hoy la tabla es estatica sin esos features. No bloqueante. |
| `src/pages/admin/AdminProductsPage.jsx:48-56` | Barra de filtros de estado construida con `<button>` crudos (`STATUS.map`) — es un patron tabs/segmented. `common/Tabs` o `common/ViewToggle` podrian aplicar. | INFO | Opcional. El patron de botones-filtro es estandar y funcional; Tabs/ViewToggle aportarian semantica ARIA tablist. |
| `src/pages/admin/AdminProductsPage.jsx:6,12,11,149-156` | **Reuso CORRECTO ya aplicado**: importa y usa `ChipInput` (Chip), `ConfirmModal` (shared), y primitives `MetaTag`/`Button`/`Price`. El modal de borrado usa `ConfirmModal`, NO un `<div>` modal a mano. | OK | Ninguna. Ejemplo del uso esperado de la libreria adaptada. |
| `src/pages/admin/AdminConfigPage.jsx:65-93` | Grid de tarjetas de navegacion (`ITEMS.map` → `<Link>`/`<div>`). NO duplica ningun componente adaptado: es un hub de navegacion, no un widget de datos. | OK | Ninguna. Patron de navegacion correcto (analogo a NAV array). |
| `src/components/admin/AdminSidebar/index.jsx:16-83` | `ADMIN_NAV` array → `<NavLink>`. Entrada de navegacion, NO un widget reutilizable. | OK | Ninguna (explicitamente fuera del eje de reuso de componentes). |
| `src/layouts/AccountLayout.jsx:15-61` | `NAV_ITEMS` array → `<NavLink>`. Idem: navegacion, no widget. | OK | Ninguna. |

---

## AXIS 2 — Contrato canonico

### 2.1 Rutas cableadas (destino de `to=`) vs `src/router/AppRouter.jsx`

Todas las rutas agregadas/referenciadas por los archivos cambiados se
verificaron con `grep -q 'path="<ruta>"' src/router/AppRouter.jsx`.

| Archivo:linea | Hallazgo | Severidad | Recomendacion |
|---|---|---|---|
| `src/components/admin/AdminSidebar/index.jsx:18-52` | Las **29** entradas `to=` del `ADMIN_NAV` resuelven a rutas existentes en el router (verificado 29/29 OK). | CONFIRMADO | Ninguna. |
| `src/layouts/AccountLayout.jsx:16-26` | Las **11** entradas `to=` de `NAV_ITEMS` resuelven a rutas existentes (11/11 OK), incluida `support/tickets` (AppRouter.jsx:242) y `account/referral`/`account/search-history` (cableadas por la iniciativa, AppRouter.jsx:214,220). | CONFIRMADO | Ninguna. |
| `src/pages/admin/AdminConfigPage.jsx:26,32,38,44,50` | Los 5 destinos del hub resuelven: `/admin/system-settings` (AppRouter.jsx:275), `/admin/config/gateways` (339), `/admin/config/shipping` (340), `/admin/contact/messages` (317), `/admin/pages` (336). | CONFIRMADO | Ninguna. |
| `src/pages/admin/AdminConfigPage.jsx:23-27` | **Divergencia doc-vs-codigo (no de contrato).** El analisis de la iniciativa (`analisis-rutas-huerfanas.md`, seccion "Sub-paginas") afirma que la tarjeta UC-CFG-03 "Ajustes del sitio" apunta a `/admin/config/site` (AdminSiteSettingsPage). El codigo real apunta a `/admin/system-settings` (linea 26). `/admin/config/site` NO existe como `path=` en el router. El codigo es coherente (la ruta que usa SI existe); la inconsistencia esta en la narrativa del analisis, que describe un repunteo a `config/site` no aplicado. | BAJA | Reconciliar el analisis con el codigo: o documentar que CFG-03 quedo apuntando a `system-settings` (drift de SiteSettings ya anotado como fuera de alcance), o cablear `/admin/config/site` si esa pagina debe ser el destino. No rompe navegacion. |
| `src/pages/admin/AdminInventoryPage.jsx:49,52` | Enlaces de cabecera `/admin/inventory/dashboard` (AppRouter.jsx:296) e `/admin/inventory/import` (294) existen. | CONFIRMADO | Ninguna. |
| `src/pages/admin/AdminInventoryPage.jsx:124,129` | Enlaces dinamicos `/admin/inventory/${variant_id}/adjust` y `/movements` coinciden con las rutas param `admin/inventory/:variantId/adjust` (AppRouter.jsx:300) y `:variantId/movements` (299). | CONFIRMADO | Ninguna. |
| `src/pages/admin/AdminProductsPage.jsx:42,43,104,133` | `/admin/products/import` (AppRouter.jsx:256), `/admin/products/new` (254), `/admin/products/:id` (260) existen. El bug previo `/admin/products/nuevo`→404 ya esta corregido a `new`. | CONFIRMADO | Ninguna. |

### 2.2 Endpoints de API referenciados en archivos cambiados

Los archivos cambiados **no llaman endpoints directamente**. El unico
acceso a API es indirecto:

- `AdminInventoryPage.jsx:7,32` importa y usa `useInventory` (no es archivo
  cambiado).
- `AdminProductsPage.jsx:10,31` despacha thunks de `adminSlice` (no es
  archivo cambiado).

| Archivo:linea | Hallazgo | Severidad | Recomendacion |
|---|---|---|---|
| `src/hooks/domain/useInventory.js:11` (referenciado desde `AdminInventoryPage.jsx:7`) | El hook usa `STOCK_URL = '/api/v1/admin/inventory/'`. El contrato canonico (`rest-api-conventions.rst:507-510`) declara `GET /api/v1/inventory/{product_id}/` para UC-INV-01 — sin segmento `/admin/` y con `{product_id}` en el path. La lista canonica no contempla un endpoint de listado bajo `/admin/inventory/`. Drift de prefijo + de forma de recurso. | MEDIA (fuera de alcance) | NO introducido por esta iniciativa (el hook no es archivo cambiado). Documentar como drift de contrato preexistente; abrir iniciativa separada para reconciliar el namespace de inventario UI↔contrato. |
| `src/hooks/domain/useInventory.js:13` (idem) | `MOVEMENTS = /api/v1/admin/inventory/variants/${variantId}/movements/`. El contrato no lista endpoint de movimientos de inventario (solo `/inventory/{product_id}/` GET/PATCH e `/inventory/imports/` POST). | MEDIA (fuera de alcance) | Idem anterior: drift preexistente, no de esta iniciativa. Reconciliar en iniciativa de contrato de inventario. |

> Nota de alcance: los dos hallazgos de endpoint NO cuentan como
> discrepancias de la iniciativa `cablear-rutas-huerfanas`, cuyo scope es
> cablear navegacion. Se reportan como contexto/deuda preexistente por
> exhaustividad del eje. El contrato (`rest-api-conventions.rst:710-763`)
> ya reconoce explicitamente deuda de URLs en el frontend.

---

## Conclusion

### Conteo

| Categoria | Conteo |
|-----------|--------|
| AXIS 1 — reuso: hallazgos accionables (BAJA/INFO) | 4 |
| AXIS 1 — reuso correcto / no-aplica (OK) | 4 |
| AXIS 2 — rutas CONFIRMADAS | 6 |
| AXIS 2 — discrepancias de contrato dentro del alcance de la iniciativa | 0 |
| AXIS 2 — divergencia doc-vs-codigo (BAJA, dentro de archivos cambiados) | 1 |
| AXIS 2 — drift de endpoint preexistente (MEDIA, fuera de alcance) | 2 |

### Veredicto

- **Contrato de rutas (eje central de la iniciativa): CONFIRMADO.** Las 40
  entradas de navegacion auditadas (29 AdminSidebar + 11 AccountLayout) y
  los 12 destinos de pagina (Config 5, Inventory 4, Products 3) resuelven a
  rutas reales del router. Cero rutas huerfanas residuales en los archivos
  cambiados. El bug `/admin/products/nuevo`→404 quedo corregido a `new`.
- **1 divergencia BAJA dentro del alcance**: la tarjeta CFG-03 del hub
  apunta a `/admin/system-settings` y no a `/admin/config/site` como narra
  el analisis; el codigo es funcional (ruta existe) pero la doc no coincide.
- **Reuso de componentes**: 4 oportunidades LOW/INFO (2 tablas → DataGrid,
  1 select → Dropdown, 1 barra de botones → Tabs). Ninguna es regresion:
  siguen la convencion dominante del repo (33 paginas con `<table>` crudo,
  0 con `Dropdown`). AdminProductsPage ya reusa correctamente ChipInput,
  ConfirmModal y primitives.
- **2 drifts MEDIA de endpoint de inventario** (`/api/v1/admin/inventory/`
  vs canonico `/api/v1/inventory/{product_id}/`) son preexistentes en el
  hook `useInventory.js`, fuera del alcance de esta iniciativa.

**Resumen**: la iniciativa cumple su objetivo (cablear rutas huerfanas) con
0 discrepancias de contrato en su alcance; 1 inconsistencia doc-vs-codigo
menor a reconciliar y 4 oportunidades de reuso opcionales. Los 2 hallazgos
de endpoint son deuda preexistente a derivar a iniciativa separada.
