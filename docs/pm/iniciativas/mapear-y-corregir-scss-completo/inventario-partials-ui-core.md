# Inventario de partials de `ui-core-5.25.0` y decision de portacion

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Tarea | T-103 (Fase F0a, ultima tarea pre-portacion) |
| Documento | Tabla de decision archivo-por-archivo: portar / portar-adaptado / portar-integrado / no-portar-arquitectura / fuera-de-scope |
| Fecha | 2026-05-21 |
| Fuente | `/tmp/references/ui-core-5.25.0/scss/` (210 archivos SCSS) |
| Destino | `/tmp/project/template-ecommerce-ui/src/styles/` |
| Modo | B (Puerto como mixins, preserva CSS Modules) — aprobado en alcance |
| Prefijo | `--ec-` — aprobado en alcance |
| Decisiones marco | D-MODO, D-PREFIJO, D-COREUI-BUNDLES (ver alcance amended) |

## Proposito del documento

Este es el **mapa de F1a**. Cada tarea de portacion (T-201..T-209
del replan) toma como input este inventario para saber **que
archivos concretos** tocar, en que orden, y como tratarlos.
T-103 es la **ultima tarea de F0a** antes de la portacion
masiva.

T-103 no toca codigo de produccion. Es decision documentada por
archivo.

## Definiciones de categorias

Para cada archivo de ui-core se le asigna **exactamente una**
categoria:

| Categoria | Significado | Ejemplo |
|-----------|-------------|---------|
| **portar** | Copiar adaptando `--cui-` a `--ec-`, sin convertir clases (porque el archivo no expone clases globales: funciones, mixins, variables). | `functions/_color.scss`, `mixins/_focus-ring.scss` |
| **portar-adaptado** | Portar convirtiendo selectores globales (`.btn`, `.card`) a mixins parametrizados (`@mixin btn-base`, `@mixin card-base`). | `_buttons.scss`, `_card.scss` |
| **portar-integrado** | Portar fusionando con archivo existente del template, no creando archivo nuevo. | `_variables.scss` (integrar con el nuestro), `helpers/_visually-hidden.scss` (consolidar con el mixin nuestro) |
| **portar-selectivo** | Portar solo parte del archivo o solo bajo condicion (e.g. `_root.scss` solo expone ~30-50 vars vs las 130+ de ui-core). | `_root.scss` |
| **no-portar-arquitectura** | No aplica por CSS Modules vs clases globales, decision arquitectonica explicita. | `coreui.scss` bundle, `_utilities.scss` (utility classes globales) |
| **fuera-de-scope** | RTL, themes alternativos, vendor de tipografia responsive. | `*.rtl.scss`, `themes/bootstrap/`, `vendor/_rfs.scss` |
| **diferir** | Puede portarse en el futuro pero F1a no lo necesita. | Componentes complejos no usados por el template (`_calendar.scss`, `_carousel.scss`, etc) |

## Inventario por categoria estructural

### 1. Bundles principales (8 archivos)

| Archivo | Categoria | Justificacion |
|---------|-----------|---------------|
| `coreui.scss` | **no-portar-arquitectura** | Bundle compuesto via `@forward` de TODOS los partials. Nuestro template no tiene bundle global de componentes; cada `.module.scss` importa abstracts directamente. D-COREUI-BUNDLES. |
| `coreui-grid.scss` | **no-portar-arquitectura** | Bundle solo grid. El contenido (variables y mixins de grid) si se porta como mixins en F1a (ver `_grid.scss` y `mixins/_grid.scss` mas abajo); el bundle como archivo NO se porta. |
| `coreui-reboot.scss` | **no-portar-arquitectura** | Bundle solo reboot. El contenido se consolida con `base/_reset.scss` nuestro (ver `_reboot.scss` mas abajo). |
| `coreui-utilities.scss` | **no-portar-arquitectura** | Bundle solo utilities globales. Modo B puro no porta utility classes. |
| `coreui.rtl.scss` | **fuera-de-scope** | RTL fuera de scope. |
| `coreui-grid.rtl.scss` | **fuera-de-scope** | RTL fuera de scope. |
| `coreui-reboot.rtl.scss` | **fuera-de-scope** | RTL fuera de scope. |
| `coreui-utilities.rtl.scss` | **fuera-de-scope** | RTL fuera de scope. |

