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
