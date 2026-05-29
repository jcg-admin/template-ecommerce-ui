# Plan de implementación completa — auditar-rutas-y-flujos

Generado: 2026-05-28  
Metodología: lectura completa de cada JSX + API de cada componente ui-core + sistema SCSS

---

## PRINCIPIOS DE IMPLEMENTACIÓN

### Uso obligatorio de componentes ui-core
Cada página debe usar los componentes correctos según la situación:

| Situación | Componente | Props clave |
|-----------|-----------|-------------|
| Botón que dispara una llamada API | `LoadingButton` | `loading={isActioning}` `variant="primary"` |
| Error inline (validación, API) | `Alert` | `variant="danger"` `dismissible` |
| Éxito tras guardar | `Alert` | `variant="success"` `timeout={4000}` |
| Confirmación de borrado | `Modal` | `backdrop="static"` `centered` |
| Formulario multipaso | `Stepper` | `linear` `onFinish` |
| Secciones colapsables | `Collapse` | con `<button>` como trigger |
| Selector de múltiples opciones | `MultiSelect` | `options` `onChange` `selectionType="tags"` |
| Selector con búsqueda | `Autocomplete` | `externalSearch` para async |
| Etiquetas seleccionables | `Chip` | `selectable` `onSelect` `onDeselect` |
| Input de etiquetas | `ChipInput` | `onChange` |
| Rango de valores | `RangeSlider` | `min` `max` `defaultValue={[a,b]}` `tooltipsFormat` |
| Fecha individual | `DatePicker` | `onChange` `format` |
| Rango de fechas | `DateRangePicker` | `onChange` |
| Pestañas de secciones | `Tabs` + `TabList` + `Tab` + `TabPanel` | `defaultTab` `onTabChange` |
| Tooltip informativo | `Tooltip` | `placement` `trigger="hover focus"` |
| Panel lateral | `Offcanvas` | `open` `onClose` `placement` |
| Carrusel de imágenes | `Carousel` | `interval={0}` + `CarouselSlide` |
| Precios formateados | `Price` | `amount` `currency="MXN"` |
| Badges de estado | `MetaTag` | `tone="bronze"/"lime"/"vino"/"coral"` |
| Campos de formulario | `Field` | `label` `value` `onChange` `error` |

### Sistema SCSS — variables a usar
```scss
@use '@styles/abstracts' as *;
// Colores: $primary-color, $bg-surface, $bg-elevated, $bg-page
// $text-primary, $text-secondary, $text-muted
// $border-color, $border-medium, $border-strong
// $error-color, $error-bg, $success-color, $success-bg
// $warning-color, $info-color
// $bronze, $coral, $lime, $vino
// Spacing: $spacing-1..$spacing-24
// Typography: $font-size-xs..$font-size-5xl, $font-weight-*
// Border: $border-radius-sm..$border-radius-2xl
// Shadows: $shadow-xs..$shadow-xl, $shadow-modal
// Mixins: @include flex-start, flex-center, flex-between, card-base, btn-primary
```

---

## FASE 1 — SCSS MODULES FALTANTES (11 archivos)
**Prioridad: BLOQUEANTE — crash en build al navegar a esas páginas**

### F1-01 — AdminProductEditPage.module.scss
Clases usadas por la página: `page`, `header`, `title`, `subtitle`
```scss
@use '@styles/abstracts' as *;
.page   { max-width: 900px; margin: 0 auto; padding: $spacing-8 $spacing-6; }
.header { display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: $spacing-8; gap: $spacing-4; }
.title  { font-family: $font-family-display; font-size: $font-size-2xl;
          color: $text-primary; margin: 0; }
.subtitle { font-size: $font-size-sm; color: $text-muted; margin-top: $spacing-1; }
```

### F1-02 — AdminProductImportPage.module.scss
Clases: `page`, `header`, `breadcrumb`, `bcCurrent`, `lead`, `dropZone`, `dropZoneActive`, `dropIcon`, `dropTitle`, `dropHint`, `actions`, `actionBadge`, `stat`, `statN`, `statLabel`, `iconOk`, `iconFail`, `errorMsg`, `errorDownload`
```scss
@use '@styles/abstracts' as *;
.page       { padding: $spacing-8 $spacing-6; max-width: 1200px; margin: 0 auto; }
.header     { margin-bottom: $spacing-8; }
.breadcrumb { display: flex; align-items: center; gap: $spacing-2;
              font-size: $font-size-sm; color: $text-muted; margin-bottom: $spacing-4;
              a { color: $text-muted; text-decoration: none;
                  &:hover { color: $text-primary; } } }
.bcCurrent  { color: $text-secondary; }
.lead       { font-size: $font-size-base; color: $text-secondary; }
.dropZone   { border: 2px dashed $border-medium; border-radius: $border-radius-lg;
              padding: $spacing-12; text-align: center; cursor: pointer;
              transition: $transition-default;
              &:hover { border-color: $primary-color; background: $primary-50; } }
.dropZoneActive { border-color: $primary-color; background: $primary-50; }
.dropIcon   { font-size: 48px; margin-bottom: $spacing-4; opacity: 0.4; }
.dropTitle  { font-size: $font-size-lg; color: $text-primary; margin-bottom: $spacing-2; }
.dropHint   { font-size: $font-size-sm; color: $text-muted; }
.actions    { display: flex; gap: $spacing-3; margin-top: $spacing-6; }
.actionBadge { display: inline-flex; align-items: center; gap: $spacing-1;
               padding: $spacing-1 $spacing-3; border-radius: $border-radius-full;
               font-size: $font-size-xs; font-weight: $font-weight-semibold;
               background: $bg-elevated; color: $text-secondary; }
.stat       { text-align: center; padding: $spacing-6; background: $bg-surface;
              border-radius: $border-radius-lg; }
.statN      { font-size: $font-size-3xl; font-weight: $font-weight-bold;
              color: $text-primary; }
.statLabel  { font-size: $font-size-sm; color: $text-muted; margin-top: $spacing-1; }
.iconOk     { color: $success-color; }
.iconFail   { color: $error-color; }
.errorMsg   { font-size: $font-size-sm; color: $error-color; }
.errorDownload { font-size: $font-size-sm; color: $text-link; text-decoration: underline;
                 cursor: pointer; }
```

