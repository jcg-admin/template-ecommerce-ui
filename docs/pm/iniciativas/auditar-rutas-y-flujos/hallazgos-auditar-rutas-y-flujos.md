# Hallazgos — auditar-rutas-y-flujos

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-rutas-y-flujos |
| Fase documentada | Fase 1 — SCSS Modules |
| Fecha | 2026-05-28 |
| Commits | 9251a4f, eccdd4b |
| Estado SCSS | 146 entries, 0 issues |
| Estado tests | 1331 pasando, 0 fallos |

---

## METODOLOGÍA DE AUDITORÍA

Antes de corregir cualquier cosa, se ejecutaron tres pasos en orden:

1. **Leer los imports** — qué archivo `.module.scss` importa cada JSX
   (result: los JSX no importaban archivos propios sino compartidos)
2. **Cruzar clases JSX vs selectores SCSS** — cada `styles.X` del JSX
   tiene un selector `.X` definido en el SCSS
3. **Verificar la forma del selector** — distinguir entre bloque propio
   `.clase { }` vs selector combinado `.clase .descendiente { }`,
   ya que CSS Modules necesita que la clase aparezca como selector
   (de cualquier forma) para generar el hash

Este proceso descubrió que el hallazgo inicial HALLAZGO-SCSS-01
sobreestimó el problema en un factor de 11x.

---

## HALLAZGO-FASE1-01 — 11 páginas importaban SCSS compartidos, no propios (DIAGNÓSTICO CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-01 |
| Fecha | 2026-05-28 |
| Severidad | Media |
| Estado | DOCUMENTADO — cambia el alcance del trabajo |

**Descripción:**
El hallazgo HALLAZGO-SCSS-01 (de la auditoría previa) decía que 11 páginas
importaban un `.module.scss` que no existía en disco. Al leer los imports
reales de cada JSX, se descubrió que importaban **5 archivos SCSS compartidos**
con nombres distintos al de la página:

| JSX que importa | Archivo SCSS que importa | Existe |
|----------------|--------------------------|--------|
| AdminProductEditPage | `./AdminProductCreatePage.module.scss` | SÍ (20L) |
| AdminProductImportPage | `./AdminBulkPage.module.scss` | SÍ (186L) |
| AdminProductVariantsPage | `./AdminVariantsPage.module.scss` | SÍ (158L) |
| AdminVariantTypesPage | `./AdminVariantsPage.module.scss` | SÍ (158L) |
| AdminReportDashboardPage | `./AdminReportPage.module.scss` | SÍ (109L) |
| AdminReportSalesPage | `./AdminReportPage.module.scss` | SÍ (109L) |
| AdminReportTopSellersPage | `./AdminReportPage.module.scss` | SÍ (109L) |
| AdminReportCustomersRfmPage | `./AdminReportPage.module.scss` | SÍ (109L) |
| AdminShippingMethodsPage | `./AdminTablePage.module.scss` | SÍ (156L) |
| AdminStaticPagesPage | `./AdminTablePage.module.scss` | SÍ (156L) |
| AdminStockAlertsPage | `./AdminTablePage.module.scss` | SÍ (156L) |

**Lección:** Antes de asumir que un archivo falta, leer el import exacto del JSX.

---

## HALLAZGO-FASE1-02 — Clases faltantes en SCSS compartidos de páginas admin (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-02 |
| Fecha | 2026-05-28 |
| Severidad | Media (elementos sin estilo, no crash) |
| Estado | CORREGIDO — commit 9251a4f |

**Descripción:**
Tras cruzar las clases usadas en los JSX con las definidas en los SCSS compartidos,
se encontraron 3 clases faltantes en 2 archivos:

