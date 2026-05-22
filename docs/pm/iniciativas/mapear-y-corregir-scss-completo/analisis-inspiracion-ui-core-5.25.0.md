# Analisis de inspiracion — `ui-core-5.25.0`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Inspeccion del template de referencia `ui-core-5.25.0` para integrar patrones en nuestro template |
| Fecha | 2026-05-21 |
| Origen de la directiva | Solicitud del usuario tras ampliar el alcance: "no borres nada, integra de manera correcta". Aplicacion concreta: "si una variable o mixin no se usa en nuestro template, revisar como lo usa ui-core e integrar ese patron". |
| Repo de referencia | `/tmp/references/ui-core-5.25.0` (clonado de `https://github.com/NestorMonroy/ui-core-5.25.0`) |

## Naturaleza del template de referencia

`ui-core-5.25.0` es **CoreUI Pro v5.25.0**, una extension comercial
de Bootstrap 5. Confirmacion en `package.json`: nombre
`@ui/ui-pro`, version `5.25.0`, descripcion explicita de
"based on Bootstrap 5", dependencia `stylelint-config-twbs-bootstrap`.

**Es un template SCSS** (igual que nuestro `template-ecommerce-ui`),
no una "libreria de componentes" en el sentido de runtime. La
diferencia con nuestro template es la **capa de consumo del
SCSS**:

| Aspecto | nuestro template | ui-core |
|---------|------------------|---------|
| Tipo de proyecto | template SCSS | template SCSS |
| Capa de consumo | React + CSS Modules con scope local | clases globales tipo Bootstrap (`.btn`, `.card`, `.modal`) |
| Distribucion del SCSS | bundle de aplicacion | librería distribuible (`dist/css/coreui.css` + RTL + min) |
| Archivos SCSS | 125 | **210** |
| `_variables.scss` (lineas) | 370 | **2845** |
| Hex en `_variables.scss` | 56 | 94 |
| Hex fuera de variables | 17 (en `.module.scss` con disable inline) | 1 (en `_chip.scss`) |
| Helpers vs mixins | todo en `_mixins.scss` (52 mixins, 9 muertos) | **separados**: `mixins/` (33 archivos) + `helpers/` (12 archivos clase utility) + `functions/` (13 funciones) |
| `@use`/`@forward` | 129 + 2 | masivo, con bundles compuestos via `@forward` |
| Custom properties | 0 | **130+** en `_root.scss` |
| Dark mode | no | si (`_variables-dark.scss` + `[data-theme="dark"]`) |
| Sistema fusv (find unused vars) | no usado | usado como linter dedicado (`npm run css-lint-vars`) |
| `!default` en variables | no usado | usado en **todas** las variables (~2000+) |
| Mapas SCSS (`$key: ($k: $v, ...)`) | no usados | extensivos (`$grays`, `$colors`, `$theme-colors`, etc) |

**Implicacion central**: ui-core es un template SCSS **mucho mas
maduro** que el nuestro. La directiva "integrar siguiendo
ui-core" significa, en muchos casos, **adoptar patrones que
nuestro template no tiene** porque nunca llego a esa madurez.

## Que se puede inspirar y que no

### Si transferible (patrones agnostic a la capa de consumo)

- Estructura `mixins/` vs `helpers/` vs `functions/` (separacion por funcion).
- Uso de `!default` para permitir sobrescribir desde el adoptante.
- Uso de mapas SCSS para agrupar variables relacionadas.
- Patron `scss-docs-start NAME / scss-docs-end NAME` para
  delimitar secciones nombradas.
- Patron `fusv-disable / fusv-enable` para excluir variables del
  scan de muertas (cuando son API publica).
- Patron de exposicion de tokens como CSS custom properties en
  `_root.scss` iterando mapas (`@each`).
- Patron de variables deprecated: marcadas con comentario,
  envueltas en `fusv-disable`, **no eliminadas**.
- Pipeline `@forward` para bundles compuestos.
- Sistema de focus-ring con mixin + helper class + custom
  properties.
- Sistema de transitions con mixin parametrizado.
- Sistema de funciones SCSS para operaciones de color (contrast,
  translucent, shift).

### No transferible (depende de la capa de consumo)

- Clases globales tipo Bootstrap (`.btn`, `.card`). Nuestro
  template usa CSS Modules con scope local por componente. La
  decision arquitectonica esta tomada en `main.scss`: "No hay
  clases globales de componentes".
- Sistema de prefix (`--cui-X`). Nuestro template no necesita
  namespace porque no expone clases globales.
- RTL/LTR via CSS logical properties con bundle separado. Fuera
  de scope.