### F1-03 — AdminProductVariantsPage.module.scss
Clases: `page`, `breadcrumb`, `bcCurrent`, `header`, `headerActions`, `empty`, `table`, `mono`, `cellInput`, `cellInputNum`, `bulkBar`, `bulkLabel`, `bulkInput`, `bulkSelect`, `combo`, `comboChip`
```scss
@use '@styles/abstracts' as *;
.page          { padding: $spacing-8 $spacing-6; max-width: 1400px; margin: 0 auto; }
.breadcrumb    { display: flex; align-items: center; gap: $spacing-2;
                 font-size: $font-size-sm; color: $text-muted; margin-bottom: $spacing-4;
                 a { color: $text-muted; text-decoration: none;
                     &:hover { color: $text-primary; } } }
.bcCurrent     { color: $text-secondary; }
.header        { display: flex; justify-content: space-between; align-items: center;
                 margin-bottom: $spacing-6; }
.headerActions { display: flex; gap: $spacing-3; }
.empty         { text-align: center; padding: $spacing-16; color: $text-muted; }
.table         { width: 100%; border-collapse: collapse;
                 th { padding: $spacing-3 $spacing-4; text-align: left;
                      font-size: $font-size-xs; font-weight: $font-weight-semibold;
                      color: $text-muted; text-transform: uppercase;
                      letter-spacing: $ls-eyebrow; border-bottom: 1px solid $border-color; }
                 td { padding: $spacing-3 $spacing-4; border-bottom: 1px solid $border-color;
                      font-size: $font-size-sm; color: $text-secondary; } }
.mono          { font-family: $font-family-mono; font-size: $font-size-xs; color: $text-muted; }
.cellInput     { background: $bg-elevated; border: 1px solid $border-color;
                 border-radius: $border-radius-sm; padding: $spacing-1 $spacing-2;
                 color: $text-primary; font-size: $font-size-sm; width: 100%; }
.cellInputNum  { @extend .cellInput; width: 80px; text-align: right; }
.bulkBar       { display: flex; align-items: center; gap: $spacing-4;
                 padding: $spacing-3 $spacing-4; background: $bg-elevated;
                 border-radius: $border-radius-md; margin-bottom: $spacing-4; }
.bulkLabel     { font-size: $font-size-sm; color: $text-secondary; }
.bulkInput     { @extend .cellInput; flex: 1; }
.bulkSelect    { background: $bg-elevated; border: 1px solid $border-color;
                 border-radius: $border-radius-sm; padding: $spacing-1 $spacing-2;
                 color: $text-primary; font-size: $font-size-sm; }
.combo         { display: flex; align-items: center; gap: $spacing-2; }
.comboChip     { display: inline-flex; align-items: center; padding: 2px $spacing-2;
                 background: $primary-50; color: $primary-color; border-radius: $border-radius-full;
                 font-size: $font-size-xs; font-weight: $font-weight-medium; }
```

### F1-04 — AdminReportDashboardPage.module.scss
Clases: `page`, `header`, `title`, `metric`, `metricLabel`, `metricValue`, `sectionTitle`, `table`, `totals`, `exportGroup`, `exportLink`, `empty`, `error`
```scss
@use '@styles/abstracts' as *;
.page        { padding: $spacing-8 $spacing-6; max-width: 1400px; margin: 0 auto; }
.header      { display: flex; justify-content: space-between; align-items: center;
               margin-bottom: $spacing-8; }
.title       { font-family: $font-family-display; font-size: $font-size-2xl; color: $text-primary; }
.metric      { background: $bg-surface; border: 1px solid $border-color;
               border-radius: $border-radius-lg; padding: $spacing-6; }
.metricLabel { font-size: $font-size-xs; text-transform: uppercase; letter-spacing: $ls-eyebrow;
               color: $text-muted; margin-bottom: $spacing-2; }
.metricValue { font-size: $font-size-3xl; font-weight: $font-weight-bold; color: $text-primary; }
.sectionTitle { font-size: $font-size-lg; font-weight: $font-weight-semibold;
                color: $text-primary; margin: $spacing-8 0 $spacing-4; }
.table       { width: 100%; border-collapse: collapse;
               th { font-size: $font-size-xs; color: $text-muted; text-align: left;
                    padding: $spacing-2 $spacing-3; border-bottom: 1px solid $border-color;
                    text-transform: uppercase; letter-spacing: $ls-eyebrow; }
               td { padding: $spacing-3; border-bottom: 1px solid $border-color;
                    font-size: $font-size-sm; color: $text-secondary; } }
.totals      { font-weight: $font-weight-semibold; color: $text-primary; }
.exportGroup { display: flex; gap: $spacing-3; margin-bottom: $spacing-4; }
.exportLink  { font-size: $font-size-sm; color: $text-link; text-decoration: underline; cursor: pointer; }
.empty       { text-align: center; padding: $spacing-16; color: $text-muted; }
.error       { color: $error-color; font-size: $font-size-sm; }
```