**Subtotal**: 0 portar, 8 no-portar.

### 2. Configuracion fundamental (4 archivos)

| Archivo | Categoria | Destino propuesto | Tarea |
|---------|-----------|-------------------|-------|
| `_variables.scss` (2845 lineas) | **portar-integrado** | `src/styles/abstracts/_variables.scss` (existente, 370 lineas). Integrar las variables de ui-core que no tengamos, todas con `!default`. Conservar las nuestras. Verificar colisiones de nombre. | T-202 |
| `_variables-dark.scss` (222 lineas) | **portar** | `src/styles/abstracts/_variables-dark.scss` (nuevo). Preparacion para dark mode futuro; archivo no se activa en este scope (no se importa desde main.scss). | T-203 |
| `_maps.scss` | **portar** | `src/styles/abstracts/_maps.scss` (nuevo). Mapas SCSS para colores, grays, theme-colors, spacers, breakpoints. Necesario para iterar en `_root.scss`. | T-204 |
| `_root.scss` (130 custom properties) | **portar-selectivo** | `src/styles/abstracts/_root.scss` (nuevo). **Filtrar selectivamente** a ~30-50 custom properties con prefijo `--ec-`: colores marca, dimensiones layout, tokens semanticos. NO las 130 completas. | T-208 |

**Subtotal**: 3 portar (uno selectivo), 1 portar-integrado.

### 3. Funciones SCSS (`functions/`, 13 archivos)

Todas son funciones SCSS puras (sin output CSS); todas se
portan a `src/styles/abstracts/functions/` como conjunto
coherente en T-201:

| Archivo | Categoria | Funciones que expone |
|---------|-----------|----------------------|
| `_assert-ascending.scss` | **portar** | `assert-ascending` (valida orden de mapa de breakpoints) |
| `_assert-starts-at-zero.scss` | **portar** | `assert-starts-at-zero` (valida que breakpoints arrancan en 0) |
| `_color-contrast-variables.scss` | **portar** | infraestructura interna del sistema de contraste |
| `_color-contrast.scss` | **portar** | `color-contrast` (decide light/dark text segun fondo, WCAG) |
| `_color-translucent.scss` | **portar** | `color-translucent` (convierte color a rgba con alpha) |
| `_color.scss` | **portar** | `shift-color`, `shade-color`, `tint-color` (manipulacion HSL) |
| `_contrast-ratio.scss` | **portar** | `contrast-ratio` (calcula contraste WCAG 2.x) |
| `_escape-svg.scss` | **portar** | `escape-svg` (codifica caracteres para usar SVG en `url()`) |
| `_maps.scss` | **portar** | helpers de manipulacion de mapas SCSS |
| `_math.scss` | **portar** | `divide` (sustituto seguro de `/` deprecated; arregla el warning de T-108 organicamente) |
| `_rgba-css-var.scss` | **portar** | helper para componer rgba con CSS custom properties |
| `_str-replace.scss` | **portar** | `str-replace` (reemplaza substring en string) |
| `_to-rgb.scss` | **portar** | `to-rgb` (extrae componentes RGB) |

**Subtotal**: 13 portar. **Tarea unica**: T-201, 60 min estimados.

**Tests asociados (T-201 sub-task)**: cada funcion sub-portada
recibe al menos 1 test en `src/styles/tests/functions.test.scss`
usando sass-true (instalado en T-108).

### 4. Mixins (`mixins/`, 33 archivos)

Estos son mixins reusables, NO clases globales. Se portan a
`src/styles/abstracts/mixins/` en T-205. La decision por archivo
depende de si nuestro template ya tiene el mixin equivalente:

