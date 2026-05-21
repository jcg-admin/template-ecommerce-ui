# Iniciativa: mapear-y-corregir-scss-completo

| Campo | Valor |
|-------|-------|
| Slug | `mapear-y-corregir-scss-completo` |
| Estado | En ejecucion |
| Orden de backlog | (no aplica: abierta directamente sin pasar por backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Fecha de redefinicion de scope | 2026-05-21 (ampliado de auditoria a mapeo + correccion) |
| Fecha de paso a En ejecucion | 2026-05-21 |
| Iniciativa origen | Solicitud del usuario el 2026-05-21 como ampliacion de scope de la iniciativa cancelada `monitorear-y-reducir-allowlist-hex`. |
| Iniciativa que esta subsume | [`monitorear-y-reducir-allowlist-hex`](../monitorear-y-reducir-allowlist-hex/) (cancelada 2026-05-21). |
| Iniciativa que aporto deuda registrada | `resolver-hallazgos-de-deuda-del-template` (H-05 originalmente delegado a `monitorear-y-reducir-allowlist-hex`, ahora heredado por esta). |

## Motivo de existencia

El SCSS del template **nunca ha sido auditado de forma integral** y
acumula deuda no formalizada en las dos dimensiones que ya tienen
ADR (`dec-stylelint-y-checkscss-en-pre-push`,
`dec-color-no-hex-con-allowlist-documentada`) y en siete dimensiones
mas que no tienen ADR.

Esta iniciativa no se limita a **detectar** los problemas; tambien
los **corrige**. Tiene dos fases logicas por dimension:

- **Fase de mapeo**: producir evidencia citada (archivos:linea,
  conteos, ejemplos) del estado actual.
- **Fase de correccion**: aplicar los cambios necesarios para que el
  SCSS quede en estado declarado como bueno (variables muertas
  eliminadas, hex literales acotados, convenciones uniformadas,
  pipeline `@use`/`@forward` consistente, etc).

## Por que mapear + corregir (no solo auditar)

Tres razones para incluir la fase correctiva:

1. **Evitar tocar el SCSS dos veces**. Una iniciativa que solo audita
   produce un reporte que otra iniciativa tendria que ejecutar. Al
   tocar el sistema dos veces se duplica el riesgo de regresion y la
   carga de revision.
2. **Deuda visible no es deuda resuelta**. Las dos ADRs activas ya
   detectan parte del problema (hex sin allowlist, fallos de
   stylelint), pero no garantizan que la deuda se **reduzca con el
   tiempo**, solo que no crezca por canales mecanicos. La iniciativa
   corrige lo que detecta.
3. **El SCSS no tiene tests funcionales**. Un cambio puede no romper
   Jest pero romper visualmente un componente. Mantener el contexto
   fresco mientras se decide y se corrige reduce el riesgo de error
   por descontextualizacion.

## Inventario inicial del SCSS

Resultado de la inspeccion automatica el 2026-05-21:

### Volumen

| Categoria | Conteo |
|-----------|--------|
| Archivos `.scss` totales | 125 |
| Archivos `.module.scss` (CSS modules) | 101 |
| Archivos partials globales `_*.scss` | 24 |
| Hex literales actuales en SCSS | **76** |

### Estructura global declarada (`src/styles/`)

```
src/styles/
├── main.scss              ← entry point del bundle global
├── abstracts/
│   ├── _index.scss
│   ├── _variables.scss    ← paleta de colores, tokens
│   └── _mixins.scss
├── base/                  ← 3 archivos (reset, animations, typography)
├── components/            ← 12 archivos (buttons, forms, cards, modal, ...)
├── layouts/               ← 2 archivos (sidebar, header)
├── accessibility/         ← 2 archivos (focus-indicators)
└── utils/                 ← 1 archivo (utilities)
```

### Top de directorios con `.module.scss`

| Directorio | Conteo aproximado |
|-----------|--------------------|
| `src/pages/admin/` | 39 |
| `src/pages/account/` | 19 |
| `src/pages/catalog/` | 7 |
| `src/pages/auth/` | 5 |
| `src/components/catalog/` | 4 |

## Hallazgo preliminar de alto nivel

**Discrepancia entre la ADR `dec-color-no-hex-con-allowlist-documentada`
y el estado actual del repo**:

- La ADR declara: "antes de PR #4 habia 525 hex literales. PR #4
  los redujo a 17 en allowlist".
- El conteo actual es **76** hex literales en SCSS.

Posibilidades a investigar durante el mapeo formal:

1. La allowlist crecio de 17 a 76 sin proceso formal (lo cual
   justifica directamente la fase correctiva: reducir y formalizar).
2. El conteo del PR #4 era diferente (e.g. excluia `.module.scss`
   o solo contaba colores principales).
