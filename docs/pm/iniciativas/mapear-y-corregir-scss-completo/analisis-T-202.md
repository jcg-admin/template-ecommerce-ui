# Analisis exhaustivo y plan de integracion — T-202

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Tarea | T-202 (Fase F1a, **mas larga de la fase**) |
| Documento | Analisis previo a la integracion masiva del `_variables.scss` de ui-core en el nuestro |
| Fecha | 2026-05-21 |
| Origen de la solicitud | Mensaje del usuario "continua con el Analisis exhaustivo de T-202 con plan de integracion" |
| Naturaleza | Pure analisis. No toca codigo de produccion. Produce plan operativo para T-202. |
| Esfuerzo estimado original (replan) | 120 min |
| Esfuerzo estimado revisado tras este analisis | Ver seccion de estimacion al final |

## Por que este analisis es necesario

T-202 es **la tarea mas delicada de F1a** porque modifica el unico
archivo que **todo el resto del template consume**:
`src/styles/abstracts/_variables.scss`. Una colision mal resuelta
puede:

- Cambiar el aspecto visual de cualquier componente.
- Romper compilacion en cualquier `.module.scss`.
- Crear cascadas de regresiones difciles de revertir.

Por eso T-202 **no es una tarea de "copy-paste e integrar"** sino
de **decision nombre por nombre** con criterios documentados.

## Inventario cuantitativo

| Metrica | Valor |
|---------|-------|
| Variables en ui-core `_variables.scss` (2845 lineas) | **1687** |
| Variables en nuestro `_variables.scss` (405 lineas tras T-201) | **229** |
| Secciones nombradas en ui-core (`scss-docs-start`) | **94** |
| **Colisiones de nombre (mismas variables en ambos)** | **72** |
| Colisiones identicas (mismo valor) | **9** |
| Colisiones divergentes (necesitan decision) | **63** |
| Variables ui-core sin colision (porte limpio) | **1615** |

## Reglas operativas de la integracion

Aplicadas en orden de prioridad:

### Regla 1: variables identicas se omiten

Las 9 variables con valor identico ya existen en el template y
ya tienen `!default`. **No se duplican**. Si la version de ui-core
trae anotaciones interesantes (comentario), se conserva el
comentario en la nuestra (merge no destructivo).

### Regla 2: divergencias por "diseno propio del template" se mantienen

31 de las 63 divergencias son **valores intencionales del template
e-comerce-ui**. Ejemplos: `$primary: $primary-color`, `$gray-500:
#999999`, `$font-size-base: 15px` (nuestro template usa 15px
porque es decision de marca; ui-core usa 1rem que es 16px estandar
Bootstrap). **Se mantiene la nuestra**, se ignora la de ui-core.

### Regla 3: ui-core usa `var(--#{$prefix}X)`

14 colisiones donde ui-core referencia CSS custom properties que
todavia no existen en nuestro template. Estas custom properties
se crean en T-208 (root selectivo con `--ec-`). **Decision para
T-202**: mantener nuestra version (valor SCSS literal). Cuando
T-208 cree las custom properties correspondientes, una tarea
posterior (T-209 o T-401..T-407) puede actualizar selectivamente
estas variables a `var(--ec-X)` si conviene para theming dinamico.

### Regla 4: ui-core usa funciones SCSS

4 colisiones donde ui-core deriva el valor con `shade-color`,
`tint-color`, `color-contrast`, etc. Tras T-201, **nuestras
funciones estan disponibles**. Decision case-by-case:
- **Si el valor numerico del template es producto manual** de la
  funcion (e.g. `#1C5BD8` ~ `shade-color($indigo, 20%)` aproximado),
  **mantener nuestro valor literal** y anotar.
- **Si el valor del template puede regenerarse** sin perdida
  visual, **adoptar la formula de ui-core** (mejor DX, ajustable).

### Regla 5: ui-core usa indireccion via `$input-btn-*`

13 colisiones donde ui-core define una capa intermedia
`$input-btn-padding-x`, `$input-btn-font-size`, etc, y luego
`$btn-padding-x: $input-btn-padding-x`. Esto permite cambiar
inputs Y botones a la vez.

