# Replan — `mapear-y-corregir-scss-completo`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Replan formal tras inspeccion de `ui-core-5.25.0` y aprobacion del modo B + prefijo `--ec-` |
| Fecha | 2026-05-21 |
| Estado al producir | En ejecucion (replan en curso) |
| Reemplaza a | `plan-mapear-y-corregir-scss-completo.md` (queda vigente como plan historico previo al replan) |
| Inputs | `alcance-*.md`, `analisis-*.md`, `analisis-inspiracion-ui-core-5.25.0.md`, decisiones aprobadas del usuario |

## Por que este replan existe

El plan original (`plan-*.md`, producido en commit `9c7c406`)
asumía una iniciativa de **auditoria + correccion ligera** del
SCSS existente: tokenizar 17 hex, eliminar 40 variables y 9
mixins muertos, migrar 18 paths relativos, formalizar 3 ADRs.
Esfuerzo estimado 8.75 h, 24 tareas T-001..T-024.

Tras la directiva del usuario "no borres nada, integra de manera
correcta" + la inspeccion del template de referencia
`ui-core-5.25.0` + las decisiones D-MODO (puerto como mixins)
y D-PREFIJO (`--ec-`), la iniciativa cambia de naturaleza:

| Antes | Ahora |
|-------|-------|
| Auditar y corregir SCSS existente | Auditar + portar selectivamente SCSS de ui-core como mixins + integrar |
| 24 tareas | ~38 tareas |
| 8.75 h | ~40 h |
| Toca ~22 archivos | Toca ~80 archivos (122 SCSS existentes + ~50 partials nuevos portados) |
| Sin nuevas dependencias | Anade `find-unused-sass-variables` |
| Sin custom properties | Anade ~30-50 custom properties con prefijo `--ec-` |

Este es **el alcance final**. El plan original queda como
historico; este replan lo reemplaza operativamente.

## Disciplina de portacion

Cada partial de ui-core que se porta sigue esta disciplina:

1. **Origen**: archivo en `/tmp/references/ui-core-5.25.0/scss/`.
2. **Destino**: archivo en
   `/tmp/project/template-ecommerce-ui/src/styles/abstracts/`
   (o subdirectorio apropiado).
3. **Adaptaciones obligatorias**:
   - Eliminar el namespace `--cui-` de ui-core y reemplazar por
     `--ec-` donde aplique (custom properties).
   - Convertir clases globales en mixins. Ejemplo:
     ```scss
     // En ui-core:
     .btn { padding: $btn-padding-y $btn-padding-x; ... }
     // En nuestro template:
     @mixin btn-base { padding: $btn-padding-y $btn-padding-x; ... }
     ```
   - Si la clase tiene variantes (`.btn`, `.btn-primary`,
     `.btn-lg`), generar mixins parametrizados:
     ```scss
     @mixin btn-base { ... }
     @mixin btn-variant($color) { background: $color; ... }
     @mixin btn-size($padding-y, $padding-x, $font-size) { ... }
     ```
4. **Atribucion**: cada archivo portado lleva header inicial:
   ```scss
   // Portado de ui-core-5.25.0 (CoreUI Pro) — MIT-equivalente
   // Adaptado a CSS Modules con prefijo --ec-
   // Iniciativa: mapear-y-corregir-scss-completo
   ```
5. **Preservacion del `!default`**: las variables siguen
   declarandose con `!default` para permitir override del
   adoptante.
6. **fusv-disable**: las variables o mixins que se anaden como
   API publica pero no se usan inmediatamente se marcan con
   `// fusv-disable` para excluirlas del scan.

## Disciplina de licencia

CoreUI Pro tiene licencia comercial; CoreUI (no-pro) es MIT. El
archivo `LICENSE` del repo `ui-core-5.25.0` clonado debe
verificarse antes de portar. Si la licencia no permite la
adaptacion derivada en este proyecto, **la iniciativa debe
detenerse y replantear**.

Tarea T-101 dedicada a este chequeo. Bloquea toda la fase de
portacion.

## Fases nuevas

