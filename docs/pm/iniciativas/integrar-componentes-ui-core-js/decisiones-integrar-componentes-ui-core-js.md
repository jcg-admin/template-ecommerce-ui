# Decisiones: integrar-componentes-ui-core-js

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Fecha de apertura | 2026-05-28 |
| Fecha de cierre | 2026-05-28 |

## Seccion 1 — Decisiones de arquitectura

### dec-dialog-para-modales-nativos
Los modales del template (RefundModal, StockAdjustModal) y cualquier
modal futuro usan `<dialog>.showModal()` en lugar de divs con backdrop
manual. El browser gestiona focus trap, scroll lock, Escape y top layer
nativamente. Cero dependencias para esta funcionalidad.

### dec-floating-ui-para-posicionamiento
`@floating-ui/react` es la unica dependencia nueva instalada (~3KB gzip).
Solo se usa para los 6 componentes que requieren posicionamiento dinamico:
Dropdown, Tooltip, Autocomplete, MultiSelect, DatePicker, DateRangePicker.
`@popperjs/core` descartado (modo mantenimiento desde 2021).
CSS Anchor Positioning descartado (Firefox/Safari sin soporte en Mayo 2026).

### dec-popover-api-para-flotantes
Dropdown y Tooltip usan `popover=auto`/`popover=manual` respectivamente.
El browser gestiona: light-dismiss (click fuera cierra), Escape, top layer,
y exclusividad (solo uno abierto a la vez). floating-ui aporta solo
el calculo de coordenadas de posicion.

### dec-details-para-collapse
Collapse usa `<details>/<summary>` nativo. El attribute `name` en details
agrupa un Accordion con exclusividad nativa (Chrome 120+, Firefox 130+).
El evento `toggle` no se dispara en jsdom — los tests usan `fireEvent`
manual (documentado como BUG-JSDOM-01).

### dec-radiogroup-para-rating
Rating se implementa como `<fieldset role=radiogroup>` con inputs radio
ocultos y labels SVG, no sobre `<input type=range>`. Razon: el range
nativo no permite itemCount arbitrario ni precision de media estrella
con la accesibilidad de estrella individual. Cada estrella tiene su
propio `aria-label="N estrellas"`.

### dec-no-web-components
Web Components (Custom Elements, Shadow DOM) no se adoptan. El principio
de "maximo nativo" se aplica a APIs HTML/CSS/JS del navegador, no a la
arquitectura de componentes. CSS Modules y Redux tienen friction con
Shadow DOM. Los hooks React ya proveen el mismo nivel de encapsulacion.

## Seccion 2 — Resultado cuantitativo

| Metrica | Antes | Despues |
|---------|-------|---------|
| Tests pasando | 669 | 777 (+108) |
| Suites fallando | 11 (preexistentes) | 9 (2 corregidas: scss.test, AdminLayout) |
| SCSS entries | 122 | 135 |
| lint:style errores | 30 | 30 (sin regresion) |
| Componentes nuevos | 0 | 13 |
| Hooks UI nuevos | 0 | 5 (useClickOutside, useEscapeKey, useKeyboardShortcut, useScrollLock, useFloating) |
| Dependencias nuevas | 0 | 1 (@floating-ui/react 3KB) |

## Seccion 3 — Bugs encontrados durante la ejecucion

| ID | Severidad | Archivo | Descripcion | Estado |
|----|-----------|---------|-------------|--------|
| BUG-M01/M02 | Alta | RefundModal, StockAdjustModal | Backdrop manual sin focus trap, scroll lock, Escape | Corregido |
| BUG-T01 | Media | ToastContainer | Timer no pausa en hover — mensaje desaparece al leer | Corregido |
| BUG-T02 | Media | ToastContainer | Errores con role=status en lugar de role=alert | Corregido |
| BUG-S01..S05 | Media/Baja | AdminSidebar, AdminLayout | Sin narrow, backdrop sin ARIA, nav duplicada, aria-label estatico | Corregidos |
| BUG-CO01 | Media | CheckoutPage | Step inline sin aria-current, sin role list | Corregido |
| BUG-CO02 | Media | CheckoutPage | Todos los pasos visibles sin validacion por paso | Corregido |
| BUG-CF01 | Media | CatalogFilters | Dos inputs separados sin garantia min<=max | Corregido |
| BUG-SB01 | Baja | SearchBar | Sin autocompletado ni atajo Ctrl+K | Corregido |
| BUG-PC01 | Media | ProductCard | rating_avg en domain.ts pero no renderizado | Corregido |
| BUG-PP01 | Baja | ProductPage | Secciones apiladas sin navegacion por tabs | Corregido |
| BUG-HE01 | Media | Header | Avatar sin dropdown de usuario | Corregido |
| BUG-VE01 | Baja | VerifyEmailPage | Solo flujo link sin opcion de codigo manual OTP | Documentado |
| BUG-OTP-01 | Alta | OTPInput | padEnd('','') no rellena — 0 inputs renderizados | Corregido |
| BUG-CSS-MOD-01 | Info | Tests | toHaveClass no funciona con CSS Modules hasheados | Documentado, patron corregido |
| BUG-JSDOM-01 | Info | Tests | details/toggle no se dispara en jsdom | Documentado, patron corregido |
| BUG-JSDOM-02 | Info | Tests | inputs con inputMode no queryables por role=textbox | Documentado, patron corregido |
| BUG-TEST-CF01 | Info | CatalogFilters.test | Tests buscaban inputs eliminados al migrar a RangeSlider | Corregido |

## Seccion 4 — Criterios de completitud verificados

| Criterio | Resultado |
|----------|-----------|
| @floating-ui/react en package.json | PASA |
| 5 hooks UI en src/hooks/ui/ con tests | PASA |
| Modal con dialog: focus trap + scroll lock + Escape | PASA (5/5 tests) |
| Sidebar con narrow y backdrop accesible | PASA (7/7 tests) |
| Toast con pausa en hover y role ARIA correcto | PASA (6/6 tests) |
| Button con loading + Field con passwordToggle | PASA |
| Dropdown, Tooltip, Rating, Tabs, Collapse con tests | PASA (31 tests) |
| RangeSlider, Stepper, Autocomplete, MultiSelect con tests | PASA (29 tests) |
| OTPInput, Carousel con tests | PASA (12 tests) |
| Ctrl+K en Header | PASA |
| Rating en ProductCard | PASA |
| Tabs en ProductPage | PASA |
| RangeSlider en CatalogFilters | PASA |
| Dropdown de usuario en Header | PASA |
| Stepper en CheckoutPage | PASA |
| lint:style sin regresion vs baseline | PASA (30 = 30) |
| SCSS compile 135 entries clean | PASA |
| 0 nuevos fallos de tests | PASA |
| Documento de decisiones producido | PASA |
