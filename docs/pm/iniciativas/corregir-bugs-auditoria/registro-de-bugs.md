# Registro de bugs — corregir-bugs-auditoria

---

## BUG-CSS-01 — SearchModal: CSS vars con prefijo incorrecto

**Severidad:** CRÍTICA
**Archivo:** `src/components/common/SearchModal/SearchModal.module.scss`
**Síntoma:** El modal de búsqueda aparece sin colores — fondo transparente, texto invisible.
**Causa:** El SCSS usa el prefijo `--c-*` que no existe en el tema. El tema define `--ec-*`.

| Var usada (rota) | Var correcta del tema |
|------------------|-----------------------|
| `--c-surface-1` | `--ec-bg-page` |
| `--c-surface-2` | `--ec-bg-surface` |
| `--c-accent` | `--ec-accent` |
| `--c-border` | `--ec-border-color` |
| `--c-text-primary` | `--ec-text-primary` |
| `--c-text-secondary` | `--ec-text-secondary` |

**Estado:** PENDIENTE — F1-T1

---

## BUG-CSS-02 — ProductCard: --text-muted no existe

**Severidad:** CRÍTICA
**Archivo:** `src/components/catalog/ProductCard.module.scss`
**Síntoma:** El texto secundario de las cards aparece sin color (hereda el del padre o invisible).
**Causa:** Usa `var(--text-muted)`. El tema define `var(--ec-text-muted)`.

**Estado:** PENDIENTE — F1-T2

---

## BUG-KEY-01 — key={index} en listas mutables

**Severidad:** MEDIA
**Causa:** React usa el key para identificar elementos en el DOM virtual.
Usar el índice como key en listas que pueden reordenarse o filtrarse
provoca renders incorrectos, pérdida de estado y animaciones rotas.

**Ocurrencias (28 total):**

| Tarea | Archivo | Línea | Contexto |
|-------|---------|-------|----------|
| F2-T1 | `components/admin/AdminSidebar/index.jsx` | L55 | Sección de nav |
| F2-T2 | `components/auth/OTPInput/OTPInput.jsx` | L173 | Dígitos OTP |
| F2-T3 | `components/common/Autocomplete/Autocomplete.jsx` | L277 | Items sugeridos |
| F2-T4 | `components/common/Carousel/Carousel.jsx` | L179 | Slides |
| F2-T5 | `components/common/DatePicker/Calendar.jsx` | L320 | Cabecera días semana |
| F2-T6 | `components/common/MultiSelect/MultiSelect.jsx` | L251 | Tags seleccionados |
| F2-T7 | `components/common/MultiSelect/MultiSelect.jsx` | L271 | Inputs hidden |
| F2-T8 | `components/common/RangeSlider/RangeSlider.jsx` | L121, L140 | Marks del slider |
| F2-T9 | `components/common/Stepper/Stepper.jsx` | L98 | Pasos del stepper |
| F2-T10 | `components/layout/Header/index.jsx` | L181 | Items del mini-cart |
| F2-T11 | `pages/account/AddressesPage.jsx` | L62 | Tarjetas de dirección |
| F2-T12 | `pages/account/OrderDetailPage.jsx` | L138 | Líneas del pedido |
| F2-T13 | `pages/admin/AdminDashboardPage.jsx` | L109 | Alertas de stock |
| F2-T14 | `pages/admin/AdminInventoryImportPage.jsx` | L107 | Filas de errores |
| F2-T15 | `pages/admin/AdminOrderDetailPage.jsx` | L173, L217 | Items y notas |
| F2-T16 | `pages/admin/AdminPriceSyncPage.jsx` | L147 | Filas de preview |
| F2-T17 | `pages/admin/AdminProductImportPage.jsx` | L147 | Filas de import |
| F2-T18 | `pages/admin/AdminProductVariantsPage.jsx` | L167 | Chips de combinación |
| F2-T19 | `pages/admin/AdminVoucherDetailPage.jsx` | L144 | Changelog |
| F2-T20 | `pages/catalog/CatalogPage.jsx` | L265, L327 | Filtros y chips |
| F2-T21 | `pages/catalog/ProductPage.jsx` | L84 | Thumbnails |
| F2-T22 | `pages/checkout/ExpressCheckoutPage.jsx` | L142 | Líneas de dirección |
| F2-T23 | `pages/checkout/OrderSuccessPage.jsx` | L71 | Imágenes recap |
| F2-T24 | `pages/checkout/PaymentFailedPage.jsx` | L84 | Historial de intentos |
| F2-T25 | `pages/home/HomePage.jsx` | L98 | Skeletons de carga |

