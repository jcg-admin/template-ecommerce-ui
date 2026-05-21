# Tareas — `mapear-y-corregir-scss-completo`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Tareas atomicas T-001..T-024 |
| Fecha | 2026-05-21 |
| Estructura | Una fila por tarea, archivos afectados, criterio de aceptacion binario, dependencias |

## Convenciones

- **T-NNN**: identificador atomico. Una sola unidad de cambio
  conceptualmente coherente.
- **Una tarea = idealmente un archivo**. Excepciones documentadas
  en la columna "Archivos" cuando varios son inseparables (e.g.
  tokenizar un color implica `_variables.scss` + N consumers en
  un solo commit para no dejar el build roto).
- **Criterio binario**: comprobable con un comando o inspeccion
  visual sin ambiguedad.
- **Dependencias**: ID de tarea que debe estar cerrada antes.
- **Esfuerzo**: estimacion en minutos, orientativa.

## DAG de dependencias

```
Fase 1 (entrada)
  T-001 ── independiente
  T-002 ── independiente

Fase 2 (depende de Fase 1 solo para Fase cerrada)
  T-003 ── depende de Fase 1
  T-004 ── depende de Fase 1
  T-005 ── depende de Fase 1
  T-006 ── depende de Fase 1
  T-007 ── depende de T-005, T-006

Fase 3 (depende de Fase 2)
  T-008 ── depende de Fase 2 cerrada
  T-009 ── depende de T-008
  T-010 ── depende de T-008
  T-011 ── depende de T-008
  T-012 ── depende de T-008
  T-013 ── depende de T-008
  T-014 ── independiente dentro de Fase 3

Fase 4 (depende de Fase 3)
  T-015 ── depende de Fase 3 cerrada
  T-016 ── depende de T-015
  T-017 ── depende de Fase 3 cerrada
  T-018 ── depende de T-017
  T-019 ── independiente dentro de Fase 4

Fase 5 (depende de Fase 4)
  T-020 ── depende de Fase 4 cerrada
  T-021 ── depende de Fase 4 cerrada
  T-022 ── depende de T-020
  T-023 ── independiente dentro de Fase 5
  T-024 ── depende de TODAS las anteriores
```

## Fase 1 — Cierre de mapeos pendientes (~60 min)

### T-001 — Diagnosticar duplicacion `_animations.scss`

| Campo | Valor |
|-------|-------|
| Dimension | D2 |
| Archivos | `src/styles/base/_animations.scss`, `src/styles/components/_animations.scss` |
| Accion | Leer ambos. Diagnosticar: duplicados / complementarios / propositos distintos. |
| Output | `Hallazgo durante la ejecucion` en `progreso-*.md` con el diagnostico y la accion decidida. |
| Criterio aceptacion | El diagnostico esta registrado y la accion (consolidar / mantener / mover) decidida. Si la decision es consolidar, queda como sub-tarea pendiente para el final de Fase 1. |
| Dependencias | — |
| Esfuerzo | ~20 min |

### T-002 — Inventario y categorizacion de `!important`

| Campo | Valor |
|-------|-------|
| Dimension | D7 |
| Archivos | `progreso-*.md` (solo doc) |
| Accion | Listar las 14 ocurrencias con archivo:linea y clasificar cada una: legitimo (mixin visually-hidden) / sospechoso / candidato a eliminar. |
| Output | Tabla en `Hallazgo durante la ejecucion` de `progreso-*.md`. |
| Criterio aceptacion | Tabla con 14 filas categorizadas. Para los "sospechosos" o "candidatos a eliminar", queda apuntado el archivo a refactorizar. |
| Dependencias | — |
| Esfuerzo | ~30 min |

**Cierre de Fase 1**: T-001 + T-002 cerradas, evento
`Fase cerrada` registrado. Si T-001 decide consolidar el
duplicado, ejecutar la consolidacion como parte del cierre de la
fase (commit aparte) antes de pasar a Fase 2.

## Fase 2 — Limpieza interna sin impacto visible (~105 min)

### T-003 — Eliminar 40 variables muertas

