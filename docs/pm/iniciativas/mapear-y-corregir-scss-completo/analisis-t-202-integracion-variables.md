# Analisis de T-202 — Integracion de `_variables.scss` de ui-core

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Tarea | T-202 (Fase F1a, segunda tarea) |
| Documento | Analisis exhaustivo previo a la ejecucion de T-202: que se va a hacer, en que orden, con que disciplina, ante que decisiones |
| Fecha | 2026-05-21 |
| Origen de la solicitud | Mensaje del usuario "vas a crear un analisis completo DE TODO lo que se va hacer en T-202, para poder continuar, y tenerlo registrado en un analisis" |
| Naturaleza | Pure analisis. No toca codigo. Produce el plan ejecutable de T-202. |
| Esfuerzo estimado de T-202 | 120 min (el mayor de F1a) |

## Por que este analisis existe

T-202 es la tarea de **mayor riesgo y mayor tamano** de la fase
F1a. Toca `_variables.scss`, el corazon del sistema de tokens
del template, con 230 variables vivas que consumen ~340 archivos
`.module.scss`. Una decision equivocada puede:

- Romper visualmente decenas de componentes existentes (regresion
  silenciosa que ni los tests Jest ni `npm run verify-build`
  detectan porque no leen pixeles).
- Crear colisiones que rompan la compilacion SCSS (detectable).
- Introducir variables muertas masivas que disparen el contador
  `fusv` y degraden el ritual de monitoreo.

Por eso T-202 **se planifica antes de ejecutar** con este
documento. El plan baja a granularidad de **variable individual**
para las colisiones y de **seccion** para las no colisionantes.

## Inventario empirico verificado (al momento de este analisis)

### Nuestro `_variables.scss`

| Metrica | Valor |
|---------|-------|
| Lineas | 405 |
| Variables top-level (`^\$X:`) | 230 |
| Variables con `!default` | 8 (las 7 anticipadas en T-201 + 1 colateral) |
| Secciones logicas (comentadas con `// N. NOMBRE`) | 18 |
| Bloque "VARIABLES MINIMAS PARA SISTEMA DE FUNCIONES PORTADAS (T-201)" al final | 7 variables: `$white`, `$black`, `$min-contrast-ratio`, `$color-contrast-dark`, `$color-contrast-light`, `$escaped-characters`, `$prefix` |

### `_variables.scss` de ui-core

| Metrica | Valor |
|---------|-------|
| Lineas | 2845 |
| Variables top-level | 1687 |
| Secciones `scss-docs-start NAME` | 94 |
| Lineas dentro de bloques `scss-docs-*` | 1949 |
| Variables dentro de bloques `scss-docs-*` | 1483 |
| Hex literales | 94 (todos en variables fuente; 0 disables `color-no-hex` porque ui-core no activa esa regla) |

### Diff de nombres

| Categoria | Conteo | Significado |
|-----------|--------|-------------|
| Colisiones (nombre identico) | **70** | Requieren decision uno por uno |
| Solo en ui-core | 1615 | Candidatas a anadir; filtrar por relevancia segun T-103 |
| Solo en nuestro template | 157 | Conservar tal cual (especificas del proyecto: oros, tierra, coral, indigo Material) |

## Las 70 colisiones detalladas

### 8 colisiones IDENTICAS — sin accion (conservar)

Variables con el **mismo nombre y mismo valor** en ambos. No
requieren cambio:

| Variable | Valor comun |
|----------|-------------|
| `$color-contrast-dark` | `$black` |
| `$color-contrast-light` | `$white` |
| `$font-weight-bold` | `700` |
| `$font-weight-light` | `300` |
| `$font-weight-medium` | `500` |
| `$font-weight-normal` | `400` |
| `$font-weight-semibold` | `600` |
| `$min-contrast-ratio` | `4.5` |

**Accion**: ninguna. Confirma que las anticipadas en T-201 son
consistentes.

### 62 colisiones DIFERENTES — requieren decision

Cada una se ha clasificado por **politica de resolucion**:

| Politica | Cantidad | Significado |
|----------|----------|-------------|
| **PRESERVAR-NUESTRO** | 56 | Nuestro valor es semanticamente distinto y refleja decision arquitectonica del template (paleta de oros/tierra/coral, pixels en lugar de rem, referencias a nuestros aliases). Conservamos el nuestro intacto. |
| **ABSORBER-UI-CORE** | 6 | Nuestro valor es trivial / redundante / inferior; ui-core es mejor y no rompe nada. |

#### Politica PRESERVAR-NUESTRO (56 variables)

Listadas por familia tematica:

**Paleta de grays (6 variables)**: nuestros grays son **azul-Material-Tailwind**, ui-core son **azul-frio CoreUI**. Decision arquitectonica del template.