3. Hay hex literales fuera de la allowlist que stylelint no esta
   detectando.

Cualquiera de las tres es accionable y conduce a correccion
concreta.

## Que esta dentro del alcance preliminar

El alcance final lo fijara `alcance-mapear-y-corregir-scss-completo.md`.
Preliminarmente, **nueve dimensiones**, cada una con criterio de
mapeo (que se inventaria) y criterio de correccion (que se considera
arreglado).

### 1. Tokens de diseno

| Fase | Criterio |
|------|----------|
| Mapeo | Inventariar variables de color, espaciados, tipografia, breakpoints, border radius, sombras y transiciones en `_variables.scss` y en cualquier otro partial. |
| Correccion | Tokens consolidados en un solo lugar canonico. Valores literales repetidos fuera del catalogo de tokens reemplazados por la variable correspondiente. |

### 2. Organizacion de archivos

| Fase | Criterio |
|------|----------|
| Mapeo | Identificar modulos huerfanos (definidos pero no importados), duplicados, mal ubicados (e.g. un layout en `components/`). |
| Correccion | Modulos huerfanos eliminados o re-conectados. Duplicados unificados. Modulos mal ubicados movidos al directorio correcto con su import actualizado. |

### 3. Hex literales y allowlist

| Fase | Criterio |
|------|----------|
| Mapeo | Conteo real de hex literales por archivo, comparado con la allowlist actual de stylelint. Justificacion de cada entrada vigente. |
| Correccion | Hex literales fuera de allowlist reemplazados por variables del catalogo. Allowlist depurada (entradas sin justificacion vigente retiradas). Bloqueador mecanico en pre-push que rechace nuevos hex fuera de allowlist (heredado de la iniciativa cancelada). Ritual trimestral documentado para revision (heredado). |

### 4. Convenciones de nombrado

| Fase | Criterio |
|------|----------|
| Mapeo | Inventariar variables SCSS (`$kebab-case` vs `$camelCase` vs mezcla), clases CSS modules (camelCase vs kebab-case), mixins (nombrado y firma). Detectar inconsistencias por proyecto. |
| Correccion | Convencion unica adoptada y documentada en un ADR nuevo (`dec-convenciones-de-nombrado-scss` o nombre equivalente). Variables, clases y mixins migrados a la convencion. Stylelint regla anadida si aplica. |

### 5. Pipeline `@use` / `@forward` / `@import`

| Fase | Criterio |
|------|----------|
| Mapeo | Inventariar uso de `@import` (legacy) vs `@use`/`@forward` (moderno). Identificar archivos con `@import` y la razon (e.g. circular dependency, falta de migracion). |
| Correccion | Migracion completa a `@use`/`@forward`. `@import` eliminado salvo casos justificados con razon explicita en comentario. Namespaces consistentes. |

### 6. Variables muertas y mixins no usados

| Fase | Criterio |
|------|----------|
| Mapeo | Variables definidas en `_variables.scss` sin consumer en el codigo. Mixins definidos en `_mixins.scss` sin invocacion. Reglas CSS especificas sin selector que las matchee. |
| Correccion | Variables y mixins muertos eliminados. Si alguno se conserva por razon documentada (e.g. parte de una API publica del template para adoptantes), se anade comentario justificandolo. |

### 7. Especificidad y herencia

| Fase | Criterio |
|------|----------|
| Mapeo | Inventariar usos de `!important`. Identificar selectores con especificidad > 3 (anti-patron en CSS modules). Detectar anidacion excesiva (> 3 niveles). |
| Correccion | `!important` eliminado o documentado por excepcion explicita. Selectores con especificidad alta refactorizados. Anidacion excesiva aplanada. |

### 8. Consistencia con arquitectura del frontend

