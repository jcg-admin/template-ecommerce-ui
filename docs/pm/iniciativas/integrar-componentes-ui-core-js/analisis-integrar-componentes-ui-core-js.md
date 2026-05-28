# Analisis: integrar-componentes-ui-core-js

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Fecha | 2026-05-28 |
| Naturaleza | Analisis exhaustivo previo a la definicion de alcance y plan |
| Fuente | ui-core-5.25.0 (MIT) — /tmp/references/ui-core-5.25.0/js/src/ |

## Contexto

ui-core-5.25.0 expone 29 componentes vanilla JS y un conjunto de
utilitarios (FocusTrap, Backdrop, ScrollBarHelper, Popper.js) que
resuelven problemas de accesibilidad y comportamiento que los
componentes React actuales del template no tienen.

La estrategia aprobada es **adaptar la logica al stack React**:
cada componente JS se traduce a un hook React (`use<Nombre>`) o
directamente a un componente funcional mejorado. No se importan los
JS de ui-core en produccion — se usan como especificacion de
comportamiento y referencia de API.

---

## Bloque A — Utilitarios transversales (base de todo)

Los utilitarios de ui-core son la infraestructura que todos los
componentes consumen. En React se convierten en hooks reutilizables.
Son el primer entregable porque todo lo demas depende de ellos.

| Utilitario ui-core | Hook React equivalente | Que resuelve |
|--------------------|----------------------|--------------|
| `util/focustrap.js` | `useFocusTrap(ref)` | Mantiene el foco dentro del elemento (modal, offcanvas). Tab/Shift+Tab no escapan. WCAG 2.4.3. |
| `util/scrollbar.js` | `useScrollLock()` | Bloquea el scroll del body al abrir modal/offcanvas. Compensa el ancho de la scrollbar (evita el layout shift). |
| `util/backdrop.js` | `useBackdrop(visible, onClick)` | Renderiza y anima el backdrop oscuro detras del modal. Gestiona su ciclo de vida (append/remove del DOM). |
| `dom/event-handler.js` | `useEventListener(ref, event, handler)` | Wrapper de addEventListener con cleanup automatico en unmount. |
| `@popperjs/core` | `usePopper(ref, popperRef, options)` | Posicionamiento de dropdowns, tooltips, popovers. Ya disponible en node_modules si se instala. |

**Decision de implementacion**: los hooks se crean en
`src/hooks/ui/` (separados de `src/hooks/domain/` que es logica
de negocio). Son hooks puros de UI sin dependencia de Redux.

---

## Bloque B — Componentes existentes en el template a mejorar

El template tiene implementaciones propias de Modal, Sidebar y Toast
que carecen de la logica de accesibilidad de ui-core.

### B-1: Modal (RefundModal + StockAdjustModal)

**Estado actual**: backdrop con `onClick` manual, sin focus trap,
sin scroll lock, sin cierre por Escape, sin animacion CSS.

**Que aporta ui-core modal.js**:
- `backdrop: true|false|'static'` — static no cierra al hacer click fuera
- `focus: true` — focus trap con Tab/Shift+Tab
- `keyboard: true` — cierre con Escape
- ScrollBarHelper al abrir/cerrar
- Eventos: `show`, `shown`, `hide`, `hidden`
- Animacion CSS via clases `fade` / `show`

**Traduccion React**:
```
src/components/common/Modal/
  Modal.jsx          — componente que usa useFocusTrap + useScrollLock + useBackdrop
  Modal.module.scss  — animacion fade (tokens de T-202)
  useModal.js        — hook: estado open/close + logica de Escape
```

Los modales existentes (RefundModal, StockAdjustModal) pasan a usar
este `<Modal>` comun en lugar de su backdrop manual.

---

### B-2: Sidebar (AdminSidebar + AccountSidebar)

**Estado actual**: toggle simple con clase CSS, sin backdrop en
mobile, sin modo narrow-unfoldable (rail de iconos), sin
ScrollBarHelper.