```
$gray-200  nuestro #EEEEEE   ui-core #e7eaee   ← preservar nuestro
$gray-400  nuestro #CCCCCC   ui-core #cfd4de   ← preservar nuestro
$gray-500  nuestro #999999   ui-core #aab3c5   ← preservar nuestro
$gray-600  nuestro #666666   ui-core #6d7d9c   ← preservar nuestro
$gray-700  nuestro #555555   ui-core #4a566d   ← preservar nuestro
$gray-800  nuestro #333333   ui-core #323a49   ← preservar nuestro
```

**Paleta indigo (4 variables)**: nuestro indigo Material/Tailwind son hex declarados directamente; ui-core deriva con `shade-color($indigo, X%)`.

```
$indigo-500  nuestro #4A5FC1   ui-core $indigo                   ← preservar nuestro
$indigo-600  nuestro #1C5BD8   ui-core shade-color($indigo, 20%)  ← preservar nuestro
$indigo-700  nuestro #1A4F8B   ui-core shade-color($indigo, 40%)  ← preservar nuestro
$indigo-900  nuestro #14296B   ui-core shade-color($indigo, 80%)  ← preservar nuestro
```

**Tokens semanticos primarios (4 variables)**: estos son los puntos de marca del template; ui-core usa otros colores.

```
$primary  nuestro $primary-color   ui-core #5856d6   ← preservar nuestro
$success  nuestro $success-color   ui-core #1b9e3e   ← preservar nuestro
$warning  nuestro $warning-color   ui-core #f9b115   ← preservar nuestro
$black    nuestro #000             ui-core #080a0c   ← preservar nuestro (negro absoluto en el template)
```

**Border / radius (6 variables)**: el template usa escala en pixels (4/12/16/24); ui-core usa rem (`.25rem`, `.5rem`, etc).

```
$border-radius      nuestro $border-radius-md   ui-core .375rem
$border-radius-sm   nuestro 4px                 ui-core .25rem
$border-radius-lg   nuestro 12px                ui-core .5rem
$border-radius-xl   nuestro 16px                ui-core 1rem
$border-radius-2xl  nuestro 24px                ui-core $border-radius-xxl
$border-color       nuestro #E8E0D5             ui-core $gray-300         ← color de la paleta de tierra
```

**Btn (10 variables)**: tamanos del template en pixels con paddings concretos.

```
$btn-border-radius     nuestro $border-radius-md      ui-core var(--ec-border-radius)
$btn-font-size         nuestro $font-size-base        ui-core $input-btn-font-size
$btn-font-size-lg      nuestro $font-size-lg          ui-core $input-btn-font-size-lg
$btn-font-size-sm      nuestro $font-size-sm          ui-core $input-btn-font-size-sm
$btn-font-weight       nuestro $font-weight-semibold  ui-core $font-weight-normal
$btn-line-height       nuestro 1.5                    ui-core $input-btn-line-height
$btn-padding-x         nuestro 20px                   ui-core $input-btn-padding-x
$btn-padding-x-lg      nuestro 28px                   ui-core $input-btn-padding-x-lg
$btn-padding-x-sm      nuestro 14px                   ui-core $input-btn-padding-x-sm
$btn-padding-y         nuestro 10px                   ui-core $input-btn-padding-y
$btn-padding-y-lg      nuestro 14px                   ui-core $input-btn-padding-y-lg
$btn-padding-y-sm      nuestro 6px                    ui-core $input-btn-padding-y-sm
$btn-transition        nuestro $transition-default    ui-core literal multilinea
```

**Input (11 variables)**: equivalente a btn, valores propios del template.

```
$input-bg                  nuestro $bg-surface            ui-core var(--ec-body-bg)
$input-border-color        nuestro $border-color          ui-core var(--ec-border-color)
$input-border-radius       nuestro $border-radius-md      ui-core var(--ec-border-radius)
$input-color               nuestro $text-primary          ui-core var(--ec-body-color)
$input-focus-border-color  nuestro $primary-color         ui-core tint-color($primary, 50%)
$input-font-size           nuestro $font-size-base        ui-core $input-btn-font-size
$input-padding-x           nuestro 14px                   ui-core $input-btn-padding-x
$input-padding-y           nuestro 10px                   ui-core $input-btn-padding-y
$input-placeholder-color   nuestro $text-muted            ui-core var(--ec-secondary-color)
$input-transition          nuestro $transition-default    ui-core literal multilinea
```

**Badge (5 variables)**:

```
$badge-border-radius  nuestro $border-radius-full    ui-core var(--ec-border-radius)
$badge-font-size      nuestro $font-size-xs          ui-core .75em
$badge-font-weight    nuestro $font-weight-semibold  ui-core $font-weight-bold
$badge-padding-x      nuestro 8px                    ui-core .65em
$badge-padding-y      nuestro 3px                    ui-core .35em
```

**Card / header / footer / sidebar (6 variables)**:

```
$card-bg              nuestro $bg-surface           ui-core var(--ec-body-bg)
$card-border-radius   nuestro $border-radius-lg     ui-core var(--ec-border-radius)
$header-bg            nuestro $bg-surface           ui-core var(--ec-body-bg)
$footer-bg            nuestro $secondary-dark       ui-core var(--ec-tertiary-bg)
$sidebar-bg           nuestro $secondary-color      ui-core var(--ec-body-bg)
$sidebar-width        nuestro 260px                 ui-core 16rem
$sidebar-transition   nuestro width 300ms ease-out  ui-core (multipropiedad larga)
```

**Tipografia y misc (4 variables)**:

```
$font-family-base   nuestro <stack propio>      ui-core <stack Bootstrap>
$font-size-base     nuestro 15px                ui-core 1rem
$font-size-lg       nuestro 18px                ui-core $font-size-base * 1.25
$font-size-sm       nuestro 13px                ui-core $font-size-base * .875
$text-muted         nuestro #9C8A7A             ui-core var(--ec-secondary-color)
$transition-base    nuestro 250ms ease          ui-core all .2s ease-in-out
```

**Disciplina para las 56**: estas variables **NO se modifican**.
Se anotan en T-202 como "preservada (colision con ui-core),
valor del template intencional". En el commit message va una
seccion explicita listandolas.

#### Politica ABSORBER-UI-CORE (6 variables)

**`$prefix`** — el nuestro era `"ec-"` literal en T-201; ui-core
es `$variable-prefix`. Nuestro valor es **correcto y necesario**
(decision D-PREFIJO), pero podemos absorber la **convencion** de
ui-core: declararlo en un solo lugar y referenciar. Sin embargo,
ui-core declara `$variable-prefix: cui- !default` y nuestro
`$prefix: "ec-" !default` es funcionalmente equivalente. **Decision:
PRESERVAR el nuestro**. Tras revisar, mover a categoria
preservar-nuestro. **Total ABSORBER-UI-CORE baja a 5**.

**`$escaped-characters`** — colision identica funcionalmente (el
mapa de codificacion de caracteres en data URIs es estandar
universal). Pero ui-core podria tener entradas adicionales que
no tenemos. Verificar en ejecucion: si ui-core tiene mas
entradas, absorber el suyo. Si es identico, dejar el nuestro.

**`$white`** — nuestro `#FFFFFF`, ui-core `#fff`. Semanticamente
identicos. Estilisticamente, `#fff` es mas compacto. **Decision:
absorber ui-core** (`#fff`). Riesgo cero: ningun consumer
diferencia `#FFFFFF` de `#fff` en CSS.

**`$min-contrast-ratio`** — ya identico en valor (4.5), pero
ahora tendra el mismo bloque scss-docs en T-202.

**`$color-contrast-dark`** — ya identico.

**`$color-contrast-light`** — ya identico.

**Reclasificacion final**: 6 son las que estaba listando arriba,
pero solo **2 candidatas reales a absorcion**: `$white` (cambio
estilistico) y `$escaped-characters` (verificar contenido).

**Politica ABSORBER-UI-CORE final**: **2 variables a verificar/
absorber selectivamente**.

## Variables ONLY-en-ui-core: que portamos, que no

ui-core tiene 1615 variables que nosotros no tenemos. La
politica para integrar las nuevas es por **familia tematica** que
mapea al inventario T-103:

### Tabla de politica por seccion

Cada seccion de `_variables.scss` de ui-core se evalua segun la
categoria de su componente en T-103:

