# Plan — `mapear-y-corregir-scss-completo`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Documento | Plan de ejecucion |
| Fecha | 2026-05-21 |
| Estado al producir | En analisis (cambia a `En ejecucion` al iniciar T-001) |
| Inputs | `alcance-*.md` (aprobado), `analisis-*.md` |
| Tareas individuales | Detalladas en `tareas-mapear-y-corregir-scss-completo.md` |

## Proposito de este documento

Definir **estrategia de ejecucion**: agrupacion en fases,
secuencia, dependencias, criterios de cierre por fase, y los
puntos de verificacion intermedios. El detalle por tarea (T-NNN)
vive en `tareas-*.md`.

## Estrategia general

Cinco fases secuenciales con cierre verificable cada una.
Dentro de cada fase, tareas independientes pueden ejecutarse en
cualquier orden, salvo dependencias explicitas.

| Fase | Dimension(es) | Esfuerzo estimado | Tareas |
|------|---------------|-------------------|--------|
| 1 Cierre de mapeos pendientes | D2, D7 | ~60 min | T-001 a T-002 |
| 2 Limpieza interna sin impacto visible | D6, D5 | ~105 min | T-003 a T-007 |
| 3 Tokenizacion de hex | D3 | ~120 min | T-008 a T-014 |
| 4 Pequenas formalizaciones | D1, D4, D8 | ~90 min | T-015 a T-019 |
| 5 Cierre con ritual y ADRs | D9 + cierre | ~150 min | T-020 a T-024 |
| **Total estimado** | — | **~525 min (~8.75 h)** | 24 tareas |

Se mantiene el orden propuesto en el alcance. La diferencia
vs estimado del alcance (~465 min trabajo correctivo + ~120 min
mapeo + ~60 min cierre = ~10.5 h en alcance vs ~8.75 h aqui) es
porque el alcance contaba el mapeo entero, pero el analisis ya
cubrio parte sustancial; lo que queda son los mapeos pendientes
de D2 y D7.

## Fase 1 — Cierre de mapeos pendientes

### Por que primero

Las dimensiones D2 (organizacion) y D7 (`!important`) tienen
**mapeo no completamente cerrado** en el analisis. Antes de
corregir nada, terminar de mapearlas evita correr la fase
correctiva sobre informacion incompleta.

### Tareas

- **T-001**: verificar `base/_animations.scss` vs
  `components/_animations.scss`. Determinar si son duplicados,
  complementarios, o tienen propositos distintos.
- **T-002**: inventariar las 14 ocurrencias de `!important` con
  archivo:linea y categorizar cada una como legitimo / sospechoso
  / candidato a eliminar.

### Criterio de cierre de la fase

- T-001 produce un mini-reporte (puede vivir en
  `progreso-*.md` como `Hallazgo durante la ejecucion`) con el
  diagnostico del duplicado.
- T-002 produce una tabla con las 14 ocurrencias clasificadas.
- Ningun commit toca codigo de produccion en esta fase. Solo
  documentacion del estado.

### Dependencias

Ninguna. Fase de entrada.

## Fase 2 — Limpieza interna sin impacto visible

### Por que segundo

D6 (variables y mixins muertos) y D5 (pipeline `@use`) son
**cambios mecanicos invisibles al usuario final**: eliminar
codigo no usado no cambia el render; migrar `'../abstracts'` a
`'@styles/abstracts'` produce el mismo bundle. Bajo riesgo de
regresion. Hacerlos antes de tokenizar hex (fase 3) deja el
catalogo de variables limpio para anadir los tokens nuevos.

### Tareas

- **T-003**: eliminar las 40 variables muertas de
  `_variables.scss` (decision 1 aprobada: eliminar todas).
- **T-004**: eliminar los 9 mixins muertos de `_mixins.scss`.
- **T-005**: migrar los 18 archivos con `@use '../abstracts'` a
  `@use '@styles/abstracts'`.
- **T-006**: migrar el archivo con import parcial directo
  (`@use '../abstracts/variables'`) al barrel.
