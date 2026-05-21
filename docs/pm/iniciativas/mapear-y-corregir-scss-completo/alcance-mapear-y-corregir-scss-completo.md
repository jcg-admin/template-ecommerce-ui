# Alcance — `mapear-y-corregir-scss-completo`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Alcance final propuesto para confirmacion del usuario |
| Fecha | 2026-05-21 |
| Estado al producir | En analisis |
| Input | `analisis-mapear-y-corregir-scss-completo.md` (655 lineas, 9 dimensiones mapeadas) |

## Proposito de este documento

Convertir el alcance preliminar declarado en `index.md` y el
mapeo del analisis en un **contrato verificable**: cada dimension
con criterio de "mapeado" cerrado, criterio de "corregido"
operativo, y dependencias declaradas.

**Este documento marca el punto de pausa obligatoria del flujo**.
Sin confirmacion explicita del usuario sobre este alcance, no se
produce el plan ni se ejecutan tareas.

## Resumen ejecutivo

Nueve dimensiones a mapear y corregir, con esfuerzo total estimado
de **~10.5 horas efectivas**. Distribucion de prioridad segun el
diagnostico:

| Prioridad | Dimensiones |
|-----------|-------------|
| **Alta** (deuda significativa) | D3 (hex), D6 (muertas), D9 (ritual) |
| **Media** (deuda menor pero accionable) | D1 (aliases), D5 (pipeline), D7 (!important) |
| **Baja** (mayormente formalizacion) | D2 (organizacion), D4 (convenciones), D8 (custom props) |

Tres entregables al cierre, ademas del repo modificado:

- **ADR nueva o ampliada** sobre convenciones de nombrado SCSS
  (D4).
- **ADR nueva o ampliada** sobre allowlist hex con disciplina de
  documentacion en disables (D3 + D9).
- **ADR nueva** declarando que el template usa tokens solo en SCSS
  (no CSS custom properties), si la decision se confirma (D8).

## Criterios de aceptacion por dimension

Cada dimension tiene **criterio de mapeo** (que se considera
inventariado) y **criterio de correccion** (que se considera
arreglado). Las correcciones son obligatorias salvo donde se
indique "opcional".

### D1 — Tokens de diseno

**Mapeo cerrado** (ya cubierto por el analisis):
- Inventario completo de variables en `_variables.scss` (223
  variables en 15 secciones).
- Identificacion de las 17 variables aliases de compatibilidad
  al final del archivo.

**Correccion exigida**:
- Los 17 aliases del bloque final eliminados.
- Sus consumers migrados al nombre canonico (e.g. `$bg-card` ->
  `$card-bg`).
- Si alguno se conserva por razon documentada (e.g. uso muy
  extendido cuyo cambio impactaria demasiados archivos), se
  marca con comentario explicito justificando.
- `$white: #FFFFFF` reemplazado por referencia a `$bg-surface`
  o tokenizado con nombre semantico.

**Criterio de "corregido"**: `grep -E "^\\\$bg-card|^\\\$primary:|^\\\$color-" src/styles/abstracts/_variables.scss`
devuelve cero o solo aliases marcados con comentario justificando.

### D2 — Organizacion de archivos

**Mapeo exigido**:
- Verificar contenido de `base/_animations.scss` vs
  `components/_animations.scss`. Determinar si son duplicados,
  complementarios, o tienen propositos distintos.
- Inventariar la presencia/ausencia de `_index.scss` en cada
  subdirectorio de `src/styles/`.

**Correccion exigida**:
- Si `_animations.scss` esta duplicado: consolidar en uno solo.
- Politica de `_index.scss` documentada: o todos los
  subdirectorios lo tienen, o ninguno fuera de `abstracts/` y
  `accessibility/` (que son los unicos que sirven barrel real).
- `_utilities.scss` solitario en `utils/` evaluado: si no crece
  el directorio, considerar moverlo a `base/`.

**Criterio de "corregido"**: hay decision documentada sobre
duplicacion y barrels, aplicada al codigo.

### D3 — Hex literales y allowlist

**Mapeo cerrado** (ya cubierto por el analisis):
- 17 hex en `.module.scss` con archivo:linea (tabla completa en
  `analisis-*.md`).
- 6 colores unicos identificados, con frecuencia de uso.
- Verificacion via stylelint controlado: la regla funciona, los
  disables la neutralizan.