### F1-05 — AdminReportSalesPage.module.scss
Clases: igual que ReportDashboard + `filters`, `filter`, `metricDelta`, `metricDeltaUp`, `metricDeltaDown`
```scss
@use '@styles/abstracts' as *;
// Extiende el mismo sistema que AdminReportDashboardPage
.page           { padding: $spacing-8 $spacing-6; max-width: 1400px; margin: 0 auto; }
.header         { display: flex; justify-content: space-between; align-items: center;
                  margin-bottom: $spacing-6; }
.title          { font-family: $font-family-display; font-size: $font-size-2xl; color: $text-primary; }
.filters        { display: flex; gap: $spacing-4; margin-bottom: $spacing-8;
                  flex-wrap: wrap; align-items: center; }
.filter         { display: flex; flex-direction: column; gap: $spacing-1;
                  label { font-size: $font-size-xs; color: $text-muted; } }
.metric         { background: $bg-surface; border: 1px solid $border-color;
                  border-radius: $border-radius-lg; padding: $spacing-6; }
.metricLabel    { font-size: $font-size-xs; text-transform: uppercase; letter-spacing: $ls-eyebrow;
                  color: $text-muted; margin-bottom: $spacing-2; }
.metricValue    { font-size: $font-size-3xl; font-weight: $font-weight-bold; color: $text-primary; }
.metricDelta    { font-size: $font-size-sm; margin-top: $spacing-1; }
.metricDeltaUp  { color: $success-color; }
.metricDeltaDown { color: $error-color; }
.sectionTitle   { font-size: $font-size-lg; font-weight: $font-weight-semibold;
                  color: $text-primary; margin: $spacing-8 0 $spacing-4; }
.table          { width: 100%; border-collapse: collapse;
                  th { font-size: $font-size-xs; color: $text-muted; text-align: left;
                       padding: $spacing-2 $spacing-3; border-bottom: 1px solid $border-color;
                       text-transform: uppercase; letter-spacing: $ls-eyebrow; }
                  td { padding: $spacing-3; border-bottom: 1px solid $border-color;
                       font-size: $font-size-sm; color: $text-secondary; } }
.totals         { font-weight: $font-weight-semibold; color: $text-primary; }
.exportGroup    { display: flex; gap: $spacing-3; margin-bottom: $spacing-4; }
.exportLink     { font-size: $font-size-sm; color: $text-link; text-decoration: underline; cursor: pointer; }
.empty          { text-align: center; padding: $spacing-16; color: $text-muted; }
.error          { color: $error-color; font-size: $font-size-sm; }
```

### F1-06 — AdminReportTopSellersPage.module.scss
Clases: igual que ReportSalesPage sin metricDelta*
_(Mismo contenido que F1-05 excepto las clases de delta)_

### F1-07 — AdminReportCustomersRfmPage.module.scss
Clases: igual que ReportSalesPage
_(Mismo contenido que F1-05)_

### F1-08 — AdminShippingMethodsPage.module.scss
Clases: `page`, `header`, `title`, `table`, `tableWrap`, `loading`, `empty`, `itemName`, `mono`, `statusPill`, `actions`, `actionBtn`, `actionDelete`
```scss
@use '@styles/abstracts' as *;
.page       { padding: $spacing-8 $spacing-6; max-width: 1200px; margin: 0 auto; }
.header     { display: flex; justify-content: space-between; align-items: center;
              margin-bottom: $spacing-6; }
.title      { font-family: $font-family-display; font-size: $font-size-2xl; color: $text-primary; }
.tableWrap  { overflow-x: auto; }
.table      { width: 100%; border-collapse: collapse;
              th { font-size: $font-size-xs; color: $text-muted; text-align: left;
                   padding: $spacing-2 $spacing-4; border-bottom: 1px solid $border-color;
                   text-transform: uppercase; letter-spacing: $ls-eyebrow; }
              td { padding: $spacing-4; border-bottom: 1px solid $border-color;
                   font-size: $font-size-sm; color: $text-secondary; } }
.loading    { text-align: center; padding: $spacing-16; color: $text-muted; }
.empty      { text-align: center; padding: $spacing-16; color: $text-muted; }
.itemName   { font-weight: $font-weight-medium; color: $text-primary; }
.mono       { font-family: $font-family-mono; font-size: $font-size-xs; }
.statusPill { display: inline-flex; align-items: center; padding: 2px $spacing-3;
              border-radius: $border-radius-full; font-size: $font-size-xs;
              font-weight: $font-weight-semibold;
              &.active { background: $success-bg; color: $success-color; }
              &.inactive { background: $error-bg; color: $error-color; } }
.actions    { display: flex; gap: $spacing-2; }
.actionBtn  { background: none; border: 1px solid $border-color; border-radius: $border-radius-sm;
              padding: $spacing-1 $spacing-3; font-size: $font-size-xs; color: $text-secondary;
              cursor: pointer; transition: $transition-default;
              &:hover { border-color: $primary-color; color: $primary-color; } }
.actionDelete { @extend .actionBtn; &:hover { border-color: $error-color; color: $error-color; } }
```

### F1-09 — AdminStaticPagesPage.module.scss
Clases: `page`, `header`, `title`, `table`, `tableWrap`, `loading`, `empty`, `itemName`, `mono`, `statusPill`, `actions`, `actionBtn`
_(Mismo sistema que F1-08)_

### F1-10 — AdminStockAlertsPage.module.scss
Clases: `page`, `header`, `title`, `table`, `tableWrap`, `loading`, `empty`, `itemName`, `mono`, `statusPill`, `actions`, `stockLow`, `stockOut`
```scss
@use '@styles/abstracts' as *;
// Base igual que F1-08
.page       { padding: $spacing-8 $spacing-6; max-width: 1400px; margin: 0 auto; }
.header     { display: flex; justify-content: space-between; align-items: center;
              margin-bottom: $spacing-6; }
.title      { font-family: $font-family-display; font-size: $font-size-2xl; color: $text-primary; }
.tableWrap  { overflow-x: auto; }
.table      { width: 100%; border-collapse: collapse;
              th { font-size: $font-size-xs; color: $text-muted; text-align: left;
                   padding: $spacing-2 $spacing-4; border-bottom: 1px solid $border-color;
                   text-transform: uppercase; letter-spacing: $ls-eyebrow; }
              td { padding: $spacing-4; border-bottom: 1px solid $border-color;
                   font-size: $font-size-sm; color: $text-secondary; } }
.loading    { text-align: center; padding: $spacing-16; color: $text-muted; }
.empty      { text-align: center; padding: $spacing-16; color: $text-muted; }
.itemName   { font-weight: $font-weight-medium; color: $text-primary; }
.mono       { font-family: $font-family-mono; font-size: $font-size-xs; }
.statusPill { display: inline-flex; align-items: center; padding: 2px $spacing-3;
              border-radius: $border-radius-full; font-size: $font-size-xs;
              font-weight: $font-weight-semibold; }
.actions    { display: flex; gap: $spacing-2; }
.stockLow   { background: $warning-bg; color: $warning-color; border-radius: $border-radius-full;
              padding: 2px $spacing-3; font-size: $font-size-xs; font-weight: $font-weight-semibold; }
.stockOut   { background: $error-bg; color: $error-color; border-radius: $border-radius-full;
              padding: 2px $spacing-3; font-size: $font-size-xs; font-weight: $font-weight-semibold; }
```