| Seccion (origen ui-core) | Variables | Componente en T-103 | Politica T-202 |
|--------------------------|-----------|---------------------|----------------|
| `aspect-ratios` | 1 (mapa) | helpers (`ratio`) | **PORTAR** completo (1 mapa) |
| `border-radius-variables` | 6 | infra | **INTEGRAR**: nuestro template tiene los pixels, ui-core tiene rem. Anadir las ui-core con prefijo `cui-` solo si las funciones portadas las necesitan internamente (verificar). |
| `border-variables` | 5 | infra | **PORTAR** las que no colisionan. |
| `box-shadow-variables` | 4 | infra | **PORTAR** completo. |
| `btn-variables` | 36 | T-401 buttons | **PORTAR-FILTRADO**: las que ya tenemos (preservar nuestras), anadir las nuevas (focus-states, active-states, ghost variants, outline variants). |
| `btn-ghost-variables` | 7 | T-401 buttons | **PORTAR** completo (nuestro template no tiene ghost). |
| `btn-outline-variables` | 11 | T-401 buttons | **PORTAR** completo. |
| `card-variables` | 19 | T-402 cards | **PORTAR-FILTRADO**: 2 colisiones, 17 nuevas. |
| `close-variables` | 13 | T-404 (close button) | **PORTAR** completo. |
| `color-variables` | 10 | infra | **PORTAR** las 10 (blue, indigo, purple, pink, red, orange, yellow, green, teal, cyan). **Importante**: nuestro template tiene indigo-{500,600,700,900} en pixels distintos a los de ui-core. **No colisiona con `$indigo` simple** porque solo tenemos las variantes numeradas. Anadir `$indigo` = `#3949ab` o similar como token base, dejar nuestras variantes en su escala material. |
| `colors-map` | 1 mapa | infra | **PORTAR** el mapa. Iterable para `_root.scss` (T-208). |
| `container-max-widths` | 1 mapa | T-209 containers | **DIFERIR** o portar si T-209 lo necesita. |
| `cq-grid-breakpoints` | 1 mapa | T-205 mixins/breakpoints | **PORTAR** (container queries, util). |
| `display-headings` | 5 + 1 mapa | T-209 type | **PORTAR** (display-1..6 + map). |
| `focus-ring-variables` | 5 | T-207 focus-ring consolidado | **PORTAR** completo. Necesario para focus-ring portado en T-207. |
| `font-sizes` | 1 mapa | infra | **PORTAR** el mapa. |
| `font-variables` | 25 | infra | **PORTAR-FILTRADO**: colisiones en font-size-base/lg/sm (preservar nuestros pixels), el resto nuevas. |
| `footer-variables` | 7 | T-209 footer (DIFERIR) | **PORTAR** completo con `fusv-disable` (D6: variables reservadas para futuro componente Footer). |
| `form-check-variables` | 27 | T-403 forms | **PORTAR** completo. |
| `form-feedback-variables` | 9 | T-403 forms | **PORTAR** completo. |
| `form-file-variables` | 3 | T-403 forms | **PORTAR** completo. |
| `form-floating-variables` | 11 | T-403 forms (diferir) | **PORTAR** con `fusv-disable`. |
| `form-input-variables` | 39 | T-403 forms | **PORTAR-FILTRADO** (11 colisiones de input-*; preservar nuestras dimensiones). |
| `form-label-variables` | 5 | T-403 forms | **PORTAR**. |
| `form-text-variables` | 5 | T-403 forms | **PORTAR**. |
| `form-validation-colors` | 4 | T-403 forms | **PORTAR**. |
| `form-validation-states` | 1 mapa | T-403 forms | **PORTAR**. |
| `form-select-variables` | 35 | T-403 forms | **PORTAR**. |
| `form-switch-variables` | 12 | T-403 forms | **PORTAR**. |
| `gray-color-variables` | 12 (`$gray-100..900` + `$grays` map) | infra | **PORTAR-FILTRADO**: 6 colisiones (gray-200..800), preservar nuestras. Anadir las que no colisionan: gray-100, gray-300, gray-900. |
| `gray-colors-map` | 1 mapa | infra | **PORTAR** el mapa. |
| `grid-breakpoints` | 1 mapa | T-205 mixins/breakpoints | **PORTAR**, **CRITICA**: necesaria para `media-up($bp)` parametrizado que reemplaza nuestros `media-xl`/`media-2xl` muertos. |
| `header-variables` | 31 | T-209 header | **PORTAR-FILTRADO** (1 colision header-bg; preservar nuestro). |
| `headings-variables` | 6 | T-209 type | **PORTAR**. |
| `icon-link-variables` | 5 | T-209 helpers | **DIFERIR** (helper no portado en T-103). |
| `input-btn-variables` | 17 | T-209 input-btn shared | **PORTAR**, **importante**: muchos `$btn-*` y `$input-*` de ui-core referencian estos. Necesario para que las absorciones futuras funcionen. |
| `input-group-variables` | 6 | T-403 forms (diferir) | **PORTAR** con `fusv-disable`. |
| `modal-variables` | 31 | T-404 modal | **PORTAR**. |
| `nav-variables` | 42 | T-209 (DIFERIR) | **PORTAR** con `fusv-disable`. |
| `position-map` | 1 mapa | infra | **DIFERIR** (helper de posicion no portado). |
| `progress-variables` | 11 | T-209 (DIFERIR) | **DIFERIR** completo (no portar todavia). |
| `sidebar-variables` | 15 | T-209 sidebar | **PORTAR-FILTRADO** (3 colisiones; preservar nuestras). |
| `sidebar-nav-variables` | 59 | T-209 sidebar | **PORTAR**. |
| `sidebar-toggler` | 11 | T-209 sidebar | **PORTAR**. |
| `spacer-variables-maps` | 2 mapas | infra | **PORTAR** (mapa de espaciados iterable). |
| `spinner-variables` | 8 | T-407 animations | **PORTAR**. |
| `table-loop` | 1 mapa | T-405 tables | **PORTAR**. |
| `table-variables` | 26 | T-405 tables | **PORTAR**. |
| `theme-color-variables` | 8 | infra | **PORTAR** (primary, success, info, warning, danger, secondary, light, dark abstractos). **No colisionan** con nuestras `$primary-color`, etc. |
| `theme-colors-map` | 1 mapa | infra | **PORTAR** el mapa. |
| `theme-gradients` | 9 + 1 mapa | infra | **PORTAR**. |
| `theme-bg-subtle-variables` | 8 | infra (dark mode) | **PORTAR** con `fusv-disable` (necesario para dark mode futuro). |
| `theme-border-subtle-variables` | 8 | infra | **PORTAR** con `fusv-disable`. |
| `theme-text-variables` | 8 | infra | **PORTAR** con `fusv-disable`. |
| `thumbnail-variables` | 6 | helpers | **DIFERIR**. |
| `toast-variables` | 14 | T-404 toast | **PORTAR**. |
| `tooltip-feedback-variables` | 6 | T-209 tooltip (DIFERIR) | **DIFERIR**. |
| `tooltip-variables` | 12 | T-209 tooltip (DIFERIR) | **DIFERIR**. |
| `type-variables` | 25 | T-209 type | **PORTAR**. |
| `vr-variables` | 1 | helpers (DIFERIR) | **DIFERIR**. |
| `zindex-levels-map` | 1 mapa | infra | **PORTAR**. |
| `zindex-stack` | 12 | infra | **PORTAR-FILTRADO**: tenemos `$z-hide`, `$z-base`, `$z-dropdown`, etc. (categoria C de muertos). ui-core tiene `$zindex-dropdown: 1000`, etc. Decision: portar el `$zindex-*` de ui-core como ESCALA CANONICA, mantener nuestros `$z-*` como aliases con `fusv-disable`. |