**Correccion exigida**:
- Tokenizar los 6 colores unicos en `_variables.scss` con
  nombres semanticos (no genericos como `$color-1`). Propuesta
  de nombres a decidir durante la ejecucion:
  - `#d4c4a8` (x4): probable `$border-soft-beige` o similar.
  - `#c8b88a` (x3): probable `$bg-warm-beige` o similar.
  - `#cfc4b3` (x3): probable `$border-neutral-warm`.
  - `#5a36d0` (x3): probable `$badge-info-text` (badges
    morados de "info diferenciada" en returns/admin).
  - `#b08a3c`, `#6b5618`: usos puntuales, nombres a decidir
    en contexto.
- Reemplazar los 17 usos por la variable correspondiente.
- Eliminar los 17 comentarios `stylelint-disable-next-line
  color-no-hex` correspondientes.
- Si un color queda sin tokenizar por razon legitima
  (improbable dado el analisis), reemplazar el disable inline
  por una entrada documentada en la allowlist real (a definir
  donde vive: `.stylelintrc.json` o un archivo aparte).

**Verificacion del hex en partials globales**:
- Revisar el hex en `_focus-indicators.scss:1` y los 2 en
  `_mixins.scss`. Si son legitimos (parte de la fuente de
  tokens), conservar; si son ad-hoc, tokenizar.

**Criterio de "corregido"**:
- `grep -roE "#[0-9a-fA-F]{3,8}" src --include="*.module.scss"`
  devuelve 0 ocurrencias.
- `grep -rE "stylelint-disable-next-line color-no-hex" src` devuelve 0.

### D4 — Convenciones de nombrado

**Mapeo cerrado** (ya cubierto por el analisis):
- 223/223 variables kebab-case.
- 319/324 clases camelCase (5 excepciones con guion bajo).
- 52/52 mixins kebab-case.

**Correccion exigida**:
- **ADR nueva** `dec-convenciones-de-nombrado-scss` que formalice
  las tres convenciones existentes de facto.
- Activar `selector-class-pattern: "^[a-z][a-zA-Z0-9]*$"` en
  stylelint para `.module.scss` (regla actualmente `null`).
- Revisar las 5 clases con guion bajo: o se renombran a
  camelCase, o se documenta la excepcion (puede ser BEM modifier
  intencional).

**Criterio de "corregido"**:
- ADR escrita y aceptada.
- `npx stylelint "src/**/*.module.scss"` pasa con la nueva
  regla activa.
- Si quedan excepciones (5 clases con `_`), estan documentadas
  en comentario inline.

### D5 — Pipeline `@use` / `@forward` / `@import`

**Mapeo cerrado** (ya cubierto por el analisis):
- 0 `@import` legacy.
- 129 `@use`, 2 `@forward`.
- 18 archivos con `@use '../abstracts' as *` (ruta relativa) en
  vez del alias.
- 1 archivo con import parcial directo
  (`@use '../abstracts/variables' as *`).

**Correccion exigida**:
- Migrar los 18 archivos a `@use '@styles/abstracts' as *`.
- Migrar el 1 archivo con import parcial al barrel.
- Verificar que `scripts/check-scss.mjs` enforza esta forma
  canonica; si no lo hace para algun directorio, ampliar.

**Criterio de "corregido"**:
- `grep -rE "@use '\.\./abstracts" src --include="*.scss"`
  devuelve 0.
- `grep -rE "@use '\.\./abstracts/variables" src` devuelve 0.

### D6 — Variables muertas y mixins no usados

**Mapeo cerrado** (ya cubierto por el analisis):
- 40 variables muertas listadas.
- 9 mixins muertos listados.

**Correccion exigida**:
- **Decision por variable** entre dos opciones:
  - **Eliminar** si no hay caso de uso previsto.
  - **Conservar y documentar** como API publica del template
    para adoptantes (e.g. `$footer-*` si se espera que el
    adoptante implemente un footer reusando los tokens).
- Lo mismo para los 9 mixins.
- Las que se conservan llevan comentario inline justificando.

**Decision propuesta de partida**: eliminar todas salvo
justificacion explicita. Razon: 18% del catalogo muerto
contamina la lectura del template para adoptantes; mejor
empezar con un catalogo vivo y reintroducir variables cuando
haya demanda real.

**Criterio de "corregido"**:
- Re-ejecucion del script de variables muertas devuelve 0 (o
  solo las explicitamente marcadas como API publica).