| Archivo | Clase faltante | Causa |
|---------|----------------|-------|
| `AdminTablePage.module.scss` | `.actionDelete` | La clase no existía en absoluto |
| `AdminVariantsPage.module.scss` | `.iconBtnDelete` | Existía solo como `.iconBtnDelete:hover` (pseudo-selector), no como bloque propio `.iconBtnDelete { }` |
| `AdminVariantsPage.module.scss` | `.smallBtnDelete` | Mismo caso que `.iconBtnDelete` |

**Causa raíz de `.iconBtnDelete` y `.smallBtnDelete`:**
En CSS Modules, el selector `.iconBtnDelete:hover { }` como selector de nivel raíz
SÍ genera un hash — pero cuando el JSX hace `className={styles.iconBtnDelete}`,
CSS Modules busca el bloque `.iconBtnDelete { }` como clase propia. El pseudo-selector
raíz sin bloque propio no genera el hash exportable como `styles.iconBtnDelete`.
La corrección es convertir `.Cls:hover { }` a `.Cls { &:hover { } }`.

**Corrección aplicada:**
```scss
// Antes (no genera styles.iconBtnDelete exportable)
.iconBtnDelete:hover { border-color: $vino-soft; color: $vino-soft; }

// Después (genera styles.iconBtnDelete como clase propia)
.iconBtnDelete {
  &:hover { border-color: $vino-soft; color: $vino-soft; }
}
```

---

## HALLAZGO-FASE1-03 — Variable $bg-dark inexistente en RangeSlider.module.scss (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-03 |
| Fecha | 2026-05-28 |
| Severidad | Alta (SyntaxError de SCSS — check-scss fallaba) |
| Estado | CORREGIDO — commit 9251a4f |

**Descripción:**
`RangeSlider.module.scss` (agregado en la sesión anterior) usaba `$bg-dark`
en el estilo del tooltip. Esta variable no existe en el sistema de diseño del proyecto.

**Variables de fondo disponibles en el sistema:**
```scss
$bg-page:     #0E1400  // Fondo principal (más oscuro)
$bg-surface:  #161D04  // Panel sobre fondo
$bg-sunken:   #0A1004  // Zona hundida
$bg-elevated: #1F2808  // Zona elevada
$bg-overlay:  rgba(10, 16, 4, 0.78)
```

**Corrección:** `color: $bg-dark` → `color: $bg-page`

