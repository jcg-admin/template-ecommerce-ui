# Alcance: integrar-componentes-ui-core-js

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Fecha | 2026-05-28 |
| Estado del alcance | Aprobado |

## Enunciado del alcance

Adaptar la logica de comportamiento, accesibilidad e interaccion de
los 29 componentes vanilla JS de ui-core-5.25.0 al stack React del
template. La traduccion se hace mediante hooks React y componentes
funcionales propios. Los archivos JS de ui-core NO se importan en
produccion -- son referencia de comportamiento y API.

## Principios rectores (no negociables)

1. **Maximo nativo**: usar el elemento HTML o API del navegador
   correcta antes de escribir logica JS. Si el browser ya lo
   resuelve, no se reinventa.
2. **Minima dependencia**: una sola dependencia nueva permitida
   (`@floating-ui/react`) para el posicionamiento de 6 componentes.
   Todo lo demas: APIs nativas del navegador.
3. **React idiomatico**: hooks y componentes funcionales. Sin clases
   vanilla, sin manipulacion directa del DOM excepto donde useRef
   es la unica opcion (dialog.showModal(), focus()).
4. **SCSS ya listo**: los tokens de ui-core ya estan en
   `src/styles/abstracts/_variables.scss` (T-202). No se vuelve
   a portar SCSS.
5. **Sin romper lo existente**: los componentes actuales (RefundModal,
   StockAdjustModal, AdminSidebar, ToastContainer) se mejoran
   gradualmente, no se reemplazan de golpe. Cada mejora pasa los
   tests existentes.

## Que ENTRA en el alcance

### Capa 0 -- Dependencia

| Artefacto | Descripcion |
|-----------|-------------|
| `@floating-ui/react` en package.json | Unica dependencia nueva. ~3KB gzip. Solo para posicionamiento de flotantes. |

### Capa 1 -- Hooks de utilidad UI (src/hooks/ui/)

Hooks puros, sin Redux, reutilizables por cualquier componente.

| Hook | API nativa base | Que resuelve |
|------|----------------|--------------|
| `useClickOutside(ref, handler)` | addEventListener | Cierra dropdown/popover al click fuera del ref |
| `useEscapeKey(handler, enabled)` | addEventListener | Llama handler al presionar Escape |
| `useKeyboardShortcut(keys, handler)` | addEventListener | Atajos tipo Ctrl+K para SearchButton |
| `useScrollLock()` | document.body.style | Bloquea scroll del body (fallback para browsers sin dialog) |
| `useFloating(options)` | @floating-ui/react | Wrapper opinado de useFloating para el template |

Nota: `useFocusTrap` y `useScrollLock` NO son necesarios como hooks
independientes porque `<dialog>.showModal()` los gestiona nativamente
(H-01). Se crean solo como fallback para contextos sin `<dialog>`.

### Capa 2 -- Componentes existentes mejorados

Mejoras a componentes que ya existen en el template.

| Componente actual | Mejora | API nativa adoptada |
|-------------------|--------|---------------------|
| `RefundModal` + `StockAdjustModal` | Extraer `<Modal>` comun con `<dialog>` | `dialog.showModal()` |
| `AdminSidebar` + `AccountSidebar` | Extraer `<Sidebar>` comun con modo narrow | CSS + backdrop sin dependencia |
| `ToastContainer` | Pausa del timer en hover/focus, animacion CSS | CSS `@starting-style` + `onMouseEnter` |
| `Button` (primitivo) | Prop `loading` con spinner inline | CSS animation |
| `Field` (primitivo) | Prop `showPasswordToggle` | `useState` + `type="text/password"` |

### Capa 3 -- Componentes nuevos de alta prioridad

Ausentes del template, alto impacto en UX del e-commerce.

| Componente | Directorio | API nativa base |
|-----------|------------|----------------|
| `Dropdown` | `src/components/common/Dropdown/` | `popover=auto` + `useFloating` |
| `Tooltip` | `src/components/common/Tooltip/` | `popover=auto` + `useFloating` |
| `Rating` | `src/components/catalog/Rating/` | radiogroup + SVG |
| `Tabs` + `Tab` + `TabPanel` | `src/components/common/Tabs/` | ARIA tablist |
| `Collapse` + `Accordion` | `src/components/common/Collapse/` | `<details>` + CSS |

### Capa 4 -- Componentes nuevos de prioridad media