- Soporte para themes alternativos (`scss/themes/bootstrap/`).
  Fuera de scope.

## Inspeccion por dimension

Cada dimension del alcance se vuelve a evaluar a la luz de
ui-core. Para cada una: que tiene ui-core, que tenemos nosotros,
implicacion para nuestra fase correctiva.

### D1 — Tokens de diseno

#### Que tiene ui-core

- `_variables.scss` (2845 lineas) organizado en **bloques marcados**
  con `// scss-docs-start NAME` / `// scss-docs-end NAME` que
  delimitan secciones extraibles automaticamente para
  documentacion. ~40 secciones nombradas detectadas.
- **Todas las variables con `!default`**: `$primary: #5856d6 !default;`.
  Permite al adoptante sobrescribir antes del `@use`.
- **Mapas SCSS** para agrupar variables relacionadas:
  ```scss
  $colors: (
    "blue":   $blue,
    "indigo": $indigo,
    ...
  ) !default;
  ```
  Permite iterar con `@each` para generar CSS custom properties,
  utility classes, o variantes de componentes.
- Variables **deprecated** se conservan con comentario
  `// Deprecated in 5.0.0` y se envuelven en `fusv-disable`.
- Tokens separados en archivos: `_variables.scss`, `_variables-dark.scss`,
  `_maps.scss` (importado en `_root.scss`).

#### Que tenemos nosotros

- `_variables.scss` (370 lineas) organizado en **15 secciones
  numeradas con comentarios** pero sin marcadores extraibles
  programaticamente.
- **Ninguna variable con `!default`**: el adoptante no puede
  sobrescribir sin tocar el archivo.
- **Ningun mapa SCSS**: las variables se definen sueltas.
- 17 variables aliases de compatibilidad al final del archivo
  (`$bg-card = $card-bg`, etc) que parecen ser deuda de
  migracion.

#### Implicacion para fase correctiva

- **Anadir `!default` a todas las variables** (~223). Una sola
  tarea mecanica. Permite al adoptante sobrescribir tokens en
  fork.
- **Considerar marcadores `scss-docs-start/end`** para secciones
  que puedan documentarse. Aplicabilidad media: nuestro template
  no tiene generador de docs SCSS, pero el patron es bueno como
  disciplina de organizacion.
- **Considerar mapas SCSS** para grupos relacionados (colores
  primarios, espaciados, breakpoints). Aplicabilidad media: si
  vamos a generar CSS custom properties (D8), los mapas son
  utiles para iterar.
- **Los 17 aliases de compatibilidad** no son patron de ui-core.
  Son deuda nuestra. Decision: revocar la decision aprobada de
  "eliminar"; reemplazar por "documentar como deuda de
  migracion progresiva, programar migracion de consumers a
  nombres canonicos sin eliminar los aliases hasta que tengan
  0 consumers".

### D2 — Organizacion de archivos

#### Que tiene ui-core

```
scss/
├── coreui.scss                  ← bundle principal con @forward de todo
├── coreui-grid.scss             ← bundle solo grid
├── coreui-reboot.scss           ← bundle solo reboot
├── coreui-utilities.scss        ← bundle solo utilities
├── _variables.scss              ← 2845 lineas
├── _variables-dark.scss
├── _root.scss                   ← :root con custom properties
├── _<componente>.scss           ← uno por componente (~70 partials)
├── _<componente>.import.scss    ← entry individual `@forward "<componente>"`
├── mixins/                      ← 33 mixins reutilizables (sin output)
├── helpers/                     ← 12 clases utility (con output)
├── functions/                   ← 13 funciones SCSS
├── utilities/                   ← API de utilities + bg-gradients
├── forms/                       ← partials especificos de formularios
├── sidebar/                     ← partials especificos de sidebar
├── themes/                      ← themes alternativos (bootstrap)
└── vendor/                      ← vendoring de rfs (responsive font sizing)
```

**Separacion clave**: `mixins/` (codigo sin output) vs `helpers/`
(codigo con output que produce clases utility). Nuestro template
mezcla ambos en `_mixins.scss`.

**Patron `_<x>.import.scss`**: cada componente tiene un entry
"individual" que solo `@forward`-ea su partial. Permite al
adoptante importar solo lo que necesita sin todo el bundle.

#### Que tenemos nosotros

```
src/styles/
├── main.scss                    ← entry point del bundle global
├── abstracts/
│   ├── _index.scss              ← barrel: @forward variables + mixins
│   ├── _variables.scss
│   └── _mixins.scss             ← 52 mixins (algunos con output, otros sin)
├── base/                        ← 3 (reset, typography, animations)
├── components/                  ← 12 (buttons, forms, modal, ...) ← muchos huerfanos
├── layouts/                     ← 2 (sidebar, header)
├── accessibility/               ← 2 (focus-indicators)
└── utils/                       ← 1 (utilities)
```