| Archivo | Categoria | Notas |
|---------|-----------|-------|
| `_alert.scss` | **diferir** | Alert es un componente UI; lo portaremos en T-209 cuando el template lo necesite. Mixin de alert no tiene caso de uso hoy. |
| `_avatar.scss` | **diferir** | Sin caso de uso. |
| `_backdrop.scss` | **portar** | Util para Modal del template (que ya existe). |
| `_border-radius.scss` | **portar** | Mixin parametrizado de border-radius con fallbacks. |
| `_box-shadow.scss` | **portar** | Mixin de sombras. Probablemente integra con nuestras variables `$shadow-*`. |
| `_breakpoints.scss` | **portar-integrado** | **CLAVE para D6**: el `media-up($name)` parametrizado reemplaza nuestros `media-xl`/`media-2xl` muertos. Integrar consolidando. |
| `_buttons.scss` | **portar** | Mixin de boton parametrizado (variantes, tamanos, outline). Lo necesitan T-401 (buttons). |
| `_caret.scss` | **diferir** | Caret de dropdown; sin caso de uso. |
| `_chip.scss` | **diferir** | Chip; nuestro template no lo tiene. |
| `_clearfix.scss` | **portar** | Patron clasico. Util si aparece grid antiguo. |
| `_color-mode.scss` | **portar** | Necesario para dark mode futuro (`[data-theme]`). |
| `_color-scheme.scss` | **portar** | Helper de color scheme; complementa color-mode. |
| `_container.scss` | **portar** | Mixin de contenedor responsive. |
| `_deprecate.scss` | **portar** | Helper para marcar mixins/funciones como deprecated emitiendo warning. **Util para gestionar nuestros 17 aliases** (D6) — los podriamos marcar deprecated en lugar de eliminar. |
| `_elevation.scss` | **portar** | Sistema de elevation/sombras. Complementa nuestro `hover-lift` muerto. |
| `_focus-ring.scss` | **portar-integrado** | **CLAVE para D6**: integrar con nuestro `@mixin focus-ring` muerto + `_focus-indicators.scss`. T-207. |
| `_forms.scss` | **portar** | Mixin de inputs, estados de validacion. Lo necesitan T-403 (forms). |
| `_gradients.scss` | **portar** | Mixin de gradients reusable. |
| `_grid.scss` | **portar** | Mixins de grid (row, col, gutter). Sustituyen nuestro `category-grid`/`product-grid` muertos potencialmente. |
| `_icon.scss` | **portar** | Mixin de tamano de icono. |
| `_image.scss` | **portar** | Mixin de imagen responsive (`@mixin img-fluid`). |
| `_list-group.scss` | **diferir** | Componente sin uso. |
| `_lists.scss` | **portar** | Helpers de listas (sin estilos). |
| `_ltr-rtl.scss` | **fuera-de-scope** | RTL fuera de scope. |
| `_pagination.scss` | **portar** | Si el template tiene paginacion en catalog (verificar). |
| `_reset-text.scss` | **portar** | Helper para reset de texto. |
| `_resize.scss` | **portar** | Mixin de resize handle (usable en textarea). |
| `_table-variants.scss` | **portar** | Variantes de tabla (T-405 tables). |
| `_text-truncate.scss` | **portar-integrado** | Integrar con nuestro `@mixin truncate-text` existente. |
| `_transition.scss` | **portar-integrado** | **CLAVE para T-001**: el mixin de transition parametrizado de ui-core conecta con nuestro `components/_animations.scss` huerfano. Cumple la accion derivada de T-001 reformulada. |
| `_utilities.scss` + `_utilities.import.scss` | **no-portar-arquitectura** | Utilities globales tipo Bootstrap; chocan con CSS Modules. |
| `_visually-hidden.scss` | **portar-integrado** | Consolidar con nuestro `@mixin visually-hidden` que ya existe en `_mixins.scss`. T-206. |