#### Componentes DIFERIDOS (categoria D del inventario T-103)

Las siguientes secciones **no se portan en T-202**. Sus variables
se mantienen en ui-core y se portaran cuando el componente
correspondiente se necesite:

| Seccion | Variables | Razon de diferimiento |
|---------|-----------|-----------------------|
| `accordion-variables` | 26 | No hay accordion en el template |
| `alert-variables` | 7 | No hay alert (tenemos toast pero no alert) |
| `autocomplete-variables` | 84 | No hay autocomplete |
| `avatar-variables` | 9 | No hay avatar |
| `breadcrumb-variables` | 11 | Verificar uso real (uncertain) |
| `calendar-variables` | 41 | No hay calendar |
| `callout-variables` | 9 | No hay callout |
| `carousel-variables` | 23 | No hay carousel |
| `carousel-dark-variables` | 3 | Idem |
| `collapse-transition` | 2 | Util pero requiere collapse component |
| `date-picker-variables` | 79 | No hay date-picker |
| `dropdown-variables` | 26 | No hay dropdown |
| `dropdown-dark-variables` | 12 | Idem |
| `figure-variables` | 2 | Sin uso |
| `form-multi-select-variables` | 119 | Sin uso |
| `form-otp-variables` | 29 | Sin uso |
| `form-password-variables` | 9 | Sin uso |
| `form-range-variables` | 17 | Sin uso |
| `list-group-variables` | 19 | Sin uso |
| `navbar-variables` | 23 | El template tiene Header propio, no Navbar |
| `navbar-dark-variables` | 9 | Idem |
| `offcanvas-variables` | 13 | Sin uso |
| `pagination-variables` | 29 | **VERIFICAR**: el template muestra paginacion en Catalog. Si la usa, portar. |
| `popover-variables` | 18 | Sin uso |
| `range-slider-variables` | 37 | Sin uso |
| `rating-variables` | 9 | Sin uso |
| `stepper-variables` | 33 | **VERIFICAR**: el template tiene FormStepper. Si lo usa, portar. |
| `time-picker-variables` | 81 | Sin uso |

**Total diferido**: ~720 variables. No se anaden a nuestro
`_variables.scss` en T-202.

## Calculo del alcance de T-202

| Categoria | Conteo aproximado |
|-----------|--------|
| **Variables ya en el template** (conservar) | 230 |
| **Colisiones IDENTICAS** (sin cambio, ya consistentes) | 8 |
| **Colisiones DIFERENTES preservar-nuestro** (sin cambio) | 56 |
| **Colisiones DIFERENTES absorber-ui-core** (cambio puntual) | 2 (`$white`, `$escaped-characters`) |
| **Solo-en-ui-core PORTAR** (familias activas) | ~430 variables nuevas |
| **Solo-en-ui-core PORTAR con `fusv-disable`** (reservadas futuras) | ~120 variables nuevas |
| **Solo-en-ui-core DIFERIDAS** (no portar ahora) | ~720 |
| **Solo-en-ui-core de "diferir total"** (no portar nunca en esta iniciativa) | ~340 |

**Total estimado tras T-202**: ~230 + ~550 nuevas = **~780 variables top-level**.
Tamano final del `_variables.scss`: ~1200 lineas (de 405 actuales).

## Plan de ejecucion paso a paso

T-202 se ejecuta en **8 sub-pasos** secuenciales, cada uno con
validacion. **Un solo commit al final** (atomico) porque las
partes no son separables: las variables nuevas dependen unas de
otras (e.g. btn-variables depende de input-btn-variables).

### Paso 1 — Backup adicional pre-T-202