- El build sigue pasando: `npm run verify-build` verde.

### D7 — Especificidad y `!important`

**Mapeo exigido** (no completamente cerrado por el analisis):
- Lista completa de `!important` con archivo:linea (14
  ocurrencias).
- Por cada ocurrencia, categorizacion: legitimo (mixin
  visually-hidden), sospechoso (sin razon obvia), candidato a
  eliminar.

**Correccion exigida**:
- Los legitimos llevan comentario inline justificando.
- Los sospechosos: refactorizar la cascada para no necesitar
  `!important`, o documentar razon.

**Criterio de "corregido"**:
- Todo `!important` restante tiene comentario inline con razon.
- `npm run verify-build` verde.

### D8 — CSS custom properties

**Mapeo cerrado**:
- 0 declaraciones de `--*` en SCSS.
- Decision implicita: tokens solo en SCSS, no expuestos a JS.

**Correccion exigida**:
- **ADR nueva** `dec-tokens-solo-sass-no-css-vars` que formalice
  la decision con su razon: el template no tiene theming
  dinamico runtime, JS no necesita leer tokens, no hay caso de
  uso actual para custom properties.
- Si en el futuro surge necesidad (dark mode, adoptante con
  multi-tenant, etc), sera iniciativa propia que amplia esta
  ADR.

**Criterio de "corregido"**: ADR escrita y aceptada.

### D9 — Ritual de monitoreo

**Sin fase de mapeo**: la dimension es la salida del trabajo,
no su entrada.

**Correccion exigida**:
- **Bloqueador mecanico en pre-push**: ampliar
  `scripts/check-scss.mjs` (o crear `scripts/check-scss-disables.mjs`
  paralelo) para rechazar `stylelint-disable-next-line
  color-no-hex` sin razon documentada. Convencion propuesta: el
  comentario debe tener formato `/* stylelint-disable-next-line
  color-no-hex -- razon */` con texto despues de `--`.
- **Catalogo central** de disables vigentes: tras la correccion
  de D3, idealmente no quedan disables; si quedan algunos
  excepcionales, viven en un lugar central (e.g. seccion
  documentada en `.stylelintrc.json` o archivo aparte).
- **Ritual trimestral documentado** en
  `docs/desarrollo/ritual-revision-scss.md` (o ubicacion
  similar): responsable, procedimiento, criterio de retirada.
- **ADR ampliada**: la ADR existente
  `dec-color-no-hex-con-allowlist-documentada` se amplia o
  reemplaza para reflejar como la disciplina se materializa
  realmente (con razon documentada en comentario, no como lista
  central).

**Criterio de "corregido"**:
- El script pre-push esta activo y prueba (test artificial:
  anadir disable sin razon -> pre-push falla).
- Documentacion del ritual existe.
- ADR escrita/ampliada y aceptada.

## Lo que NO esta dentro del alcance (confirmacion)

Repetido del `index.md` para evitar deriva:

- **Rediseno de la paleta visual**. Los tokens se consolidan, no
  se redisenan.
- **Migracion a otra tecnologia** (Tailwind, CSS-in-JS, etc).
- **Cambio de la decision de CSS modules** como arquitectura.
- **Componentes nuevos**.
- **Cambios visuales perceptibles**. Cada correccion debe ser
  visualmente neutra. Excepciones documentadas y validadas con
  captura antes/despues.

## Disciplina de correccion

Reglas operativas vigentes en toda la fase correctiva:

1. **Una correccion por commit**. Aislar el cambio facilita
   rollback si rompe algo. Excepciones permitidas solo cuando
   varias correcciones son inseparables (e.g. mover una variable
   y actualizar todos sus consumers en un solo commit porque
   dejar el repo en estado intermedio rompe el build).
2. **Tests verdes en cada commit**. `npm test` debe pasar antes
   y despues de cada commit.
3. **Build limpio en cada commit**. `npm run verify-build` debe
   pasar antes y despues.
4. **Validacion visual cuando aplica**. Para correcciones que
   tocan componentes con render observable, comparar antes/
   despues. Si una correccion altera el render, se documenta y
   se obtiene confirmacion antes de aplicar.
5. **Mensaje de commit explicito** sobre la dimension y la
   sub-correccion. Ejemplo: "Tokenize beige border color used
   in account pages (D3)".

## Orden de ejecucion propuesto

Por dependencias y por gradiente de riesgo:

| Fase | Dimensiones | Razon |
|------|-------------|-------|
| 1. Cierre de mapeos pendientes | D2, D7 | Cubrir lo que el analisis dejo abierto |
| 2. Limpieza interna sin impacto visible | D6, D5 | Bajo riesgo, prepara terreno |
| 3. Tokenizacion de hex | D3 | Alta densidad de cambios, ya bien mapeado |
| 4. Pequenas formalizaciones | D1, D4, D8 | Refactor de aliases + ADRs |
| 5. Cierre con ritual | D9 | Bloqueador + ADR ampliada al final |

Esto **es propuesta de orden**, no decision final; la decision
vive en `plan-*.md`.

## Decisiones de proceso pendientes de confirmacion

Las siguientes decisiones afectan la ejecucion y se piden al
usuario explicitamente:

### Decision 1 — Eliminar variables muertas o conservar como API publica

El analisis lista 40 variables y 9 mixins muertos. **Propuesta
de partida**: eliminar todos. **Alternativa**: marcar algunos
como API publica para adoptantes (futbol entre limpieza y
extensibilidad).

**Recomendacion**: eliminar todos. Si un adoptante futuro
necesita una variable, la anade. Mantener cadaveres porque
"alguien podria usarlos" infla el catalogo sin beneficio.

### Decision 2 — Donde vive la "allowlist real" si quedan excepciones

Tras D3, idealmente no quedan disables. Pero si queda alguno
excepcional:
- **Opcion A**: comentario inline con razon (formato `-- razon`).
- **Opcion B**: lista central en `.stylelintrc.json` con array
  de hex permitidos.
- **Opcion C**: archivo separado documentando cada hex.

**Recomendacion**: A. Razon: el disable y su razon viven en el
mismo sitio, facil de leer en review.

### Decision 3 — Como se valida visualmente la correccion

Cuatro opciones para componentes con render observable:
- **Opcion A**: captura manual antes/despues por componente
  tocado.
- **Opcion B**: Storybook si esta disponible.
- **Opcion C**: Snapshot tests de jest-image-snapshot.
- **Opcion D**: Confianza en que los cambios son tokenizacion
  pura (mismo valor visual) sin validacion explicita.

**Recomendacion**: D para correcciones que son tokenizacion 1:1
(reemplazo de `#d4c4a8` por `$border-soft-beige` que mapea al
mismo hex). A para correcciones que tocan especificidad o
`!important`.

### Decision 4 — ADRs a producir

Confirmar cuales de las siguientes ADRs se producen:
- `dec-convenciones-de-nombrado-scss` (D4): **propuesto**.
- `dec-color-no-hex-con-allowlist-documentada` (D3+D9):
  **ampliar la existente**, no nueva.
- `dec-tokens-solo-sass-no-css-vars` (D8): **propuesto**.
- Posibles otras emergentes de la ejecucion.

## Pre-condicion para pasar a `En ejecucion`

Antes de producir `plan-*.md`:

1. El usuario confirma este alcance explicitamente (o pide
   ajustes y se itera).
2. El usuario resuelve las 4 decisiones de proceso pendientes
   (o delega).

Producido `plan-*.md`, se produce `tareas-*.md`, y se cambia
estado a `En ejecucion` registrando evento `Cambio de estado`
en `progreso-*.md`.

## Que sigue

Pausa para confirmacion del usuario. Sin confirmacion, no se
avanza al plan.

## Modificaciones al alcance tras `analisis-inspiracion-ui-core-5.25.0.md`

El 2026-05-21, tras producir el `analisis-inspiracion-ui-core-5.25.0.md`
y recibir las decisiones del usuario, el alcance se modifica.
**Las decisiones originales (Decision 1 a Decision 4 mas
arriba) se modifican como sigue, no se eliminan del documento
para preservar trazabilidad**:

### Decision 1 — REVOCADA, reemplazada por Decision 1'

**Original**: Eliminar todas las 40 variables muertas y 9
mixins muertos.

**Reemplazo**: **Conservar todas**. Para cada una:
- Si ui-core tiene un patron equivalente activo: **integrar**
  via tarea explicita (T-NUEVA-XX correspondiente).
- Si no tiene equivalente o el patron no aplica a nuestro
  template: **marcar con `// fusv-disable`** y comentario
  justificando como API publica reservada.
- Eliminacion permitida solo cuando hay evidencia explicita de
  ausencia de caso de uso presente y futuro (caso excepcional,
  no por defecto).