| Fase | Criterio |
|------|----------|
| Mapeo | Verificar que los tokens del SCSS estan disponibles como CSS custom properties cuando el JS necesita leerlos (theming dinamico, calculo de animaciones, etc). Detectar duplicacion entre `$sass-var` y `--css-var`. |
| Correccion | Tokens expuestos via CSS custom properties cuando el JS los necesita. Sin duplicacion: la variable SCSS define el valor, la custom property la consume. |

### 9. Ritual de monitoreo (heredado de la cancelada)

| Fase | Criterio |
|------|----------|
| Mapeo | (No aplica: este punto es la salida del trabajo, no su entrada.) |
| Correccion | Bloqueador mecanico en pre-push que rechace cualquier hex fuera de allowlist. Script de revision documentado (`scripts/check-scss.mjs` ampliado o complementado). ADR sobre ritual trimestral con responsable y procedimiento. |

## Que NO esta dentro del alcance preliminar

- **Redisenar la paleta visual** del template. Los tokens se mapean
  y consolidan, no se cambian estilos de marca.
- **Migrar a otra tecnologia** (Tailwind, CSS-in-JS, vanilla extract).
  El template usa SCSS por decision arquitectonica.
- **Cambiar la decision de CSS modules**. Esa es la arquitectura
  vigente y no se discute aqui.
- **Implementar componentes nuevos**. Solo se mapea y corrige lo
  existente.
- **Cambios visuales perceptibles**. Cada correccion debe ser
  visualmente neutra (mismo render); si una correccion altera el
  render, se documenta y se valida con captura antes de aplicar.

## Documentos esperados

| Documento | Estado |
|-----------|--------|
| [alcance-mapear-y-corregir-scss-completo.md](alcance-mapear-y-corregir-scss-completo.md) | Producido. Contrato verificable: criterios de mapeo + correccion por dimension, lo que NO esta en scope, disciplina operativa, orden de ejecucion propuesto, 4 decisiones de proceso pendientes de confirmacion. **Marca el punto de pausa obligatoria**: sin confirmacion del usuario no se avanza al plan. |
| [analisis-mapear-y-corregir-scss-completo.md](analisis-mapear-y-corregir-scss-completo.md) | Producido. Mapeo formal de las 9 dimensiones con evidencia citada (archivo:linea, conteos, ejemplos). Tres hallazgos transversales (H-A, H-B, H-C) sobre la "allowlist" actual. Estimacion preliminar de esfuerzo correctivo ~10.5 h. |
| [plan-mapear-y-corregir-scss-completo.md](plan-mapear-y-corregir-scss-completo.md) | Producido (historico). Plan original de 5 fases / 24 tareas / 8.75 h. **Reemplazado operativamente por `replan-*.md`** tras incorporar la directiva de integracion via ui-core. Se conserva como evidencia historica. |
| [replan-mapear-y-corregir-scss-completo.md](replan-mapear-y-corregir-scss-completo.md) | Producido. Replan formal post-inspeccion de ui-core. 9 fases / ~52 tareas / ~39 h. Anade F0a (pre-portacion), F1a (portacion capa abstracta), F4a (integracion en componentes), F5a (documentacion). |
| [analisis-inspiracion-ui-core-5.25.0.md](analisis-inspiracion-ui-core-5.25.0.md) | Producido. 769 lineas. Inspeccion de `ui-core-5.25.0` (CoreUI Pro v5.25.0) por dimension. Establece decisiones D-MODO (puerto como mixins), D-PREFIJO (`--ec-`), D-COREUI-BUNDLES (bundles no se portan). |
| [analisis-tooling-scss-ui-core.md](analisis-tooling-scss-ui-core.md) | Producido (T-104). 482 lineas. Analisis del `package.json` de ui-core para detectar tooling SCSS adoptable. Resultado: 4 adoptar (stylelint cache, npm-run-all, 3 reglas selectivas, sass-true), 2 diferir, 4 descartar. Tareas T-105..T-108 ejecutadas tras este analisis. |
| [inventario-partials-ui-core.md](inventario-partials-ui-core.md) | Producido (T-103). 384 lineas. Inventario archivo por archivo de los 210 partials SCSS de ui-core con categorizacion: portar / portar-adaptado / portar-integrado / portar-selectivo / no-portar-arquitectura / fuera-de-scope / diferir. Mapa de F1a: ~62 archivos a portar en ~11.5 h. |
| [analisis-t-202-integracion-variables.md](analisis-t-202-integracion-variables.md) | Producido (pre-T-202). 750 lineas. Analisis exhaustivo del trabajo a realizar en T-202 (integracion del `_variables.scss` de ui-core en el nuestro). Inventario empirico: 70 colisiones (8 identicas + 62 diferentes), 1615 variables solo-en-ui-core, ~430 portar + ~120 con fusv-disable + ~720 diferir, ~340 nunca. Plan de 8 sub-pasos secuenciales con validacion intermedia, ~121 min total. Listado de las 56 variables preservar-nuestro con valores y razon. 5 riesgos identificados con mitigaciones. |
| [tareas-mapear-y-corregir-scss-completo.md](tareas-mapear-y-corregir-scss-completo.md) | Producido. T-001..T-024 con archivos, accion, criterio binario, dependencias, esfuerzo. Verificacion global al cierre con comandos ejecutables. |
| [progreso-mapear-y-corregir-scss-completo.md](progreso-mapear-y-corregir-scss-completo.md) | En uso. |
| `decisiones-mapear-y-corregir-scss-completo.md` | Pendiente. Obligatorio al cierre. Probablemente incluye ADRs nuevas o ampliaciones de las existentes. |

