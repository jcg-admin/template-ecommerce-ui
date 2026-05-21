# Analisis — `mapear-y-corregir-scss-completo`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Mapeo formal de las 9 dimensiones del alcance preliminar |
| Fecha | 2026-05-21 |
| Estado al producir | En analisis |

## Metodologia

Por cada dimension del alcance preliminar, este analisis recoge:

1. **Evidencia objetiva**: conteos, ejemplos `archivo:linea`,
   muestras de codigo, salida de herramientas (`stylelint`,
   `grep`, `find`, scripts Python ad-hoc).
2. **Diagnostico**: que esta bien, que esta mal, que es deuda no
   formalizada.
3. **Correcciones candidatas**: lista de cambios concretos que la
   fase correctiva ejecutaria. **Es candidata, no decision final**;
   la decision vive en `alcance-*.md` (siguiente paso del flujo).

Lo que sigue es **mapeo con diagnostico**, no diseno de la
correccion. El plan de tareas se produce despues.

## Hallazgos centrales (cruzan varias dimensiones)

Tres hallazgos transversales emergen del analisis. Se documentan
antes de las dimensiones porque condicionan varias:

### H-A: La "allowlist documentada" no es una lista, son 17 disables inline

La ADR `dec-color-no-hex-con-allowlist-documentada` declara
"allowlist documentada". El conteo es:

| Item | Conteo |
|------|--------|
| Hex literales en `.module.scss` | **17** |
| Comentarios `/* stylelint-disable-next-line color-no-hex */` | **17** |
| Match 1:1 entre disable y hex que lo sigue | confirmado |

**No existe una allowlist centralizada** en `.stylelintrc.json` con
los 17 colores y su justificacion. Lo que existe son 17 escapes
dispersos por el codigo, cada uno **sin razon documentada** en su
comentario. Comparar:

```scss
/* stylelint-disable-next-line color-no-hex */
border: 1px solid #d4c4a8;
```

