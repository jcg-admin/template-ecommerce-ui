# Plan de corrección — corregir-bugs-auditoria

**Creado:** 2026-05-30
**Origen:** Auditoría post-deploy (8 capas)
**Estrategia:** Fases ordenadas por severidad. Cada tarea toca un solo archivo.
Commit al final de cada fase. Tests + SCSS check antes de cada commit.

---

## FASE 1 — CSS custom properties rotas (CRÍTICA)

**Impacto:** El modal de búsqueda no tiene colores. Texto y fondos invisibles.
**Tiempo estimado:** 15 min.
**Commit:** `fix: BUG-CSS-01 + BUG-CSS-02 — CSS vars prefijo --ec-*`

### F1-T1 — SearchModal.module.scss: reemplazar --c-* por --ec-*

**Archivo:** `src/components/common/SearchModal/SearchModal.module.scss`

Mapeo de variables:

| Antes (rota) | Después (correcta) |
|---|---|
| `var(--c-surface-1)` | `var(--ec-bg-page)` |
| `var(--c-surface-2)` | `var(--ec-bg-surface)` |
| `var(--c-accent)` | `var(--ec-accent)` |
| `var(--c-border)` | `var(--ec-border-color)` |
| `var(--c-text-primary)` | `var(--ec-text-primary)` |
| `var(--c-text-secondary)` | `var(--ec-text-secondary)` |

**Verificar:** abrir el modal de búsqueda → fondo visible, input con borde, texto legible.

- [x] DONE

### F1-T2 — ProductCard.module.scss: --text-muted → --ec-text-muted

**Archivo:** `src/components/catalog/ProductCard.module.scss`

```scss
// Antes
color: var(--text-muted);
// Después
color: var(--ec-text-muted);
```

**Verificar:** cards del catálogo → texto secundario (precio, categoría) visible.

- [x] DONE

---

## FASE 2 — React keys en listas (MEDIA)

**Impacto:** Reconciliación incorrecta al reordenar o filtrar listas.
**Tiempo estimado:** 30 min.
**Commit:** `fix: BUG-KEY-01 — reemplazar key={{index}} por key estable en 25 ocurrencias`

**Regla general:**
- Items con `id` → `key={item.id}`
- Items con `slug` → `key={item.slug}`
- Strings en array → `key={string}` o `key={\`prefix-\${index}\`}` si pueden repetirse
- Cabeceras estáticas de tabla (días semana), skeletons → `key={index}` es aceptable

### F2-T1 — AdminSidebar/index.jsx L55
Secciones de nav son estáticas. `key={i}` → `key={item.section}`.
- [x] DONE

### F2-T2 — OTPInput/OTPInput.jsx L173
Dígitos OTP: array de longitud fija, orden fijo. `key={i}` → `key={\`otp-\${i}\`}`.
- [x] DONE

### F2-T3 — Autocomplete/Autocomplete.jsx L277
Items de sugerencias. `key={i}` → `key={item.id ?? item.value ?? i}`.
- [x] DONE

### F2-T4 — Carousel/Carousel.jsx L179
Slides. `key={i}` → `key={slide.id ?? \`slide-\${i}\`}`.
- [x] DONE

### F2-T5 — DatePicker/Calendar.jsx L320
Cabecera de días de la semana — orden fijo, estático. `key={i}` → `key={d.toISOString()}`.
- [x] DONE

### F2-T6 — MultiSelect/MultiSelect.jsx L251 (tags)
Tags seleccionados. `key={i}` → `key={v}` (el valor es el identificador).
- [x] DONE

### F2-T7 — MultiSelect/MultiSelect.jsx L271 (inputs hidden)
Inputs hidden. `key={i}` → `key={\`hidden-\${v}\`}`.
- [x] DONE

### F2-T8 — RangeSlider/RangeSlider.jsx L121 + L140
Marks del slider. `key={idx}` → `key={\`mark-\${mark.value}\`}`.
- [x] DONE

### F2-T9 — Stepper/Stepper.jsx L98
Pasos del stepper. `key={i}` → `key={step.id ?? step.label ?? i}`.
- [x] DONE

### F2-T10 — Header/index.jsx L181
Items del mini-cart. `key={i}` → `key={item.id}`.
- [x] DONE

### F2-T11 — AddressesPage.jsx L62
Tarjetas de dirección. `key={i}` → `key={addr.id}`.
- [x] DONE