Recomendacion: tomar un backup adicional del estado actual
(`0d3ac5f`) antes de empezar. Ya hay un backup en
`/tmp/backups/template-e-comerce-ui-20260521-093916.tar.gz`
del estado pre-T-201 (HEAD `cda3f4f`). Esto da dos restore
points distintos.

Duracion: 1 min.

### Paso 2 — Reestructurar el header del archivo

Anadir al inicio de `_variables.scss` un header documental
multilinea que explique:

- Linaje (codigo propio + integraciones de ui-core con atribucion)
- Convencion de naming (`$component-state-property-size` segun
  Bootstrap/CoreUI, formalizado aqui como D4)
- Politica de `!default`
- Politica de `// fusv-disable` para variables reservadas
- Politica de `// scss-docs-start/end NAME` para secciones
  documentables

Duracion: 5 min.

### Paso 3 — Anadir `!default` a las 222 variables existentes

Decision 6 del alcance: todas las variables con `!default`.

Actualmente: 8 con `!default` (las 7 anticipadas + 1 colateral),
222 sin `!default`.

Implementacion: script Python que toma cada `^\$X: VALUE;` y lo
convierte a `^\$X: VALUE !default;`, conservando comentarios
inline.

Validacion intermedia tras paso 3:
- `npm run lint:scss-compile` debe seguir pasando.
- `npm test` debe seguir pasando.
- `fusv` debe reportar igual numero de muertas (no debe cambiar).

Duracion: 10 min (5 script + 5 verificacion).

### Paso 4 — Reorganizar las secciones existentes con marcadores `scss-docs-*`

Aplicar a las 18 secciones existentes el patron de ui-core:

```scss
// scss-docs-start primary-colors
$primary-color:        #C5A572 !default;
$primary-color-dark:   #B08A4F !default;
// scss-docs-end primary-colors
```

No reordena variables, solo anade marcadores. Esto permite
futuras herramientas de extraccion de documentacion.

Validacion intermedia: igual que paso 3.

Duracion: 15 min.

### Paso 5 — Absorber las 2 colisiones decididas

**`$white`**: cambiar `#FFFFFF` a `#fff` (estilistico).

**`$escaped-characters`**: comparar contenido linea por linea.
Si ui-core tiene caracteres adicionales codificados, absorberlos.
Si es identico, dejar.

Validacion intermedia: igual.

Duracion: 5 min.

### Paso 6 — Anadir las ~550 variables nuevas en secciones nuevas

Este es el paso mayor. Procedimiento por seccion:

1. Copiar el bloque `// scss-docs-start NAME ... scss-docs-end NAME`
   completo de ui-core.
2. Adaptar references `--cui-` a `--ec-`.
3. Anadir `!default` (ui-core ya lo trae, doble check).
4. Si la seccion es de un componente "DIFERIR-pero-portar" (categoria
   D del inventario T-103), envolver el bloque con
   `// fusv-disable` / `// fusv-enable`.
5. Insertar la seccion en su lugar logico de
   `_variables.scss` segun el orden funcional (colores antes de
   componentes que los usan, etc).

Las secciones se procesan en este orden de dependencia:

1. `aspect-ratios` (mapa, sin deps)
2. `color-variables` (10 colores base)
3. `colors-map` (mapa)
4. `gray-color-variables` (los 6 que no colisionan + map)
5. `theme-color-variables` (semanticos)
6. `theme-colors-map` (mapa)
7. `font-sizes` (mapa)
8. `font-variables` (las que no colisionan)
9. `border-variables` (las que no colisionan)
10. `box-shadow-variables`
11. `headings-variables`
12. `display-headings`
13. `type-variables`
14. `focus-ring-variables` (necesario para T-207)
15. `zindex-stack` (las que no colisionan)
16. `zindex-levels-map`
17. `grid-breakpoints` (necesario para T-205)
18. `cq-grid-breakpoints`
19. `spacer-variables-maps`
20. `input-btn-variables` (base para btn y input)
21. `btn-variables` (filtradas)
22. `btn-ghost-variables`
23. `btn-outline-variables`
24. `card-variables` (filtradas)
25. `close-variables`
26. `form-input-variables` (filtradas)
27. `form-label-variables`
28. `form-text-variables`
29. `form-check-variables`
30. `form-feedback-variables`
31. `form-file-variables`
32. `form-validation-colors`
33. `form-validation-states`
34. `form-select-variables`
35. `form-switch-variables`
36. `form-floating-variables` (con `fusv-disable`)
37. `input-group-variables` (con `fusv-disable`)
38. `header-variables` (filtradas)
39. `sidebar-variables` (filtradas)
40. `sidebar-nav-variables`
41. `sidebar-toggler`
42. `footer-variables` (con `fusv-disable`)
43. `nav-variables` (con `fusv-disable`)
44. `modal-variables`
45. `toast-variables`
46. `spinner-variables`
47. `table-variables`
48. `table-loop`
49. `theme-bg-subtle-variables` (con `fusv-disable`)
50. `theme-border-subtle-variables` (con `fusv-disable`)
51. `theme-text-variables` (con `fusv-disable`)
52. `theme-gradients`