Razon de la revocacion: la directiva del usuario "no borres
nada, integra de manera correcta" + evidencia empirica de
ui-core (8 de los 9 mixins muertos tienen equivalentes en
ui-core; mayoria de variables muertas corresponden a patrones
maduros de ui-core).

### Decision 4 — REVOCADA, reemplazada por Decision 4'

**Original**: Producir ADR `dec-tokens-solo-sass-no-css-vars`
declarando que el template no usa CSS custom properties.

**Reemplazo**: Producir ADR
`dec-tokens-via-sass-y-cssvars-selectivos` con adopcion parcial
del patron de ui-core. Exponer como CSS custom properties solo
los tokens que JS razonablemente podria querer leer:
- Colores primarios de marca (~5-10 properties).
- Dimensiones de layout: sidebar width, header height (~5).
- Tokens semanticos de estado (success, error, warning, info).
- **Total estimado**: ~30-50 custom properties con prefijo
  `--ec-`, no las 130+ de ui-core.

Tokens no expuestos (espaciados, tipografia, transitions,
breakpoints) permanecen solo en SCSS.

Razon de la revocacion: ui-core demuestra que custom properties
son el patron estandar para sistemas de tokens maduros; cerrar
prematuramente nos restaria capacidad futura sin justificacion.

### Decisiones nuevas aprobadas tras el analisis-inspiracion

#### D-MODO — Modo de puerto

**Modo B confirmado**: portar el SCSS de ui-core como **mixins**,
no como clases globales. Preserva la decision arquitectonica
declarada en `src/styles/main.scss` ("No hay clases globales de
componentes").

#### D-PREFIJO — Prefijo CSS custom property

**Prefijo `--ec-`** (de `e-comerce`). Brevedad operativa, sin
colision con prefijos estandar (`--bs-`, `--cui-`, `--tw-`).
Verificado: el repo tenia 0 declaraciones de custom properties
antes de esta decision; el prefijo `app:` que existia en el
proyecto es exclusivamente para JS CustomEvents
(`app:unauthorized`), no se extiende a CSS por ser demasiado
generico.

#### D-COREUI-BUNDLES — Bundles `coreui-*.scss` no se portan

Los archivos `coreui.scss`, `coreui-grid.scss`,
`coreui-reboot.scss`, `coreui-utilities.scss` y sus variantes
`.rtl.scss` **no se portan** en esta iniciativa. Razon
documentada por bundle en
`analisis-inspiracion-ui-core-5.25.0.md`.

#### Decision 5 — Herramientas de disciplina importadas de ui-core

Adoptar:

- **`find-unused-sass-variables` (fusv)** como devDependency.
  Script `npm run lint:scss-vars`. Patron `// fusv-disable` /
  `// fusv-enable` para marcar variables/mixins como API
  publica.
- **Activar `declaration-no-important: true`** en stylelint.
  Casos legitimos (`visually-hidden`,
  `prefers-reduced-motion`) llevan disable explicito.
- **Patron de marcadores `// scss-docs-start NAME / scss-docs-end NAME`**
  como disciplina de organizacion para secciones documentables
  de `_variables.scss`.

#### Decision 6 — Variables con `!default`

Adoptar `!default` en **todas** las variables del template para
permitir override por el adoptante. Tarea masiva mecanica
(T-202 dentro de F1a). ~223 variables afectadas.

## Esfuerzo actualizado tras el replan

| Item | Antes | Despues |
|------|-------|---------|
| Fases | 5 | 9 |
| Tareas | 24 | ~52 |
| Esfuerzo | 8.75 h | ~39 h |
| Archivos nuevos en repo | 0-1 | ~50 |
| Custom properties | 0 | ~30-50 con prefijo `--ec-` |
| Dependencias nuevas | 0 | `find-unused-sass-variables` |

Detalle en `replan-mapear-y-corregir-scss-completo.md`.

## Pre-condicion para reanudar ejecucion (actualizada)

Antes de reanudar la ejecucion (F1 cierre + F0a + F1a..F5a):

1. El usuario confirma este alcance modificado.
2. `tareas-mapear-y-corregir-scss-completo.md` se actualiza para
   reflejar las nuevas tareas (post-replan).
3. T-101 (verificacion de licencia de ui-core) se ejecuta como
   primera tarea de F0a. Si la licencia no permite la
   adaptacion, la iniciativa se detiene y se replantea.