### F2-T12 — OrderDetailPage.jsx L138
Líneas del pedido. `key={i}` → `key={item.id ?? item.product_id}`.
- [x] DONE

### F2-T13 — AdminDashboardPage.jsx L109
Alertas de stock. `key={i}` → `key={a.product_id ?? i}`.
- [x] DONE

### F2-T14 — AdminInventoryImportPage.jsx L107
Filas de errores. `key={idx}` → `key={\`row-\${row.line ?? idx}\`}`.
- [x] DONE

### F2-T15 — AdminOrderDetailPage.jsx L173 + L217
Items L173: `key={i}` → `key={item.id}`.
Notas L217: `key={i}` → `key={\`note-\${i}\`}` (no tienen id).
- [x] DONE

### F2-T16 — AdminPriceSyncPage.jsx L147
Filas de preview. `key={i}` → `key={row.sku ?? i}`.
- [x] DONE

### F2-T17 — AdminProductImportPage.jsx L147
Filas de import. `key={i}` → `key={row.id ?? row.sku ?? i}`.
- [x] DONE

### F2-T18 — AdminProductVariantsPage.jsx L167
Chips de combinación. `key={i}` → `key={label}` (son strings únicos).
- [x] DONE

### F2-T19 — AdminVoucherDetailPage.jsx L144
Changelog. `key={i}` → `key={entry.id ?? \`log-\${i}\`}`.
- [x] DONE

### F2-T20 — CatalogPage.jsx L265 + L327
L265 filtros Check: `key={i}` → `key={i}` (el valor string `i` ES el key, variable mal nombrada).
L327 Pagination: inspeccionar y corregir según contexto.
- [x] DONE

### F2-T21 — ProductPage.jsx L84
Thumbnails. `key={i}` → `key={img.id ?? img.url ?? i}`.
- [x] DONE

### F2-T22 — ExpressCheckoutPage.jsx L142
Líneas de dirección (strings). `key={i}` → `key={\`line-\${i}\`}`.
- [x] DONE

### F2-T23 — OrderSuccessPage.jsx L71
Imágenes recap. `key={i}` → `key={item.id ?? i}`.
- [x] DONE

### F2-T24 — PaymentFailedPage.jsx L84
Historial de intentos. `key={i}` → `key={entry.id ?? \`attempt-\${i}\`}`.
- [x] DONE

### F2-T25 — HomePage.jsx L98
Skeletons: array de longitud fija generado con `Array.from`. `key={i}` aceptable.
Marcar como INFO, no requiere cambio.
- [x] DONE (INFO — sin cambio)

---

## FASE 3 — Accesibilidad: inputs sin aria-label (BAJA)

**Impacto:** Lectores de pantalla no pueden identificar los campos.
**Tiempo estimado:** 20 min.
**Commit:** `fix: BUG-ACC-01 — aria-label en 10 inputs sin label`

### F3-T1 — RefundModal/index.jsx L74
`<input type="radio" name="type" value="full" ...>`
Agregar `aria-label="Reembolso completo"`.
- [x] DONE

### F3-T2 — RefundModal/index.jsx L79
`<input type="radio" name="type" value="partial" ...>`
Agregar `aria-label="Reembolso parcial"`.
- [x] DONE

### F3-T3 — ProfilePage.jsx L73
`<input type="file" accept="image/..." onChange={handleAvatar} hidden>`
Agregar `aria-label="Subir foto de perfil"`.
- [x] DONE

### F3-T4 — AdminAuditLogPage.jsx L65
`<input type="date" value={from} ...>`
Agregar `aria-label="Fecha desde"`.
- [x] DONE

### F3-T5 — AdminAuditLogPage.jsx L69
`<input type="date" value={to} ...>`
Agregar `aria-label="Fecha hasta"`.
- [x] DONE

### F3-T6 — AdminPaymentsPage.jsx L93
`<input type="date" value={filters.from} ...>`
Agregar `aria-label="Fecha desde"`.
- [x] DONE

### F3-T7 — AdminPaymentsPage.jsx L96
`<input type="date" value={filters.to} ...>`
Agregar `aria-label="Fecha hasta"`.
- [x] DONE

### F3-T8 — AdminProductDetailPage.jsx L231
`<input type="file" multiple accept="image/*" onChange={handleUpload} hidden>`
Agregar `aria-label="Subir imágenes del producto"`.
- [x] DONE