| Campo | Valor |
|-------|-------|
| Dimension | D6 |
| Archivos | `src/styles/abstracts/_variables.scss` |
| Accion | Eliminar las 40 variables listadas en `analisis-*.md` D6. Verificar antes de eliminar cada una con `grep -rE "\\\$<nombre>" src` (sin filtro `--include` para detectar consumers en `.ts`, `.tsx`, `.md`). |
| Output | `_variables.scss` con las 40 variables eliminadas. |
| Criterio aceptacion | `grep -E "^\\\$accent-light\|^\\\$footer-bg\|<resto>" src/styles/abstracts/_variables.scss` devuelve 0 lineas. `npm test` y `npm run verify-build` verdes. |
| Dependencias | Fase 1 cerrada |
| Esfuerzo | ~30 min |

### T-004 — Eliminar 9 mixins muertos

| Campo | Valor |
|-------|-------|
| Dimension | D6 |
| Archivos | `src/styles/abstracts/_mixins.scss` |
| Accion | Eliminar los 9 mixins listados. Verificar antes de cada eliminacion con `grep -rE "@include\s+<nombre>" src`. |
| Output | `_mixins.scss` con los 9 mixins eliminados. |
| Criterio aceptacion | `grep -E "^@mixin (absolute-center\|category-grid\|focus-ring\|hover-lift\|media-2xl\|media-xl\|product-grid\|search-input\|slide-down)" src/styles/abstracts/_mixins.scss` devuelve 0. Tests + build verdes. |
| Dependencias | Fase 1 cerrada |
| Esfuerzo | ~15 min |

### T-005 — Migrar 18 archivos a alias `@styles/abstracts`

| Campo | Valor |
|-------|-------|
| Dimension | D5 |
| Archivos | 18 archivos `*.module.scss` con `@use '../abstracts' as *` |
| Accion | Reemplazar `@use '../abstracts' as *` por `@use '@styles/abstracts' as *` en los 18 archivos identificados via `grep -rl "@use '\.\./abstracts'" src`. |
| Output | 18 archivos modificados. |
| Criterio aceptacion | `grep -rE "@use '\.\./abstracts'" src --include="*.scss"` devuelve 0. Tests + build verdes. |
| Dependencias | Fase 1 cerrada |
| Esfuerzo | ~30 min |

### T-006 — Migrar import parcial directo al barrel

| Campo | Valor |
|-------|-------|
| Dimension | D5 |
| Archivos | 1 archivo (identificable via `grep -rl "@use '\.\./abstracts/variables'" src`) |
| Accion | Reemplazar `@use '../abstracts/variables' as *` por `@use '@styles/abstracts' as *`. Si el archivo solo usa variables y no mixins, esto introduce `mixins` en su scope sin uso; es aceptable porque el barrel es el patron del proyecto. |
| Output | 1 archivo modificado. |
| Criterio aceptacion | `grep -rE "@use '\.\./abstracts/variables'" src` devuelve 0. Tests + build verdes. |
| Dependencias | Fase 1 cerrada |
| Esfuerzo | ~10 min |

### T-007 — Verificar/ampliar `check-scss.mjs` para enforzar alias

| Campo | Valor |
|-------|-------|
| Dimension | D5 |
| Archivos | `scripts/check-scss.mjs` (posible modificacion) |
| Accion | Leer el script para verificar si ya enforza `@styles/abstracts` en `pages/`, `components/`, `layouts/`. Si lo hace, anadir test artificial (anadir un import relativo en un archivo temporal y verificar que el script falla). Si no lo hace, ampliarlo. |
| Output | Script verificado, posiblemente ampliado. Test artificial documentado en `Hallazgo durante la ejecucion`. |
| Criterio aceptacion | Test artificial: crear `src/pages/checkout/__test.module.scss` con `@use '../../styles/abstracts' as *` y verificar que `node scripts/check-scss.mjs` falla. Eliminar archivo de prueba. Script ya enforza o se amplio para enforzar. |
| Dependencias | T-005, T-006 |
| Esfuerzo | ~20 min |

**Cierre de Fase 2**: criterios de fase 2 del plan cumplidos.

## Fase 3 — Tokenizacion de hex (~120 min)