**Subtotal mixins/**: 22 portar (8 portar-integrado), 6 diferir,
2 fuera-de-scope, 1 no-portar-arquitectura, 2 utilidades del
sistema.

### 5. Helpers (`helpers/`, 12 archivos)

Helpers de ui-core son **clases utility con output CSS**. Modo
B convierte estos a mixins, no se mantienen como clases
globales:

| Archivo | Categoria | Destino propuesto |
|---------|-----------|-------------------|
| `_clearfix.scss` | **diferir** | Ya cubierto por `mixins/_clearfix.scss`. Helper class no se porta. |
| `_color-bg.scss` | **diferir** | Genera utilities `.bg-primary`, etc. Modo B no las porta. |
| `_colored-links.scss` | **diferir** | Genera utilities `.link-primary`, etc. Igual. |
| `_focus-ring.scss` | **portar-integrado** | Solo el comportamiento; consolidar con `mixins/_focus-ring.scss` en T-207. |
| `_icon-link.scss` | **diferir** | Genera `.icon-link` utility. |
| `_position.scss` | **diferir** | Genera `.position-relative`, etc. Innecesario en CSS Modules (cada componente declara su position). |
| `_ratio.scss` | **portar** | **Util concreto**: mixin de aspect-ratio. Reemplaza el typo del template `$product-card-img-ratio: 4 / 3` con un patron moderno usando `aspect-ratio: 4 / 3`. |
| `_stacks.scss` | **diferir** | Layout stack utility class. |
| `_stretched-link.scss` | **diferir** | `.stretched-link` para hacer toda la card clicable. Patron especifico. |
| `_text-truncation.scss` | **diferir** | Ya cubierto por `mixins/_text-truncate.scss`. |
| `_visually-hidden.scss` | **portar-integrado** | El mixin solo (no la clase global). Consolida con el nuestro en T-206. |
| `_vr.scss` | **diferir** | Vertical rule utility. |

**Subtotal helpers/**: 3 portar (2 integrado), 9 diferir.

### 6. Componentes (`_*.scss` partials principales, 55 archivos)

Estos son los partials de componente de ui-core. **Modo B**:
cada uno se convierte a un archivo de mixins parametrizados en
`src/styles/abstracts/components/`, y se importa selectivamente
solo si nuestro template tiene un `.module.scss` que vaya a
usarlo.

| Archivo | Categoria | Tarea | Justificacion |
|---------|-----------|-------|---------------|
| `_accordion.scss` | **diferir** | — | Sin uso en el template. |
| `_alert.scss` | **diferir** | — | Sin uso. Podemos tener Toast pero no Alert clasico. |
| `_autocomplete.scss` | **diferir** | — | El template usa search-input pero no autocomplete. |
| `_avatar.scss` | **diferir** | — | Sin uso. |
| `_badge.scss` | **portar-adaptado** | T-209 | El template tiene `.badge` modifier (Destacado), `StatusBadge`, etc. Util. |
| `_banner.scss` | **diferir** | — | Sin uso. |
| `_breadcrumb.scss` | **portar-adaptado** | T-209 | El template muestra paths en catalogo; util potencialmente. **Verificar uso real**. |
| `_button-group.scss` | **diferir** | — | Sin uso evidente. |
| `_buttons.scss` | **portar-adaptado** | T-209+T-401 | **Critico**. El template tiene multiples botones; mixins parametrizados ahorran muchisimo codigo. |
| `_calendar.scss` | **diferir** | — | Sin uso. |
| `_callout.scss` | **diferir** | — | Sin uso. |
| `_card.scss` | **portar-adaptado** | T-209+T-402 | **Critico**. ProductCard, InfoCard, panels. |
| `_carousel.scss` | **diferir** | — | Sin uso. |
| `_chip.scss` | **diferir** | — | Sin uso. |
| `_close.scss` | **portar-adaptado** | T-209+T-404 | Util para Modal y Toast close button. |
| `_containers.scss` | **portar-adaptado** | T-209 | Sistema de container responsive. |
| `_date-picker.scss` | **diferir** | — | Sin uso. |
| `_dropdown.scss` | **diferir** | — | El template no usa dropdowns generales. |
| `_footer.scss` | **diferir** | — | El template no tiene Footer; las variables se conservan con fusv-disable (D6). |
| `_forms.scss` | **portar-adaptado** | T-209+T-403 | **Critico**. Inputs, selects, validation. |
| `_functions.scss` | **portar** | T-201 | Barrel de `functions/`. Se porta como `src/styles/abstracts/functions/_index.scss`. |
| `_grid.scss` | **portar-adaptado** | T-209 | Container queries y grid moderno. |
| `_header.scss` | **portar-adaptado** | T-209 | El template tiene Header; este mixin lo enriquece. |
| `_helpers.scss` | **portar** | T-201/T-205 | Barrel de `helpers/`. |
| `_icon.scss` | **portar** | T-205 | Mixin de icono. |
| `_images.scss` | **portar-adaptado** | T-209 | `.figure`, `.img-fluid`. |
| `_list-group.scss` | **diferir** | — | Sin uso. |
| `_loading-button.scss` | **portar-adaptado** | T-209+T-401 | Util para botones con spinner durante actions async. **El template lo necesita** (checkout, login, save). |
| `_maps.scss` | **portar** | T-204 | Barrel de mapas SCSS. |
| `_mixins.scss` | **portar** | T-205 | Barrel de `mixins/`. |
| `_modal.scss` | **portar-adaptado** | T-209+T-404 | **Critico**. ModalContainer existe en el template. |
| `_nav.scss` | **diferir** | — | El template tiene navegacion propia. Ver despues si conviene. |
| `_navbar.scss` | **diferir** | — | El template tiene SideBar y Header propios. |
| `_offcanvas.scss` | **diferir** | — | Sin uso evidente. |
| `_pagination.scss` | **portar-adaptado** | T-209 | Util para Catalog y Admin. |
| `_placeholders.scss` | **diferir** | — | Placeholders animados (skeleton). El template ya tiene `@keyframes skeletonPulse`; portar este reemplaza/integra. **Reconsiderar en T-407**. |
| `_popover.scss` | **diferir** | — | Sin uso. |
| `_progress.scss` | **diferir** | — | Sin uso. |
| `_range-slider.scss` | **diferir** | — | Sin uso (filtros del catalog usan select). |
| `_rating.scss` | **diferir** | — | Sin uso. |
| `_reboot.scss` | **portar-integrado** | T-209 | **Consolidar con `base/_reset.scss`**. ui-core reboot es mas exhaustivo. |
| `_root.scss` | **portar-selectivo** | T-208 | Custom properties con prefijo `--ec-`. Selectivo. |
| `_search-button.scss` | **diferir** | — | Sin uso explicito. |
| `_sidebar.scss` | **portar-adaptado** | T-209 | El template tiene Sidebar; este puede enriquecerlo. |
| `_spinners.scss` | **portar-integrado** | T-209+T-407 | **Critico**: integra con el `components/_animations.scss` huerfano (T-001 reformulada). Usado en LoadingButton y page transitions. |
| `_stepper.scss` | **portar-adaptado** | T-209+T-403 | El template tiene `FormStepper` mencionado en `_mixins.scss`; util. **Verificar uso**. |
| `_tables.scss` | **portar-adaptado** | T-209+T-405 | **Critico**. Admin pages (orders, products, customers). |
| `_time-picker.scss` | **diferir** | — | Sin uso. |
| `_toasts.scss` | **portar-adaptado** | T-209+T-404 | **Critico**. ToastContainer existe. |
| `_tooltip.scss` | **diferir** | — | Sin uso explicito. |
| `_transitions.scss` | **portar-integrado** | T-209+T-407 | **Critico**: junto con `mixins/_transition.scss` resuelve el huerfano de animaciones (T-001). |
| `_type.scss` | **portar** | T-209 | Sistema tipografico (`h1`-`h6`, `.lead`, etc). |
| `_utilities.scss` | **no-portar-arquitectura** | — | Utility classes globales. Modo B no las porta. |
| `_variables-dark.scss` | **portar** | T-203 | (ya listado en seccion 2). |
| `_variables.scss` | **portar-integrado** | T-202 | (ya listado en seccion 2). |

**Subtotal partials de componente**: 18 portar-adaptado, 5
portar-integrado, 6 portar (barriles y configuracion), 25
diferir, 1 no-portar-arquitectura, 0 fuera-de-scope.

### 7. Forms (`forms/`, 13 archivos)

Subdirectorio para formularios complejos. Decision agrupada:

| Archivo | Categoria | Justificacion |
|---------|-----------|---------------|
| `_chip-input.scss` | **diferir** | Sin uso. |
| `_floating-labels.scss` | **diferir** | Patron especifico. Decidir en T-403 si se introduce. |
| `_form-check.scss` | **portar-adaptado** | Util para checkbox/radio en el template. |
| `_form-control.scss` | **portar-adaptado** | Input base; util. |
| `_form-multi-select.scss` | **diferir** | Sin uso. |
| `_form-otp.scss` | **diferir** | Sin uso. |
| `_form-password.scss` | **diferir** | Sin uso. |
| `_form-range.scss` | **diferir** | Sin uso. |
| `_form-select.scss` | **portar-adaptado** | Util para selects del catalog/admin. |
| `_form-text.scss` | **portar-adaptado** | Helper de mensajes de form. |
| `_input-group.scss` | **diferir** | Sin uso. |
| `_labels.scss` | **portar-adaptado** | Util. |
| `_validation.scss` | **portar-adaptado** | **Critico** para forms del admin. |

**Subtotal forms/**: 7 portar-adaptado, 6 diferir. Tarea T-403.

### 8. Sidebar (`sidebar/`, 3 archivos)

| Archivo | Categoria | Justificacion |
|---------|-----------|---------------|
| `_sidebar.scss` | **portar-adaptado** | El template tiene Sidebar; este enriquece variantes. |
| `_sidebar-narrow.scss` | **diferir** | Variante; ver despues si conviene. |
| `_sidebar-nav.scss` | **portar-adaptado** | Navegacion dentro del sidebar; util. |

**Subtotal sidebar/**: 2 portar-adaptado, 1 diferir.

### 9. Utilities (`utilities/`, 4 archivos)

| Archivo | Categoria | Justificacion |
|---------|-----------|---------------|
| `_api.scss` + `_api.import.scss` | **no-portar-arquitectura** | API de generacion de utility classes globales. Modo B no las porta. |
| `_bg-gradients.scss` + `_bg-gradients.import.scss` | **no-portar-arquitectura** | Utility classes de gradients globales. |

**Subtotal utilities/**: 0 portar, 4 no-portar-arquitectura.

### 10. Themes y Vendor (4 archivos)

| Archivo | Categoria | Justificacion |
|---------|-----------|---------------|
| `themes/bootstrap/*.scss` | **fuera-de-scope** | Theme alternativo Bootstrap. Fuera de scope. |
| `vendor/_rfs.scss` | **fuera-de-scope** | Responsive font sizing de Bootstrap. Decision arquitectonica de tipografia que requiere su propia ADR. |

**Subtotal**: 0 portar, varios fuera-de-scope.

### 11. Entries `.import.scss` (53 archivos)

Los `_X.import.scss` son entry points individuales que solo hacen
`@forward "X"`. Modo B **NO los porta**: nuestro template no es
libreria distribuible y los consumers internos usan `@use` directo.

**Subtotal**: 0 portar, 53 no-portar-arquitectura.

## Resumen ejecutivo por categoria

| Categoria | Archivos | Tareas asociadas |
|-----------|----------|-------------------|
| **portar** | 26 | T-201 (functions), T-204 (maps), T-205 (mixins) |
| **portar-adaptado** | 27 | T-209 (componentes como mixins), T-401..T-407 (integracion en `.module.scss`) |
| **portar-integrado** | 9 | T-202 (variables), T-206 (visually-hidden), T-207 (focus-ring), T-208 (root selectivo), T-209 (reboot, spinners, transitions consolidados) |
| **portar-selectivo** | 1 | T-208 (`_root.scss` filtrado) |
| **diferir** | ~45 | Iniciativas futuras cuando el template introduzca esos componentes |
| **no-portar-arquitectura** | ~70 (incluye 53 `.import.scss`) | — |
| **fuera-de-scope** | ~10 | RTL + themes + vendor |
| **Total inventariado** | **~210** | |

**Total a portar en F1a**: ~62 archivos.

## Orden de portacion propuesto (alineado con replan)

| Fase | Tarea | Archivos | Esfuerzo |
|------|-------|----------|----------|
| F1a | T-201 functions | 13 archivos de `functions/` + tests sass-true | 60 min |
| F1a | T-202 variables | Integrar `_variables.scss` (verificacion 1 a 1) | 120 min |
| F1a | T-203 variables-dark | Copiar `_variables-dark.scss` (no se activa) | 30 min |
| F1a | T-204 maps | Portar `_maps.scss` | 45 min |
| F1a | T-205 mixins | 22 archivos de `mixins/` (los no-diferidos) | 120 min |
| F1a | T-206 visually-hidden | Consolidar con `_mixins.scss` nuestro | 15 min |
| F1a | T-207 focus-ring | Consolidar con `_focus-indicators.scss` nuestro | 30 min |
| F1a | T-208 root selectivo | Crear `_root.scss` con ~30-50 custom properties `--ec-` | 90 min |
| F1a | T-209 componentes como mixins | ~18 partials de componente convertidos a mixins | 180 min |
| **Total F1a** | | **~62 archivos portados** | **~690 min (~11.5 h)** |

Esta estimacion se alinea con el replan (T-201..T-209 = 720 min);
la diferencia de 30 min queda como margen.

## Atribucion en cada archivo portado

Cada archivo portado lleva el siguiente header:

```scss
// =============================================================================
// Portado de ui-core-5.25.0 (CoreUI Pro) — MIT
// Atribucion: docs/licenses/ui-core-5.25.0-LICENSE.md
// Adaptado a CSS Modules de ecommerce-ui con prefijo --ec-
// Origen: scss/<ruta-original>.scss
// Iniciativa: mapear-y-corregir-scss-completo
// =============================================================================
```

Esto cumple la atribucion MIT y traza el origen tecnico
(creativeLabs / CoreUI Pro) preservando las 3 observaciones de
T-101.

## Riesgos identificados durante el inventario

| Riesgo | Mitigacion |
|--------|------------|
| Las funciones de ui-core dependen entre si (chains de `@use`); portarlas individualmente romperia | T-201 las porta como conjunto coherente con `@use 'sass:color'` y barrel `_index.scss` |
| Variables nuestras colisionan con nombres de ui-core (e.g. `$primary`) | T-202 hace verificacion 1 a 1 nombre por nombre, prefijando `ec-` solo si hay colision real |
| `_root.scss` ingenuamente con 130 properties haria el bundle CSS innecesariamente grande | T-208 filtra a ~30-50 properties relevantes para nuestro JS/theming actual |
| Componentes en `portar-adaptado` requieren convertir clases globales a mixins; trabajo manual significativo | T-209 estima 180 min pero podria expandirse; reevaluar al cierre de T-209 |
| Algunos componentes "diferir" podrian ser necesarios y se descubre tarde | El criterio de "diferir" es "no se usa en `.module.scss` existente del template HOY"; si en F4a (integracion) aparece necesidad, se anade tarea reactiva |
| Deprecation warnings de Sass (`if()`, `/`) pueden multiplicarse al portar mas SCSS | T-201 incluye `divide()` de ui-core que reemplaza `/`; usaremos eso en F1a y arregla organicamente |

## Decisiones tomadas en este inventario sin pausar

Aplicando regla del usuario "tomar siempre la mejor decision":

1. **Componentes sin uso evidente en el template HOY se marcan "diferir"**, no "portar". Razon: la directiva "no borres, integra" se cumple cuando el componente se necesite; portar 50 componentes que no se usan no es integracion, es preparacion especulativa. Cuando aparezca demanda, se porta reactivo.
2. **Los 53 archivos `*.import.scss` NO se portan**. Su unica razon de existir en ui-core es permitir consumer externo `@use 'pkg:coreui/card.import'`. No aplica a nuestro template.
3. **Components vs Helpers**: cuando un helper de ui-core (`helpers/_focus-ring.scss`) tiene un mixin equivalente en `mixins/_focus-ring.scss`, se porta SOLO el mixin (no la clase utility). Coherente con Modo B.
4. **`_reboot.scss` se consolida con `base/_reset.scss`** porque ambos hacen el mismo trabajo. No es eliminacion: es fusion enriquecedora.
5. **`vendor/_rfs.scss` (responsive font sizing) fuera de scope**. Es una decision tipografica que requiere ADR propia. Si se decide adoptar, iniciativa propia.
6. **`themes/bootstrap/`** fuera de scope. Themes alternativos requieren ADR de theming.

## Pre-condicion para F1a

T-103 cierra F0a. Pre-condicion para arrancar F1a:

1. T-103 cerrada con este inventario.
2. Replan reconfirmado: ~62 archivos a portar en ~11.5 h.
3. Disciplina por tarea de portacion: tests siguen el baseline
   actualizado `2 failed / 795 passed / 797 total` o mejor, build
   sigue limpio, `npm run lint:scss-all` sigue funcionando.
4. Primer paso de F1a sera **T-201 (functions)** porque las demas
   tareas dependen de tener las funciones disponibles.

## Que sigue

1. Cerrar T-103 con commit de este documento.
2. **F0a queda completa**.
3. Arrancar F1a desde T-201: portar las 13 funciones de
   `functions/` a `src/styles/abstracts/functions/`, anadir tests
   sass-true por funcion, validar compilacion.