- **T-007**: verificar/ampliar `scripts/check-scss.mjs` para
  enforzar `@styles/abstracts` en `src/pages`, `src/components`,
  `src/layouts`. Si ya lo hace, anadir test artificial.

### Criterio de cierre de la fase

- `grep -E "^\\\$accent-light|^\\\$footer-bg|..." src/styles/abstracts/_variables.scss`
  devuelve 0 (variables muertas eliminadas).
- `grep -E "^@mixin (absolute-center|category-grid|...)" src/styles/abstracts/_mixins.scss`
  devuelve 0 (mixins muertos eliminados).
- `grep -rE "@use '\.\./abstracts" src --include="*.scss"` devuelve 0.
- `npm test` y `npm run verify-build` verdes en cada commit de la
  fase.

### Dependencias

T-003 y T-004 pueden ejecutarse en cualquier orden.
T-005 y T-006 pueden ejecutarse en cualquier orden.
T-007 idealmente despues de T-005/T-006 (para no validar contra
estado intermedio).

### Riesgo y mitigacion

- Riesgo: alguna "variable muerta" segun el analisis tenga consumer
  no detectado (e.g. consumer en archivo `.ts` que lee el SCSS por
  string).
  Mitigacion: verificar con `grep -rE "\\\$accent-light" src` (no
  solo `--include=*.scss`) antes de eliminar cada una.

## Fase 3 — Tokenizacion de hex

### Por que tercero

El bloque de mayor densidad de cambios y mayor potencial de
debate. Hacerlo despues del cleanup (fase 2) deja el catalogo
de variables listo para recibir los 6 tokens nuevos sin
conflictos de nombre con cadaveres. Hacerlo antes del ritual
(fase 5) permite que el bloqueador final ya vea un repo limpio.

### Tareas

- **T-008**: definir y anadir los 6 tokens semanticos en
  `_variables.scss` para los 6 colores unicos identificados.
  Nombres concretos a decidir durante la tarea segun contexto de
  uso.
- **T-009**: tokenizar `#d4c4a8` (4 ocurrencias en AddressesPage,
  ChangePasswordPage, VerifyEmailPage, WishlistPage). Eliminar
  los 4 disables.
- **T-010**: tokenizar `#c8b88a` (3 ocurrencias en mismos pages).
  Eliminar los 3 disables.
- **T-011**: tokenizar `#cfc4b3` (3 ocurrencias en AdminPaymentRefund,
  AdminPayments, PaymentSelection). Eliminar los 3 disables.
- **T-012**: tokenizar `#5a36d0` (3 ocurrencias en badges info
  morados de ReturnDetail, AdminReturnDetail, Returns). Eliminar
  los 3 disables.
- **T-013**: tokenizar `#b08a3c` (1 ocurrencia en VariantSelector)
  y `#6b5618` (1 ocurrencia en SearchResultsPage). Eliminar los
  2 disables.
- **T-014**: verificar el hex en `_focus-indicators.scss` y los 2
  hex en `_mixins.scss`. Decidir si tokenizar o conservar como
  fuente de tokens.

### Criterio de cierre de la fase

- `grep -roE "#[0-9a-fA-F]{3,8}" src --include="*.module.scss"`
  devuelve 0.
- `grep -rE "stylelint-disable-next-line color-no-hex" src`
  devuelve 0.
- `npm test` y `npm run verify-build` verdes en cada commit.

### Dependencias

T-008 debe ir antes de T-009..T-013 (los tokens deben existir
antes de ser referenciados).
T-009..T-013 pueden ejecutarse en cualquier orden entre si.
T-014 puede ir en paralelo.

### Riesgo y mitigacion

- Riesgo: una tokenizacion produce render visualmente distinto.
  Mitigacion: cada tarea de tokenizacion T-009..T-013 reemplaza
  hex por variable que mapea **al mismo hex literal**. Decision 3
  aprobada: confiar en tokenizacion 1:1 sin validacion visual
  explicita. Si alguna correccion no fuera 1:1, se trata como
  excepcion y se valida.