### T-008 — Anadir 6 tokens semanticos en `_variables.scss`

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `src/styles/abstracts/_variables.scss` |
| Accion | Anadir 6 variables con nombres semanticos para los 6 colores unicos. Nombres tentativos (refinables en la tarea segun contexto de uso): `$border-beige-soft` (`#d4c4a8`), `$bg-beige-warm` (`#c8b88a`), `$border-neutral-warm` (`#cfc4b3`), `$badge-info-text` (`#5a36d0`), `$border-gold-warm` (`#b08a3c`), `$text-gold-dark` (`#6b5618`). |
| Output | 6 variables nuevas en `_variables.scss`, idealmente bajo seccion existente apropiada (no nueva seccion). |
| Criterio aceptacion | Las 6 variables existen en el archivo. `npm run verify-build` verde (las variables no se usan todavia; solo definidas). |
| Dependencias | Fase 2 cerrada |
| Esfuerzo | ~20 min |

### T-009 — Tokenizar `#d4c4a8` (4 ocurrencias)

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `src/pages/auth/VerifyEmailPage.module.scss:79`, `src/pages/account/WishlistPage.module.scss:36`, `src/pages/account/ChangePasswordPage.module.scss:47`, `src/pages/account/AddressesPage.module.scss:110,158` |
| Accion | Reemplazar las 4 ocurrencias de `#d4c4a8` por `$border-beige-soft` (o nombre final de T-008). Eliminar los 4 comentarios `/* stylelint-disable-next-line color-no-hex */`. |
| Output | 4 archivos modificados (uno tiene 2 ocurrencias). |
| Criterio aceptacion | `grep -rE "#d4c4a8" src --include="*.module.scss"` devuelve 0. `grep -rE "stylelint-disable-next-line color-no-hex" src --include="*.module.scss"` devuelve 13 (17 - 4). Tests + build verdes. |
| Dependencias | T-008 |
| Esfuerzo | ~15 min |

### T-010 — Tokenizar `#c8b88a` (3 ocurrencias)

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `VerifyEmailPage.module.scss:94`, `WishlistPage.module.scss:153`, `ChangePasswordPage.module.scss:97`, `AddressesPage.module.scss:149` |
| Accion | Reemplazar `#c8b88a` por `$bg-beige-warm` (o nombre final). Eliminar disables. Nota: el analisis listo 3 ocurrencias pero la tabla original cuenta 4 (incluye `AddressesPage.module.scss:149`). Verificar con grep al comenzar la tarea. |
| Output | 3 o 4 archivos modificados segun el conteo real. |
| Criterio aceptacion | `grep -rE "#c8b88a" src --include="*.module.scss"` devuelve 0. Tests + build verdes. |
| Dependencias | T-008 |
| Esfuerzo | ~15 min |

### T-011 — Tokenizar `#cfc4b3` (3 ocurrencias)

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `AdminPaymentRefundPage.module.scss:28`, `AdminPaymentsPage.module.scss:18`, `PaymentSelectionPage.module.scss:50` |
| Accion | Reemplazar `#cfc4b3` por `$border-neutral-warm`. Eliminar disables. |
| Output | 3 archivos modificados. |
| Criterio aceptacion | `grep -rE "#cfc4b3" src --include="*.module.scss"` devuelve 0. Tests + build verdes. |
| Dependencias | T-008 |
| Esfuerzo | ~10 min |

### T-012 — Tokenizar `#5a36d0` (3 ocurrencias)

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `AdminReturnDetailPage.module.scss:58`, `ReturnsPage.module.scss:76`, `ReturnDetailPage.module.scss:70` |
| Accion | Reemplazar `#5a36d0` por `$badge-info-text` (color del `.badgeInfo` morado). Eliminar disables. |
| Output | 3 archivos modificados. |
| Criterio aceptacion | `grep -rE "#5a36d0" src --include="*.module.scss"` devuelve 0. Tests + build verdes. |
| Dependencias | T-008 |
| Esfuerzo | ~10 min |

### T-013 — Tokenizar `#b08a3c` y `#6b5618` (2 ocurrencias singleton)