#### Implicacion para fase correctiva

- **Separar `_mixins.scss` actual en dos directorios**: `mixins/`
  (sin output, p.ej. `flex-center`, `truncate-text`,
  `visually-hidden`) y `helpers/` (con output, p.ej. clases
  utility si se mantienen). Aplicabilidad alta como mejora de
  organizacion, baja como obligacion (nuestro template usa CSS
  Modules; los helpers como clases globales chocan con la
  arquitectura).
- **Anadir `functions/`** si introducimos funciones SCSS
  (probable cuando incorporemos sistema de contraste o
  manipulacion de color para dark mode).
- **`components/_animations.scss` huerfano**: ui-core lo separa
  en `_transitions.scss` (clases `.fade`, `.collapse`) y
  `_spinners.scss` (clases `.spinner-border`, `.spinner-grow`)
  con custom properties. Nuestro template tiene
  `components/_animations.scss` sin importer; **la directiva
  "integrar" implica conectarlo** como hace ui-core: importarlo
  desde `main.scss` Y aplicar sus clases utility en los
  componentes que las usan (Toast, modal, etc).

### D3 — Hex literales y allowlist

#### Que tiene ui-core

- **134 hex literales** en total: 94 en `_variables.scss`, 15 en
  `_variables-dark.scss`, 21 en `themes/bootstrap/bootstrap.scss`,
  2 en functions, 1 en `_chip.scss`, 1 en `_color-translucent.scss`.
- **Ningun `stylelint-disable-next-line color-no-hex`**: la
  regla `color-no-hex` **no la activan**.
- En su lugar usan disables para **otras** reglas: principalmente
  `function-disallowed-list` (90 veces), `declaration-no-important`
  (42), `property-disallowed-list` (12).
- Las disciplinas que **si** enforzan via stylelint son
  `function-disallowed-list` (evitar funciones SCSS deprecated
  como `lighten`/`darken`), `property-disallowed-list` (evitar
  `width`/`height` con `border-radius: 50%` por accesibilidad),
  `declaration-no-important` (cada `!important` requiere disable
  explicito con razon implicita).

#### Que tenemos nosotros

- 76 hex totales: 56 en `_variables.scss` (legitimos), 2 en
  `_mixins.scss`, 1 en `_focus-indicators.scss`, 17 en
  `.module.scss` con `stylelint-disable-next-line` inline.
- La regla `color-no-hex` esta activa solo para `src/**/*.module.scss`
  via override. Los partials globales no la tienen activa.

#### Implicacion para fase correctiva

**ui-core no toleraria nuestros 17 disables, pero tampoco usa la
regla `color-no-hex`**. Es decir, ui-core resuelve el problema
**no activando la regla**, confiando en que sus desarrolladores
no introducen hex en partials de componentes.

Nuestro template tiene la regla activa y los 17 disables son
sintoma de **frustracion del desarrollador con la regla**: no
encuentra una variable apropiada, decide forzarlo con disable.

**Decision actualizada**: la solucion no es solo "tokenizar los
17 hex" (decision aprobada original), sino tambien **adoptar la
disciplina de declaration-no-important + function-disallowed-list
con disables documentados** que ui-core usa. Los 17 hex se
tokenizan; ademas, la disciplina de "disable solo con razon
explicita" se aplica a **todos** los disables, no solo los de
`color-no-hex`.

### D4 — Convenciones de nombrado

#### Que tiene ui-core