### F1-11 — AdminVariantTypesPage.module.scss
Clases: `page`, `breadcrumb`, `bcCurrent`, `header`, `headerActions`, `lead`, `empty`, `iconBtn`, `iconBtnDelete`, `inlineForm`, `inlineInput`, `addOption`, `modalBackdrop`, `modal`, `modalTitle`, `modalActions`
```scss
@use '@styles/abstracts' as *;
.page          { padding: $spacing-8 $spacing-6; max-width: 1200px; margin: 0 auto; }
.breadcrumb    { display: flex; align-items: center; gap: $spacing-2;
                 font-size: $font-size-sm; color: $text-muted; margin-bottom: $spacing-4;
                 a { color: $text-muted; text-decoration: none;
                     &:hover { color: $text-primary; } } }
.bcCurrent     { color: $text-secondary; }
.header        { display: flex; justify-content: space-between; align-items: center;
                 margin-bottom: $spacing-4; }
.headerActions { display: flex; gap: $spacing-3; }
.lead          { font-size: $font-size-sm; color: $text-muted; margin-bottom: $spacing-8; }
.empty         { text-align: center; padding: $spacing-12; color: $text-muted; }
.iconBtn       { background: none; border: 1px solid $border-color; border-radius: $border-radius-sm;
                 padding: $spacing-1 $spacing-2; cursor: pointer; color: $text-muted;
                 transition: $transition-default;
                 &:hover { color: $primary-color; border-color: $primary-color; } }
.iconBtnDelete { @extend .iconBtn;
                 &:hover { color: $error-color; border-color: $error-color; } }
.inlineForm    { display: flex; gap: $spacing-2; align-items: center; margin-top: $spacing-3; }
.inlineInput   { flex: 1; background: $bg-elevated; border: 1px solid $border-color;
                 border-radius: $border-radius-sm; padding: $spacing-2 $spacing-3;
                 color: $text-primary; font-size: $font-size-sm;
                 &:focus { outline: none; border-color: $primary-color; } }
.addOption     { font-size: $font-size-sm; color: $text-link; cursor: pointer;
                 background: none; border: none; padding: 0; margin-top: $spacing-2;
                 &:hover { color: $primary-light; } }
// Modal nativo — ahora reemplazado por el componente Modal de ui-core
.modalBackdrop { position: fixed; inset: 0; background: $bg-overlay;
                 z-index: $z-modal-backdrop; display: grid; place-items: center; }
.modal         { background: $bg-surface; border-radius: $border-radius-xl;
                 padding: $spacing-8; min-width: 480px; box-shadow: $shadow-modal; }
.modalTitle    { font-size: $font-size-lg; font-weight: $font-weight-semibold;
                 color: $text-primary; margin-bottom: $spacing-6; }
.modalActions  { display: flex; justify-content: flex-end; gap: $spacing-3; margin-top: $spacing-8; }
```

---

## FASE 2 — PÁGINAS HUÉRFANAS: REGISTRAR EN ROUTER + MEJORAR IMPLEMENTACIÓN

### F2-01 — AdminVoucherDetailPage
**Ruta a registrar**: `/admin/vouchers/:id`  
**Calidad actual**: COMPLETA — 169L, bien estructurada  
**Mejoras con ui-core**:
```jsx
// Reemplazar el <button type="submit"> por:
<LoadingButton loading={isActioning} variant="primary" type="submit">
  Guardar cambios
</LoadingButton>

// Reemplazar el mensaje de éxito/error por:
{actionError && <Alert variant="danger" dismissible>{actionError}</Alert>}
{saved && <Alert variant="success" timeout={3000}>Voucher actualizado</Alert>}

// Reemplazar el DatePicker nativo por:
<DatePicker
  label="Válido desde"
  value={form.valid_from}
  onChange={(d) => setForm(f => ({ ...f, valid_from: d }))}
  format="YYYY-MM-DD"
/>
<DatePicker
  label="Válido hasta"
  value={form.valid_until}
  onChange={(d) => setForm(f => ({ ...f, valid_until: d }))}
  format="YYYY-MM-DD"
/>
```
**MSW requerido**: GET /api/v1/admin/vouchers/:id/ → agregar a admin.ts  
**Router**: `<Route path="admin/vouchers/:id" element={<AdminVoucherDetailPage />} />`

---

### F2-02 — AdminProductDetailPage
**Ruta a registrar**: `/admin/products/:id`  
**Calidad actual**: COMPLETA — 226L  
**Mejoras con ui-core**:
```jsx
// Galería de imágenes: reemplazar la galería manual por Carousel
<Carousel interval={0} keyboard ride={false}>
  {images.map((img) => (
    <CarouselSlide key={img.id}>
      <img src={img.url} alt={img.alt} />
    </CarouselSlide>
  ))}
</Carousel>

// Tabs de secciones del producto:
<Tabs defaultTab="info">
  <TabList>
    <Tab id="info">Información</Tab>
    <Tab id="variants">Variantes</Tab>
    <Tab id="images">Imágenes</Tab>
    <Tab id="metrics">Métricas</Tab>
  </TabList>
  <TabPanel id="info">...</TabPanel>
  <TabPanel id="variants">...</TabPanel>
  <TabPanel id="images">...</TabPanel>
  <TabPanel id="metrics">...</TabPanel>
</Tabs>

// Confirmación de borrado:
<Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
  centered backdrop="static" size="sm">
  <p>¿Eliminar este producto? Esta acción no se puede deshacer.</p>
  <LoadingButton variant="danger" loading={isActioning}
    onClick={handleDelete}>Eliminar</LoadingButton>
</Modal>
```
**Router**: `<Route path="admin/products/:id" element={<AdminProductDetailPage />} />`

---