| Campo | Valor |
|-------|-------|
| Dimension | D3 |
| Archivos | `VariantSelector.module.scss:28`, `SearchResultsPage.module.scss:11` |
| Accion | Reemplazar `#b08a3c` por `$border-gold-warm`, `#6b5618` por `$text-gold-dark`. Eliminar 2 disables. |
| Output | 2 archivos modificados. |
| Criterio aceptacion | `grep -rE "#b08a3c\|#6b5618" src --include="*.module.scss"` devuelve 0. Tests + build verdes. |
| Dependencias | T-008 |
| Esfuerzo | ~10 min |

### T-014 — Verificar hex en partials globales

| Campo | Valor |
|-------|-------|
| Dimension | D3 (extension) |
| Archivos | `src/styles/accessibility/_focus-indicators.scss`, `src/styles/abstracts/_mixins.scss` |
| Accion | Revisar el hex en `_focus-indicators.scss` y los 2 hex en `_mixins.scss`. Categorizar: legitimo (parte de fuente de tokens, conservar) vs ad-hoc (tokenizar). Aplicar la decision. |
| Output | Diagnostico en `progreso-*.md` + archivos modificados si la decision fue tokenizar. |
| Criterio aceptacion | Cada hex en partials globales tiene decision documentada (legitimo o tokenizado). Tests + build verdes. |
| Dependencias | (puede ir en paralelo a T-009..T-013) |
| Esfuerzo | ~30 min |

**Cierre de Fase 3**: `grep -roE "#[0-9a-fA-F]{3,8}" src --include="*.module.scss"` = 0; `grep -rE "stylelint-disable-next-line color-no-hex" src` = 0.

## Fase 4 — Pequenas formalizaciones (~90 min)

### T-015 — Migrar 17 aliases de compatibilidad

| Campo | Valor |
|-------|-------|
| Dimension | D1 |
| Archivos | `_variables.scss` (lectura) + multiples consumers (modificacion) |
| Accion | Para cada uno de los 17 aliases (`$bg-card`, `$primary-tint`, `$text-on-btn`, `$success`, `$warning`, `$error`, `$border`, `$primary`, `$color-primary`, `$color-danger`, `$color-error`, `$color-text`, `$white`, `$surface`, `$bg-subtle`, `$bg-muted`, `$radius-sm`, `$radius-md`, `$radius-lg`, `$font-size-display`): identificar consumers con `grep -rE "\\\$<alias>" src --include="*.scss"`, reemplazar por el nombre canonico. Commit por alias migrado. |
| Output | Multiple `.module.scss` y partials modificados. |
| Criterio aceptacion | Cada uno de los 17 aliases tiene 0 consumers (excepto su propia definicion en `_variables.scss`). Tests + build verdes despues de cada commit. |
| Dependencias | Fase 3 cerrada |
| Esfuerzo | ~30 min (commit por alias, mecanico) |

### T-016 — Eliminar bloque de aliases de `_variables.scss`

| Campo | Valor |
|-------|-------|
| Dimension | D1 |
| Archivos | `src/styles/abstracts/_variables.scss` |
| Accion | Eliminar el bloque "ALIASES — compatibilidad con nombres alternativos" al final del archivo (lineas ~335-370 aproximadamente). Incluye `$white: #FFFFFF` que se reemplaza por referencia a `$bg-surface` o decision contextual. |
| Output | `_variables.scss` sin el bloque de aliases. |
| Criterio aceptacion | `grep -E "^\\\$bg-card:\|^\\\$primary:\|^\\\$color-" src/styles/abstracts/_variables.scss` devuelve 0. `grep -E "^\\\$white" src/styles/abstracts/_variables.scss` devuelve 0. Tests + build verdes. |
| Dependencias | T-015 |
| Esfuerzo | ~10 min |

### T-017 — Revisar 5 clases con guion bajo

| Campo | Valor |
|-------|-------|
| Dimension | D4 |
| Archivos | 5 archivos `.module.scss` con clases que contienen `_` |
| Accion | Identificar las 5 clases con `grep -rohE "^\.[a-zA-Z][a-zA-Z0-9_-]*" src/pages src/components --include="*.module.scss" \| sort -u \| grep "_"`. Para cada una: renombrar a camelCase o documentar con comentario inline la excepcion. |
| Output | 5 archivos modificados o documentados. |
| Criterio aceptacion | Todas las clases pasan `^[a-z][a-zA-Z0-9]*$` o tienen comentario inline justificando. Tests + build verdes. |
| Dependencias | Fase 3 cerrada |
| Esfuerzo | ~15 min |