**Que aporta ui-core sidebar.js**:
- `show()`, `hide()`, `toggle()` — ciclo de vida explicito
- `narrow()`, `toggleNarrow()` — modo rail (solo iconos, 64px)
- `unfoldable()`, `toggleUnfoldable()` — narrow + expand al hover
- `reset()` — volver al estado inicial
- Backdrop en mobile con ScrollBarHelper
- Eventos: `show`, `shown`, `hide`, `hidden`
- Clases: `sidebar-narrow`, `sidebar-overlaid`, `sidebar-narrow-unfoldable`

**Traduccion React**:
```
src/hooks/ui/useSidebar.js      — estado + logica narrow/unfoldable/backdrop
src/components/layout/Sidebar/  — componente comun (AdminSidebar y AccountSidebar lo usan)
```

---

### B-3: Toast (ToastContainer)

**Estado actual**: autohide sin pausa al hover, sin animacion
entering/leaving, sin ARIA live region correcta.

**Que aporta ui-core toast.js**:
- `animation: true` — clases `showing`/`show` para CSS transition
- `autohide: true`, `delay: 5000` — timer configurable
- Pausa del timer en `mouseover`/`focusin`, reanuda en `mouseout`/`focusout`
- `isShown()` — estado programatico
- Eventos: `show`, `shown`, `hide`, `hidden`

**Traduccion React**:
```
src/hooks/ui/useToast.js        — timer con pausa en hover/focus
src/components/common/Toast/    — animacion CSS + aria-live="polite"
```

---

## Bloque C — Componentes nuevos de alto valor para e-commerce

Ordenados por impacto en el flujo de compra.

### C-1: Dropdown (ALTO impacto — ausente en el template)

**ui-core dropdown.js**: 458L, Popper.js, navegacion por flechas,
cierre con Escape y click fuera, `autoClose: true|false|'inside'|'outside'`.

**Uso en el template**:
- Menu de usuario en el Header (actualmente no existe como dropdown)
- Selector de cantidad en cart
- Filtros del catalogo (actualmente un panel lateral fijo)
- Acciones en filas de tablas admin

**Traduccion React**:
```
src/hooks/ui/useDropdown.js         — posicion Popper, teclado, click fuera
src/components/common/Dropdown/     — Dropdown + DropdownItem + DropdownDivider
```

---

### C-2: Tooltip (ALTO impacto — ausente)

**ui-core tooltip.js**: 636L, Popper.js, delay configurable,
placement top/bottom/left/right/auto, trigger hover|focus|click|manual.

**Uso en el template**:
- Iconos de accion en tablas admin sin etiqueta visible
- Precios con descuento (mostrar calculo al hover)
- Badges de estado (mostrar significado al hover)
- Botones de icono en el Header

**Traduccion React**:
```
src/hooks/ui/useTooltip.js          — Popper + delay + trigger
src/components/common/Tooltip/      — wrapper que usa useTooltip
```

---

### C-3: Rating (ALTO impacto — e-commerce)

**ui-core rating.js**: 527L.
Options: `itemCount`, `value`, `precision` (0.5 stars), `readOnly`,
`disabled`, `allowClear`, `tooltips`, `highlightOnlySelected`,
`icon`/`activeIcon` personalizables.
Metodos: `update(config)`, `reset(value)`.

**Uso en el template**:
- ProductCard: rating de producto (actualmente ausente)
- ProductPage: rating detallado con distribucion de estrellas
- ProductReviewCreatePage: selector de calificacion interactivo

**Traduccion React**:
```
src/components/catalog/Rating/
  Rating.jsx             — componente con precision, readOnly, tooltips
  Rating.module.scss     — estilos con tokens de ui-core (star-color vars)
```

---

### C-4: RangeSlider (MEDIO impacto)

**ui-core range-slider.js**: 672L.
Options: `min`, `max`, `step`, `value` (array para rango doble),
`labels`, `tooltips`, `tooltipsFormat`, `track`, `vertical`,
`distance` (distancia minima entre thumbs en rango doble).

**Uso en el template**:
- CatalogFilters: filtro de precio por rango (actualmente usa
  dos inputs numericos separados)

**Traduccion React**:
```
src/components/common/RangeSlider/
  RangeSlider.jsx        — single y double thumb
  RangeSlider.module.scss
```

---

### C-5: Autocomplete (MEDIO impacto)