**Nota:** `key={i}` en cabeceras de tabla estáticas (Calendar días semana)
y skeletons de carga (HomePage) es aceptable — el orden nunca cambia.
Se documenta para trazabilidad pero la prioridad de fix es baja en esos casos.

**Estado:** PENDIENTE — F2

---

## BUG-ACC-01 — Inputs sin aria-label

**Severidad:** BAJA
**Causa:** Inputs sin `<label>` asociado ni `aria-label` — lectores de pantalla no los identifican.

| Tarea | Archivo | Línea | Tipo | Fix |
|-------|---------|-------|------|-----|
| F3-T1 | `components/admin/RefundModal/index.jsx` | L74 | radio "full" | `aria-label="Reembolso completo"` |
| F3-T2 | `components/admin/RefundModal/index.jsx` | L79 | radio "partial" | `aria-label="Reembolso parcial"` |
| F3-T3 | `pages/account/ProfilePage.jsx` | L73 | file avatar | `aria-label="Subir foto de perfil"` |
| F3-T4 | `pages/admin/AdminAuditLogPage.jsx` | L65 | date "desde" | `aria-label="Fecha desde"` |
| F3-T5 | `pages/admin/AdminAuditLogPage.jsx` | L69 | date "hasta" | `aria-label="Fecha hasta"` |
| F3-T6 | `pages/admin/AdminPaymentsPage.jsx` | L93 | date "desde" | `aria-label="Fecha desde"` |
| F3-T7 | `pages/admin/AdminPaymentsPage.jsx` | L96 | date "hasta" | `aria-label="Fecha hasta"` |
| F3-T8 | `pages/admin/AdminProductDetailPage.jsx` | L231 | file imágenes | `aria-label="Subir imágenes del producto"` |
| F3-T9 | `pages/admin/AdminVariantTypesPage.jsx` | L236 | text etiqueta | `aria-label="Etiqueta de variante"` |
| F3-T10 | `pages/admin/AdminVariantTypesPage.jsx` | L237 | text sub-etiqueta | `aria-label="Sub-etiqueta de variante"` |

**Estado:** PENDIENTE — F3

---

## BUG-SCSS-01 — z-index hardcodeados

**Severidad:** BAJA
**Causa:** Los `z-index` no usan las variables `$z-*` del sistema de diseño.
Riesgo de conflictos entre capas al añadir nuevos elementos.

**Variables disponibles en `_variables.scss`:**
```scss
$z-sticky:         1020
$z-fixed:          1030
$z-modal-backdrop: 1040
$z-modal:          1050
$z-toast:          1080
```

| Tarea | Archivo | Línea | Valor actual | Variable correcta |
|-------|---------|-------|--------------|-------------------|
| F4-T1 | `components/admin/ProductDiscountCreateForm.module.scss` | L11 | 1000 | `$z-sticky` (1020) o valor custom |
| F4-T2 | `components/admin/VoucherCreateForm.module.scss` | L11 | 1000 | idem |
| F4-T3 | `components/common/Autocomplete/Autocomplete.module.scss` | L31, L77 | 9999 | `$z-modal` |
| F4-T4 | `components/common/Carousel/Carousel.module.scss` | L32, L86 | 10 | valor propio (`$z-carousel-controls: 10`) |
| F4-T5 | `components/common/DatePicker/DatePicker.module.scss` | L26 | 9999 | `$z-modal` |
| F4-T6 | `components/common/DatePicker/DateRangePicker.module.scss` | L21 | 9999 | `$z-modal` |
| F4-T7 | `components/common/MultiSelect/MultiSelect.module.scss` | L35 | 9999 | `$z-modal` |
| F4-T8 | `components/common/Offcanvas/Offcanvas.module.scss` | L7, L14 | 1040, 1045 | `$z-modal-backdrop`, `$z-modal` |
| F4-T9 | `components/common/Popover/Popover.module.scss` | L12 | 9999 | `$z-modal` |
| F4-T10 | `components/common/TimePicker/TimePicker.module.scss` | L50 | 9999 | `$z-modal` |
| F4-T11 | `components/common/Tooltip/Tooltip.module.scss` | L18 | 9999 | `$z-toast` |
| F4-T12 | `components/layout/Sidebar/Sidebar.module.scss` | L15, L46 | 200, 199 | valores propios |

**Estado:** PENDIENTE — F4

---

## BUG-MSW-01 — Endpoints admin sin handler MSW

**Severidad:** BAJA (afecta solo DEMO_MODE en panel admin)
**Causa:** El panel admin llama endpoints que no tienen handler en MSW —
la petición cae al network real y falla con error de red o CORS.