### T-018 — Activar `selector-class-pattern` en stylelint

| Campo | Valor |
|-------|-------|
| Dimension | D4 |
| Archivos | `.stylelintrc.json` |
| Accion | En el override para `src/**/*.module.scss`, anadir `"selector-class-pattern": ["^[a-z][a-zA-Z0-9]*$", { "message": "CSS module classes must be camelCase" }]`. Ejecutar `npx stylelint "src/**/*.module.scss"` y verificar 0 violaciones. |
| Output | `.stylelintrc.json` modificado. |
| Criterio aceptacion | `npx stylelint "src/**/*.module.scss"` sale con codigo 0. Si hay violaciones, regresar a T-017 antes de cerrar. |
| Dependencias | T-017 |
| Esfuerzo | ~10 min |

### T-019 — ADR `dec-convenciones-de-nombrado-scss`

| Campo | Valor |
|-------|-------|
| Dimension | D4 |
| Archivos | `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` |
| Accion | Anadir nueva ADR siguiendo el formato del archivo: contexto (uniformidad 98-100% de facto pero sin formalizar, regla `selector-class-pattern: null` permitia drift), decision (variables kebab-case, clases camelCase, mixins kebab-case enforzadas via stylelint), alternativas, consecuencias, evidencia. |
| Output | Una nueva seccion `## dec-convenciones-de-nombrado-scss` en el archivo de ADRs. |
| Criterio aceptacion | ADR existe con las 5 secciones canonicas (contexto / decision / alternativas / razon / consecuencias) y referencia a la regla stylelint activada en T-018. |
| Dependencias | (puede ir en paralelo dentro de Fase 4) |
| Esfuerzo | ~25 min |

**Cierre de Fase 4**: criterios de fase 4 del plan cumplidos.

## Fase 5 — Cierre con ritual y ADRs (~150 min)

### T-020 — Ampliar `check-scss.mjs` para validar disables

| Campo | Valor |
|-------|-------|
| Dimension | D9 |
| Archivos | `scripts/check-scss.mjs` o `scripts/check-scss-disables.mjs` (nuevo) |
| Accion | Implementar logica que recorre `src/**/*.scss`, busca lineas `stylelint-disable-next-line` y verifica que el comentario incluye una razon (formato `-- texto`). Falla si encuentra alguno sin razon. |
| Output | Script ampliado o nuevo + entrada en `package.json` si se integra como `npm run lint:scss-disables`. Husky pre-push lo invoca. |
| Criterio aceptacion | Test artificial: anadir `/* stylelint-disable-next-line color-no-hex */` (sin razon) en un archivo SCSS, ejecutar el script, debe fallar. Anadir `--razon` y debe pasar. Eliminar artificios al cerrar. |
| Dependencias | Fase 4 cerrada |
| Esfuerzo | ~45 min |

### T-021 — Documentar ritual trimestral

| Campo | Valor |
|-------|-------|
| Dimension | D9 |
| Archivos | `docs/desarrollo/ritual-revision-scss.md` (nuevo) |
| Accion | Crear documento con secciones: proposito, responsable (rotativo o propietario fijo), procedimiento paso a paso, criterio de retirada de excepciones, herramientas (`scripts/check-scss.mjs`, `npx stylelint`), referencia a las ADRs relevantes. |
| Output | 1 archivo nuevo. |
| Criterio aceptacion | Archivo existe con las secciones requeridas. |
| Dependencias | Fase 4 cerrada |
| Esfuerzo | ~30 min |

### T-022 — Ampliar ADR `dec-color-no-hex-con-allowlist-documentada`

| Campo | Valor |
|-------|-------|
| Dimension | D3 + D9 |
| Archivos | `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` |
| Accion | Anadir bloque "Actualizacion 2026-05-21" o reescribir la ADR existente para reflejar como la disciplina se materializa realmente: comentarios inline `/* stylelint-disable-next-line color-no-hex -- razon */`, bloqueador pre-push que enforza el formato, ritual trimestral. Referenciar T-020 y T-021. |
| Output | ADR ampliada. |
| Criterio aceptacion | La ADR refleja el estado actual del repo tras la iniciativa. Las 5 secciones canonicas siguen presentes. |
| Dependencias | T-020 |
| Esfuerzo | ~20 min |