Validacion **por bloques** (cada 10 secciones):
- `npm run lint:scss-compile` debe seguir pasando.
- `npm test` (suite completa) debe seguir verde.
- `fusv` debe mostrar incremento controlado de variables muertas
  (esperado: las que llevan `fusv-disable` no cuentan).

Duracion: 60 min.

### Paso 7 — Reconectar el bloque de variables anticipadas de T-201

El bloque "VARIABLES MINIMAS PARA SISTEMA DE FUNCIONES
PORTADAS (T-201)" al final del archivo se elimina y sus 7
variables se distribuyen en sus secciones correctas:

| Variable T-201 | Destino en T-202 |
|----------------|------------------|
| `$white` | seccion `color-variables` (absorbida + actualizada a `#fff`) |
| `$black` | seccion `color-variables` (preservada en `#000`) |
| `$min-contrast-ratio` | seccion `color-variables` |
| `$color-contrast-dark` | seccion `color-variables` |
| `$color-contrast-light` | seccion `color-variables` |
| `$escaped-characters` | seccion propia `escaped-characters` |
| `$prefix` | seccion propia al inicio (despues del header) |

Tras este paso, el archivo queda sin bloques "anticipados";
todo en su lugar logico.

Duracion: 10 min.

### Paso 8 — Validacion end-to-end + commit

```
npm run lint:style          # debe pasar limpio
npm run lint:scss-compile   # 102 SCSS entries clean
npm run lint:scss-vars      # delta controlado de muertas
npm test                    # 815 total esperado, 2 failed heredados
npm run verify-build        # OK
```

Si pasa todo: commit unico con mensaje extensivo declarando:
- Las 8 colisiones identicas (sin cambio)
- Las 56 preservadas (con lista)
- Las 2 absorbidas (con razon)
- Las ~52 secciones nuevas portadas (con conteos)
- Las ~21 secciones diferidas (con razon)
- El delta de `fusv` esperado
- El delta de tests (esperado 0 si no se rompen)

Duracion: 15 min (validacion + commit + push-equivalente).

## Estimacion total

| Paso | Esfuerzo |
|------|----------|
| 1 Backup | 1 min |
| 2 Header | 5 min |
| 3 `!default` masivo | 10 min |
| 4 Marcadores `scss-docs-*` | 15 min |
| 5 Absorber 2 colisiones | 5 min |
| 6 Anadir ~52 secciones nuevas | 60 min |
| 7 Reconectar bloque T-201 | 10 min |
| 8 Validacion + commit | 15 min |
| **Total** | **121 min** |

Coincide con la estimacion del replan (120 min).

## Riesgos identificados y mitigaciones

### Riesgo 1 — Componentes existentes se rompen visualmente

Probabilidad: media. Impacto: alto.

**Mitigacion**:
- T-202 no toca ninguna de las 230 variables existentes en valor;
  solo anade `!default` y marcadores.
- Las 56 preservadas mantienen su valor exacto.
- Las 2 absorbidas (`$white`, `$escaped-characters`) son
  estilisticas o aditivas.
- Los 815 tests Jest siguen sirviendo de regresion estructural.
- `npm run verify-build` valida compilacion completa.

### Riesgo 2 — Variables nuevas crean cadenas circulares de referencia

Probabilidad: baja. Impacto: alto (build se rompe).

**Mitigacion**:
- Orden de las 52 secciones en paso 6 explicitamente diseñado
  para respetar dependencias.
- Validacion tras cada bloque de 10 secciones detecta inmediatamente
  cualquier ciclo.

### Riesgo 3 — `fusv` se dispara con cientos de variables muertas nuevas

Probabilidad: alta. Impacto: bajo si bien gestionado.

**Mitigacion**:
- Toda variable de seccion "futura/reservada" (~120 vars) lleva
  `fusv-disable`/`fusv-enable` desde el momento de portacion.
- Las variables de secciones activas (color-variables,
  theme-color-variables, etc) **se usan inmediatamente** porque
  T-205 (mixins) y T-208 (root selectivo) las consumiran.
- El delta `fusv` se mide tras T-202 y se documenta. Si excede 200
  muertas absolutas, registrar como hallazgo organico que requiere
  ajuste de scope.

### Riesgo 4 — Colisiones decididas mal

Probabilidad: media. Impacto: medio.

**Mitigacion**:
- Las 56 preservadas estan listadas en este documento con su
  valor exacto. T-202 verifica linea por linea durante ejecucion.
- Si durante el commit aparece colision no listada aqui, **parar
  y registrar como hallazgo**.

### Riesgo 5 — Tiempo excede 120 min significativamente

Probabilidad: media. Impacto: bajo.