### F2-03 — AdminProductImportPage
**Ruta a registrar**: `/admin/products/import`  
**PROBLEMA**: debe ir ANTES de `/admin/products/:id` en el router para no ser capturado como param  
**Calidad actual**: PARCIAL — 277L, tiene Stepper nativo pero no usa el componente ui-core  
**Mejora principal — reemplazar el flujo de 3 pasos por Stepper ui-core**:
```jsx
import { Stepper, StepPanel, Alert, LoadingButton } from '@components/common';

// En el componente:
<Stepper linear onFinish={handleFinish}>
  <StepPanel title="Subir archivo" description="Sube el CSV con los productos">
    {/* Zona de drop */}
    {importError && <Alert variant="danger">{importError}</Alert>}
    <LoadingButton loading={isUploading} onClick={handleUpload} variant="primary">
      Cargar archivo
    </LoadingButton>
  </StepPanel>
  
  <StepPanel title="Previsualizar" description="Revisa los datos antes de importar">
    {/* Tabla de preview */}
    {previewErrors.length > 0 && (
      <Alert variant="warning" dismissible>
        {previewErrors.length} filas con errores
      </Alert>
    )}
  </StepPanel>
  
  <StepPanel title="Confirmar" description="Aplicar la importación">
    <Alert variant="info">
      Se importarán {preview.valid_count} productos nuevos
      y se actualizarán {preview.update_count} existentes.
    </Alert>
    <LoadingButton loading={isImporting} onClick={handleConfirm} variant="primary">
      Confirmar importación
    </LoadingButton>
  </StepPanel>
</Stepper>
```
**Router**: `<Route path="admin/products/import" element={<AdminProductImportPage />} />` (antes de `:id`)

---

### F2-04 — AdminVariantTypesPage
**Ruta a registrar**: `/admin/products/:id/variant-types`  
**Calidad actual**: PARCIAL — 234L, tiene modal nativo (`modalBackdrop`) que debe reemplazarse  
**Mejora — reemplazar modal nativo por Modal ui-core**:
```jsx
import { Modal, LoadingButton, Alert } from '@components/common';

// En lugar del div.modalBackdrop:
<Modal open={modalOpen} onClose={() => setModalOpen(false)}
  centered backdrop="static" size="sm">
  <h3>Nuevo tipo de variante</h3>
  <form onSubmit={handleSaveType}>
    <Field label="Nombre" value={typeLabel} onChange={e => setTypeLabel(e.target.value)}
      required placeholder="ej: Talla, Color, Material" />
    <Field label="Sub-etiqueta (opcional)" value={subLabel}
      onChange={e => setSubLabel(e.target.value)} />
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
      <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
      <LoadingButton loading={isSaving} type="submit" variant="primary">
        Guardar
      </LoadingButton>
    </div>
  </form>
</Modal>
```
**Router**: `<Route path="admin/products/:id/variant-types" element={<AdminVariantTypesPage />} />`

---

### F2-05 — AdminProductVariantsPage
**Ruta a registrar**: `/admin/products/:id/variants/matrix`  
**Conflicto**: AdminVariantsPage ya usa `/admin/products/:productId/variants`  
**Decisión**: AdminProductVariantsPage es la tabla de combinaciones (bulk edit), AdminVariantsPage es la gestión individual  
**Calidad actual**: PARCIAL — 207L, sin SCSS Module  
**Mejoras con ui-core**:
```jsx
import { Chip, Alert, LoadingButton } from '@components/common';

// Bulk bar con Chip para variante activa/inactiva:
<Chip selectable onSelect={() => setBulkActive(true)} onDeselect={() => setBulkActive(false)}>
  Activo
</Chip>

// Alert de éxito tras bulk update:
{bulkSuccess && <Alert variant="success" timeout={3000}>Variantes actualizadas</Alert>}
<LoadingButton loading={isBulkSaving} onClick={handleBulkSave} variant="primary">
  Guardar cambios ({selected.length} seleccionadas)
</LoadingButton>
```
**Router**: `<Route path="admin/products/:id/variants/matrix" element={<AdminProductVariantsPage />} />`

---

### F2-06 — AdminStaticPagesPage
**Ruta a registrar**: `/admin/pages`  
**Calidad actual**: PARCIAL — 79L, muy corta, solo muestra lista  
**Mejoras con ui-core**:
```jsx
import { MetaTag, Chip, Alert } from '@components/common';

// Estado de publicación con MetaTag:
<MetaTag tone={page.is_published ? 'lime' : 'bronze'}>
  {page.is_published ? 'Publicada' : 'Borrador'}
</MetaTag>

// Filtro de estado con Chip:
<Chip selectable onSelect={() => setFilter('published')}>Publicadas</Chip>
<Chip selectable onSelect={() => setFilter('draft')}>Borradores</Chip>

// Error de carga:
{error && <Alert variant="danger">No se pudieron cargar las páginas</Alert>}
```
**MSW requerido**: GET /api/v1/admin/pages/ → agregar a admin.ts  
**Router**: `<Route path="admin/pages" element={<AdminStaticPagesPage />} />`

---

### F2-07 — AdminStaticPageEditorPage
**Ruta a registrar**: `/admin/pages/:slug/edit`  
**Calidad actual**: PARCIAL — 163L, tiene tabs de secciones pero usa divs manuales  
**Mejoras con ui-core**:
```jsx
import { Tabs, TabList, Tab, TabPanel, LoadingButton, Alert } from '@components/common';

// Las secciones del editor (contenido, meta SEO, historial) como Tabs:
<Tabs defaultTab="content">
  <TabList>
    <Tab id="content">Contenido</Tab>
    <Tab id="meta">Meta SEO</Tab>
    <Tab id="history">Historial</Tab>
  </TabList>
  <TabPanel id="content">
    {/* Editor de contenido HTML */}
    <Field label="Título" value={form.title} onChange={...} required />
    <Field label="Slug" value={form.slug} onChange={...} />
    <label>Contenido (HTML)</label>
    <textarea className={styles.contentArea} value={form.content} onChange={...} />
  </TabPanel>
  <TabPanel id="meta">
    <Field label="Meta título" value={form.meta_title} onChange={...} />
    <Field label="Meta descripción" value={form.meta_description} onChange={...} />
  </TabPanel>
  <TabPanel id="history">
    {/* Lista de versiones anteriores */}
  </TabPanel>
</Tabs>

{saveError && <Alert variant="danger" dismissible>{saveError}</Alert>}
{saved && <Alert variant="success" timeout={3000}>Página guardada</Alert>}
<LoadingButton loading={isSaving} variant="primary" onClick={handleSaveDraft}>
  Guardar borrador
</LoadingButton>
<LoadingButton loading={isPublishing} variant="success" onClick={handlePublish}>
  Publicar
</LoadingButton>
```
**MSW requerido**: GET /api/v1/admin/pages/:slug/, PATCH /api/v1/admin/pages/:slug/  
**Router**: `<Route path="admin/pages/:slug/edit" element={<AdminStaticPageEditorPage />} />`