### F3-T9 — AdminVariantTypesPage.jsx L236
`<input placeholder="Etiqueta" ...>`
Agregar `aria-label="Etiqueta de variante"`.
- [x] DONE

### F3-T10 — AdminVariantTypesPage.jsx L237
`<input placeholder="Sub-etiqueta" ...>`
Agregar `aria-label="Sub-etiqueta de variante"`.
- [x] DONE

---

## FASE 4 — SCSS: z-index hardcodeados (BAJA)

**Impacto:** Sin impacto visual inmediato. Riesgo de conflictos de capas a futuro.
**Tiempo estimado:** 20 min.
**Commit:** `fix: BUG-SCSS-01 — z-index hardcodeados reemplazados por variables $z-*`

Antes de iniciar: agregar en `_variables.scss` las variables que falten:
```scss
$z-dropdown:  1000;   // dropdowns, formularios flotantes
$z-carousel:  10;     // controles internos del carrusel
$z-sidebar:   200;    // sidebar móvil
$z-overlay:   199;    // backdrop del sidebar
```

### F4-T1 — ProductDiscountCreateForm.module.scss L11
`z-index: 1000` → `z-index: $z-dropdown` (requiere `@use '@styles/abstracts' as *`).
- [ ] DONE

### F4-T2 — VoucherCreateForm.module.scss L11
`z-index: 1000` → `z-index: $z-dropdown`.
- [ ] DONE

### F4-T3 — Autocomplete/Autocomplete.module.scss L31 + L77
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T4 — Carousel/Carousel.module.scss L32 + L86
`z-index: 10` → `z-index: $z-carousel`.
- [ ] DONE

### F4-T5 — DatePicker/DatePicker.module.scss L26
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T6 — DatePicker/DateRangePicker.module.scss L21
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T7 — MultiSelect/MultiSelect.module.scss L35
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T8 — Offcanvas/Offcanvas.module.scss L7 + L14
`z-index: 1040` → `z-index: $z-modal-backdrop`.
`z-index: 1045` → `z-index: $z-modal`.
- [ ] DONE

### F4-T9 — Popover/Popover.module.scss L12
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T10 — TimePicker/TimePicker.module.scss L50
`z-index: 9999` → `z-index: $z-modal`.
- [ ] DONE

### F4-T11 — Tooltip/Tooltip.module.scss L18
`z-index: 9999` → `z-index: $z-toast` (los tooltips van sobre todo lo demás).
- [ ] DONE

### F4-T12 — Sidebar/Sidebar.module.scss L15 + L46
`z-index: 200` → `z-index: $z-sidebar`.
`z-index: 199` → `z-index: $z-overlay`.
- [ ] DONE

---

## FASE 5 — MSW: handlers del panel admin (BAJA)

**Impacto:** Las acciones del panel admin fallan en DEMO_MODE con error de red.
**Tiempo estimado:** 60 min.
**Commit:** `fix: BUG-MSW-01 — handlers MSW para 25 endpoints del panel admin`

Todos los handlers van en `src/mocks/handlers/admin.ts`.
Respuestas minimalistas que permiten completar el flujo sin datos reales.

### Grupo A — Categorías (F5-T01, F5-T12, F5-T14)
- [ ] F5-T01 DELETE `/api/v1/admin/categories/:id/` → 204 No Content
- [ ] F5-T12 PATCH `/api/v1/admin/categories/:id/` → devuelve categoría actualizada
- [ ] F5-T14 POST `/api/v1/admin/categories/` → devuelve categoría nueva con id mockeado

### Grupo B — Pedidos admin (F5-T06, F5-T15)
- [ ] F5-T06 GET `/api/v1/admin/orders/:id/` → devuelve pedido mock completo
- [ ] F5-T15 POST `/api/v1/admin/orders/:id/refund/` → devuelve `{ status: 'refunded' }`

### Grupo C — Productos (F5-T02, F5-T17, F5-T18, F5-T19)
- [ ] F5-T02 DELETE `/api/v1/admin/products/:id/` → 204 No Content
- [ ] F5-T17 POST `/api/v1/admin/products/` → devuelve producto nuevo con id mockeado
- [ ] F5-T18 POST `/api/v1/admin/products/:id/adjust-stock/` → `{ stock: N }`
- [ ] F5-T19 POST `/api/v1/admin/products/:id/images/` → `{ id: 99, url: '/mock-images/product.jpg' }`