El plan original tenia 5 fases (F1..F5). El replan introduce
**4 fases nuevas** (F0a, F1a, F4a, F5a) que extienden, no
reemplazan:

| Fase | Tipo | Objetivo | Esfuerzo |
|------|------|----------|----------|
| F0  | Cierre de mapeos | Mapeos pendientes (D2 _animations, D7 !important) | ~60 min — **ya completado** (T-001, T-002) |
| **F0a** | **Pre-portacion** | **Verificar licencia ui-core, instalar fusv, decidir alcance de portacion** | **~90 min** |
| F1  | Cierre de Fase 1 | Acciones derivadas de T-001 y T-002 reformuladas (no eliminar `_animations.scss`, refactorizar Toast) | ~90 min |
| **F1a** | **Portacion de capa abstracta** | **Portar variables maps functions mixins helpers de ui-core como mixins** | **~720 min (12 h)** |
| F2  | Limpieza interna | D6 reinterpretada: marcar muertos como API publica con fusv-disable + integrar los que tienen patron en ui-core; D5 migracion paths | ~180 min |
| F3  | Tokenizacion de hex | D3 sin cambios sustanciales | ~120 min |
| F4  | Formalizaciones | D1 D4 D8 — D8 ahora ADR de tokens-via-sass-y-cssvars-selectivos con `--ec-` | ~150 min |
| **F4a** | **Integracion en componentes** | **Aplicar mixins portados en `.module.scss` existentes (botones, cards, modals, forms)** | **~600 min (10 h)** |
| F5  | Ritual y ADRs | D9 fusv + bloqueador pre-push + ritual trimestral + ADRs formales | ~240 min |
| **F5a** | **Documentacion del template** | **Producir `docs/desarrollo/guia-de-scss.md` explicando el sistema portado para futuros contribuyentes** | **~90 min** |
| **Total** | | | **~2400 min (~40 h)** |

## DAG actualizado de fases

```
F0 (completado) ─┐
                 ├─ F0a (licencia, fusv, alcance portacion)
                 │   └─ F1 (cierre acciones T-001, T-002 reformuladas)
                 │       └─ F1a (portacion masiva ui-core como mixins)
                 │           ├─ F2 (D6 + D5)
                 │           │   └─ F3 (D3 tokenizacion hex)
                 │           │       └─ F4 (D1 D4 D8 con --ec-)
                 │           │           └─ F4a (integracion en .module.scss)
                 │           │               └─ F5 (ritual y ADRs)
                 │           │                   └─ F5a (guia de scss)
                 │           │                       └─ CIERRE
```

## Tareas reformuladas y nuevas

### Tareas que se mantienen sin cambios

T-001, T-002 (ya cerradas), T-008 a T-014 (tokenizacion hex
sigue siendo 1:1, no afectada por la portacion).

### Tareas que cambian de accion

| ID | Original | Nuevo |
|----|----------|-------|
| **T-001 accion derivada** | Eliminar `components/_animations.scss` huerfano | **Integrar siguiendo `_transitions.scss` + `_spinners.scss` de ui-core**: portar el mixin `transition` parametrizado de ui-core; conectar `components/_animations.scss` desde `main.scss`; aplicar mixins en componentes que usen animaciones |
| **T-002 accion derivada** | Refactorizar Toast para eliminar `!important` en `.icon` | Sin cambio (modificar modifiers para cambiar `background` en lugar de `color`) + **portar mixin `focus-ring` de ui-core y aplicar en Toast close button** |
| **T-003** | Eliminar 40 variables muertas | **Categorizar 40 muertas (A/B/C/D/E) + marcar `// fusv-disable` cada una con etiqueta + para las que tienen patron en ui-core, anadir tarea de integracion T-NUEVA-XX correspondiente** |
| **T-004** | Eliminar 9 mixins muertos | **Para cada mixin: si ui-core lo tiene activo, anadir tarea T-NUEVA-XX de integracion; si no tiene equivalente, marcar como API publica con `// fusv-disable` y comentario justificando** |
| **T-015** | Migrar 17 aliases de compatibilidad eliminandolos | **Migrar consumers de cada alias al nombre canonico; NO eliminar los aliases hasta que tengan cero consumers; documentar cada alias con razon de existir hasta su migracion** |
| **T-016** | Eliminar el bloque de aliases del final de `_variables.scss` | **Marcar el bloque con `// fusv-disable` + comentario "Bloque de aliases en migracion progresiva"; eliminacion solo cuando los 17 aliases tengan cero consumers (validable con fusv)** |
| **T-023** | Producir ADR `dec-tokens-solo-sass-no-css-vars` (sin custom properties) | **Producir ADR `dec-tokens-via-sass-y-cssvars-selectivos`**: adopcion parcial del patron de ui-core con prefijo `--ec-`. Exponer como custom properties solo: colores primarios, dimensiones de layout (sidebar/header), tokens semanticos de estado. Resto solo SCSS. |