---

### F2-08 — AdminGatewaysPage
**Ruta a registrar**: `/admin/config/gateways`  
**Calidad actual**: PARCIAL — 162L, tiene modal nativo + placeholder  
**Mejoras con ui-core**:
```jsx
import { Modal, Field, LoadingButton, Alert, Tooltip } from '@components/common';

// Reemplazar modal nativo:
<Modal open={editOpen} onClose={() => setEditOpen(false)}
  centered size="lg" backdrop="static">
  <h3>Configurar {editingGateway?.name}</h3>
  <Field label="API Key" value={form.api_key} onChange={...}
    type="password" />
  <Field label="Secret" value={form.secret} onChange={...}
    type="password" />
  {testResult && (
    <Alert variant={testResult.ok ? 'success' : 'danger'}>
      {testResult.message}
    </Alert>
  )}
  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
    <LoadingButton loading={isTesting} variant="secondary"
      onClick={handleTest}>
      Probar conexión
    </LoadingButton>
    <LoadingButton loading={isSaving} variant="primary"
      onClick={handleSave}>
      Guardar
    </LoadingButton>
  </div>
</Modal>

// Tooltip en campos de API key:
<Tooltip content="Nunca compartas este valor. Se muestra enmascarado."
  placement="right">
  <span>ⓘ</span>
</Tooltip>
```
**MSW requerido**: GET /api/v1/admin/config/gateways/ → agregar a admin.ts  
**Router**: `<Route path="admin/config/gateways" element={<AdminGatewaysPage />} />`

---

### F2-09 — AdminShippingMethodsPage
**Ruta a registrar**: `/admin/config/shipping`  
**Calidad actual**: PARCIAL — 144L, tiene modal nativo, sin SCSS Module  
**Mejoras con ui-core**:
```jsx
import { Modal, Field, LoadingButton, Alert } from '@components/common';

// Modal de crear/editar método:
<Modal open={formOpen} onClose={() => setFormOpen(false)}
  centered backdrop="static">
  <h3>{editing ? 'Editar' : 'Nuevo'} método de envío</h3>
  <Field label="Nombre" value={form.name} onChange={...} required />
  <Field label="Carrier" value={form.carrier} onChange={...} />
  <Field label="Costo base (MXN)" value={form.price} onChange={...} type="number" />
  <Field label="Umbral de envío gratis" value={form.free_threshold} onChange={...} type="number" />
  <Field label="Días mínimos" value={form.min_days} onChange={...} type="number" />
  <Field label="Días máximos" value={form.max_days} onChange={...} type="number" />
  <LoadingButton loading={isSaving} variant="primary" onClick={handleSave}>
    {editing ? 'Actualizar' : 'Crear'}
  </LoadingButton>
</Modal>

// Modal de confirmación de borrado:
<Modal open={deleteConfirm} onClose={() => setDeleteConfirm(null)}
  centered size="sm" backdrop="static">
  <Alert variant="warning">
    ¿Eliminar el método "{deleteConfirm?.name}"?
    Los pedidos existentes no se verán afectados.
  </Alert>
  <LoadingButton loading={isDeleting} variant="danger"
    onClick={() => handleDelete(deleteConfirm.id)}>
    Eliminar
  </LoadingButton>
</Modal>
```
**Router**: `<Route path="admin/config/shipping" element={<AdminShippingMethodsPage />} />`

---

### F2-10 — AdminSiteSettingsPage
**Ruta a registrar**: `/admin/config/site`  
**Calidad actual**: PARCIAL — 143L, sin loading ni error state  
**Mejoras con ui-core**:
```jsx
import { Field, LoadingButton, Alert, Collapse } from '@components/common';

// Secciones colapsables para organizar la configuración:
<Collapse>
  <button>Información comercial</button>
  <div>
    <Field label="Nombre del sitio" value={form.site_name} onChange={...} required />
    <Field label="Email de contacto" value={form.site_email} onChange={...} type="email" />
  </div>
</Collapse>

<Collapse>
  <button>Moneda e impuestos</button>
  <div>
    <Field label="Moneda" value={form.currency} onChange={...} />
    <Field label="Tasa de impuesto (%)" value={form.tax_rate} onChange={...} type="number" />
    <Field label="Umbral de envío gratis (MXN)" value={form.free_shipping_threshold}
      onChange={...} type="number" />
  </div>
</Collapse>

{saveError && <Alert variant="danger" dismissible>{saveError}</Alert>}
{saved && <Alert variant="success" timeout={3000}>Configuración guardada</Alert>}
<LoadingButton loading={isSaving} variant="primary" onClick={handleSave}>
  Guardar configuración
</LoadingButton>
```
**Router**: `<Route path="admin/config/site" element={<AdminSiteSettingsPage />} />`

---

### F2-11 — AdminInventoryDashboardPage
**Ruta a registrar**: `/admin/inventory/dashboard`  
**Calidad actual**: PARCIAL — 115L, sin loading ni error  
**Mejoras con ui-core**:
```jsx
import { Alert, MetaTag } from '@components/common';

// KPIs con color según severidad:
// stock bajo (warning), agotado (danger), normal (lime)
{dashboard.out_of_stock_count > 0 && (
  <Alert variant="warning" icon="⚠">
    {dashboard.out_of_stock_count} SKUs agotados — revisar reabastecimiento
  </Alert>
)}

// MetaTag para estado de cada movimiento:
<MetaTag tone={delta > 0 ? 'lime' : 'coral'}>
  {delta > 0 ? `+${delta}` : delta}
</MetaTag>
```
**MSW requerido**: GET /api/v1/admin/inventory/dashboard/  
**Router**: `<Route path="admin/inventory/dashboard" element={<AdminInventoryDashboardPage />} />`

---