**Mitigacion**:
- T-202 se ejecuta en un solo commit pero con validacion tras
  cada uno de los 8 pasos. Si paso N falla, los pasos 1..N-1 ya
  estan en working tree; se puede revertir paso N o hacer commit
  parcial.
- Si la estimacion 120 min se supera en mas de 50% (>180 min),
  registrar como hallazgo y considerar dividir T-202 en T-202a
  (`!default` + marcadores) + T-202b (secciones nuevas).

## Decisiones tomadas en este analisis sin pausar

1. **No portar variables de componentes DIFERIDOS**. Categoria D
   del inventario T-103: accordion, alert, autocomplete, avatar,
   calendar, carousel, dropdown, date-picker, range-slider,
   rating, time-picker, tooltip, popover, etc. Sus ~720
   variables no se anaden a `_variables.scss` en T-202. Quedan
   accesibles en `/tmp/references/ui-core-5.25.0/` para futura
   portacion reactiva cuando aparezca el caso de uso.

2. **Variables de componentes en T-103 marcados DIFERIR pero con
   variables que el template podria necesitar pronto** (footer,
   nav, theme-subtle, form-floating, form-otp): **portar con
   `fusv-disable`** para que esten listas sin disparar el
   linter.

3. **Para las 56 colisiones diferentes preservar-nuestro**: NO
   se anaden las versiones de ui-core con prefijo `cui-` ni con
   ningun otro prefijo. Esto crearia dos sistemas paralelos
   (`$btn-padding-y` nuestro de 10px y `$cui-btn-padding-y` de
   ui-core con su valor). Confuso y duplicacion. **Se mantiene
   solo el nuestro**; cuando los mixins portados de ui-core
   referencien `$btn-padding-y`, leeran nuestro valor (que es la
   semantica correcta para nuestro template).

4. **Ningun renombrado de variables existentes**. Las 230
   variables del template mantienen exactamente el nombre que
   tienen. Esto preserva todos los consumers en
   `.module.scss` sin necesidad de migracion.

5. **Mantener camelCase no aplica aqui**: variables y mixins
   siguen kebab-case (igual que ui-core), CSS Modules clases
   siguen camelCase (decision arquitectonica preservada).

6. **No portar `gray-100`, `gray-300`, `gray-900`** que faltan
   en nuestra paleta gris... espera, **si portarlos**. Son
   completamientos triviales de nuestra escala 200-800 actual.
   Anadirlos da la escala completa 100-900 con `!default`.

## Que registra T-202 al cierre

Tres documentos se actualizan tras el commit de T-202:

1. **`progreso-*.md`**: tres filas (Inicio, Hallazgo, Cierre)
   + cambio de baseline si aplica.

2. **Comentario inline en `_variables.scss`** (al inicio, dentro
   del header documental): tabla resumen de la integracion T-202
   (X variables nuevas, Y secciones nuevas, Z preservadas, W
   absorbidas).

3. **Este documento** se referencia desde el commit message de
   T-202 como evidencia del plan ejecutado.

## Pre-condiciones para arrancar T-202

1. T-201 cerrada (HEAD `0d3ac5f`).
2. Working tree limpio antes de empezar.
3. Tests baseline `2 failed / 813 passed / 815 total`.
4. Backup `/tmp/backups/template-e-comerce-ui-20260521-093916.tar.gz`
   accesible (existe).
5. Este documento commiteado (T-202.5 = "Analisis T-202 producido").

## Cuando cerrar T-202

Criterios de aceptacion:

- [ ] `lint:style` pasa con 0 errores.
- [ ] `lint:scss-compile` pasa con 102 SCSS entries clean.
- [ ] `npm test` pasa con `2 failed / X passed / X+2 total` donde
      X >= 813 (no regresion).
- [ ] `npm run verify-build` pasa.
- [ ] `_variables.scss` tiene ~780 variables top-level y ~52
      secciones `scss-docs-*` nuevas.
- [ ] Bloque "VARIABLES MINIMAS PARA SISTEMA DE FUNCIONES
      PORTADAS (T-201)" eliminado; sus 7 variables redistribuidas.
- [ ] Las 56 preservadas mantienen su valor exacto.
- [ ] Las 2 absorbidas (`$white`, `$escaped-characters`) tienen
      su nuevo valor.
- [ ] `fusv` delta documentado en `progreso-*.md`.
- [ ] Tres filas en `progreso-*.md`: Inicio, Hallazgo, Cierre.
- [ ] Commit Tim Pope con mensaje extenso referenciando este
      documento.

## Que sigue tras T-202

1. **T-203** (variables-dark) — copiar `_variables-dark.scss` de
   ui-core. Trivial (no se importa desde main, preparacion para
   dark mode). 30 min.

2. **T-204** (maps) — portar `_maps.scss`. 45 min.

3. **T-205** (mixins) — la mayor de F1a despues de T-202.
   120 min.

T-202 cierra **el bloque mas pesado de F1a** y desbloquea T-203,
T-204, T-205 que ya tienen sus dependencias listas en
`_variables.scss`.