### Tareas nuevas (F0a — Pre-portacion)

| ID | Dimension | Accion | Esfuerzo |
|----|-----------|--------|----------|
| **T-101** | Setup | Verificar licencia de `ui-core-5.25.0`. Si MIT o compatible: continuar. Si propietaria: detener iniciativa y replantear. | ~15 min |
| **T-102** | D9 | Instalar `find-unused-sass-variables` como devDependency. Anadir script `lint:scss-vars` a `package.json`. Test artificial. | ~30 min |
| **T-103** | F0a | Inventariar partials de ui-core a portar. Tabla de decision: portar / portar-adaptado / no-portar-por-arquitectura / fuera-de-scope. | ~45 min |

### Tareas nuevas (F1a — Portacion de capa abstracta)

Cada tarea porta un grupo coherente de ui-core. La carpeta destino
es `src/styles/abstracts/` con subdirectorios.

| ID | Origen | Destino | Esfuerzo |
|----|--------|---------|----------|
| **T-201** | `scss/functions/_*.scss` (13 funciones) | `src/styles/abstracts/functions/_*.scss` (nuevo directorio) | ~60 min |
| **T-202** | `scss/_variables.scss` (2845 lineas) | **Integrar** en `src/styles/abstracts/_variables.scss` existente (sin reemplazar; conservar las nuestras + anadir las de ui-core que no tengamos, todas con `!default`) | ~120 min |
| **T-203** | `scss/_variables-dark.scss` (222 lineas) | `src/styles/abstracts/_variables-dark.scss` (nuevo) | ~30 min |
| **T-204** | `scss/_maps.scss` o equivalente | `src/styles/abstracts/_maps.scss` (nuevo). Mapas SCSS para colores, grays, theme-colors, spacers, breakpoints. | ~45 min |
| **T-205** | `scss/mixins/_*.scss` (33 archivos) | `src/styles/abstracts/mixins/_*.scss` (nuevo directorio). Conservar nombres de archivo. | ~120 min |
| **T-206** | `scss/helpers/_visually-hidden.scss` | Consolidar con nuestro `@mixin visually-hidden` existente en `_mixins.scss` | ~15 min |
| **T-207** | `scss/helpers/_focus-ring.scss` + `scss/mixins/_focus-ring.scss` | Portar como mixin en `abstracts/mixins/_focus-ring.scss` + integrar con `_focus-indicators.scss` existente | ~30 min |
| **T-208** | `scss/_root.scss` (130 custom properties) | `src/styles/abstracts/_root.scss` (nuevo). **Filtro selectivo**: exponer como `--ec-X` solo los tokens que JS razonablemente podria querer leer (~30-50 properties, no 130). | ~90 min |
| **T-209** | `scss/_<componente>.scss` (~30 partials de componente) | **NO portar como partials con clases globales**. En su lugar, **convertir a mixins parametrizados** dentro de `src/styles/abstracts/mixins/components/_<componente>.scss`. Solo se portan los que se usen en `.module.scss` existentes del template. | ~180 min |

### Tareas nuevas (F2 — D6 + D5 reinterpretadas)