## Flujo previsto

1. Producir `analisis-mapear-y-corregir-scss-completo.md` con mapeo
   formal de las 9 dimensiones, evidencia citada por dimension,
   diagnostico de problemas concretos a corregir.
2. Producir `alcance-mapear-y-corregir-scss-completo.md` con
   dimensiones confirmadas, criterios de evaluacion, criterio de
   completitud verificable por dimension (que se considera
   "mapeado" y que se considera "corregido").
3. **Pausa para confirmacion del alcance antes de planificar.**
4. Producir plan + tareas estructurados por fase de dimension
   (mapeo, luego correccion), paso a `En ejecucion`.
5. Ejecutar dimension por dimension, manteniendo tests verdes y
   build limpio en cada commit. Cada correccion se valida visualmente
   si toca un componente con render observable.
6. Producir `decisiones-mapear-y-corregir-scss-completo.md` al
   cierre con ADRs nuevas (convenciones de nombrado, pipeline,
   monitoreo) o ampliacion de las existentes.
7. Cerrar segun PROC-GESTION-001.

## Disciplina de correccion

Cada correccion sigue cuatro reglas:

- **Una correccion por commit**. Aislar el cambio facilita rollback
  si rompe algo.
- **Tests verdes en cada commit**. `npm test` con tests existentes
  debe seguir pasando; si un test depende de un valor SCSS literal
  (poco probable pero posible), se actualiza junto con el cambio.
- **Build limpio en cada commit**. `npm run build` y
  `npm run verify-build` deben pasar.
- **Validacion visual cuando aplica**. Para correcciones que tocan
  componentes con render observable, capturar antes/despues o usar
  storybook si esta disponible. Si una correccion altera el render
  intencionalmente, se documenta.

## Relacion con otras iniciativas

| Iniciativa | Relacion |
|-----------|----------|
| `monitorear-y-reducir-allowlist-hex` (Cancelada) | Iniciativa subsumida. Su trabajo planeado (allowlist hex + bloqueador pre-push + ritual trimestral) migra a esta como **dimension 9** del alcance. |
| `resolver-hallazgos-de-deuda-del-template` (Cerrada) | Origen del H-05 que derivo en la cancelada y ahora hereda esta. |
| `revisar-arquitectura-de-mocks` (Cerrada) | Esta iniciativa adopta el mismo patron de "mapeo con evidencia citada + correccion" que aquella ejecuto sobre los mocks. |
| `ampliar-ucs-de-ecommerce` (En analisis pausada) | Independiente. No hay solapamiento de scope. Puede coexistir o ejecutarse en paralelo cuando se desbloquee. |
| `completar-dominio-de-ecommerce` (En ejecucion bloqueada) | Independiente. Aquella toca tipos de TypeScript, esta toca SCSS. Pueden coexistir. |
| `validar-contrato-de-mocks-vs-backend-real` (Backlog #1) | Independiente. |