### F2-12 — AdminStockAlertsPage
**Ruta a registrar**: `/admin/inventory/stock-alerts`  
**Calidad actual**: PARCIAL — 96L, sin SCSS Module  
**Mejoras con ui-core**:
```jsx
import { Alert, Chip, Tooltip } from '@components/common';

// Filtro de severidad con Chips:
<Chip selectable onSelect={() => setFilter('out')}>Agotado</Chip>
<Chip selectable onSelect={() => setFilter('low')}>Stock bajo</Chip>
<Chip selectable onSelect={() => setFilter('all')}>Todos</Chip>

// Tooltip en el umbral de alerta:
<Tooltip content={`Umbral configurado: ${alert.threshold} unidades`}>
  <span className={styles.stockLow}>{alert.stock}</span>
</Tooltip>

// Alert de resumen al inicio:
<Alert variant="warning">
  {alerts.filter(a => a.stock === 0).length} SKUs agotados ·
  {alerts.filter(a => a.stock > 0).length} con stock bajo
</Alert>
```
**MSW requerido**: GET /api/v1/admin/inventory/stock-alerts/  
**Router**: `<Route path="admin/inventory/stock-alerts" element={<AdminStockAlertsPage />} />`

---

## FASE 3 — HABILITAR AdminConfigPage

### F3-01 — Quitar aria-disabled de las tarjetas de config
Cuando se registren las rutas de F2-08, F2-09, F2-10, editar AdminConfigPage:
```jsx
// Antes (tarjeta deshabilitada):
<div className={`${styles.card} ${styles.disabled}`} aria-disabled="true">

// Después (tarjeta activa con enlace):
<Link to="/admin/config/gateways" className={styles.card}>
```
Las 3 tarjetas corresponden a Gateways, Envío y Configuración del sitio.

---

## FASE 4 — CORREGIR LOADING INFINITO EN RECURSOS NO ENCONTRADOS

### F4-01 — ProductPage
```jsx
if (isLoading) return <div className={styles.loading}>Cargando producto…</div>;
if (!product)  return <Navigate to="/404" replace />;
```

### F4-02 — OrderSuccessPage
```jsx
if (isLoading) return <div className={styles.loading}>Cargando confirmación…</div>;
if (!order)    return <Navigate to="/" replace />;
```

### F4-03 — OrderDetailPage
```jsx
if (isLoading) return <div className={styles.loading}>Cargando pedido…</div>;
if (!order)    return <Navigate to="/account/orders" replace />;
```

---

## FASE 5 — MSW HANDLERS FALTANTES

### F5-01 — addresses CRUD completo (storefront.ts)
```typescript
http.patch('/api/v1/auth/addresses/:id/', async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: params.id, ...body });
}),
http.delete('/api/v1/auth/addresses/:id/', ({ params }) => {
  return HttpResponse.json({ id: params.id, deleted: true });
}),
```

### F5-02 — admin/products/:id (admin.ts)
```typescript
http.get('/api/v1/admin/products/:id/', ({ params }) => {
  const p = ADMIN_PRODUCTS.find(p => String(p.id) === params.id);
  if (!p) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 });
  return HttpResponse.json({ ...p, images: [], variants: [] });
}),
http.patch('/api/v1/admin/products/:id/', async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: Number(params.id), ...body });
}),
```

### F5-03 — payments/gateways (payments.ts)
```typescript
http.get('/api/v1/payments/gateways/', () =>
  HttpResponse.json({
    results: [
      { id: 'mercadopago', name: 'MercadoPago', logo: '/mp-logo.png', active: true },
      { id: 'paypal', name: 'PayPal', logo: '/pp-logo.png', active: true },
    ]
  })
),
```

### F5-04 — admin/pages CMS (admin.ts)
```typescript
const MOCK_PAGES = [
  { slug: 'about', title: 'Acerca de', is_published: true, content: '<p>...</p>' },
  { slug: 'privacy', title: 'Privacidad', is_published: true, content: '<p>...</p>' },
];
http.get('/api/v1/admin/pages/', () =>
  HttpResponse.json({ results: MOCK_PAGES, count: MOCK_PAGES.length })
),
http.get('/api/v1/admin/pages/:slug/', ({ params }) => {
  const p = MOCK_PAGES.find(p => p.slug === params.slug);
  if (!p) return HttpResponse.json({ detail: 'No encontrada' }, { status: 404 });
  return HttpResponse.json(p);
}),
http.patch('/api/v1/admin/pages/:slug/', async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ slug: params.slug, ...body });
}),
```

### F5-05 — inventory/dashboard y stock-alerts (inventory.ts)
```typescript
http.get('/api/v1/admin/inventory/dashboard/', () =>
  HttpResponse.json({
    total_skus: 48, low_stock_count: 7, out_of_stock_count: 2,
    recent_movements: [
      { id: 1, sku: 'ELE-001', delta: -3, reason: 'Venta', created_at: new Date().toISOString() },
    ]
  })
),
http.get('/api/v1/admin/inventory/stock-alerts/', () =>
  HttpResponse.json({
    results: [
      { product_id: 1, variant_id: null, sku: 'OTA-001', name: 'Otán de Oshún', stock: 1, threshold: 5 },
      { product_id: 2, variant_id: 3, sku: 'ELE-007', name: 'Eleke 7 cuentas', stock: 0, threshold: 3 },
    ]
  })
),
```

### F5-06 — admin/vouchers/:id (admin.ts)
```typescript
http.get('/api/v1/admin/vouchers/:id/', ({ params }) => {
  return HttpResponse.json({
    id: Number(params.id), code: 'OSHUN20', discount_type: 'percentage',
    discount_value: 20, min_order_amount: 500, max_uses: 100, uses_count: 12,
    is_active: true, valid_from: '2026-01-01', valid_until: '2026-12-31',
  });
}),
http.post('/api/v1/admin/vouchers/', async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: 99, ...body }, { status: 201 });
}),
http.patch('/api/v1/admin/vouchers/:id/', async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: Number(params.id), ...body });
}),
http.delete('/api/v1/admin/vouchers/:id/', ({ params }) =>
  HttpResponse.json({ id: params.id, deleted: true })
),
```