| ID | Dimension | Accion |
|----|-----------|--------|
| **T-301** | D6 | Categorizar las 40 variables muertas en grupos (A aliases no adoptados, B footer, C z-index, D spacings, E patron-en-ui-core). Marcar cada una con `// fusv-disable` y comentario explicativo. |
| **T-302** | D6 | Integrar las que tienen patron en ui-core: refactorizar los breakpoint mixins (`media-xl`, `media-2xl`) a un mixin parametrizado `media-up($bp)` siguiendo ui-core. |
| **T-303** | D6 | Documentar los 9 mixins muertos: 1 a integrar (`focus-ring`, ya en T-207), 8 a marcar como API publica. |
| T-005..T-007 | D5 | Sin cambios (migracion de 18 paths relativos + 1 import parcial + verificacion check-scss). |

### Tareas nuevas (F4a — Integracion en componentes)

Esta fase aplica los mixins portados a `.module.scss` existentes
del template. Una tarea por familia de componente:

| ID | Familia | Componentes afectados | Esfuerzo |
|----|---------|----------------------|----------|
| **T-401** | Buttons | Todos los `.module.scss` que tienen clases de tipo `.button`, `.btn`, `.cta`, etc — aplicar `@include btn-base` + variantes | ~120 min |
| **T-402** | Cards | Componentes con cards de producto, panels, info-cards | ~90 min |
| **T-403** | Forms | inputs, textareas, selects, checkbox, radio, form-stepper | ~120 min |
| **T-404** | Modal/Toast | ModalContainer, ToastContainer | ~60 min |
| **T-405** | Tables | Componentes de admin con tablas (orders, products, customers) | ~90 min |
| **T-406** | Focus / accessibility | Aplicar `@include focus-ring` en TODOS los elementos interactivos | ~60 min |
| **T-407** | Animations | Aplicar `@include transition($value)` parametrizado en lugar de duraciones hardcoded | ~60 min |

### Tareas nuevas (F5a — Documentacion)

| ID | Dimension | Accion |
|----|-----------|--------|
| **T-501** | Doc | Producir `docs/desarrollo/guia-de-scss.md` con: estructura, convenciones, lista de mixins disponibles, prefijo `--ec-`, ejemplo de uso desde `.module.scss`, referencia a ui-core como origen | ~60 min |
| **T-502** | Doc | Actualizar `glosario/glosario.md` con entradas: "prefijo `--ec-`", "fusv", "portado de ui-core" | ~15 min |

## Estimacion total de esfuerzo

| Fase | Esfuerzo |
|------|----------|
| F0 (cerrada) | 60 min |
| F0a | 90 min |
| F1 cierre (acciones T-001, T-002 reformuladas) | 90 min |
| F1a portacion capa abstracta | 720 min |
| F2 D6 + D5 | 180 min |
| F3 tokenizacion hex (sin cambios) | 120 min |
| F4 formalizaciones | 150 min |
| F4a integracion en componentes | 600 min |
| F5 ritual y ADRs | 240 min |
| F5a documentacion | 90 min |
| **Total** | **2340 min (~39 h)** |

## Tabla resumen del cambio respecto al plan original

| Aspecto | Plan original | Replan |
|---------|---------------|--------|
| Tareas | 24 | ~52 |
| Fases | 5 | 9 (5 originales + 4 nuevas) |
| Esfuerzo | 8.75 h | 39 h |
| Naturaleza | Auditoria + correccion ligera | Auditoria + portacion + integracion masiva |
| ADRs a producir | 2 nuevas + 1 ampliada | 3 nuevas + 1 ampliada + ADR sobre portacion |
| Archivos nuevos en repo | 0-1 | ~50 (mixins, functions, helpers portados) |
| Custom properties | 0 (decision anterior) | ~30-50 con prefijo `--ec-` |
| Dependencias nuevas | 0 | `find-unused-sass-variables` |
| Riesgo de regresion | Bajo | Medio-alto |

## Riesgo y mitigaciones