**Nuestro template** define `$btn-padding-x: 20px` directamente,
sin la indireccion.

**Decision T-202**:
- Anadir las variables `$input-btn-*` de ui-core (no colisionan,
  son nuevas en nuestro lado).
- **No** cambiar el valor de las nuestras `$btn-*` para que
  apunten a `$input-btn-*`. Conservar el diseno del template:
  botones tienen padding 20/10, inputs tienen 14/10. **Ya no
  comparten valor**.
- Anadir comentario inline donde colisione: `// Divergencia
  intencional vs ui-core: botones del template usan padding mas
  generoso que inputs.`

### Regla 6: variables sin colision se portan

Las 1615 variables ui-core sin colision se portan a su seccion
correspondiente. Todas con `!default`. **No** se prefijan con
`ec-`; mantienen su nombre original (`$gray-100`, `$gray-300`,
`$indigo`, `$navbar-bg`, etc).

### Regla 7: variables que dependen de otras se ordenan correctamente

Las nuevas variables a menudo dependen de variables que **deben
estar declaradas antes**. T-202 respeta el orden topologico de
ui-core (que ya esta correcto). El bloque anticipado de T-201
**se elimina** y sus 7 variables se absorben en su seccion
canonica.

### Regla 8: secciones de componentes sin uso en el template se difieren