- **Variables**: kebab-case, formula `$component-state-property-size`
  explicita en el comentario del archivo
  ("Variables should follow the `$component-state-property-size`
  formula for consistent naming. Ex: $nav-link-disabled-color
  and $modal-content-box-shadow-xs.").
- **Mixins**: kebab-case (`focus-ring`, `border-radius`,
  `transition`).
- **Funciones**: kebab-case (`color-contrast`, `to-rgb`).
- **Clases CSS**: BEM-Bootstrap-like (`.btn`, `.btn-primary`,
  `.btn-lg`, `.card`, `.card-body`, `.card-title`). Patrón con
  guiones (kebab-case).

#### Que tenemos nosotros

- **Variables**: kebab-case (100% uniforme).
- **Mixins**: kebab-case (100% uniforme).
- **Clases CSS modules**: **camelCase** (98.5%), no kebab-case
  como ui-core. Esto es decision arquitectonica de CSS Modules
  (camelCase es idiomatic en `import styles from './X.module.scss'
  styles.myClass`).

#### Implicacion para fase correctiva

- Variables y mixins: **convencion identica a ui-core**, solo
  falta formalizarla en ADR. Tarea de bajo esfuerzo.
- Clases: **diferencia legitima**. Nuestro template usa
  camelCase porque es CSS Modules. No se cambia. Documentar en
  la ADR de convenciones que el camelCase de clases es
  **especifico** a la capa de consumo (CSS Modules) y por eso
  diverge de ui-core.
- Adoptar la **formula `$component-state-property-size`** como
  guia de nombrado de variables nuevas (nuestro
  `$btn-padding-y` ya la sigue de facto).

### D5 — Pipeline `@use` / `@forward`

#### Que tiene ui-core

- **Cero `@import` legacy**.
- **`@use` para consumo**, **`@forward` para composicion**.
- **Bundles compuestos** via `@forward` (el `coreui.scss`
  forwardea 50+ partials).
- **Patron `_X.import.scss`**: cada componente tiene un entry
  individual que solo `@forward`-ea su partial principal.
  Permite al adoptante hacer
  `@use "node_modules/@coreui/coreui/scss/card.import" as *;`
  sin tirar todo el bundle.

#### Que tenemos nosotros

- 0 `@import` legacy (igual que ui-core).
- 129 `@use`, 2 `@forward`.
- 18 archivos usan ruta relativa `'../abstracts'` en vez del
  alias `'@styles/abstracts'`.
- 1 archivo importa partial directo
  (`'../abstracts/variables'`) saltandose el barrel.
- Sin pattern `_X.import.scss` para imports individuales.

#### Implicacion para fase correctiva

- Migrar los 18 paths relativos al alias: **patron alineado con
  ui-core**.
- Migrar el import parcial al barrel: **alineado con ui-core**
  (que tampoco hace imports parciales saltandose barrels).
- **No adoptar pattern `_X.import.scss`** todavia: nuestro
  template no es libreria distribuible, asi que el adoptante no
  hace `@use` selectivo desde fuera. Si en el futuro el template
  se distribuye via npm, este patron sera util.

### D6 — Variables muertas y mixins no usados

Esta es la dimension **mas impactada** por la directiva
"no borres nada, integra siguiendo ui-core".

#### 9 mixins muertos vs ui-core

| Nuestro mixin muerto | En ui-core? | Patron de uso en ui-core | Decision integracion |
|----------------------|--------------|---------------------------|----------------------|
| `@mixin absolute-center` | **no existe** | — | Conservar. Patron propio sin equivalente directo. Documentar como API publica disponible para componentes futuros que necesiten centrado absoluto (modal-content, loading-spinner full-page). |
| `@mixin category-grid` | **no existe** | — | Conservar. Patron especifico de ecommerce (grid de categorias). Documentar como API publica. |
| `@mixin focus-ring` | **SI** (`mixins/_focus-ring.scss`) | Usado en `_time-picker.scss`, `_date-picker.scss`, `_autocomplete.scss`, `_chip.scss` para `:focus-visible` de inputs interactivos | **Integrar activamente**. Aplicar `@include focus-ring` en todos los componentes interactivos del template (botones, inputs, links, controls). Probable que se solape con `_focus-indicators.scss` actual; consolidar. |
| `@mixin hover-lift` | **no existe** | — pero ui-core tiene `_elevation.scss` mixin con concepto similar | Conservar. Investigar si reemplazable por sistema de elevation de ui-core. |
| `@mixin media-2xl` / `@mixin media-xl` | ui-core usa breakpoints via `media-breakpoint-up($name)` mixin parametrizado | Patron mas flexible: un mixin con argumento | **Integrar**: refactorizar nuestros mixins por-breakpoint a un mixin parametrizado `@mixin media-up($bp)` que tome el breakpoint como argumento. Mantener los actuales como fachada compatible (deprecated). |
| `@mixin product-grid` | **no existe** | — | Conservar. Patron especifico de ecommerce. |
| `@mixin search-input` | **no existe** | — pero ui-core tiene `_autocomplete.scss` con patron similar | Conservar. Investigar consolidacion con autocomplete cuando se implemente. |
| `@mixin slide-down` | **no existe** explicitamente, pero ui-core tiene `_transition.scss` mixin generico | Conservar. Patron de animacion ya en `base/_animations.scss` como `@keyframes slideDown`; el mixin envuelve. Documentar como uso opcional. |

#### 40 variables muertas vs ui-core

Categorizacion por probable origen:

**Categoria A: aliases semanticos no adoptados** (7 variables)

`$space-xs`, `$space-sm`, `$space-md`, `$space-lg`, `$space-xl`,
`$space-2xl`, `$space-3xl`.

En ui-core no existen estos aliases; existen `$spacer` (singular,
base) y se generan multiplos via mapa
`$spacers: ($spacer * .25, $spacer * .5, ...)`.

**Decision integracion**: conservar los aliases pero documentar
como redundancia. Probablemente eliminar en una tarea futura
cuando se decida si migrar a mapa de espaciado tipo ui-core.

**Categoria B: variables de footer** (5 variables)

`$footer-bg`, `$footer-height`, `$footer-text`.

ui-core tiene `_footer.scss` activo con sus propias variables
de footer (`$footer-color`, `$footer-bg`, `$footer-padding-y`,
etc) usadas extensivamente.

**Decision integracion**: **conservar y activar**. El template
necesita un componente Footer; las variables estan listas. Tarea
nueva: implementar componente Footer reusando las variables
existentes.

**Categoria C: z-index extras** (5 variables)

`$z-hide`, `$z-base`, `$z-dropdown`, `$z-popover`, `$z-tooltip`.

ui-core tiene escala z-index completa
(`$zindex-dropdown: 1000 !default`, `$zindex-sticky: 1020`, etc).
Cada componente que necesita stacking usa el suyo.

**Decision integracion**: **conservar**. Cuando se anadan
dropdowns, popovers, tooltips al template, las variables estan
listas. Tarea documentacion: marcar como "reserved for future
use".

**Categoria D: espaciados grandes** (3 variables)

`$spacing-16`, `$spacing-20`, `$spacing-24`.

ui-core tiene escala que llega a `$spacer * 5` (~5rem). Nuestros
spacings llegan a 96px equivalente.

**Decision integracion**: **conservar**. Espaciados que se usan
en layouts amplios (hero sections, splash pages). Documentar
disponibilidad.

**Categoria E: otros con patron de uso claro en ui-core** (~20 variables)

`$accent-light`, `$border-error`, `$border-focus`,
`$border-radius` (alias), `$border-radius-2xl`, `$border-width-thin`,
`$bp-xs` (breakpoint 0px), `$font-size-5xl`, `$font-weight-extrabold`,
`$info-border`, `$line-height-loose`, `$low-stock-color`,
`$secondary-light`, `$shadow-card`, `$shadow-card-hover`,
`$sidebar-width-collapsed`, `$sidebar-width-mobile`,
`$transition-shadow`, `$transition-slower`, `$transition-transform`,
`$warning-border`.

ui-core tiene equivalentes para cada uno:
- borders: `$border-color-translucent`, `$border-width-bold`,
  `$focus-ring-color`, etc.
- breakpoints: `$grid-breakpoints` con `xs: 0` incluido.
- font: `$h1-font-size` hasta `$h6-font-size`, `$display1-size`,
  pesos `$font-weight-bolder`.
- transitions: `$transition-base`, `$transition-fade`,
  `$transition-collapse`, `$transition-collapse-width`.

**Decision integracion**: **conservar y planificar activacion
gradual**. Cada categoria es un sub-objetivo de fase correctiva
ampliada.

#### Implicacion conjunta para D6

La directiva "no borres nada, integra" tiene **respaldo empirico
de ui-core**: las 40 variables y 9 mixins muertos en nuestro
template son **mayoritariamente expectativas de patrones que
ui-core ya implementa**. Eliminarlos seria empobrecer el
catalogo y luego tener que reintroducirlos cuando se necesiten.

**Trabajo nuevo emergente**:
1. Para cada muerto, decidir si corresponde a un patron de
   ui-core integrable, a una expectativa razonable de futuro
   uso, o a una verdadera deuda sin justificacion.
2. Para los integrables-via-ui-core: ejecutar la integracion
   (consumer en algun componente) en la fase correctiva.
3. Para los no integrables ahora: marcar con `// fusv-disable`
   adoptando el patron de ui-core, documentar como "reserved".

### D7 — Especificidad y `!important`

#### Que tiene ui-core

- Regla stylelint `declaration-no-important` **activa** (parte
  de `stylelint-config-twbs-bootstrap`).
- **42 disables** de la regla detectados, cada uno con
  contexto. Casos legitimos: helpers de utility,
  visually-hidden, prefers-reduced-motion.
- Cuando deshabilitan, lo hacen para conjuntos coherentes (un
  bloque completo, no linea aislada).

#### Que tenemos nosotros

- Regla stylelint `declaration-no-important` **desactivada** (no
  aparece en `.stylelintrc.json`, asi que el default es off).
- 14 `!important` totales: 13 legitimos (visually-hidden,
  prefers-reduced-motion) + 1 sospechoso (Toast cascada mal
  modelada).

#### Implicacion para fase correctiva

- **Activar `declaration-no-important: true`** y refactorizar el
  Toast (decision ya tomada en T-002). Los 13 legitimos ganan
  disable explicito con razon.
- Adoptar el patron de ui-core de disables a nivel **bloque**
  cuando hay varios `!important` juntos (como en `visually-hidden`).

### D8 — CSS custom properties

Esta es la dimension donde **la decision aprobada original
(no usar custom properties) queda mas en cuestion**.

#### Que tiene ui-core

- `_root.scss`: declara **130+ CSS custom properties** en `:root`
  iterando los mapas de variables SCSS:
  ```scss
  :root, [data-theme="light"] {
    @each $color, $value in $colors {
      --#{$prefix}#{$color}: #{$value};
    }
    @each $color, $value in $theme-colors {
      --#{$prefix}#{$color}: #{$value};
    }
    ...
  }
  ```
- Soporte para dark mode via `[data-theme="dark"]` que redefine
  las mismas custom properties con valores de
  `_variables-dark.scss`.
- Componentes consumen `var(--cui-X, fallback)` para que JS
  pueda mutar el token sin recompilar SCSS.
- 130+ propiedades sugiere que CoreUI considera el theming
  dinamico **caso de uso central**, no excepcional.

#### Que tenemos nosotros

- 0 declaraciones de custom properties.
- Sin theming dinamico. Sin dark mode. JS no lee tokens.

#### Implicacion para fase correctiva

**Revocacion parcial de la decision aprobada original
(Decision 4: `dec-tokens-solo-sass-no-css-vars` declarando
explicitamente que NO se usan custom properties)**.

Alternativas:

- **Opcion A — Mantener la decision original**. Nuestro template
  no tiene caso de uso para theming dinamico ni dark mode. Las
  custom properties son sobreingenieria.
- **Opcion B — Adoptar el patron de ui-core completo**. Anadir
  `_root.scss`, declarar custom properties iterando mapas,
  preparar para dark mode futuro.
- **Opcion C — Adoptar parcialmente**. Exponer solo los tokens
  que JS realmente podria querer leer/cambiar (probablemente:
  colores de marca, sidebar width, header height). Dejar el
  resto solo como SCSS.

**Recomendacion**: **Opcion C**. Es la integracion correcta:
no sobreingenieria pero tampoco cierre prematuro. La ADR
correspondiente seria
`dec-tokens-via-sass-y-cssvars-selectivos` en vez de
`dec-tokens-solo-sass-no-css-vars`.

### D9 — Ritual de monitoreo

#### Que tiene ui-core

- **`fusv` (find-unused-sass-variables)**: herramienta dedicada,
  corrida como `npm run css-lint-vars`. Es **el equivalente
  exacto del bloqueador que nuestra iniciativa cancelada
  planeaba**.
- Variables marcadas `// fusv-disable` se excluyen del scan
  (son API publica del template).
- Stylelint config heredada de `stylelint-config-twbs-bootstrap`
  (mantenida por el equipo Bootstrap).

#### Que tenemos nosotros

- Sin herramienta dedicada para detectar variables muertas
  (el script ad-hoc que produje durante el analisis no se
  integra como pre-push).
- Sin equivalente a `fusv-disable` para marcar API publica.

#### Implicacion para fase correctiva

**Adoptar `fusv` como dependencia de dev**, configurarlo como
parte del pre-push o de `lint:scss-vars`. Es **literalmente la
herramienta** que necesitamos.

Para la disciplina de hex literales, no copiar el patron
"desactivar la regla" de ui-core (nosotros si tenemos casos en
.module.scss); construir el bloqueador propuesto en el alcance
original (D9) pero **complementado con fusv** para variables.

## Cambios al alcance aprobado

A la luz de este analisis, las 4 decisiones aprobadas del alcance
quedan modificadas:

### Decision 1 — REVOCADA

**Antes**: "Eliminar todas las 40 variables muertas y 9 mixins
muertos."

**Ahora**: "Conservar todas. Para cada una, evaluar contra
ui-core: si ui-core la tiene activa, **integrar** consumer en
nuestro template; si no, **marcar `// fusv-disable` y documentar
como API publica reservada**. Eliminacion solo permitida cuando
hay evidencia explicita de que la variable/mixin nunca tendra
caso de uso."

### Decision 2 — SIN CAMBIO

"Allowlist real via comentario inline con razon despues de `--`."
Sigue vigente, **complementada por la adopcion del patron
`// fusv-disable`** de ui-core para variables (no hex).

### Decision 3 — SIN CAMBIO

"Validacion visual confiada para tokenizaciones 1:1, explicita
para cambios de especificidad/!important."

### Decision 4 — REEMPLAZADA

**Antes**: "Producir ADR `dec-tokens-solo-sass-no-css-vars`."

**Ahora**: "Producir ADR `dec-tokens-via-sass-y-cssvars-selectivos`
adoptando parcialmente el patron de ui-core: exponer como CSS
custom properties solo los tokens que JS podria razonablemente
querer leer (colores marca, sidebar/header dimensions, theme
tokens si se planea dark mode futuro). Resto solo SCSS."

### Nueva decision emergente — Decision 5

"Adoptar herramientas y disciplinas de ui-core en stylelint y
linting de variables:
- `find-unused-sass-variables` como dependencia + script
  `lint:scss-vars`.
- Activar `declaration-no-important` en stylelint.
- Activar `function-disallowed-list` con conjunto inicial
  (probable: `lighten`, `darken`, deprecated SCSS).
- Patron `// fusv-disable` para API publica."

### Nueva decision emergente — Decision 6

"Adoptar `!default` en todas las variables del template para
permitir override por el adoptante. Tarea masiva mecanica."

## Esfuerzo estimado actualizado

Con la directiva de integracion, el esfuerzo crece
significativamente:

| Fase | Original | Actualizado | Razon del crecimiento |
|------|----------|-------------|-----------------------|
| 0 (cruce ui-core) | — | **120 min** | Nueva: este analisis ya producido cuenta como mapeo; falta diseno de integracion por variable/mixin |
| 1 | 60 min | 90 min | T-001 accion (eliminar huerfano) cambia a "integrar siguiendo ui-core `_transitions.scss` + `_spinners.scss`" |
| 2 | 105 min | **180 min** | T-003 y T-004 cambian de "eliminar" a "documentar API publica con fusv-disable + integrar los que tienen patron en ui-core" |
| 3 | 120 min | 120 min | Sin cambio (tokenizacion hex sigue igual) |
| 4 | 90 min | **150 min** | T-015 y T-016 cambian de "eliminar aliases" a "migrar consumers gradualmente conservando aliases hasta cero consumers"; T-019 ADR gana mas dimensiones |
| 5 | 150 min | **240 min** | Nuevas tareas: instalar fusv, configurar declaration-no-important, ADRs reformuladas, mas patron `!default` masivo |
| **Total** | **525 min (~8.75h)** | **900 min (~15h)** | +70% |

## Tareas afectadas (preview del replan)

Resumen de cambios al plan de tareas. El detalle por tarea va en
`replan-mapear-y-corregir-scss-completo.md` (siguiente
documento):

- **Fase 0 nueva** con T-000 (este analisis ya producido) y
  T-000-a (diseno de integracion por recurso muerto).
- **T-001 accion pendiente**: cambia de "eliminar
  components/_animations.scss" a "integrar siguiendo
  ui-core _transitions.scss + _spinners.scss".
- **T-003**: "eliminar 40 muertas" cambia a "categorizar 40
  muertas en A/B/C/D/E + aplicar fusv-disable + integrar las
  que tienen patron en ui-core".
- **T-004**: "eliminar 9 mixins muertos" cambia a "para cada
  mixin: si ui-core lo tiene, integrar consumer; si no,
  documentar API publica".
- **T-008..T-013**: sin cambio (tokenizacion hex).
- **T-015**: "migrar aliases" cambia a "migrar consumers
  gradualmente sin eliminar aliases hasta cero consumers".
- **T-016**: "eliminar bloque aliases" se elimina del plan; los
  aliases se conservan con comentario explicativo.
- **T-019**: ADR de convenciones gana referencias a la formula
  `$component-state-property-size` de ui-core.
- **T-023**: ADR cambia de "tokens-solo-sass-no-css-vars" a
  "tokens-via-sass-y-cssvars-selectivos".
- **T-NUEVA-1**: instalar y configurar `fusv` como linter.
- **T-NUEVA-2**: activar `declaration-no-important` en
  stylelint + refactor del Toast.
- **T-NUEVA-3**: anadir `!default` a todas las variables.
- **T-NUEVA-4**: implementar `_root.scss` con custom properties
  selectivas (D8 opcion C).

## Que sigue

1. Producir `replan-mapear-y-corregir-scss-completo.md` con
   las tareas reformuladas en detalle.
2. Actualizar `alcance-*.md` con las decisiones revocadas/
   reemplazadas/nuevas.
3. Registrar `Cambio de alcance` formal en `progreso-*.md`.
4. Reanudar la ejecucion desde el cierre de Fase 1 con las
   acciones reformuladas.

## Decisiones del usuario tras revisar este analisis

Tras leer este documento, el usuario aprobo explicitamente las
siguientes decisiones (recogidas aqui para que queden cerca de
su justificacion):

### Decision D-MODO — Modo de puerto

**Modo B confirmado**: portar el SCSS de ui-core como **mixins**,
no como clases globales. Razon: preserva la decision
arquitectonica declarada en `src/styles/main.scss` ("Toda clase
reutilizable vive en abstracts/ como MIXIN. No hay clases
globales de componentes."). Cada componente del template hace
`.button { @include btn-base; }` en su `.module.scss` y obtiene
el estilo de ui-core con su clase scoped local.

Las clases utility de ui-core (`scss/helpers/*.scss`, scss/utilities/`)
no se portan como utilities globales. Las que tienen valor se
convierten en mixins o se evaluan caso por caso.

### Decision D-PREFIJO — Prefijo CSS custom property

**Prefijo `--ec-` confirmado**. Razones:

- Brevedad operativa: 4 caracteres totales con guion. Importante
  porque se usara en cientos de declaraciones y miles de usos
  `var(--ec-X)`.
- Inequivoco en el contexto del proyecto: dentro de
  `ecommerce-ui`, `--ec-primary` solo puede significar
  "e-comerce primary".
- Sin colision con prefijos populares: Bootstrap usa `--bs-`,
  CoreUI `--cui-`, Tailwind `--tw-`. `--ec-` queda en territorio
  libre.
- Sigue la convencion de prefijos cortos (2-3 letras) de
  Bootstrap/CoreUI, manteniendo coherencia visual con el codigo
  portado.

**Verificacion empirica realizada antes de la decision**: el repo
no tenia ningun prefijo CSS custom property establecido previamente
(0 declaraciones de `--*` reales en SCSS; las 93 ocurrencias
iniciales detectadas eran modifiers BEM tipo `&--success`). El
proyecto si tiene una convencion de namespace `app:` para JS
CustomEvents (`app:unauthorized`), pero al revisar con el usuario
se descarto extender `app-` a CSS porque `app` es demasiado
generico y se prefiere un prefijo que identifique inequivocamente
al template `ecommerce-ui`.

### Decision D-COREUI-BUNDLES — Bundles `coreui-*.scss` no se portan

Los archivos `coreui.scss`, `coreui-grid.scss`,
`coreui-reboot.scss`, `coreui-utilities.scss` y sus variantes
`.rtl.scss` **no se portan** porque:

- `coreui.scss`: es el bundle compuesto via `@forward` de TODOS
  los partials de componente. Nuestro template no tiene bundle
  global de componentes (cada `.module.scss` importa abstracts).
- `coreui-grid.scss`: bundle solo de grid. El contenido SI se
  porta, pero como mixins en `src/styles/abstracts/`, no como
  bundle.
- `coreui-reboot.scss`: reset global. Se compara con
  `src/styles/base/_reset.scss` y se consolida.
- `coreui-utilities.scss`: utilities como clases globales.
  Modo B puro no las porta; cada caso se evalua.
- Todos los `.rtl.scss`: el template no soporta RTL hoy. Fuera
  de scope.

## Hallazgos organicos paralelos (no afectan esta iniciativa)

Durante la inspeccion para esta iniciativa surgieron dos
hallazgos que no son su scope pero conviene anotar:

### Hallazgo organico 1 — Linaje del template antecesor `mx-template`

`src/hooks/utils/useBreakpoint.js:4` contiene el comentario:

```js
// Reemplaza: breakpoints.min.js de mx-template
```

Esto sugiere que el template actual hereda codigo de un antecesor
llamado `mx-template`. Solo se encontro 1 referencia explicita,
pero podria haber mas codigo heredado sin marca. Conviene en una
iniciativa futura: auditar referencias y documentar el linaje, o
eliminar las referencias si ya no aplican.

### Hallazgo organico 2 — Grafia del nombre del proyecto

El `package.json` declara `"name": "ecommerce-ui"` con **una sola
`m`**. La grafia correcta en ingles es **"e-commerce"** (doble
`m`). El typo esta consolidado a lo largo del repo (~285
ocurrencias). No es un error reciente; es la grafia oficial del
proyecto.

Si en el futuro se decide corregir, sera iniciativa propia
("renombrar el proyecto") con impacto masivo. Esta iniciativa
mantiene la grafia actual sin modificar.