| Riesgo | Mitigacion |
|--------|------------|
| Variables de ui-core colisionan con nombres existentes nuestros | En T-202, verificar nombre por nombre antes de anadir. Si colisiona, conservar el nuestro y aplicar prefijo `ec-` al de ui-core. |
| Funciones SCSS de ui-core tienen dependencias entre si | T-201 las porta como conjunto coherente (las 13 a la vez) tras analizar dependencias. |
| El puerto rompe `npm run verify-build` por sintaxis nueva (e.g. funciones `sass:color`) | Tests intermedios en cada T-NUEVA-X. Build verde antes y despues. |
| Mixins parametrizados consumen mas tiempo de implementacion | T-209 limita a "solo los que se usan en .module.scss existentes", no todos los 70 componentes de ui-core. |
| Licencia de ui-core no permite la adaptacion | **T-101 es bloqueante**. Detener iniciativa si la licencia es incompatible. |
| Esfuerzo de 39h es subestimacion | El esfuerzo se reevalua al cierre de F1a (portacion). Si excede 50% lo previsto, replan formal con el usuario. |

## Que se ejecuta cuando

Estado actual: F0 cerrada, F1 pendiente del cierre con acciones
reformuladas.

Orden de ejecucion tras este replan:

1. **F1 cierre** (90 min): aplicar las acciones reformuladas de
   T-001 y T-002 que estaban pendientes. **No eliminar
   components/_animations.scss**, en su lugar conectarlo
   (acordara con T-201/T-205 dependiendo de lo que requiera).
2. **F0a** (90 min): verificar licencia (T-101), instalar fusv
   (T-102), inventariar partials a portar (T-103).
3. **F1a** (720 min): portacion masiva. Bloque mayor, divisible
   en 4-5 sesiones de trabajo.
4. **F2-F5a**: en orden, con verificacion `npm test` + `verify-build`
   + delta-cero entre cada fase.

## Decisiones tomadas en este replan sin pausar

Aplicando la regla del usuario "tomar siempre la mejor decision":

1. **Mantener T-001 y T-002 ya cerradas**. Los diagnosticos
   producidos en sus commits siguen siendo validos; lo que
   cambia es la accion derivada, que se ejecuta ahora.
2. **No portar bundles `coreui-*.scss`**. Razon documentada en
   D-COREUI-BUNDLES.
3. **No portar archivos `.rtl.scss`**. RTL fuera de scope.
4. **No portar `themes/bootstrap/`**. Fuera de scope.
5. **No portar `scss/sidebar/`** completo como bundle; solo
   los mixins de comportamiento de sidebar si nuestro template
   los necesita.
6. **No portar `scss/vendor/_rfs.scss`** (responsive font sizing
   de Bootstrap). Es una decision arquitectonica de tipografia
   que requiere su propia ADR; fuera del scope de esta
   iniciativa.

## Que NO esta dentro del alcance (confirmacion)

- Theming dinamico runtime con dark mode activo. T-208 expone
  custom properties para que la **infraestructura** este lista,
  pero **no implementa** el toggler de dark mode ni el sistema
  de preferencia del usuario.
- Soporte RTL.
- Soporte de themes alternativos.
- Componentes nuevos (incluyendo Footer). Las variables de
  footer se conservan con `fusv-disable`; no se implementa el
  componente.
- Renombrar el proyecto (`ecommerce-ui` -> `e-commerce-ui`).
- Eliminar referencias al template antecesor `mx-template`.

## Pre-condicion para reanudar ejecucion

Antes de pasar a la ejecucion de F1 (cierre) + F0a + F1a..F5a:

1. El usuario confirma este replan.
2. Tareas reformuladas + nuevas registradas en `tareas-*.md`
   (siguiente paso).
3. `alcance-*.md` actualizado con las decisiones formales
   (siguiente paso).

## Que sigue

1. Actualizar `tareas-mapear-y-corregir-scss-completo.md`
   incorporando las tareas reformuladas y las nuevas.
2. Actualizar `alcance-mapear-y-corregir-scss-completo.md` con
   las decisiones aprobadas (D-MODO, D-PREFIJO, D-COREUI-BUNDLES)
   + las nuevas Decision 5 y Decision 6 (fusv, !default,
   custom properties selectivas).
3. Registrar `Cambio de alcance` y `Replan` formales en
   `progreso-*.md`.
4. Reanudar ejecucion desde F1 (cierre con acciones reformuladas).