| Componente | Directorio | API nativa base |
|-----------|------------|----------------|
| `RangeSlider` | `src/components/common/RangeSlider/` | `<input type=range>` |
| `Stepper` + `StepperStep` | `src/components/common/Stepper/` | `<ol>` + ARIA |
| `Autocomplete` | `src/components/common/Autocomplete/` | `popover=auto` + `useFloating` |
| `MultiSelect` | `src/components/common/MultiSelect/` | `popover=auto` + `useFloating` |

### Capa 5 -- Mejoras menores y componentes de bajo impacto

| Componente | Directorio | Nota |
|-----------|------------|------|
| `OTPInput` | `src/components/auth/OTPInput/` | n inputs con auto-focus |
| `Carousel` | `src/components/common/Carousel/` | scroll-snap CSS |
| `SearchButton` | mejora del `SearchBar` existente | `useKeyboardShortcut` |

## Que NO entra en el alcance

| Excluido | Razon |
|----------|-------|
| Importar los JS de ui-core en produccion | Conflictan con el virtual DOM de React. Son referencia, no dependencia. |
| Web Components / Custom Elements / Shadow DOM | Friction con CSS Modules y Redux. El principio nativo se aplica a APIs HTML/CSS/JS, no a la arquitectura de componentes. |
| `Calendar` como componente standalone | Solo tiene sentido como sub de `DatePicker`. Se implementa junto. |
| `DatePicker` / `DateRangePicker` / `TimePicker` | Complejos (~1100-1200L cada uno en ui-core). Se difieren a cuando haya demanda real en el template. |
| `Navigation` standalone | Su logica se absorbe en el `Sidebar` mejorado (Capa 2). |
| `ScrollSpy` | Solo necesario si `ProductPage` crece significativamente. Diferir. |
| `Popover` | Extension de `Tooltip`. Si `Tooltip` se implementa, `Popover` se agrega como variante. No es una tarea separada. |
| `Chip` / `ChipInput` | Baja demanda en el template actual. Diferir a cuando admin necesite tags de productos. |
| `Alert` | Toast ya cubre el caso principal. Alert es para mensajes inline persistentes -- pueden ser un div con estilos, no un componente nuevo. |
| `Button.toggle` (aria-pressed) | Una linea en el primitivo. Se agrega cuando un caso de uso lo requiera, no preventivamente. |
| Reemplazar `framer-motion` | Ya instalado, cubre las animaciones de salida que `@starting-style` no resuelve. No se elimina. |
| SSR / hidratacion | El template es SPA client-side (dec-spa-cliente-sin-ssr). Fuera de scope. |

## Criterio de completitud

La iniciativa esta cerrada cuando:

1. `@floating-ui/react` esta en `package.json` con tests verdes.
2. Capa 1: los 5 hooks de utilidad existen en `src/hooks/ui/` con tests.
3. Capa 2: `<Modal>` comun con `<dialog>`, `<Sidebar>` comun con narrow,
   `ToastContainer` con pausa en hover, `Button` con loading, `Field`
   con password toggle. Tests existentes pasan.
4. Capa 3: `Dropdown`, `Tooltip`, `Rating`, `Tabs`, `Collapse` existen
   con tests unitarios y estan integrados en al menos un lugar del template.
5. Capa 4: `RangeSlider`, `Stepper`, `Autocomplete`, `MultiSelect`
   existen con tests unitarios.
6. Capa 5: `OTPInput`, `Carousel`, `SearchButton` con Ctrl+K.
7. `lint:style` no regresa respecto al baseline actual (30 errores).
8. SCSS compile 122 entries clean.
9. Documento de decisiones (`decisiones-integrar-componentes-ui-core-js.md`)
   producido con las cuatro secciones canonicas.

## ADRs que este alcance toca o genera

| ADR | Accion |
|-----|--------|
| `dec-spa-cliente-sin-ssr` | Leida. No se contradice. Los componentes son client-only. |
| `dec-redux-toolkit-para-estado-y-react-query-para-cache` | Leida. Los hooks de UI no usan Redux. Estado de UI (open/closed) es local con useState. |
| Nueva: `dec-dialog-para-modales-nativos` | Crear al cerrar la iniciativa. Documenta la decision de usar `<dialog>` en lugar del backdrop manual actual. |
| Nueva: `dec-floating-ui-para-posicionamiento` | Crear al cerrar. Documenta por que floating-ui y no Popper.js ni CSS Anchor Positioning. |