## Fase 4 — Pequenas formalizaciones

### Por que cuarto

Una vez el codigo esta limpio (fase 2) y los hex tokenizados
(fase 3), formalizar las convenciones y eliminar el bloque de
aliases es trabajo de ordenamiento que cierra naturalmente.

### Tareas

- **T-015**: migrar los 17 aliases de compatibilidad (`$bg-card`,
  `$primary`, `$color-danger`, etc) a sus nombres canonicos.
  Multiple archivos consumers afectados.
- **T-016**: eliminar el bloque de aliases del final de
  `_variables.scss`. Eliminar tambien `$white: #FFFFFF` por
  referencia a `$bg-surface` o token semantico.
- **T-017**: revisar las 5 clases CSS modules con guion bajo.
  Renombrar a camelCase o documentar excepcion.
- **T-018**: activar `selector-class-pattern: "^[a-z][a-zA-Z0-9]*$"`
  en stylelint para `.module.scss`. Verificar que pasa
  (`npx stylelint "src/**/*.module.scss"`).
- **T-019**: producir ADR nueva `dec-convenciones-de-nombrado-scss`
  formalizando variables kebab, clases camelCase, mixins kebab.

### Criterio de cierre de la fase

- `grep -E "^\\\$bg-card:|^\\\$primary:|^\\\$color-danger:" src/styles/abstracts/_variables.scss`
  devuelve 0 (o solo lineas comentadas justificando excepcion).
- ADR `dec-convenciones-de-nombrado-scss` aceptada en
  `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md`.
- `npx stylelint "src/**/*.module.scss"` pasa con la nueva regla
  activa.
- `npm test` y `npm run verify-build` verdes.

### Dependencias

T-015 antes de T-016 (eliminar el bloque solo si nadie lo usa).
T-017 antes de T-018 (no activar la regla con violaciones
existentes).
T-019 puede ir en cualquier momento de la fase.

### Riesgo y mitigacion

- Riesgo: T-015 toca muchos archivos consumers (todos los pages/
  components que usan `$bg-card`, `$primary`, etc).
  Mitigacion: usar sed con backup, verificar diff, ejecutar tests
  antes de commitear cada alias migrado.

## Fase 5 — Cierre con ritual y ADRs

### Por que ultimo

El ritual de monitoreo (D9) tiene sentido solo despues de que
el repo esta limpio. Si el bloqueador pre-push se construyera
antes, fallaria contra los 17 disables existentes (a no ser que
se hiciera un bypass temporal). Mas natural construirlo al final
cuando ya no hay disables sin razon que bloquear.

Las ADRs de cierre se producen al final porque consolidan
decisiones tomadas durante toda la iniciativa.

### Tareas

- **T-020**: ampliar `scripts/check-scss.mjs` (o crear paralelo)
  para detectar `stylelint-disable-next-line color-no-hex` sin
  razon documentada (formato `-- razon`). Test artificial:
  anadir un disable sin razon, verificar que el script falla.
- **T-021**: documentar el ritual trimestral en
  `docs/desarrollo/ritual-revision-scss.md`: responsable,
  procedimiento, criterio de retirada de excepciones.
- **T-022**: ampliar la ADR existente
  `dec-color-no-hex-con-allowlist-documentada` reflejando como
  la disciplina se materializa: comentarios inline con razon
  documentada, bloqueador pre-push, ritual trimestral.
- **T-023**: producir ADR nueva `dec-tokens-solo-sass-no-css-vars`
  declarando explicitamente que el template no usa CSS custom
  properties para tokens.
- **T-024**: producir
  `decisiones-mapear-y-corregir-scss-completo.md` con las
  cuatro secciones canonicas (contexto, decisiones, alternativas,
  consecuencias). Cerrar iniciativa.

### Criterio de cierre de la fase

- T-020: test artificial (anadir disable sin razon) hace fallar
  el pre-push.
- T-021: archivo de ritual existe con el contenido minimo
  requerido.