**ui-core autocomplete.js**: 1042L, Popper.js.
Options: `options` (array o async), `search` (campo por el que
buscar), `optionsTemplate` (render personalizado de cada opcion),
`showHints`, `allowOnlyDefinedOptions`, `clearSearchOnSelect`.
Metodos: `show`, `hide`, `toggle`, `clear`, `search(query)`,
`deselectAll`, `update`.

**Uso en el template**:
- SearchBar: autocompletado de busqueda de productos
- Formularios admin: selector de categoria, proveedor

**Traduccion React**:
```
src/hooks/ui/useAutocomplete.js     — filtrado, teclado, Popper
src/components/common/Autocomplete/ — combobox accesible
```

---

### C-6: MultiSelect (MEDIO impacto)

**ui-core multi-select.js**: 1201L, Popper.js.
Options: `options`, `multiple`, `search`, `selectAll`, `cleaner`,
`optionsTemplate`, `selectionType: 'tags'|'counter'|'text'`,
`value` (array).
Metodos: `selectAll`, `deselectAll`, `getValue`, `search`.

**Uso en el template**:
- Filtros del catalogo: seleccion multiple de categorias/marcas
- Formularios admin: asignacion de etiquetas, permisos

**Traduccion React**:
```
src/components/common/MultiSelect/  — con tokens de ui-core
```

---

### C-7: Collapse (MEDIO impacto)

**ui-core collapse.js**: 300L.
Options: `parent` (accordion — solo uno abierto), `toggle`.
Metodos: `show`, `hide`, `toggle`.
Animacion via height transition.

**Uso en el template**:
- FAQs en ProductPage
- Secciones colapsables en admin
- Filtros del catalogo en mobile

**Traduccion React**:
```
src/hooks/ui/useCollapse.js         — height animation con useRef
src/components/common/Collapse/     — Collapse + Accordion
```

---

### C-8: Tab (MEDIO impacto)

**ui-core tab.js**: 318L.
Activacion via click, teclado (flechas), ARIA `role="tablist"`,
`role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.

**Uso en el template**:
- ProductPage: pestanas descripcion/especificaciones/resenas
- AdminDashboard: tabs de metricas
- AccountPage: tabs de perfil/pedidos/direcciones

**Traduccion React**:
```
src/components/common/Tabs/
  Tabs.jsx + Tab.jsx + TabPanel.jsx — accesibilidad ARIA completa
```

---

### C-9: Stepper (MEDIO impacto — checkout)

**ui-core stepper.js**: 674L.
Options: `linear` (no saltar pasos), `skipValidation`.
Metodos: `next`, `prev`, `showStep(n)`, `finish`, `reset`.
Clases por paso: `complete`, `active`.

**Uso en el template**:
- CheckoutPage: flujo de compra en pasos (envio → pago → confirmacion)
- Actualmente el checkout es una pagina unica sin indicador de progreso

**Traduccion React**:
```
src/components/common/Stepper/
  Stepper.jsx + StepperStep.jsx