Aplicando el criterio del inventario T-103 ("diferir componentes
sin uso"): las secciones de variables para componentes que el
template no usa hoy **no se portan en T-202**. Se portan
reactivamente cuando T-209 o F4a los necesite.

Componentes que SI se portan en T-202 (necesarios HOY):
- gray-color-variables + gray-colors-map
- color-variables + colors-map (paleta base)
- theme-color-variables (semantic primary/secondary/etc)
- spacer-variables-maps (sistema espacial)
- grid-breakpoints (responsive)
- border-variables + border-radius-variables
- box-shadow-variables
- focus-ring-variables (relevante para T-207)
- font-variables, font-sizes, headings, type-variables
- input-btn-variables (capa intermedia)
- btn-variables (template tiene botones)
- form-input-variables (template tiene forms)
- card-variables (template tiene Card)
- modal-variables (template tiene Modal)
- toast-variables (template tiene Toast)
- badge-variables (template tiene Badge)
- table-variables (template tiene Admin tables)
- sidebar-variables (template tiene Sidebar)
- header-variables (template tiene Header)
- transitions (zindex-stack)
- zindex-stack + zindex-levels-map (template lo necesita en T-301)

Componentes que **se difieren** (T-209 cuando aparezca necesidad):
- accordion, alert, autocomplete, avatar, breadcrumb, button-group,
  calendar, callout, carousel, chip, close, collapse-transition,
  dropdown, figure, footer (variables de footer SI van, son
  reservadas; el componente se difiere), list-group, nav, navbar,
  offcanvas, pagination (re-evaluar), placeholders, popover,
  progress, range-slider, rating, spinner (SI va, lo usamos en
  Toast/LoadingButton), stepper, thumbnail, time-picker, tooltip,
  vr, date-picker, form-multi-select, form-otp, form-password,
  form-range, calendar, autocomplete, sidebar-narrow, sidebar-nav.

### Regla 9: orden de declaracion DENTRO de cada seccion

Tras integrar, el orden interno de cada seccion sigue el de
ui-core (que ya cumple dependencia topologica). Las variables
nuevas se intercalan con las nuestras existentes:
- Primero las de ui-core (con `!default`).
- Despues las propias del template marcadas con comentario
  `// Variable propia del template (no en ui-core)`.

### Regla 10: bloque anticipado de T-201 se reabsorbe

Las 7 variables anticipadas al final de `_variables.scss` en
T-201 (`$white`, `$black`, `$min-contrast-ratio`,
`$color-contrast-dark`, `$color-contrast-light`,
`$escaped-characters`, `$prefix`) se eliminan del bloque
"VARIABLES MINIMAS PARA SISTEMA DE FUNCIONES PORTADAS (T-201)"
y se distribuyen en sus secciones canonicas:
- `$white`, `$black` -> seccion gray-color-variables.
- `$min-contrast-ratio` -> seccion type-variables o adjacente.
- `$color-contrast-dark`, `$color-contrast-light` -> idem.
- `$escaped-characters` -> seccion estructural antes de los
  componentes.
- `$prefix` -> seccion estructural (declaracion del namespace).

## Detalle de las 9 colisiones identicas

| Variable | Valor compartido | Decision |
|----------|------------------|----------|
| `$color-contrast-dark` | `$black` | Identica. Mantener la nuestra. Si ui-core trae comentario adicional, fusionar. |
| `$color-contrast-light` | `$white` | Idem. |
| `$escaped-characters` | mapa de 5 entradas | Identica. La nuestra absorbe la posicion canonica. |
| `$font-weight-bold` | `700` | Identica. |
| `$font-weight-light` | `300` | Identica. |
| `$font-weight-medium` | `500` | Identica. |
| `$font-weight-normal` | `400` | Identica. |
| `$font-weight-semibold` | `600` | Identica. |
| `$min-contrast-ratio` | `4.5` | Identica. |

**Trabajo total para identicas**: cero. Solo verificar que el
orden de declaracion final coincide con ui-core (las del
template van en la posicion canonica).

## Detalle de las 63 colisiones divergentes

Categorizadas en 5 grupos. Decision aplicada de Reglas 2-5.

### Grupo A: diseno propio del template (31 variables)

**Decision: mantener TODAS las nuestras**. Conservar el diseno
visual del template e-comerce-ui. ui-core es referencia para
estructura, no para valores de marca.

| Variable | Nuestro valor (conservar) | ui-core (descartar) | Razon |
|----------|---------------------------|---------------------|-------|
| `$badge-font-size` | `$font-size-xs` | `.75em` | Sistema tipografico del template usa escala absoluta, no relativa. |
| `$badge-font-weight` | `$font-weight-semibold` | `$font-weight-bold` | Decision visual del template. |
| `$badge-padding-x` / `-y` | `8px` / `3px` | `.65em` / `.35em` | Padding absoluto del template. |
| `$black` | `#000` | `#080a0c` | Negro puro vs casi-negro ui-core. Decision visual. |
| `$border-color` | `#E8E0D5` | `$gray-300` | Color de marca (beige claro). |
| `$border-radius` | `$border-radius-md` | `.375rem` | Sistema modular del template usa $border-radius-md (8px). |
| `$border-radius-sm/lg/xl/2xl` | px values | rem values | Sistema en pixels del template. |
| `$btn-font-weight` | `$font-weight-semibold` | `$font-weight-normal` | Boton del template usa peso 600 (mas presencia visual). |
| `$btn-transition` | `$transition-default` | `color .15s ...` (composicion larga) | Token `$transition-default` cubre el uso del template. |
| `$font-size-base/lg/sm` | `15px/18px/13px` | `1rem` y multiplos | Sistema en pixels del template, no rem. |
| `$gray-200..800` (6 vars) | escala monocromatica `#EEEEEE..#333333` | escala azulada `#e7eaee..#323a49` | **Decision visual de marca**: el template usa grises neutros; ui-core usa grises con tinte azul (Bootstrap). |
| `$indigo-500` | `#4A5FC1` | `$indigo` | Color marca, NO el indigo base. |
| `$input-transition` | `$transition-default` | composicion larga | Idem que `$btn-transition`. |
| `$primary/success/warning` | aliases a vars de marca | hex literales propios | Aliases del template apuntan a sistema centralizado. |
| `$sidebar-transition` | `width 300ms ease-out` | composicion larga | Diseno propio. |
| `$sidebar-width` | `260px` | `16rem` (= 256px) | Diseno propio. |
| `$transition-base` | `250ms ease` | `all .2s ease-in-out` | Sistema propio. |
| `$white` | `#FFFFFF` | `#fff` | Equivalentes; mantener el nuestro por consistencia con `#000`. |

**Anotacion en el archivo final** para cada una: `// Diseno propio
del template, valor difiere intencionalmente de ui-core.`

### Grupo B: ui-core usa CSS custom properties (14 variables)

**Decision: mantener las nuestras** (valor SCSS literal). T-208
creara las custom properties con prefijo `--ec-`. En T-208 o
posterior, se puede convertir selectivamente alguna a
`var(--ec-X)` para theming.

| Variable | Nuestro (conservar T-202) | ui-core (referencia T-208+) |
|----------|---------------------------|-----------------------------|
| `$badge-border-radius` | `$border-radius-full` | `var(--#{$prefix}border-radius)` |
| `$btn-border-radius` | `$border-radius-md` | `var(--#{$prefix}border-radius)` |
| `$card-bg` | `$bg-surface` | `var(--#{$prefix}body-bg)` |
| `$card-border-radius` | `$border-radius-lg` | `var(--#{$prefix}border-radius)` |
| `$font-family-base` | family stack literal | `var(--#{$prefix}font-sans-serif)` |
| `$footer-bg` | `$secondary-dark` | `var(--#{$prefix}tertiary-bg)` |
| `$header-bg` | `$bg-surface` | `var(--#{$prefix}body-bg)` |
| `$input-bg` | `$bg-surface` | `var(--#{$prefix}body-bg)` |
| `$input-border-color` | `$border-color` | `var(--#{$prefix}border-color)` |
| `$input-border-radius` | `$border-radius-md` | `var(--#{$prefix}border-radius)` |
| `$input-color` | `$text-primary` | `var(--#{$prefix}body-color)` |
| `$input-placeholder-color` | `$text-muted` | `var(--#{$prefix}secondary-color)` |
| `$sidebar-bg` | `$secondary-color` | `var(--#{$prefix}body-bg)` |
| `$text-muted` | `#9C8A7A` | `var(--#{$prefix}secondary-color)` |

**Anotacion en el archivo final**: `// ui-core lo expone via
var(--ec-X); template usa valor SCSS literal hasta T-208.`

### Grupo C: ui-core usa funciones SCSS (4 variables)

Tras T-201, nuestras funciones `shade-color`, `tint-color`,
`shift-color`, `color-contrast` estan operativas. Decision
case-by-case:

| Variable | Nuestro | ui-core | Decision T-202 |
|----------|---------|---------|-----------------|
| `$indigo-600` | `#1C5BD8` | `shade-color($indigo, 20%)` | **Mantener nuestro**. Aproximacion manual del template; cambiar a la formula alteraria el valor (`shade(#5856d6, 20%) = #4645ab`, distinto). El nuestro es decision visual. |
| `$indigo-700` | `#1A4F8B` | `shade-color($indigo, 40%)` | Mantener nuestro (mismo razonamiento). |
| `$indigo-900` | `#14296B` | `shade-color($indigo, 80%)` | Mantener nuestro. |
| `$input-focus-border-color` | `$primary-color` | `tint-color($primary, 50%)` | **Considerar adoptar la formula** en una tarea futura: el focus debe ser mas claro que primary para distinguirse visualmente. Por ahora T-202 mantiene el nuestro. Anota en TODO. |

### Grupo D: ui-core usa indireccion `$input-btn-*` (13 variables)

ui-core define una capa intermedia para compartir tokens entre
inputs y botones:

```scss
// En ui-core:
$input-btn-padding-y:   .375rem;
$input-btn-padding-x:   .75rem;
$input-btn-font-size:   $font-size-base;
$input-btn-line-height: $line-height-base;

$btn-padding-y:   $input-btn-padding-y;
$btn-padding-x:   $input-btn-padding-x;
$input-padding-y: $input-btn-padding-y;
$input-padding-x: $input-btn-padding-x;
```

Nuestro template **define los `$btn-*` y `$input-*` directamente
con valores distintos** (botones 20/10, inputs 14/10). Esto es
**diseno intencional**: botones tienen padding mas generoso que
inputs.

**Decision T-202**:
1. **Anadir** las variables `$input-btn-*` de ui-core al template
   (no colisionan, son nuevas). Sirven como capa de tokens de
   referencia.
2. **NO cambiar** los valores nuestros de `$btn-*` y `$input-*`.
3. Anotar en cada uno: `// Divergencia intencional vs ui-core:
   botones del template usan padding 20/10, inputs 14/10. La
   indireccion $input-btn-* esta disponible pero no se usa.`

### Grupo E: definicion estructural (1 variable)

`$prefix`:
- Nuestro: `"ec-"` (decision D-PREFIJO).
- ui-core: `$variable-prefix` (alias indirecto).

**Decision**: mantener nuestra version. T-201 ya la introdujo
correctamente. En T-202, **NO anadir** `$variable-prefix` de
ui-core porque introduciria un alias que apunta a algo distinto.

## Variables ui-core sin colision a portar (1615 variables)

Estas son las que aportan **el valor real** de la integracion.
Se portan por seccion respetando dependencias topologicas.

### Secciones criticas para F1a/F4a (portar SI o SI)

| Seccion | Variables aprox | Justificacion |
|---------|-----------------|---------------|
| gray-color-variables | 12 | Paleta gris extendida (`$gray-100` a `$gray-1000`). Base del sistema. |
| gray-colors-map | 1 (mapa) | Para iteracion en T-208 (root). |
| color-variables | 100+ | Paleta extendida (red-100 a red-1000, blue, green, etc). Decision: portar **solo** las hue families presentes en nuestro template hoy: indigo, gray, blue, green, red, orange, yellow. Diferir: pink, purple, teal, cyan. |
| colors-map | 1 | Idem. |
| theme-color-variables | ~10 | `$primary`, `$secondary`, `$success`, etc. Aqui hay colisiones (Grupo A); las nuevas como `$tertiary`, `$light`, `$dark` se anaden. |
| theme-colors-map | 1 | Mapa de theme-colors. |
| spacer-variables-maps | 1 mapa + ~5 vars | `$spacers` mapa con multiplicos de `$spacer`. Util para utility classes (si se introducen). |
| position-map | 1 | Para offcanvas/dropdown (diferido). Conservar como API publica. |
| icon-link-variables | 4 | Para componente icon-link (diferido). Conservar. |
| grid-breakpoints | 1 mapa | Mapa canonico `xs:0, sm:576px, md:768px, lg:992px, xl:1200px, xxl:1400px`. **Critico para mixin media-up de T-205**. |
| cq-grid-breakpoints | 1 mapa | Container queries breakpoints. Util. |
| container-max-widths | 1 mapa | `$container-max-widths` mapa. |
| border-variables | 4 | `$border-width`, `$border-style`, `$border-color`, `$border-color-translucent`. |
| border-radius-variables | ~10 | `$border-radius` family ampliada. |
| box-shadow-variables | 5 | `$box-shadow-sm`, `$box-shadow`, `$box-shadow-lg`, `$box-shadow-inset`. |
| focus-ring-variables | 5 | `$focus-ring-width`, `$focus-ring-opacity`, `$focus-ring-color`, `$focus-ring-blur`, `$focus-ring-box-shadow`. **Critico para T-207**. |
| caret-variables | 4 | Para dropdown (diferido pero usadas por mas componentes). |
| collapse-transition | 2 | Util para colapsables (diferido pero util). |
| aspect-ratios | 1 mapa | `$aspect-ratios`. Util para imagenes. |
| font-variables | ~10 | `$font-family-sans-serif`, `$font-family-monospace`, etc. |
| font-sizes | 1 mapa | `$font-sizes`. |
| headings-variables | ~10 | `$headings-margin-bottom`, etc. |
| display-headings | ~10 | `$display-font-sizes` mapa. |
| type-variables | ~15 | Texto general (`$paragraph-margin-bottom`, etc). |
| vr-variables | 4 | Vertical rule (diferido). |
| table-variables | ~30 | Tablas (template tiene admin tables). **Portar**. |
| table-loop | 1 | Iteracion de variantes. |
| input-btn-variables | ~15 | Capa intermedia (Grupo D arriba). **Portar**. |
| btn-variables | ~25 | Botones. **Portar**. (Algunas colisionan con Grupo A) |
| btn-outline-variables | 5 | Botones outline. |
| btn-ghost-variables | 5 | Botones ghost (ui-core Pro). |
| form-text-variables | 3 | Texto descriptivo de form. |
| form-label-variables | 5 | Etiquetas. |
| form-input-variables | ~30 | Inputs. **Portar**. |
| form-check-variables | ~25 | Checkbox/Radio. **Portar**. |
| form-switch-variables | 8 | Switches. |
| form-otp-variables | 8 | OTP (diferido). |
| form-password-variables | 5 | Password input (diferido). |
| input-group-variables | 5 | Input groups (diferido). |
| form-select-variables | ~10 | Select. **Portar**. |
| form-range-variables | ~10 | Range slider (diferido). |
| form-file-variables | 3 | File input (diferido). |
| form-floating-variables | 8 | Floating labels (diferido). |
| form-feedback-variables | 5 | Mensajes de validacion. **Portar**. |
| form-validation-colors / states | ~10 | Estados de validacion. **Portar**. |
| zindex-stack | 1 mapa | **Critico** para resolver T-301 (variables muertas z-*). |
| zindex-levels-map | 1 mapa | Niveles de z-index. |
| card-variables | ~15 | **Portar** (template tiene Card). |
| modal-variables | ~30 | **Portar** (template tiene Modal). |
| toast-variables | ~12 | **Portar** (template tiene Toast). |
| badge-variables | ~10 | **Portar** (template tiene Badge). |
| header-variables | ~15 | **Portar** (template tiene Header). |
| sidebar-variables | ~15 | **Portar** (template tiene Sidebar). |
| footer-variables | 5 | **Portar** (variables reservadas, componente diferido). |
| spinner-variables | 5 | **Portar** (usado por Toast loading button). |
| close-variables | 4 | **Portar** (usado por Modal/Toast close button). |
| breadcrumb-variables | 5 | Diferir (verificar uso). |
| pagination-variables | ~15 | Diferir (verificar uso en catalog/admin). |

### Secciones a diferir completamente (no se portan en T-202)

Su uso no es necesario para F1a/F4a; se portan reactivamente
cuando T-209 o F4a las necesite. Estimacion ~700 variables
diferidas:

- accordion-variables (38 vars)
- alert-variables (17 vars)
- avatar-variables (56 vars)
- callout-variables (25 vars)
- carousel-variables (31 vars)
- date-picker-variables (101 vars)
- calendar-variables (59 vars)
- dropdown-variables (36 vars + dark)
- navbar-variables (31 vars + dark)
- nav-variables (53 vars)
- offcanvas-variables (33 vars)
- popover-variables (33 vars)
- progress-variables (17 vars)
- list-group-variables (31 vars)
- placeholders (7 vars)
- range-slider-variables (47 vars)
- rating-variables (13 vars)
- stepper-variables (44 vars)
- tooltip-variables + feedback (31 vars)
- thumbnail-variables (12 vars)
- figure-variables (8 vars)
- autocomplete-variables (109 vars)
- form-multi-select-variables (145 vars)
- time-picker-variables (102 vars)
- form-otp + password + range + file + floating (~ 50 vars)
- input-group-variables (9 vars)
- carousel-dark-variables (6 vars)
- sidebar-nav-variables (75 vars) - diferir (re-evaluar en T-209)
- sidebar-toggler (15 vars) - diferir
- chip variables (no documentadas) - diferir

**Estimacion variables a diferir**: ~700-800.

### Resultado neto T-202

| Item | Antes T-202 | Despues T-202 |
|------|-------------|----------------|
| Variables en `_variables.scss` | 229 | ~**800-900** (porte selectivo, no completo) |
| Lineas del archivo | 405 | ~**1200-1500** |
| Mapas SCSS | 0 | ~**12** (colors, theme-colors, grays, spacers, breakpoints, sizes, etc) |
| Secciones con `scss-docs-start/end` | 0 | **~40** |

## Orden topologico de integracion

Para no romper compilacion durante el trabajo, las secciones se
portan en este orden estricto. Cada nueva seccion solo puede
depender de las ya portadas:

```
1. estructurales       (prefix, variable-prefix-alt -- ya esta)
2. gray-color-variables
   gray-colors-map
3. color-variables
   colors-map
4. theme-color-variables   (depende de colors)
   theme-colors-map
   theme-text-variables
   theme-bg-subtle-variables
   theme-border-subtle-variables
   theme-gradients
   variable-gradient
5. spacer-variables-maps
6. grid-breakpoints
   container-max-widths
7. border-variables       (depende de gray)
   border-radius-variables
8. box-shadow-variables
9. focus-ring-variables   (depende de theme colors)
10. font-variables
    font-sizes
    headings-variables
    display-headings
    type-variables
11. zindex-stack
    zindex-levels-map
12. input-btn-variables   (depende de borders, font, etc)
13. btn-variables         (depende de input-btn-*)
    btn-outline-variables
    btn-ghost-variables
14. form-text-variables
    form-label-variables
    form-input-variables  (depende de input-btn-*)
    form-check-variables
    form-switch-variables
    form-select-variables
    form-feedback-variables
    form-validation-colors
    form-validation-states
15. card-variables
16. modal-variables
17. toast-variables
18. badge-variables
19. table-variables
20. spinner-variables
21. close-variables
22. header-variables
23. sidebar-variables
24. footer-variables
```

24 secciones a portar. Cada una con marker `// scss-docs-start
NAME` y `// scss-docs-end NAME` siguiendo el patron ui-core
(Decision 5 del alcance).

## Verificaciones obligatorias por seccion

Tras anadir cada seccion, ejecutar **mini-suite** antes de pasar
a la siguiente:

```bash
npm run lint:scss-compile   # 102 entries deben compilar limpio
npm test -- src/styles/tests/scss.test.js  # 21 tests SCSS pasan
```

Si una seccion rompe compilacion, **deshacer la seccion** y
diagnosticar (probablemente dependencia ausente). Esto es
sustituto del re-build webpack completo (mas lento).

Al final de T-202, verificacion completa:

```bash
npm test --silent                  # baseline 2/813/815 o mejor
npm run lint:style                 # 0 errores
npm run lint:scss-compile          # 102 entries clean
npm run lint:scss-vars             # delta vs 79 (algunas nuevas seran muertas)
npm run verify-build               # OK
```

## Riesgo conocido durante T-202

| Riesgo | Mitigacion |
|--------|------------|
| Compilacion rompe por dependencia en seccion no portada todavia | Orden topologico estricto (ver arriba). Si pasa, deshacer la seccion. |
| `$indigo` (sin sufijo) colisiona con uso futuro | Verificar antes de portar: si `$indigo` no esta en colisiones (no esta), portar sin problema. La nuestra `$indigo-500: #4A5FC1` se mantiene. |
| Variables nuevas (~700 anadidas) disparan fusv con count alto | Marcar las "diferidas a fin de F1a" o "reservadas" con `// fusv-disable / enable` segun categoria. |
| Aliases internos de ui-core (e.g. `$input-btn-padding-y` que solo se usa para componer `$btn-padding-y` y `$input-padding-y`) quedan muertos si los `$btn/$input` divergen | Mantener los `$input-btn-*` con `// fusv-disable` (son API publica de la capa de tokens). |
| El archivo crece de 405 a ~1500 lineas y se vuelve dificil de revisar | Usar markers `scss-docs-start/end` para navegar. Generar TOC en comentario al inicio. |
| Variables del template como `$bg-surface`, `$text-primary` que ui-core no tiene se mezclan con las portadas | Bloque separado al final: `// === Variables propias del template (no en ui-core) ===` para preservar identidad. |
| Las funciones portadas en T-201 dependen del bloque anticipado al final; al reabsorber, cuidar que sigan compilando | Reabsorcion gradual: mover de a una con compile-check. |

## Estimacion de esfuerzo refinada

El replan estimaba **120 min**. Tras este analisis, la estimacion
se afina considerando:

| Sub-tarea | Tiempo |
|-----------|--------|
| Decision por divergencia (63 vars) | 30 min (5 categorias ya decididas en este analisis) |
| Reabsorber bloque anticipado de T-201 (7 vars a sus secciones) | 15 min |
| Portar 24 secciones con orden topologico, cada una compile-check | 90 min (~4 min/seccion incluyendo paste, scss-docs markers, validacion) |
| Anadir secciones de variables propias del template al final | 10 min |
| Verificacion final end-to-end (tests + build + lint) | 15 min |
| Registrar progreso, escribir commit, manejar fusv-disables | 20 min |
| **Total** | **~180 min (3 h)** |

**Esfuerzo revisado: 180 min** (50% mas que el original 120).
La razon: 63 decisiones de divergencia consumen mas tiempo del
estimado inicial, y el archivo final es ~1500 lineas que requieren
revision.

## Resumen ejecutivo del plan

| Paso | Accion |
|------|--------|
| **1** | Reabsorber bloque anticipado de T-201 (7 variables) en sus secciones canonicas. |
| **2** | Anadir scss-docs markers a las secciones existentes del template (preparacion). |
| **3** | Portar 24 secciones de ui-core en orden topologico, una por una con compile-check entre cada. |
| **4** | Por cada divergencia: aplicar la decision documentada en este analisis (Reglas 2-5). |
| **5** | Anadir comentario inline en colisiones documentando la decision. |
| **6** | Marcar como `// fusv-disable` las variables "reservadas" sin uso inmediato. |
| **7** | Verificacion end-to-end: tests, lint, build. |
| **8** | Commit unitario con changelog detallado. |

## Decisiones pendientes que el usuario podria querer cambiar

Antes de ejecutar T-202, listo decisiones de este analisis donde
me importa confirmar contigo, aunque la regla "tomar la mejor
decision" me autoriza a proceder con las que he tomado:

| Decision | Mi propuesta | Alternativa |
|----------|--------------|-------------|
| **Componentes a diferir** | Diferir ~700 variables (accordion, calendar, date-picker, etc) | Portarlas todas ahora |
| **Grupo A divergencias** | Mantener TODAS las nuestras intactas | Adoptar alguna(s) de ui-core selectivamente |
| **Grupo C funciones SCSS** | Mantener nuestros hex literales en `$indigo-*` | Regenerar con `shade-color($indigo, X%)` para mejor DX |
| **Esfuerzo** | 180 min sin pausar entre secciones | Dividir T-202 en T-202a..T-202d para commits intermedios |

Si **no respondes** a estas decisiones, aplico mi propuesta tal
cual y procedo (regla del usuario "toma la mejor decision sin
pausar").

## Lo que NO hace T-202

Recordatorio explicito de scope:

- **NO** crea CSS custom properties con `--ec-X`. Eso es T-208.
- **NO** crea mapas en `:root`. Eso es T-208.
- **NO** activa dark mode. Las variables-dark se portan en T-203
  como referencia inerte.
- **NO** toca `.module.scss` de ningun componente. Eso es F4a.
- **NO** elimina las variables muertas existentes del template
  (T-003/T-301 reformulada).
- **NO** cambia el orden de declaracion de las variables propias
  del template existentes (preserva identidad del archivo).

## Que sigue

Tras commit de este analisis:

1. **Ejecutar T-202** siguiendo el plan documentado aqui.
2. **Commit unitario** de T-202 cuando todo este verde.
3. **Pasar a T-203** (portar `_variables-dark.scss` como
   preparacion inerte, 30 min).

Aunque T-202 toma ~180 min, su valor es **enorme**: prepara las
~24 secciones de tokens que **todas las tareas restantes de
F1a/F4a consumen**. Sin T-202, T-205 (mixins), T-208 (root),
T-209 (componentes como mixins) y T-401..T-407 (integracion en
.module.scss) no tienen base.