- T-022: ADR ampliada aceptada.
- T-023: ADR nueva aceptada.
- T-024: documento de decisiones producido con las 4 secciones
  canonicas. Iniciativa marcada `Cerrada` en el indice.

### Dependencias

T-020 antes de T-022 (la ADR documenta el bloqueador, que debe
existir).
T-024 al final, despues de todas las demas.
T-021, T-022, T-023 pueden producirse en paralelo entre si.

## Disciplina operativa (recordatorio del alcance)

Vigente en cada commit de cada fase:

1. Una correccion por commit. Excepciones declaradas cuando
   varios archivos son inseparables (ejemplo: T-008 anade tokens
   y los referencia inmediatamente seria un single commit, pero
   se separa en T-008 anade tokens + T-009..T-013 los aplica
   uno por uno por color).
2. `npm test` verde antes y despues.
3. `npm run verify-build` verde antes y despues.
4. Validacion visual: aplica para T-009..T-013, T-015 solo si la
   correccion no es 1:1 (todas son 1:1 por construccion).
5. Mensaje de commit explicito sobre la dimension y la
   sub-correccion. Formato sugerido:
   `<Verbo> <objeto> (T-NNN, D<N>)`.
   Ejemplo: `Tokenize beige border color (T-009, D3)`.

## Eventos a registrar en `progreso-*.md`

| Evento | Cuando |
|--------|--------|
| `Decisiones aprobadas` | Al commitear este plan (4 decisiones del alcance + aprobacion global) |
| `Plan` | Al commitear este plan |
| `Cambio de estado` | Al pasar a `En ejecucion` (comienzo de T-001) |
| `Inicio de tarea` / `Cierre de tarea` | Por cada T-NNN |
| `Hallazgo durante la ejecucion` | Si emerge informacion no prevista durante una tarea |
| `Fase cerrada` | Al cerrar cada una de las 5 fases |
| `Cierre de iniciativa` | Al cerrar T-024 |

## Verificacion intermedia entre fases

Al cierre de cada fase, antes de empezar la siguiente:

- `npm test` verde.
- `npm run verify-build` verde.
- `npx stylelint "src/**/*.scss"` verde.
- `node scripts/check-scss.mjs` verde.
- Git status limpio.
- Evento `Fase cerrada` registrado en `progreso-*.md` con resumen
  de lo entregado.

## Riesgos generales

| Riesgo | Mitigacion |
|--------|------------|
| Variable "muerta" segun analisis tiene consumer no detectado | `grep -rE "\\\$nombre" src` antes de cada eliminacion (no solo `.scss`) |
| Token nuevo entra en conflicto con cadaver | T-003 (eliminar muertos) precede a T-008 (anadir tokens nuevos) |
| Migracion de aliases (T-015) toca muchos archivos | Una alias a la vez, commit por alias, tests entre cada |
| Stylelint nueva regla rompe build | T-017 (limpiar) precede a T-018 (activar regla) |
| Bloqueador pre-push (T-020) rompe builds existentes | Se construye despues de T-013 (cero disables); test artificial confirma que solo bloquea los nuevos sin razon |
| Cambio visual no detectado | Tokenizaciones son 1:1; las pocas no-1:1 se validan explicitamente |

## Que NO contiene este plan

- Codigo SCSS o JS especifico de la implementacion (eso es el
  commit de cada T-NNN).
- Nombres finales de los 6 tokens nuevos de D3 (se decide en T-008
  segun contexto de uso, no se pre-decide ahora).
- Decisiones sobre estructura interna de las ADRs (el formato es
  el del repo, definido en `docs/decisiones-de-arquitectura/`).

## Que sigue

1. Commitear este plan + `tareas-*.md`.
2. Registrar eventos `Decisiones aprobadas`, `Plan`, y `Cambio de
   estado` en `progreso-*.md`.
3. Actualizar el indice global: estado de la iniciativa pasa de
   `En analisis` a `En ejecucion`.
4. Comenzar T-001.