```

---

### C-10: OTPInput (BAJO — pero especifico de e-commerce)

**ui-core otp-input.js**: 479L.
Options: `value`, `placeholder`, `name`, `id`,
`ariaLabel` (funcion que recibe index y total).
Metodos: `clear`, `reset`, `update`.
Comportamiento: auto-focus al siguiente campo, backspace al anterior,
paste inteligente de 6 digitos.

**Uso en el template**:
- VerifyEmailPage: verificacion de correo (actualmente un input normal)
- Login con 2FA (si se implementa)

**Traduccion React**:
```
src/components/auth/OTPInput/       — 4-6 campos con auto-avance
```

---

### C-11: PasswordInput (BAJO — pero rapido de implementar)

**ui-core password-input.js**: 69L.
Toggle show/hide password con el icono al lado del campo.
Metodo: `toggle`.

**Uso en el template**:
- LoginPage, RegisterPage: campos de contrasena (actualmente
  `<input type="password">` sin toggle)

**Traduccion React**:
```
src/components/common/primitives/index.jsx — agregar prop showToggle
al primitivo Field existente (cambio minimo)
```

---

### C-12: LoadingButton (BAJO — pero muy reutilizable)

**ui-core loading-button.js**: 187L.
Options: `spinner`, `spinnerType` (border|grow), `disabledOnLoading`,
`timeout`.
Metodos: `start`, `stop`.

**Uso en el template**:
- Todos los formularios de submit (actualmente `disabled={saving}` con texto)
- Agregar al carrito, reembolso, vouchers, etc.

**Traduccion React**:
```
src/components/common/primitives/index.jsx — agregar prop loading al
Button existente con spinner inline (cambio minimo en primitivo)
```

---

### C-13: Carousel (BAJO — estetico)

**ui-core carousel.js**: 477L.
Options: `interval`, `keyboard`, `pause: 'hover'`, `ride`, `touch`,
`wrap`.
Metodos: `next`, `prev`, `to(index)`, `cycle`, `pause`, `dispose`.

**Uso en el template**:
- HomePage: galeria de banners o productos destacados
- ProductPage: galeria de imagenes del producto (actualmente
  imagen unica)

**Traduccion React**:
```
src/components/common/Carousel/
```

---

### C-14: SearchButton (BAJO — UI especifica)

**ui-core search-button.js**: 409L.
Options: `shortcut` (atajo de teclado, ej. `Ctrl+K`),
`preventDefault`.
Metodo: `trigger`.

**Uso en el template**:
- Header: activar el modal de busqueda con `Ctrl+K`
- La busqueda actual requiere click manual

**Traduccion React**:
```
src/hooks/ui/useKeyboardShortcut.js — hook generico de atajos
src/components/layout/Header/       — Ctrl+K para SearchBar
```

---

### C-15: Navigation (BAJO — sidebar nav)

**ui-core navigation.js**: 288L.
Options: `activeLinksExact`, `groupsAutoCollapse` (un grupo a la vez).

**Uso en el template**:
- AdminSidebar: navegacion con grupos colapsables
- AccountSidebar: navegacion de cuenta

**Traduccion React**:
El comportamiento lo absorbe el Sidebar mejorado (B-2).

---

### C-16: ScrollSpy (BAJO — informacional)

**ui-core scrollspy.js**: 299L.
Options: `target`, `rootMargin`, `threshold`, `smoothScroll`.
Actualiza el link activo en una nav segun la seccion visible.

**Uso en el template**:
- ProductPage: tabla de contenidos de descripcion larga
- Solo necesario si la pagina de producto crece en contenido

---

### C-17: Offcanvas (BAJO — alternativa a modal)

**ui-core offcanvas.js**: 285L.
Options: `backdrop: true|false|'static'`, `keyboard`, `scroll`.
FocusTrap + Backdrop + ScrollBarHelper.
Diferencia con Modal: se desliza desde un lateral.

**Uso en el template**:
- Carrito lateral (si se implementa)
- Filtros del catalogo en mobile como panel lateral

---

### C-18: Popover (BAJO — tooltip extendido)

**ui-core popover.js**: 100L (extiende Tooltip).
Options: `content`, `placement`, `trigger`, `template`, `offset`.

**Uso en el template**:
- Informacion adicional sobre campos de formulario
- Preview de producto al hover en listas

---

### C-19: Alert (MINIMO — ya cubierto por Toast)

**ui-core alert.js**: 90L.
Metodo: `close` con animacion CSS.
El Toast del template ya cubre el caso de uso. El Alert es para
mensajes inline persistentes (no toast). Bajo uso esperado.

---

### C-20: Button (MINIMO — ya cubierto)

**ui-core button.js**: 75L.
Metodo: `toggle` (modo pressed/aria-pressed).
El primitivo Button del template ya cubre el caso de uso.
Solo agregar soporte de `aria-pressed` al primitivo.

---

### C-21: Calendar (COMPLEJO — depende de DatePicker)

**ui-core calendar.js**: 1128L.
Renderizado de un calendario mensual/anual con seleccion de rango,
fechas deshabilitadas, formato localizado, renderizado
personalizado de celdas (`renderDayCell`, `renderMonthCell`).

**Uso en el template**:
- Solo necesario como subcomponente de DatePicker (C-22).

---

### C-22: DatePicker / DateRangePicker (COMPLEJO)

**ui-core date-picker.js**: 179L (wrapper sobre Calendar).
**ui-core date-range-picker.js**: 1181L, Popper.js, FocusTrap.
Options: hasta 40 opciones de configuracion de locale, formato,
fechas deshabilitadas, ranges predefinidos, footer con botones
Cancel/Confirm.

**Uso en el template**:
- Formularios admin: filtros por fecha en AdminOrdersPage,
  AdminPaymentsPage, AdminReportPage
- Actualmente usan `<input type="date">` nativo

---

### C-23: TimePicker (COMPLEJO)

**ui-core time-picker.js**: 1118L, Popper.js, FocusTrap.
Options: horas/minutos/segundos configurables, formato 12h/24h,
locale, footer.

**Uso en el template**:
- Poca demanda inmediata. Diferir a demanda real.

---

### C-24: Chip / ChipInput (ESPECIALIZADO)

**ui-core chip.js**: 365L. Toggle, select, remove con animacion.
**ui-core chip-input.js**: 593L. Campo que convierte texto en chips
al presionar Enter o separador. getValues, getSelectedValues.

**Uso en el template**:
- Formularios admin: etiquetas/tags de productos
- Filtros del catalogo: categorias seleccionadas como chips

---

## Clasificacion por prioridad de implementacion

| Prioridad | Componente | Razon |
|-----------|-----------|-------|
| **Critico** | useFocusTrap, useScrollLock, useBackdrop | Base de Modal, Offcanvas, Sidebar. Sin ellos los modales actuales tienen bugs de accesibilidad reales. |
| **Critico** | Modal mejorado | RefundModal y StockAdjustModal usados en produccion admin. |
| **Critico** | Toast mejorado | Usado en todos los layouts. |
| **Critico** | Sidebar mejorado | AdminSidebar y AccountSidebar usados en todos los layouts admin/cuenta. |
| **Alto** | Dropdown | Ausente del template. Usado en Header, tablas admin. |
| **Alto** | Tooltip | Ausente. Necesario para UX de tablas admin con iconos. |
| **Alto** | Rating | Ausente. Flujo de resenas es un UC del dominio. |
| **Alto** | Tab | Ausente. ProductPage, AdminDashboard, AccountPage lo necesitan. |
| **Medio** | RangeSlider | Mejora el filtro de precio del catalogo. |
| **Medio** | Autocomplete | Mejora el SearchBar actual. |
| **Medio** | Collapse | Necesario para FAQs y filtros mobile. |
| **Medio** | Stepper | Mejora el CheckoutPage. |
| **Medio** | MultiSelect | Mejora filtros del catalogo y formularios admin. |
| **Bajo** | PasswordInput | Cambio minimo en primitivo Field existente. |
| **Bajo** | LoadingButton | Cambio minimo en primitivo Button existente. |
| **Bajo** | OTPInput | Solo si se activa 2FA o verificacion por codigo. |
| **Bajo** | SearchButton | Ctrl+K en Header. |
| **Bajo** | Carousel | ProductPage galeria. |
| **Bajo** | Navigation | Absorbido por Sidebar mejorado. |
| **Bajo** | Offcanvas | Carrito lateral si se implementa. |
| **Bajo** | Chip / ChipInput | Tags de productos en admin. |
| **Bajo** | ScrollSpy | Solo si ProductPage crece mucho. |
| **Bajo** | Popover | Extension del Tooltip. |
| **Bajo** | Alert | Toast ya cubre el caso. Solo alertas inline persistentes. |
| **Bajo** | Button toggle | Una linea en el primitivo Button. |
| **Diferir** | Calendar | Solo como sub de DatePicker. |
| **Diferir** | DatePicker | Necesita Calendar como sub. |
| **Diferir** | DateRangePicker | Complejo. Solo para filtros de fecha en admin. |
| **Diferir** | TimePicker | Poca demanda inmediata. |

---

## Estructura de artefactos propuesta

```
src/
  hooks/
    ui/
      useFocusTrap.js       -- Bloque A
      useScrollLock.js      -- Bloque A
      useBackdrop.js        -- Bloque A
      useClickOutside.js    -- Bloque A
      useEscapeKey.js       -- Bloque A
      usePopper.js          -- Bloque A (wrapper de @popperjs/core)
      useKeyboardShortcut.js
      useDropdown.js
      useCollapse.js
      useToast.js
      useModal.js
      useSidebar.js
      useTooltip.js
      useAutocomplete.js
      useScrollSpy.js
  components/
    common/
      Modal/
        Modal.jsx
        Modal.module.scss
        useModal.js         (hook local)
      Dropdown/
        Dropdown.jsx
        DropdownItem.jsx
        Dropdown.module.scss
      Tooltip/
        Tooltip.jsx
        Tooltip.module.scss
      Tabs/
        Tabs.jsx
        Tab.jsx
        TabPanel.jsx
        Tabs.module.scss
      Collapse/
        Collapse.jsx
        Accordion.jsx
        Collapse.module.scss
      Rating/
        Rating.jsx
        Rating.module.scss
      RangeSlider/
        RangeSlider.jsx
        RangeSlider.module.scss
      Stepper/
        Stepper.jsx
        StepperStep.jsx
        Stepper.module.scss
      Autocomplete/
        Autocomplete.jsx
        Autocomplete.module.scss
      MultiSelect/
        MultiSelect.jsx
        MultiSelect.module.scss
      Carousel/
        Carousel.jsx
        Carousel.module.scss
      primitives/
        index.jsx           (agregar loading y showToggle a Button/Field)
    layout/
      Sidebar/              (componente comun para Admin y Account)
        Sidebar.jsx
        Sidebar.module.scss
    auth/
      OTPInput/
        OTPInput.jsx
        OTPInput.module.scss