vs lo que la ADR sugiere ("cada entrada con justificacion en
codigo"):

```scss
/* stylelint-disable-next-line color-no-hex --
   color de marca del proveedor externo MercadoLibre, no
   tokenizable porque cambia con su brand guidelines */
border: 1px solid #d4c4a8;
```

**Implicacion**: el ritual trimestral planeado en la iniciativa
cancelada no podria ejecutarse en el estado actual: no hay nada
que revisar. Se revisarian 17 lineas dispersas sin contexto.

### H-B: `color-no-hex` NO esta activa para partials globales

La regla aplica solo al override `src/**/*.module.scss`. Los 56 hex
en `_variables.scss` y los 2 en `_mixins.scss` son **legitimos como
fuente de tokens** y no rompen ninguna regla.

**Verificacion**: si se introduce un hex literal en
`_variables.scss`, stylelint no lo reporta. Esto es esperable
(`_variables.scss` ES la fuente de tokens), pero **no esta
documentado como decision intencional**.

### H-C: 76 hex visibles, 17 son escapes, 56 son tokens fuente

Reconciliando los conteos:

| Categoria | Conteo | Estado |
|-----------|--------|--------|
| Hex en `_variables.scss` (fuente de tokens) | 56 | Legitimos |
| Hex en `_mixins.scss` (usado en sombras `rgba()`) | 2 | A verificar |
| Hex en `_focus-indicators.scss` | 1 | A verificar |
| Hex en `.module.scss` (con disable inline) | 17 | Deuda |
| **Total grep recursivo** | **76** | Reconciliado |

La ADR decia "17 en allowlist" — exactamente coincide con el
conteo de `.module.scss`. **La cifra "525 -> 17" del PR #4 era
correcta para `.module.scss`**, pero la ADR no aclaraba que la
allowlist se materializaria como 17 comentarios inline, no como
una lista central.

## Dimension 1 — Tokens de diseno

### Evidencia

Archivo principal: `src/styles/abstracts/_variables.scss`
(370 lineas, 15 secciones numeradas).

| Categoria | Variables declaradas |
|-----------|----------------------|
| Colores primarios (oro) | 5 |
| Colores secundarios (tierra) | 3 |
| Colores acento (coral) | 3 |
| Fondos / superficies | 4 |
| Texto | 8 |
| Grises neutrales | 8 |
| Bordes | 3 |
| Estados (success / error / warning / info) | 18 |
| Familia ambar | 4 |
| Familia indigo | 4 |
| Stock / disponibilidad | 3 |
| Espaciado (sistema 4px) | 12 |
| Aliases semanticos de espaciado | 7 |
| Familias tipograficas | 3 |
| Tamanos tipograficos | 10 |
| Pesos tipograficos | 6 |
| Line heights | 5 |
| Border radius | 7 |
| Border width | 3 |
| Sombras | 8 |
| Transiciones | 8 |
| Z-index | 10 |
| Breakpoints | 6 |
| Layout (header, sidebar, footer) | 14 |
| Componentes (botones, forms, cards, badges) | 30+ |
| **Aliases compatibilidad** | 17 |

### Diagnostico

**Bien**:
- Estructura clara con 15 secciones numeradas.
- Sistema de espaciado de base 4px coherente.
- Estados semanticos completos.
- Z-index escalado.

**Mal / deuda**:
- **Bloque de "aliases compatibilidad"** al final (17 variables)
  que duplican o renombran existentes. Ejemplos: `$bg-card =
  $card-bg`, `$primary = $primary-color`, `$color-primary =
  $primary-color`, `$color-danger = $error-color`. Comentarios
  indican el archivo que los necesita. **Codigo de compromiso
  con renaming pendiente**.
- Variables muertas (ver dimension 6): **40 variables definidas
  sin consumer fuera de `_variables.scss`**.
- `$white: #FFFFFF` (alias hex literal directo) presente en el
  bloque de aliases, sin token semantico.

### Correcciones candidatas

- Migrar los consumers de `$bg-card`, `$primary`, `$color-danger`,
  etc al nombre canonico (`$card-bg`, `$primary-color`,
  `$error-color`) y eliminar el bloque de aliases.
- Documentar explicitamente que el bloque de aliases es **deuda
  de migracion**, no un patron deseable.

## Dimension 2 — Organizacion de archivos

### Evidencia

```
src/styles/
├── main.scss              (entry point, 33 lineas)
├── abstracts/             (3 archivos: _index, _variables, _mixins)
├── base/                  (3 archivos: _reset, _typography, _animations)
├── components/            (12 archivos)
├── layouts/               (2 archivos: _sidebar, _header)
├── accessibility/         (2 archivos: _index, _focus-indicators)
└── utils/                 (1 archivo: _utilities)
```

Top de directorios de la app con `.module.scss`:

| Directorio | Conteo |
|-----------|--------|
| `src/pages/admin/` | 39 |
| `src/pages/account/` | 19 |
| `src/styles/components/` | 12 |
| `src/pages/catalog/` | 7 |
| `src/pages/auth/` | 5 |

### Diagnostico

**Bien**:
- Arquitectura `abstracts/base/components/layouts/utils` documentada
  en el header de `main.scss` con comentario explicito ("estilos
  verdaderamente globales").
- 101 de 125 archivos son `.module.scss` (CSS modules predominante).
- `main.scss` solo carga: reset, typography, animations,
  accessibility/index. No carga componentes; cada componente
  importa `abstracts/` con `@use`.

**Mal / deuda**:
- `src/styles/components/_animations.scss` Y `src/styles/base/_animations.scss`
  **coexisten**. Posible duplicacion. Pendiente verificar
  contenido.
- `_utilities.scss` en `utils/` con un solo archivo: hace que la
  estructura `utils/` parezca un singleton arbitrario.
- No hay `_index.scss` en `components/`, `layouts/`, `base/`. Solo
  `abstracts/` y `accessibility/` lo tienen. **Inconsistencia
  de patron**.

### Correcciones candidatas

- Verificar si `base/_animations.scss` y `components/_animations.scss`
  son duplicados; consolidar en uno.
- Decidir politica sobre `_index.scss` por carpeta: o todas lo
  tienen, o ninguna lo necesita explicitamente.
- Considerar mover `_utilities.scss` a `base/` (es un singleton).

## Dimension 3 — Hex literales y allowlist

### Evidencia

Conteo por archivo (top, todos los archivos con >=1 hex):

```
56  src/styles/abstracts/_variables.scss
 3  src/pages/account/AddressesPage.module.scss
 2  src/styles/abstracts/_mixins.scss
 2  src/pages/auth/VerifyEmailPage.module.scss
 2  src/pages/account/WishlistPage.module.scss
 2  src/pages/account/ChangePasswordPage.module.scss
 1  src/styles/accessibility/_focus-indicators.scss
 1  src/pages/checkout/PaymentSelectionPage.module.scss
 1  src/pages/catalog/SearchResultsPage.module.scss
 1  src/pages/admin/AdminReturnDetailPage.module.scss
 1  src/pages/admin/AdminPaymentsPage.module.scss
 1  src/pages/admin/AdminPaymentRefundPage.module.scss
 1  src/pages/account/ReturnsPage.module.scss
 1  src/pages/account/ReturnDetailPage.module.scss
 1  src/components/catalog/VariantSelector/VariantSelector.module.scss
```

Los **17 hex en `.module.scss`** son los que la "allowlist" del
PR #4 acomodo. Listado completo:

| Archivo:linea | Hex | Disable preceding |
|---------------|-----|-------------------|
| `VariantSelector.module.scss:28` | `#b08a3c` | si |
| `SearchResultsPage.module.scss:11` | `#6b5618` | si |
| `AdminPaymentRefundPage.module.scss:28` | `#cfc4b3` | si |
| `AdminPaymentsPage.module.scss:18` | `#cfc4b3` | si |
| `AdminReturnDetailPage.module.scss:58` | `#5a36d0` | si |
| `VerifyEmailPage.module.scss:79` | `#d4c4a8` | si |
| `VerifyEmailPage.module.scss:94` | `#c8b88a` | si |
| `WishlistPage.module.scss:36` | `#d4c4a8` | si |
| `WishlistPage.module.scss:153` | `#c8b88a` | si |
| `ReturnsPage.module.scss:76` | `#5a36d0` | si |
| `ChangePasswordPage.module.scss:47` | `#d4c4a8` | si |
| `ChangePasswordPage.module.scss:97` | `#c8b88a` | si |
| `AddressesPage.module.scss:110` | `#d4c4a8` | si |
| `AddressesPage.module.scss:149` | `#c8b88a` | si |
| `AddressesPage.module.scss:158` | `#d4c4a8` | si |
| `ReturnDetailPage.module.scss:70` | `#5a36d0` | si |
| `PaymentSelectionPage.module.scss:50` | `#cfc4b3` | si |

**Colores unicos**: 6 distintos (`#b08a3c`, `#6b5618`, `#cfc4b3`,
`#5a36d0`, `#d4c4a8`, `#c8b88a`). Repetidos: `#d4c4a8` (4 veces),
`#c8b88a` (3), `#cfc4b3` (3), `#5a36d0` (3).

### Diagnostico

**Bien**:
- Stylelint regla activa para `.module.scss`.
- Husky pre-push corre stylelint, asi que no se cuelan nuevos
  hex sin disable explicito.

**Mal / deuda**:
- **Los disables no tienen razon documentada** (ver Hallazgo H-A).
- **Hay duplicacion**: `#d4c4a8` aparece 4 veces, `#c8b88a` 3
  veces, `#cfc4b3` 3 veces. Es candidato evidente a tokenizar.
- **No hay un bloqueador adicional** que prevenga que alguien
  anada el disable a su gusto sin documentacion. La iniciativa
  cancelada queria construir ese bloqueador; sigue siendo
  necesario.
- **`_focus-indicators.scss:1` tiene 1 hex** sin estar en una
  ruta `.module.scss`. La regla `color-no-hex` no aplica alli,
  asi que pasa silenciosamente. Verificar si es legitimo o
  deberia ser token.

### Correcciones candidatas

- Tokenizar los 6 colores unicos en `_variables.scss` con
  nombres semanticos (probablemente: tonos de marca, badge
  morado de "info diferenciada", beige de bordes secundarios).
- Reemplazar los 17 usos por la variable correspondiente y
  eliminar los disables.
- Si algun color queda sin tokenizar por razon legitima
  (ejemplo brand-color de tercero), reemplazar el disable
  inline por una entrada en allowlist real con justificacion
  en comentario.
- Construir bloqueador pre-push que rechace nuevos disables
  sin razon documentada en el comentario.
- Verificar el hex en `_focus-indicators.scss`.

## Dimension 4 — Convenciones de nombrado

### Evidencia

| Tipo | Total | Patron dominante | Excepciones |
|------|-------|------------------|-------------|
| Variables SCSS `$var` | 223 | `$kebab-case` (100%) | 0 |
| Clases CSS modules | 324 | `camelCase` (98.5%) | 5 con `_` |
| Mixins | 52 | `kebab-case` (100%) | 0 |

Variables: 223 / 223 = 100% en `$primary-color`, `$spacing-4`,
`$font-size-base`, etc.

Clases CSS modules: 319 camelCase puro + 5 con guion bajo.
Stylelint config tiene `selector-class-pattern: null` (deshabilitado),
asi que las 5 excepciones no son atrapadas mecanicamente.

Mixins: `flex-center`, `flex-between`, `product-grid`,
`media-md`, etc. Todos en kebab-case.

### Diagnostico

**Bien**:
- Las tres categorias tienen **patron uniforme dominante** (98-100%).
- Las convenciones estan implicitas en la stylelint config:
  `scss/dollar-variable-pattern: "^[a-z][a-z0-9-]*$"` (variables
  en kebab-case), `scss/at-mixin-pattern: "^[a-z][a-z0-9-]*$"`
  (mixins en kebab-case).

**Mal / deuda**:
- `selector-class-pattern: null` deshabilita la validacion para
  clases. Los 5 outliers con guion bajo pueden ser intencionales
  (BEM modifier?) o accidentes.
- **No hay ADR que formalice las convenciones**. La uniformidad
  es de facto, no de jure. Si un adoptante del template anade un
  componente con clases en kebab-case, no hay nada que se lo
  impida.

### Correcciones candidatas

- Producir ADR `dec-convenciones-de-nombrado-scss` que formalice:
  variables kebab, clases camelCase, mixins kebab.
- Activar `selector-class-pattern: "^[a-z][a-zA-Z0-9]*$"` en
  stylelint para `.module.scss` y verificar las 5 excepciones.
- Verificar si los 5 outliers son intencionales; renombrar si no.

## Dimension 5 — Pipeline `@use` / `@forward` / `@import`

### Evidencia

| Sintaxis | Conteo |
|----------|--------|
| `@use` | 129 |
| `@forward` | 2 |
| `@import` (legacy) | **0** |

Distribucion `@use`:

```
101  @use '@styles/abstracts' as *;
 18  @use '../abstracts' as *;
  3  @use 'sass:color';
  1  @use 'variables' as *;
  1  @use 'focus-indicators';
  1  @use 'base/typography';
  1  @use 'base/reset';
  1  @use 'base/animations';
  1  @use 'accessibility/index';
  1  @use '../abstracts/variables' as *;
```

### Diagnostico

**Bien**:
- **Cero `@import` legacy**. Migracion al pipeline moderno
  completa.
- 101/120 imports usan la forma canonica
  `@use '@styles/abstracts' as *;` (alias webpack).

**Mal / deuda**:
- **18 archivos usan ruta relativa** `@use '../abstracts' as *;`
  en vez del alias `@styles/`. Inconsistencia: el alias funciona,
  asi que las rutas relativas son redundantes.
- 1 archivo importa directamente `@use '../abstracts/variables' as *;`
  saltandose el barrel `_index.scss`. Acceso parcial que rompe
  la encapsulacion del abstracts.

### Correcciones candidatas

- Migrar los 18 archivos con `'../abstracts'` a
  `'@styles/abstracts'`. `scripts/check-scss.mjs` ya tiene logica
  para enforzar esto en `pages/`, `components/` y `layouts/` segun
  su comentario.
- Verificar y migrar el archivo que importa
  `'../abstracts/variables'` a usar `'@styles/abstracts' as *` y
  consumir solo lo que necesita.

## Dimension 6 — Variables muertas y mixins no usados

### Evidencia

#### Variables

Total definidas: **223**
Usadas fuera de `_variables.scss`: **183**
**Variables muertas (definidas sin consumer fuera): 40 (18%)**

Lista completa:

```
$accent-light             $space-2xl
$border-error             $space-3xl
$border-focus             $space-lg
$border-radius            $space-md
$border-radius-2xl        $space-sm
$border-radius-none       $space-xl
$border-width-thin        $space-xs
$bp-xs                    $spacing-16
$font-size-5xl            $spacing-20
$font-weight-extrabold    $spacing-24
$footer-bg                $transition-shadow
$footer-height            $transition-slower
$footer-text              $transition-transform
$info-border              $warning-border
$line-height-loose        $z-base
$low-stock-color          $z-dropdown
$secondary-light          $z-hide
$shadow-card              $z-popover
$shadow-card-hover        $z-tooltip
$sidebar-width-collapsed
$sidebar-width-mobile
```

Categorias:
- 7 aliases semanticos de espaciado (`$space-xs`..`$space-3xl`):
  todos muertos. La convencion del proyecto fue `$spacing-1`..
  `$spacing-24`; los aliases `$space-*` no se adoptaron.
- 5 variables de footer (`$footer-bg`, `$footer-height`, etc):
  no hay componente footer activo, o lo hay pero usa otras
  variables.
- 5 z-index extra (`$z-hide`, `$z-base`, `$z-dropdown`, `$z-popover`,
  `$z-tooltip`): de la escala completa, solo se usa parcialmente.
- 3 espaciados grandes (`$spacing-16`, `$spacing-20`, `$spacing-24`):
  no se llega a esos tamanos en la UI actual.
- Otros: `$bp-xs` (breakpoint 0px no usado), `$border-radius` alias,
  `$shadow-card` alias huerfano.

#### Mixins

Total definidos: **52**
Mixins usados: **43**
**Mixins muertos: 9 (17%)**

Lista:
```
@mixin absolute-center
@mixin category-grid
@mixin focus-ring
@mixin hover-lift
@mixin media-2xl
@mixin media-xl
@mixin product-grid
@mixin search-input
@mixin slide-down
```

Observaciones:
- `@mixin product-grid`, `@mixin category-grid` muertos: el grid
  de productos probablemente se implemento ad-hoc en los
  componentes en vez de via mixin.
- `@mixin media-xl`, `@mixin media-2xl` muertos: los breakpoints
  grandes no se invocan en queries.
- `@mixin focus-ring` muerto pero hay `_focus-indicators.scss`
  global, asi que el focus se maneja por otro camino.

### Diagnostico

40 variables y 9 mixins definidos sin consumer. **Total: 49
declaraciones muertas en `_variables.scss` + `_mixins.scss`**.

No es deuda critica (no rompen nada), pero contaminan el
catalogo: un adoptante leyendo `_variables.scss` no sabe cuales
son tokens "vivos" del sistema y cuales son cadaveres.

### Correcciones candidatas

- Eliminar las 40 variables y 9 mixins muertos.
- **Excepcion potencial**: variables y mixins que el template
  expone como **API publica** para adoptantes (e.g.
  `$footer-bg` quizas se conserva porque el adoptante
  implementara su footer). Marcar con comentario explicito si
  se conservan.
- Anadir tarea para revisar trimestralmente que no crezca esta
  lista (parte del ritual heredado).

## Dimension 7 — Especificidad y herencia

### Evidencia

- `!important`: **14 ocurrencias** en SCSS.
- Anidacion `&` con indent >= 6 espacios: 2 ocurrencias detectadas.

Distribucion `!important`:

```
src/styles/abstracts/_mixins.scss        (varios, en visually-hidden)
src/components/common/Toast/ToastContainer.module.scss
...
```

`src/styles/abstracts/_mixins.scss` contiene `visually-hidden`
mixin con multiples `!important` (legitimo: SR-only utility
necesita ganar especificidad).

`ToastContainer.module.scss:N: color: $bg-surface !important;` —
candidato a deuda real.

### Diagnostico

**Bien**:
- 14 `!important` totales es bajo para un proyecto de 125
  archivos.
- La concentracion en `_mixins.scss` (visually-hidden) es legitima.

**Mal / deuda**:
- Casos puntuales en componentes (Toast, etc) sin documentacion
  de por que necesitan `!important`. Sospechosos.
- Anidacion `&:hover, &.active { ... }` con multiple acciones
  por linea en `_header.scss` y `_table.scss` es legible pero
  rompe el estilo "una declaracion por linea".

### Correcciones candidatas

- Inventariar cada `!important` con archivo:linea y razon (o
  ausencia de razon).
- Eliminar los injustificados refactorizando la cascada (o
  documentar el motivo en comentario inline).

## Dimension 8 — Consistencia con arquitectura del frontend

### Evidencia

- **0 declaraciones de CSS custom properties** (`--*`) en SCSS.
- Tokens viven solo como variables SCSS (compile-time), no como
  CSS variables (runtime).

### Diagnostico

**Bien (decision)**:
- El template no tiene theming dinamico runtime. No se cambia
  tema con JS. Las variables SCSS son suficientes.
- No hay JS leyendo CSS variables. La separacion SCSS-only
  funciona.

**Posibles huecos**:
- Si en el futuro se quisiera implementar dark mode, theming por
  adoptante, o lectura de tokens desde JS, no hay infraestructura.
  No es necesario hoy, pero conviene anotarlo.

### Correcciones candidatas

- **Probablemente fuera de scope**. Si la auditoria decide que
  el template debe exponer custom properties para JS, eso es
  iniciativa propia.
- Documentar como decision explicita en ADR nueva
  (`dec-tokens-solo-sass-no-css-vars`) o ampliacion de la
  existente.

## Dimension 9 — Ritual de monitoreo (heredado)

### Evidencia

Estado actual: **no existe**.

Lo que existe es:
- `dec-stylelint-y-checkscss-en-pre-push` (PR #3, #4): Husky
  pre-push corre `stylelint` + `scripts/check-scss.mjs`.
- `dec-color-no-hex-con-allowlist-documentada` (PR #4): regla
  activa para `.module.scss`.

Lo que NO existe:
- Bloqueador especifico contra nuevos `stylelint-disable-next-line
  color-no-hex` sin razon documentada en el comentario.
- Ritual trimestral documentado de revision de los disables y la
  allowlist.
- Catalogo de los disables vigentes en un lugar central (lo unico
  que existe son los 17 comentarios dispersos).

### Diagnostico

Dimension nueva, no auditable (no hay nada que mapear). Pasa
directamente a fase correctiva.

### Correcciones candidatas

- Construir `scripts/check-scss-disables.mjs` o ampliar el
  existente para:
  - Rechazar `stylelint-disable-next-line color-no-hex` sin
    razon documentada (comentario `--` con texto al final).
  - Mantener un catalogo central de disables vigentes con
    archivo, linea, razon. Generable automaticamente o
    documentado en `.stylelintrc.json`.
- Documentar el ritual trimestral en
  `docs/desarrollo/ritual-revision-scss.md` o equivalente, con:
  - Responsable (rotativo o propietario fijo).
  - Procedimiento paso a paso.
  - Criterio para retirar un disable (cuando la razon ya no
    aplica).
- Producir ADR nueva o ampliar
  `dec-color-no-hex-con-allowlist-documentada` para reflejar
  como la disciplina se materializa realmente.

## Resumen agregado del estado

| Dimension | Estado | Tipo de correccion |
|-----------|--------|---------------------|
| 1 Tokens de diseno | Bueno con deuda menor (17 aliases) | Refactor pequeno |
| 2 Organizacion de archivos | Bueno con duplicado a verificar | Verificacion + posible merge |
| 3 Hex literales y allowlist | **Deuda alta** (17 disables sin razon) | Tokenizar 6 colores, eliminar 17 disables |
| 4 Convenciones de nombrado | **Bueno** (uniformidad de facto) | Solo formalizar ADR |
| 5 Pipeline @use/@forward | Bueno con deuda menor (19 paths relativos) | Migracion mecanica |
| 6 Variables muertas | **Deuda media** (40+9 = 49 muertas) | Eliminar / marcar como API publica |
| 7 Especificidad e !important | Bueno con casos puntuales | Inventariar y limpiar |
| 8 CSS custom properties | Decision implicita (cero usadas) | Solo formalizar ADR |
| 9 Ritual de monitoreo | **No existe** | Construir desde cero |

## Estimacion preliminar de esfuerzo

Por dimension, esfuerzo del trabajo correctivo:

| Dimension | Esfuerzo estimado |
|-----------|--------------------|
| 1 Tokens | ~45 min (migrar 17 aliases + eliminar bloque) |
| 2 Organizacion | ~30 min (verificar y mergear si aplica) |
| 3 Hex y allowlist | ~120 min (tokenizar 6, eliminar 17 disables, validar) |
| 4 Convenciones | ~30 min (ADR + activar stylelint rule) |
| 5 Pipeline | ~45 min (migrar 19 paths, mecanico) |
| 6 Variables muertas | ~60 min (decidir y eliminar 49) |
| 7 !important | ~30 min (inventario y limpieza) |
| 8 CSS custom properties | ~15 min (solo ADR) |
| 9 Ritual de monitoreo | ~90 min (script + doc + ADR) |
| **Total estimado** | **~465 min (~7.75 h)** |

Mas el esfuerzo de las tareas de mapeo (~120 min ya cubierto
parcialmente por este analisis) y cierre (~60 min):
**~10.5 horas efectivas**.

## Que sigue

1. Producir `alcance-mapear-y-corregir-scss-completo.md` con
   dimensiones confirmadas, criterio de "mapeado" + criterio de
   "corregido" por dimension, decisiones de proceso.
2. **Pausa obligatoria para confirmacion del alcance antes de
   planificar**.
3. Plan + tareas estructurados por fase de dimension.
4. Ejecucion.
5. Cierre con ADRs nuevas o ampliacion de las existentes.