El tooltip del RangeSlider tiene fondo `$text-primary` (#F5F7EE, off-white)
y texto `$bg-page` (#0E1400, verde muy oscuro) — contraste correcto para tema oscuro.

**Lección:** Al crear SCSS nuevos en el bash_tool, verificar cada variable contra
`src/styles/abstracts/_variables.scss` antes de guardar.

---

## HALLAZGO-FASE1-04 — Clase .labelClickable faltante en RangeSlider (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-04 |
| Fecha | 2026-05-28 |
| Severidad | Baja (label clickable sin cursor:pointer) |
| Estado | CORREGIDO — commit eccdd4b |

**Descripción:**
`RangeSlider.jsx` usa `styles.labelClickable` para los labels debajo del track
cuando `clickableLabels=true`. El SCSS no tenía esta clase definida.

**Uso en JSX:**
```jsx
<span className={`${styles.label} ${clickableLabels ? styles.labelClickable : ''}`}>
```

**Corrección:**
```scss
.labelClickable {
  cursor: pointer;
  &:hover { color: $primary-color; }
}
```

---

## HALLAZGO-FASE1-05 — 30 clases faltantes en 8 módulos de componentes ui-core (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-05 |
| Fecha | 2026-05-28 |
| Severidad | Media (componentes funcionales pero con elementos sin estilo visual) |
| Estado | CORREGIDO — commit eccdd4b |

**Descripción:**
Al auditar todos los componentes ui-core (no solo los de las páginas faltantes),
se encontraron 30 clases usadas en JSX sin definición en el SCSS correspondiente.
Ninguna causa crash de build (webpack no falla por clase CSS ausente en modules),
pero sí causan que `styles.X` devuelva un hash de clase vacío → elemento sin estilo.

**Tabla completa de clases faltantes por componente:**

### primitives.module.scss (+6 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.btnLoading` | Aplicado al botón cuando `loading=true` | `position: relative; cursor: wait` |
| `.btnSpinner` | Spinner animado dentro del botón | Círculo giratorio con `border-top-color: currentColor` |
| `.btnChildrenLoading` | Wrapper del texto cuando hay spinner | `opacity: 0.5` para atenuar el texto |
| `.fieldInputWrapper` | Div que envuelve el input + toggle | `position: relative; display: flex; align-items: center` |
| `.fieldHasToggle` | Modificador cuando hay passwordToggle | `padding-right: 44px` en el input interno |
| `.fieldPasswordToggle` | Botón ojo para mostrar/ocultar contraseña | Posición absoluta a la derecha del input |

**Impacto pre-corrección:** El botón de "Ingresar" en LoginPage y cualquier
`LoadingButton` en el proyecto no mostraban el spinner de carga visible.
Los campos de contraseña con toggle no tenían el ojo posicionado correctamente.

### Collapse.module.scss (+3 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.trigger` | Botón programático (alternativa a `<summary>`) | Flex between, fondo surface, cursor pointer |
| `.horizontal` | Modo de colapso horizontal | `overflow: hidden` para el contenido |
| `.content` | Wrapper del contenido colapsable | `overflow: hidden` |

### Tabs.module.scss (+2 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.tabDisabled` | Tab individual deshabilitado | `opacity: 0.45; cursor: not-allowed; pointer-events: none` |
| `.vertical` | Tabs en orientación vertical | Flex row, tabList en columna con border-right |

### Dropdown.module.scss (+2 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.header` | Componente `DropdownHeader` | Texto mono uppercase como separador de sección |
| `.triggerWrapper` | Wrapper del trigger para posicionamiento | `display: inline-flex; position: relative` |

### Stepper.module.scss (+6 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.header` | Contenedor de la lista de pasos | `margin-bottom: $spacing-6` |
| `.panel` | Panel de contenido del paso activo | `padding: $spacing-6 0` |
| `.stepWrapper` | Wrapper de cada step en la lista | Flex, flex:1, position relative |
| `.stepDisabled` | Step no clickeable (modo no-linear) | Opacidad 0.45, pointer-events none |
| `.vertical` | Stepper en orientación vertical | Lista en columna, connector como barra vertical |
| `.content` | Alias del panel (uso interno) | `padding: $spacing-4 0` |

### Autocomplete.module.scss (+8 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.inputGroup` | Wrapper campo + iconos con borde | Flex, border, border-radius, focus-within lime |
| `.panel` | Dropdown de resultados | Posición absoluta, z-index 9999, box-shadow |
| `.indicator` | Ícono de flecha ▾ desplegable | Padding, color muted, hover primary |
| `.cleaner` | Botón × para limpiar selección | Sin borde, cursor pointer, hover primary |
| `.hint` | Texto de ayuda debajo del campo | Font mono xs, color muted |
| `.invalid` | Estado de error en el wrapper | Bloque propio (selector para `.invalid .inputGroup`) |
| `.valid` | Estado de éxito en el wrapper | Bloque propio (selector para `.valid .inputGroup`) |
| `.disabled` | Wrapper cuando el campo está deshabilitado | `opacity: 0.5; pointer-events: none` |

### MultiSelect.module.scss (+12 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.selection` | Área de tags/texto seleccionado | Flex wrap, gap, flex:1, overflow hidden |
| `.placeholder` | Texto cuando no hay selección | Color muted, text-overflow ellipsis |
| `.tag` | Chip de item seleccionado (modo tags) | Fondo primary 12%, border-radius full, xs |
| `.tagRemove` | Botón × de cada tag | Sin fondo, color primary, hover opacity |
| `.indicator` | Flecha ▾ de la lista | Color muted, 0.6rem |
| `.cleaner` | Botón de limpiar todos | Sin borde, cursor pointer |
| `.searchWrapper` | Wrapper del input de búsqueda | Padding, border-bottom |
| `.noResults` | Mensaje sin resultados de búsqueda | Centro, color muted |
| `.optionCheckbox` | Checkbox de cada opción | `accent-color: $primary-color` |
| `.invalid` | Estado de error | Bloque propio |
| `.valid` | Estado de éxito | Bloque propio |
| `.disabled` | Componente deshabilitado | Trigger con opacity, pointer-events none |

### Carousel.module.scss (+8 clases)

| Clase | Contexto de uso | Estilo agregado |
|-------|----------------|-----------------|
| `.inner` | Contenedor de slides con AnimatePresence | `position: relative; overflow: hidden` |
| `.control` | Botón de navegación prev/next | Círculo sobre el slide, fondo semitransparente |
| `.controlPrev` | Botón anterior | `left: $spacing-3` |
| `.controlNext` | Botón siguiente | `right: $spacing-3` |
| `.indicators` | Contenedor de puntos de posición | Flex center, gap, padding |
| `.caption` | Pie de foto del slide | Absoluto en la parte inferior con gradiente |
| `.slideContent` | Wrapper interno de `CarouselSlide` | `position: relative; overflow: hidden` |
| `.dark` | Variante con controles oscuros | Override de colores en `.control` y `.dot` |

---

## HALLAZGO-FASE1-06 — Pseudo-selectores raíz vs bloques propios en CSS Modules (CONCEPTUAL)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE1-06 |
| Fecha | 2026-05-28 |
| Severidad | Informativo |
| Estado | DOCUMENTADO — patrón a seguir en toda la base de código |

**Descripción:**
Durante la auditoría se descubrió una distinción importante en CSS Modules:

**Patrón INCORRECTO (no genera hash exportable para `.clase`):**
```scss
// styles.clase devolverá undefined porque .clase no es un bloque propio
.clase:hover { color: red; }
.clase .hijo { font-size: 12px; }
```

**Patrón CORRECTO (genera hash exportable):**
```scss
// styles.clase devuelve el hash correcto
.clase {
  &:hover { color: red; }
}

.clase .hijo { font-size: 12px; }
// .clase tiene bloque propio, CSS Modules puede exportarlo
// .clase puede estar vacío si solo es un modificador de contexto
```

**Regla práctica:**
Toda clase que se use como `styles.X` en JSX necesita al menos un bloque
`.X { }` en el SCSS, aunque esté vacío. Los selectores combinados
`.X .hijo { }` pueden existir además, pero no en lugar del bloque propio.

**Excepción verificada:**
Los selectores de tipo `.invalid .inputGroup { }` donde `.invalid` aparece
como selector de clase (aunque sea como prefijo de selector combinado),
SÍ generan hash exportable porque webpack/css-loader procesa todos los
selectores de clase que aparecen en el archivo, no solo los bloques raíz.
**Verificado experimentalmente** con DatePicker y TimePicker — `styles.invalid`
funciona correctamente aunque solo aparezca en `.invalid .inputGroup { }`.

---

## RESUMEN EJECUTIVO FASE 1

| Métrica | Valor |
|---------|-------|
| Archivos SCSS inspeccionados | 24 (19 componentes + 5 compartidos admin) |
| Problema diagnosticado inicialmente | 11 archivos faltantes |
| Problema real encontrado | 33 clases sin definir en 10 archivos |
| Archivos creados desde cero | 0 |
| Archivos modificados | 12 |
| Clases agregadas | 33 |
| Variables SCSS incorrectas | 1 ($bg-dark → $bg-page) |
| check-scss final | 146 entries, 0 issues |
| Tests finales | 1331 pasando, 0 fallos, 0 regresiones |
| Commits | 9251a4f, eccdd4b |

**Orden de resolución aplicado:**
1. Leer imports reales → descubrir SCSS compartidos
2. Cruzar JSX vs SCSS → encontrar clases faltantes
3. Leer contexto de uso en JSX → entender semántica de cada clase
4. Leer SCSS existente → entender el sistema visual para mantener consistencia
5. Agregar clases con estilos coherentes al sistema de diseño
6. Re-auditar hasta 0 clases faltantes
7. Verificar check-scss + tests

---

## HALLAZGOS HEREDADOS DE SESIONES ANTERIORES

Los siguientes hallazgos fueron documentados en sesiones anteriores
y siguen pendientes:

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| HALLAZGO-ROUTER-01 | 12 páginas sin ruta en el router | Alta | PENDIENTE (Fase 2) |
| HALLAZGO-ROUTER-02 | AdminVariantsPage vs AdminProductVariantsPage — mismo path | Media | PENDIENTE (Fase 2) |
| HALLAZGO-ROUTER-03 | path="404" sin slash inicial | Baja | PENDIENTE (Fase 2) |
| HALLAZGO-ROUTER-04 | AdminConfigPage deshabilitada | Media | PENDIENTE (Fase 3) |
| HALLAZGO-UX-01 | Loading infinito en 3 páginas cuando recurso no existe | Alta | PENDIENTE (Fase 4) |
| HALLAZGO-MSW-01 | 8 endpoints sin mock MSW | Media | PENDIENTE (Fase 5) |
| HALLAZGO-SLICE-CONFLICT-01 | createProduct en productsSlice vs adminSlice | Media | PENDIENTE (Fase 6) |


---

## HALLAZGOS FASE 2 — Registrar páginas huérfanas en el router

---

## HALLAZGO-FASE2-01 — AdminStaticPagesPage enlaza a /admin/pages/:slug sin /edit (DOCUMENTADO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE2-01 |
| Fecha | 2026-05-28 |
| Severidad | Baja — afecta solo la decisión de naming de ruta |
| Estado | DOCUMENTADO — ruta ajustada al JSX real |

**Descripción:**
El plan original proponía `/admin/pages/:slug/edit` para el editor de páginas CMS.
Al leer el JSX real de `AdminStaticPagesPage`, los botones de "Ver" y "Editar" enlazan a:
```jsx
<Link to={`/admin/pages/${p.slug}`} ...>
```
Sin el segmento `/edit`. Igualmente `AdminStaticPageEditorPage` usa `useParams()` 
extrayendo `{ slug }` y su link de vuelta es a `/admin/pages`.

**Decisión:** La ruta registrada es `/admin/pages/:slug` (sin `/edit`) para
coincidir con los links existentes en la lista.

---

## HALLAZGO-FASE2-02 — AdminVouchersPage ya tenía links a rutas inexistentes (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE2-02 |
| Fecha | 2026-05-28 |
| Severidad | Alta — botones "Ver detalle" y "Editar" iban a 404 |
| Estado | CORREGIDO — ruta /admin/vouchers/:id registrada |

**Descripción:**
`AdminVouchersPage` tenía desde antes links a `/admin/vouchers/:id` y a
`/admin/vouchers/nuevo`. Al no estar registrada la ruta en el router, estos
botones producían navegación a `/404` silenciosamente.

La página `AdminVoucherDetailPage` maneja ambos casos en la misma ruta:
```jsx
const { id } = useParams();
const isNew  = id === 'nuevo';   // true → modo crear, false → modo editar
```

**Corrección:** Una sola ruta `/admin/vouchers/:id` cubre ambos casos:
- `/admin/vouchers/nuevo` → modo crear (isNew=true)
- `/admin/vouchers/5`     → modo editar (isNew=false, carga el voucher)

---

## HALLAZGO-FASE2-03 — AdminConfigPage no enlazaba a páginas CRUD específicas (PARCIAL)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE2-03 |
| Fecha | 2026-05-28 |
| Severidad | Media — las rutas de config específicas existen pero no están enlazadas desde el hub |
| Estado | PARCIAL — tarjeta UC-CFG-04 habilitada, resto permanece apuntando a páginas genéricas |

**Descripción:**
El hub `/admin/config` enlazaba a:
- `/admin/payments` en lugar de `/admin/config/gateways` (CRUD de gateways)
- `/admin/logistics` en lugar de `/admin/config/shipping` (CRUD de métodos de envío)
- `/admin/system-settings` en lugar de `/admin/config/site` (config del sitio)
- Sin ruta para `/admin/pages` (tarjeta con `pending: true` y `aria-disabled`)

Las páginas CRUD específicas (`AdminGatewaysPage`, `AdminShippingMethodsPage`,
`AdminSiteSettingsPage`) son funcionalidad adicional y complementaria a las
páginas genéricas existentes. El hub puede convivir con ambas.

**Corrección aplicada:** La tarjeta UC-CFG-04 fue habilitada con `to: '/admin/pages'`.
Las demás tarjetas mantienen sus rutas genéricas existentes que ya funcionan.

**Pendiente:** Evaluar si vale la pena actualizar las otras 3 tarjetas para apuntar
a las páginas CRUD específicas en lugar de las genéricas.

---

## HALLAZGO-FASE2-04 — Test de AdminConfigPage verificaba badge "Próximamente" eliminado (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE2-04 |
| Fecha | 2026-05-28 |
| Severidad | Baja — 1 test fallando |
| Estado | CORREGIDO — test actualizado |

**Descripción:**
`AdminConfigPage.test.jsx` tenía un test que verificaba que la tarjeta UC-CFG-04
mostraba el badge "Próximamente". Al habilitar la tarjeta en Fase 2, el badge
desapareció y el test falló.

**Corrección:** Test actualizado para verificar:
- UC-CFG-04 ahora es un `<Link>` a `/admin/pages` (no un `<div aria-disabled>`)
- No hay ningún `[aria-disabled="true"]` en el DOM
- El link de contenido estático apunta correctamente a `/admin/pages`

---

## HALLAZGO-FASE2-05 — React Router v6 no requiere orden específico para rutas literales (DOCUMENTADO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE2-05 |
| Fecha | 2026-05-28 |
| Severidad | Informativo |
| Estado | DOCUMENTADO |

**Descripción:**
El plan original indicaba que `/admin/products/import` debía ir
ANTES de `/admin/products/:id` para evitar que el param capturara "import".

En React Router v6 con `<Routes>`, el algoritmo usa **best-match scoring** y
no el orden de declaración. Los segmentos literales (`import`) siempre ganan
sobre los parámetros dinámicos (`:id`) en el mismo nivel jerárquico,
independientemente del orden en el JSX.

**Por tanto:** `/admin/products/import` matchea correctamente aunque esté
declarada después de `/admin/products/:id`. El mismo principio aplica a:
- `/admin/inventory/dashboard` vs `/admin/inventory/:variantId/movements`
- `/admin/inventory/stock-alerts` vs `/admin/inventory/:variantId/adjust`

**Convención adoptada:** Aunque no es obligatorio, se mantiene la convención
de declarar las rutas literales antes de las paramétricas del mismo prefijo
por claridad de lectura.

---

## RESUMEN EJECUTIVO FASE 2

| Métrica | Valor |
|---------|-------|
| Páginas huérfanas registradas | 12 |
| Lazy imports agregados | 12 |
| Rutas nuevas en AppRouter | 12 |
| Tarjetas AdminConfigPage habilitadas | 1 (UC-CFG-04 → /admin/pages) |
| Tests corregidos | 1 (AdminConfigPage.test.jsx) |
| Tests regresionados | 0 |
| check-scss | 146 entries, 0 issues |
| Tests finales | 1331 pasando, 0 fallos |

**Hallazgos clave:**
- AdminStaticPagesPage usaba `/admin/pages/:slug` sin `/edit` — ruta ajustada al JSX real
- AdminVouchersPage tenía links a rutas inexistentes desde antes de esta fase
- AdminVoucherDetailPage maneja crear y editar en una sola ruta con `id === "nuevo"`
- React Router v6 no requiere orden específico para rutas literales vs paramétricas

**Rutas registradas:**
```
/admin/vouchers/:id
/admin/products/import
/admin/products/:id
/admin/products/:id/variant-types
/admin/products/:id/variants/matrix
/admin/pages
/admin/pages/:slug
/admin/config/gateways
/admin/config/shipping
/admin/config/site
/admin/inventory/dashboard
/admin/inventory/stock-alerts
```


---

## HALLAZGOS FASE 4 — Fix loading infinito

---

## HALLAZGO-FASE4-01 — BUG-BROWSER-01 nunca fue corregido en el código fuente (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE4-01 |
| Fecha | 2026-05-28 |
| Severidad | Alta — ProductPage mostraba spinner infinito para cualquier slug |
| Estado | CORREGIDO en Fase 4 |

**Descripción:**
El commit `5b1a73d` (Fix BUG-BROWSER-01..04) documentó la corrección en el mensaje
de commit, pero al auditar el archivo `ProductPage.jsx` en Fase 4 se encontró que
los selectores incorrectos seguían presentes:

```jsx
// ANTES (incorrecto — nunca corregido):
const product   = useSelector((s) => s.catalog?.current);
const isLoading = useSelector((s) => s.catalog?.isLoadingDetail);

// DESPUÉS (correcto — corregido en Fase 4):
const product   = useSelector((s) => s.catalog?.currentProduct);
const isLoading = useSelector((s) => s.catalog?.isLoading);
```

`catalogSlice.initialState` usa `currentProduct` (no `current`) e `isLoading`
(no `isLoadingDetail`). Con los selectores incorrectos, `product` siempre era
`undefined` e `isLoading` siempre `undefined` (falsy) → el guard
`if (isLoading || !product)` siempre activaba el spinner.

**Lección:** Verificar en el código fuente real que los commits de corrección
realmente modificaron los archivos, no solo los documentaron.

---

## HALLAZGO-FASE4-02 — OrderDetailPage usaba isLoadingDetail inexistente (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE4-02 |
| Fecha | 2026-05-28 |
| Severidad | Alta — spinner infinito en detalle de pedido |
| Estado | CORREGIDO |

**Descripción:**
`OrderDetailPage.jsx` tenía:
```jsx
const isLoading = useSelector((s) => s.orders?.isLoadingDetail);
```

`ordersSlice.initialState` solo tiene `isLoading` (no `isLoadingDetail`).
El selector devolvía `undefined` (falsy) → el guard pasaba → pero `order` también
podía ser `undefined` antes de que el thunk completara → Navigate a `/account/orders`.

**Corrección:** `s.orders?.isLoadingDetail` → `s.orders?.isLoading`

---

## HALLAZGO-FASE4-03 — OrderSuccessPage sin isLoading selector (CORREGIDO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE4-03 |
| Fecha | 2026-05-28 |
| Severidad | Alta — race condition: si order=null antes de que el thunk resuelva, Navigate a / |
| Estado | CORREGIDO |

**Descripción:**
`OrderSuccessPage.jsx` tenía solo:
```jsx
const order = useSelector((s) => s.orders?.current);
// ...
if (!order) return <div>Cargando…</div>;
```

El guard `if (!order)` servía como spinner Y como 404 simultáneamente. Si el thunk
`fetchOrderDetail` fallaba o la orden no existía, el usuario veía "Cargando…"
indefinidamente en lugar de ser redirigido.

**Corrección:** Guard separado en dos bloques distintos:
```jsx
const isLoading = useSelector((s) => s.orders?.isLoading);
// ...
if (isLoading) return <div className={styles.loading}>Cargando confirmación…</div>;
if (!order)    return <Navigate to="/" replace />;
```

---

## HALLAZGO-FASE4-04 — Guards separados: semántica de isLoading vs recurso inexistente (DOCUMENTADO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE4-04 |
| Fecha | 2026-05-28 |
| Severidad | Informativo — patrón a seguir en todas las páginas con recurso dinámico |
| Estado | DOCUMENTADO |

**Patrón correcto para páginas con recurso dinámico:**

```jsx
// INCORRECTO: un solo guard confunde "cargando" con "no encontrado"
if (isLoading || !resource) return <div>Cargando…</div>;

// CORRECTO: dos guards con semántica distinta
if (isLoading) return <div className={styles.loading}>Cargando…</div>;
if (!resource) return <Navigate to="/ruta-de-fallback" replace />;
```

**Diferencia semántica:**
- `isLoading=true` → el recurso existe pero aún no llegó. Mostrar spinner.
- `!resource && !isLoading` → el recurso no existe (404 de API) o el fetch falló.
  Redirigir al fallback.

**Rutas de fallback establecidas:**

| Página | Recurso no encontrado → |
|--------|------------------------|
| ProductPage | `/404` |
| OrderSuccessPage | `/` |
| OrderDetailPage | `/account/orders` |

---

## HALLAZGO-FASE4-05 — Tests de pages con thunks async necesitan waitFor o preloadedState completo (DOCUMENTADO)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-FASE4-05 |
| Fecha | 2026-05-28 |
| Severidad | Media — tests que omiten este patrón producen falsos negativos |
| Estado | DOCUMENTADO — corrección aplicada en OrderSuccessPage.test y OrderDetailPage.test |

**Descripción:**
Los tests que renderizan páginas con `useEffect(() => dispatch(fetchX(id)))` enfrentan
un problema de timing:

1. El componente se renderiza con el `preloadedState` (isLoading: false, data: X)
2. El `useEffect` dispara `dispatch(fetchX(id))`
3. El thunk pasa a `.pending` → Redux actualiza `isLoading: true`
4. El componente re-renderiza mostrando el spinner
5. `apiService.get` es `jest.fn()` sin resolver → el thunk no completa
6. El test hace sus assertions sobre el spinner en lugar del contenido

**Soluciones por orden de preferencia:**

```javascript
// Opción A (PREFERIDA): mockResolvedValue + waitFor
apiService.get.mockResolvedValue({ data: MOCK_DATA });
// ...
await waitFor(() => expect(screen.getByText(/expected/)).toBeInTheDocument());

// Opción B: preloadedState con todos los campos del initialState
// (sin isLoading ni last* que el thunk pueda sobrescribir antes de resolver)
// Riesgo: el useEffect sigue disparando el thunk que pone isLoading=true

// Opción C (evitar): mockear el thunk directamente
// jest.mock('@redux/slices/xxxSlice', () => ({ fetchX: jest.fn(...) }))
// Riesgo: el jest.mock del slice puede afectar al reducer y romper el preloadedState
```

**Corrección aplicada:**
- `OrderSuccessPage.test`: `apiService.get.mockResolvedValue({ data: ORDER_MOCK })` + `waitFor`
- `OrderDetailPage.test`: preloadedState completo con `orders.current = ORDER`
  (el thunk resuelve rápido porque `apiService.get.mockResolvedValue` ya estaba en el test)

---

## RESUMEN EJECUTIVO FASE 4

| Métrica | Valor |
|---------|-------|
| Páginas corregidas | 3 |
| Selectores incorrectos corregidos | 3 (`catalog?.current`, `catalog?.isLoadingDetail`, `orders?.isLoadingDetail`) |
| Navigate importados | 2 (OrderSuccessPage, OrderDetailPage) |
| Guards separados (isLoading / !resource) | 3 páginas |
| Tests corregidos | 2 |
| Tests regresionados | 0 |
| Total tests | 1330 pasando, 0 fallos |