```

---

## Relacion con el trabajo SCSS de mapear-y-corregir-scss-completo

Los tokens y mixins de ui-core ya disponibles en el template
(resultado de la iniciativa cerrada) son la base de estilos de
todos estos componentes. No es necesario volver a portar nada del
SCSS — ya esta disponible en `src/styles/abstracts/`.

Mapa de dependencias SCSS ya disponibles:

| Componente React | Variables SCSS disponibles |
|------------------|--------------------------|
| Modal | `$modal-*` (bloque T-202) |
| Sidebar | `$sidebar-*` (bloque T-202) |
| Toast | `$toast-*` (bloque T-202) |
| Dropdown | `$dropdown-*` (bloque T-202) |
| Tooltip / Popover | usa Popper.js — posicion es JS |
| Badge | `$badge-*` (bloque T-202) |
| Table | `$table-*` (bloque T-202) |
| Button | `$btn-*`, `$input-btn-*` (bloque T-202) |
| Forms / Input | `$input-*`, `$form-*` (bloque T-202) |
| Card | `$card-*` (bloque T-202) |

---

## Estimacion de esfuerzo por fase

| Fase | Contenido | Esfuerzo estimado |
|------|-----------|-------------------|
| F1 — Hooks de utilidad | useFocusTrap, useScrollLock, useBackdrop, useClickOutside, useEscapeKey | ~90 min |
| F2 — Componentes criticos mejorados | Modal, Sidebar, Toast (con los hooks de F1) | ~180 min |
| F3 — Nuevos de alto impacto | Dropdown, Tooltip, Rating, Tab | ~240 min |
| F4 — Nuevos de medio impacto | RangeSlider, Autocomplete, Collapse, Stepper, MultiSelect | ~300 min |
| F5 — Mejoras menores en primitivos | PasswordInput toggle, Button loading, Button aria-pressed | ~60 min |
| F6 — Nuevos de bajo impacto | OTPInput, SearchButton, Carousel | ~180 min |
| F7 — Diferidos | DatePicker, DateRangePicker, TimePicker, Calendar | ~480 min |
| **Total** | | **~22 horas** |

---

## Notas sobre Popper.js

5 componentes usan Popper.js (Dropdown, Tooltip, Popover, Autocomplete,
MultiSelect, DateRangePicker, TimePicker). Popper.js no esta en
`package.json` actualmente.

Opciones:
1. Instalar `@popperjs/core` — standard, bien mantenido.
2. Usar la Popover API nativa del navegador (Chrome 114+, Firefox 125+)
   — no requiere dependencia pero soporte limitado en Safari 17 (parcial).
3. Usar `floating-ui` (sucesor de Popper.js) — mas moderno, mejor
   tree-shaking, mismo autor.

Recomendacion: floating-ui si se parte de cero, @popperjs/core si se
quiere coherencia maxima con la referencia de ui-core.

La decision final se toma en el alcance, no en este analisis.