**28 endpoints sin cobertura:**

| Tarea | Método | Endpoint | Página afectada |
|-------|--------|----------|-----------------|
| F5-T01 | DELETE | `/api/v1/admin/categories/:id/` | AdminCategoriesPage |
| F5-T02 | DELETE | `/api/v1/admin/products/:id/` | AdminProductDetailPage |
| F5-T03 | DELETE | `/api/v1/admin/products/:id/images/:id/` | AdminProductDetailPage |
| F5-T04 | DELETE | `/api/v1/admin/products/:id/variant-types/:id/` | AdminVariantTypesPage |
| F5-T05 | DELETE | `/api/v1/admin/shipping-methods/:id/` | AdminShippingPage |
| F5-T06 | GET | `/api/v1/admin/orders/:id/` | AdminOrderDetailPage |
| F5-T07 | GET | `/api/v1/admin/price-sync/template/` | AdminPriceSyncPage |
| F5-T08 | GET | `/api/v1/admin/products/:id/variant-types/` | AdminVariantTypesPage |
| F5-T09 | GET | `/api/v1/admin/products/:id/variants/` | AdminProductVariantsPage |
| F5-T10 | GET | `/api/v1/admin/products/import/:id/` | AdminProductImportPage |
| F5-T11 | GET | `/api/v1/admin/products/import/template/` | AdminProductImportPage |
| F5-T12 | PATCH | `/api/v1/admin/categories/:id/` | AdminCategoriesPage |
| F5-T13 | PATCH | `/api/v1/admin/shipping-methods/:id/` | AdminShippingPage |
| F5-T14 | POST | `/api/v1/admin/categories/` | AdminCategoriesPage |
| F5-T15 | POST | `/api/v1/admin/orders/:id/refund/` | AdminOrderDetailPage |
| F5-T16 | POST | `/api/v1/admin/pages/` | AdminStaticPageEditorPage |
| F5-T17 | POST | `/api/v1/admin/products/` | AdminProductForm |
| F5-T18 | POST | `/api/v1/admin/products/:id/adjust-stock/` | AdminProductDetailPage |
| F5-T19 | POST | `/api/v1/admin/products/:id/images/` | AdminProductDetailPage |
| F5-T20 | POST | `/api/v1/admin/products/import/` | AdminProductImportPage |
| F5-T21 | POST | `/api/v1/admin/shipping-methods/` | AdminShippingPage |
| F5-T22 | POST | `/api/v1/admin/users/:id/reset-password/` | AdminUsersPage |
| F5-T23 | POST | `/api/v1/admin/variants/:id/adjust-stock/` | AdminProductVariantsPage |
| F5-T24 | POST | `/api/v1/admin/vouchers/:id/duplicate/` | AdminVoucherDetailPage |
| F5-T25 | POST | `/api/v1/admin/vouchers/:id/toggle/` | AdminVoucherDetailPage |

**Estado:** PENDIENTE — F5

---

## BUG-SCSS-02 — Módulos SCSS sin JSX correspondiente

**Severidad:** INFO
**Causa:** Archivos `.module.scss` sin componente JSX — o el componente usa `index.jsx`
o el SCSS es compartido y debería vivir en `styles/components/`.

| Tarea | Archivo | Diagnóstico |
|-------|---------|-------------|
| F6-T1 | `AccountSidebar/AccountSidebar.module.scss` | Componente usa `index.jsx` — renombrar o mover |
| F6-T2 | `AdminSidebar/AdminSidebar.module.scss` | Idem |
| F6-T3 | `RefundModal/RefundModal.module.scss` | Componente usa `index.jsx` |
| F6-T4 | `StockAdjustModal/StockAdjustModal.module.scss` | Idem |
| F6-T5 | `primitives/primitives.module.scss` | SCSS compartido — mover a `styles/components/` |
| F6-T6 | `Footer/Footer.module.scss` | Componente usa `index.jsx` |
| F6-T7 | `Header/Header.module.scss` | Idem (existe `Header/index.jsx`) |
| F6-T8 | `AdminLayout/AdminLayout.module.scss` | Layout usa `AdminLayout.jsx` directamente |
| F6-T9 | `AdminBulkPage.module.scss` | Página usa nombre sin carpeta |
| F6-T10 | `AdminReportPage.module.scss` | Idem |
| F6-T11 | `AdminTablePage.module.scss` | Idem |
| F6-T12 | `AuthSimplePage.module.scss` | Idem |

**Estado:** PENDIENTE — F6