### Grupo D — Imágenes de producto (F5-T03)
- [ ] F5-T03 DELETE `/api/v1/admin/products/:id/images/:id/` → 204 No Content

### Grupo E — Variantes (F5-T04, F5-T08, F5-T09, F5-T23)
- [ ] F5-T04 DELETE `/api/v1/admin/products/:id/variant-types/:id/` → 204 No Content
- [ ] F5-T08 GET `/api/v1/admin/products/:id/variant-types/` → array de tipos mock
- [ ] F5-T09 GET `/api/v1/admin/products/:id/variants/` → array de variantes mock
- [ ] F5-T23 POST `/api/v1/admin/variants/:id/adjust-stock/` → `{ stock: N }`

### Grupo F — Import de productos (F5-T10, F5-T11, F5-T20)
- [ ] F5-T10 GET `/api/v1/admin/products/import/:id/` → estado del import mock
- [ ] F5-T11 GET `/api/v1/admin/products/import/template/` → blob CSV vacío (200 + Content-Type)
- [ ] F5-T20 POST `/api/v1/admin/products/import/` → `{ id: 1, status: 'processing' }`

### Grupo G — Price sync (F5-T07)
- [ ] F5-T07 GET `/api/v1/admin/price-sync/template/` → blob CSV vacío

### Grupo H — Shipping methods (F5-T05, F5-T13, F5-T21)
- [ ] F5-T05 DELETE `/api/v1/admin/shipping-methods/:id/` → 204 No Content
- [ ] F5-T13 PATCH `/api/v1/admin/shipping-methods/:id/` → método actualizado
- [ ] F5-T21 POST `/api/v1/admin/shipping-methods/` → método nuevo con id mockeado

### Grupo I — Usuarios (F5-T22)
- [ ] F5-T22 POST `/api/v1/admin/users/:id/reset-password/` → `{ detail: 'Email enviado.' }`

### Grupo J — Vouchers (F5-T24, F5-T25)
- [ ] F5-T24 POST `/api/v1/admin/vouchers/:id/duplicate/` → voucher duplicado con nuevo id
- [ ] F5-T25 POST `/api/v1/admin/vouchers/:id/toggle/` → `{ is_active: !prev }`

### Grupo K — Páginas estáticas (F5-T16)
- [ ] F5-T16 POST `/api/v1/admin/pages/` → página nueva con id mockeado

---

## FASE 6 — SCSS huérfanos: diagnóstico y limpieza (INFO)

**Impacto:** Cero en runtime. Claridad del código.
**Tiempo estimado:** 15 min.
**Commit:** `chore: BUG-SCSS-02 — documentar y clasificar módulos SCSS sin JSX directo`

Los archivos huérfanos son de dos tipos:

**Tipo A — Componentes con index.jsx** (el SCSS tiene nombre diferente al index):
`AccountSidebar`, `AdminSidebar`, `RefundModal`, `StockAdjustModal`, `Footer`, `Header`.
→ No requieren cambio. El SCSS es correcto, el detector buscaba `ComponentName.jsx`
pero el componente es `index.jsx`. Documentar como falso positivo.

**Tipo B — Layouts y páginas con nombre parcial**:
`AdminLayout.module.scss`, `AdminBulkPage.module.scss`, `AdminReportPage.module.scss`,
`AdminTablePage.module.scss`, `AuthSimplePage.module.scss`.
→ Verificar si los importa algún componente. Si no → eliminar.

**Tipo C — SCSS compartido**:
`primitives/primitives.module.scss`.
→ Verificar si lo usa algún JSX. Si no → mover a `styles/components/_primitives.scss`.

### F6-T1 — Verificar Tipo A (6 archivos)
Confirmar que son falsos positivos — el componente usa `index.jsx`.
- [ ] DONE

### F6-T2 — Verificar Tipo B (5 archivos)
Buscar importadores. Eliminar si no hay ninguno.
- [ ] DONE

### F6-T3 — Verificar Tipo C (1 archivo)
`primitives.module.scss` — buscar importador o mover.
- [ ] DONE

---

## Criterios de cierre de la iniciativa

- [ ] `node scripts/check-scss.mjs` → 0 issues
- [ ] `npm test` → 0 fallos
- [ ] Build sin warnings de Sass
- [ ] Todas las tareas marcadas DONE
- [ ] Commit final etiquetado en git