### T-023 — ADR `dec-tokens-solo-sass-no-css-vars`

| Campo | Valor |
|-------|-------|
| Dimension | D8 |
| Archivos | `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` |
| Accion | Anadir nueva ADR formalizando que los tokens viven solo como variables SCSS, no como CSS custom properties. Contexto: sin theming dinamico, sin lectura desde JS. Decision: tokens en SCSS exclusivamente. Alternativas: exponer todos los tokens como `--*`, mixto. Consecuencias: si surge demanda de theming dinamico, sera iniciativa propia que amplia. |
| Output | Una nueva seccion `## dec-tokens-solo-sass-no-css-vars`. |
| Criterio aceptacion | ADR existe con 5 secciones canonicas. |
| Dependencias | (puede ir en paralelo dentro de Fase 5) |
| Esfuerzo | ~20 min |

### T-024 — `decisiones-mapear-y-corregir-scss-completo.md` y cierre

| Campo | Valor |
|-------|-------|
| Dimension | Cierre |
| Archivos | `docs/pm/iniciativas/mapear-y-corregir-scss-completo/decisiones-mapear-y-corregir-scss-completo.md` (nuevo), `docs/pm/iniciativas/indice-de-iniciativas.md`, `docs/pm/iniciativas/mapear-y-corregir-scss-completo/index.md`, `progreso-*.md` |
| Accion | Producir documento de decisiones de la iniciativa con las 4 secciones canonicas de PROC-GESTION-001: contexto, decisiones tomadas (las 4 del alcance + emergentes), alternativas consideradas, consecuencias. Actualizar el indice global: estado pasa a `Cerrada`. Actualizar `index.md` de la iniciativa. Registrar evento `Cierre de iniciativa` en `progreso-*.md`. |
| Output | 1 archivo nuevo + 2 actualizados. |
| Criterio aceptacion | Documento de decisiones existe con 4 secciones. Indice global muestra `Cerrada`. Working tree limpio. |
| Dependencias | Todas las anteriores |
| Esfuerzo | ~35 min |

**Cierre de Fase 5**: iniciativa cerrada formalmente.

## Resumen

| Item | Conteo |
|------|--------|
| Total de tareas | 24 |
| Esfuerzo estimado total | ~525 min (~8.75 h) |
| Archivos `.scss` esperados de tocar | ~22 (`.module.scss` consumers + partials) |
| ADRs nuevas a producir | 2 (`dec-convenciones-de-nombrado-scss`, `dec-tokens-solo-sass-no-css-vars`) |
| ADRs a ampliar | 1 (`dec-color-no-hex-con-allowlist-documentada`) |
| Scripts a modificar/crear | 1-2 (`check-scss.mjs` ampliado o `check-scss-disables.mjs` nuevo) |
| Documentos de ritual nuevos | 1 (`docs/desarrollo/ritual-revision-scss.md`) |

## Verificacion global al cierre

Antes de marcar la iniciativa como `Cerrada`:

```bash
# D3 — no hay hex en .module.scss
grep -roE "#[0-9a-fA-F]{3,8}" src --include="*.module.scss" | wc -l
# espera: 0

# D3 — no hay disables de color-no-hex
grep -rE "stylelint-disable-next-line color-no-hex" src | wc -l
# espera: 0

# D5 — no hay rutas relativas a abstracts
grep -rE "@use '\.\./abstracts'" src --include="*.scss" | wc -l
# espera: 0

# D6 — variables muertas eliminadas (sample)
grep -E "^\\\$accent-light|^\\\$footer-bg" src/styles/abstracts/_variables.scss | wc -l
# espera: 0

# D1 — aliases de compatibilidad eliminados
grep -E "^\\\$bg-card:|^\\\$primary:|^\\\$color-" src/styles/abstracts/_variables.scss | wc -l
# espera: 0

# Build / tests / linters
npm test
npm run verify-build
npx stylelint "src/**/*.scss"
node scripts/check-scss.mjs
```

Todos los anteriores deben pasar para considerar la iniciativa
cerrable.