### F5-07 — admin/config/gateways (admin.ts)
```typescript
http.get('/api/v1/admin/config/gateways/', () =>
  HttpResponse.json({
    results: [
      { id: 'mercadopago', name: 'MercadoPago', is_active: true,
        test_mode: true, has_credentials: true },
      { id: 'paypal', name: 'PayPal', is_active: false,
        test_mode: true, has_credentials: false },
    ]
  })
),
http.patch('/api/v1/admin/config/gateways/:id/', async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: params.id, ...body });
}),
http.post('/api/v1/admin/config/gateways/:id/test/', ({ params }) =>
  HttpResponse.json({ ok: true, message: 'Conexión exitosa con sandbox' })
),
```

---

## FASE 6 — MEJORAS DE UX EN PÁGINAS PARCIALES EXISTENTES

### F6-01 — CartPage: Alert de error + LoadingButton en checkout
```jsx
import { Alert, LoadingButton } from '@components/common';

{cartError && <Alert variant="danger" dismissible onClose={clearError}>{cartError}</Alert>}
{items.length === 0 && (
  <div className={styles.empty}>
    <p>Tu bolsa está vacía</p>
    <Link to="/catalog">Explorar el catálogo →</Link>
  </div>
)}
<LoadingButton loading={isCheckingOut} variant="primary" onClick={handleCheckout}>
  Ir al pago
</LoadingButton>
```

### F6-02 — CheckoutPage: Alert de error cuando createOrder falla
```jsx
{orderError && (
  <Alert variant="danger" dismissible onClose={clearError}>
    {orderError || 'No se pudo procesar el pedido. Inténtalo de nuevo.'}
  </Alert>
)}
```

### F6-03 — AddressesPage: LoadingButton en formulario de dirección
```jsx
<LoadingButton loading={isActioning} type="submit" variant="primary">
  {editing ? 'Actualizar dirección' : 'Agregar dirección'}
</LoadingButton>
```
También agregar MSW handlers DELETE y PATCH de /api/v1/auth/addresses/:id/

### F6-04 — RegisterPage: integrar usePasswordStrength
```jsx
import { usePasswordStrength } from '@hooks/utils/usePasswordStrength';
// ...
const { score, label } = usePasswordStrength(form.password);
// Mostrar barra de fuerza bajo el campo de contraseña
<div className={styles.strengthBar}>
  <div className={styles.strengthFill} style={{ width: `${score * 25}%` }} />
</div>
<span className={styles.strengthLabel}>{label}</span>
```

### F6-05 — AccountPage: cargar datos reales de resumen
```jsx
// Agregar al useEffect de AccountPage:
useEffect(() => {
  dispatch(fetchOrders({ limit: 3 }));
  dispatch(fetchWishlist());
}, [dispatch]);

// En el JSX:
<div className={styles.stat}>
  <span className={styles.statN}>{orders.length}</span>
  <span className={styles.statLabel}>Pedidos</span>
</div>
<div className={styles.stat}>
  <span className={styles.statN}>{wishlist.length}</span>
  <span className={styles.statLabel}>En deseos</span>
</div>
```

---

## FASE 7 — VERIFICACIÓN DE FLUJOS EN BROWSER

| ID | Flujo | Pasos exactos | Credenciales |
|----|-------|--------------|--------------|
| F-01 | Compra completa (invitado) | `/` → Entrar al catálogo → producto → Agregar al carrito → `/cart` → `/checkout` | ninguna |
| F-02 | Login comprador | `/auth/login` → email: `comprador@test.mx` pass: `Test1234!` → debe ir a `/account` | — |
| F-03 | Login admin | `/auth/login` → email: `admin@e-comerce.example.com` pass: `Admin1234!` → debe ir a `/admin` | — |
| F-04 | Rutas protegidas | Ir a `/account` sin sesión → debe redirigir a `/auth/login` | ninguna |
| F-05 | Admin sin permisos | Login comprador → ir a `/admin` → debe redirigir a `/` | comprador |
| F-06 | 404 de ruta | Ir a `/ruta-que-no-existe` → debe cargar `/404` | ninguna |
| F-07 | 404 de recurso | Ir a `/catalog/slug-inventado-xyz` → debe cargar `/404` | ninguna |
| F-08 | Categoría por URL | Click en "Akoses & Medicinas" en nav → `/catalog?category=akoses-medicinas` muestra productos filtrados | ninguna |
| F-09 | Búsqueda global | Click en SearchBar del Header → escribir "eleke" → navega a `/search?q=eleke` | ninguna |
| F-10 | Vouchers admin | Login admin → `/admin/vouchers` → click en un voucher → abre `/admin/vouchers/:id` | admin |
| F-11 | Config admin | Login admin → `/admin/config` → tarjeta Gateways → abre `/admin/config/gateways` | admin |
| F-12 | Importar productos | Login admin → `/admin/products/import` → Stepper de 3 pasos completo | admin |
| F-13 | CMS de páginas | Login admin → `/admin/pages` → click editar → `/admin/pages/about/edit` | admin |
| F-14 | Inventario dashboard | Login admin → `/admin/inventory/dashboard` → KPIs cargan | admin |
| F-15 | Stock alerts | Login admin → `/admin/inventory/stock-alerts` → tabla de alertas | admin |

---

## RESUMEN EJECUTIVO DEL PLAN

| Fase | Trabajo | Archivos | Prioridad |
|------|---------|----------|-----------|
| F1 — SCSS Modules | Crear 11 archivos SCSS | 11 nuevos | BLOQUEANTE |
| F2 — Rutas huérfanas | Registrar + mejorar 12 páginas | AppRouter + 12 JSX | ALTA |
| F3 — AdminConfigPage | Habilitar 3 tarjetas | 1 JSX | ALTA (depende de F2) |
| F4 — Loading infinito | Fix en 3 páginas | 3 JSX | ALTA |
| F5 — MSW handlers | Agregar 7 grupos | 3 .ts | MEDIA |
| F6 — Mejoras UX | 5 mejoras en páginas existentes | 5 JSX | MEDIA |
| F7 — Verificación | 15 flujos en browser | — | CONTINUA |

**Total de archivos a modificar o crear**: ~50  
**Orden de ejecución recomendado**: F1 → F4 → F5 → F2 → F3 → F6 → F7
