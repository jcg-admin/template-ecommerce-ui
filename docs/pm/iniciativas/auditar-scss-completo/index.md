# Iniciativa: auditar-scss-completo

| Campo | Valor |
|-------|-------|
| Slug | `auditar-scss-completo` |
| Estado | En analisis |
| Orden de backlog | (no aplica: abierta directamente sin pasar por backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Iniciativa origen | Solicitud del usuario el 2026-05-21 como ampliacion de scope de la iniciativa cancelada `monitorear-y-reducir-allowlist-hex`. |
| Iniciativa que esta subsume | [`monitorear-y-reducir-allowlist-hex`](../monitorear-y-reducir-allowlist-hex/) (cancelada 2026-05-21). |
| Iniciativa que aporto deuda registrada | `resolver-hallazgos-de-deuda-del-template` (H-05 originalmente delegado a `monitorear-y-reducir-allowlist-hex`, ahora heredado por esta). |

## Motivo de existencia

El SCSS del template **nunca ha sido auditado de forma integral**.
Hay dos ADRs activas que tocan aspectos puntuales:

- `dec-stylelint-y-checkscss-en-pre-push` (PR #3 y PR #4): impuso
  un pipeline mecanico de validacion en pre-push (stylelint +
  `scripts/check-scss.mjs`).
- `dec-color-no-hex-con-allowlist-documentada` (PR #4): redujo
  los `#hex` literales de 525 a 17 mediante allowlist.

Pero el SCSS tiene **muchas mas dimensiones** que estas dos ADRs
no cubren:

- Organizacion de variables y tokens de diseno (`abstracts/`).
- Convenciones de nombrado (BEM, CSS modules, scoping).
- Uso de SCSS modules vs estilos globales.
- Pipeline `@use` / `@forward` / `@import`.
- Especificidad y herencia.
- Variables muertas, duplicadas o nunca usadas.
- Mixins definidos vs efectivamente usados.
- Consistencia entre el modulo `abstracts/_variables.scss` y el
  consumo en componentes.

La iniciativa original (`monitorear-y-reducir-allowlist-hex`)
solo cubria una de estas dimensiones (allowlist hex). Auditarlo
integralmente cuando se va a tocar el sistema de estilos
**evita tocarlo dos veces**: una para auditar y aplicar fixes
del scope estrecho, otra para auditar el resto despues.

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

Posibilidades a investigar durante el analisis:

1. La allowlist crecio de 17 a 76 sin proceso formal (lo cual
   justifica el bloqueador pre-push que la iniciativa original
   queria construir).
2. El conteo del PR #4 era diferente (e.g. excluia `.module.scss`
   o solo contaba colores principales).
3. Hay hex literales fuera de la allowlist que stylelint no esta
   detectando.

Cualquiera de las tres conclusiones es accionable. El analisis
formal lo resolvera.

## Que esta dentro del alcance preliminar

El alcance final lo fijara `alcance-auditar-scss-completo.md`.
Preliminarmente, las dimensiones a auditar son:

1. **Tokens de diseno**:
   - Variables de color (paleta principal, neutros, semanticos).
   - Espaciados (`$spacing-*` si existe; o valores literales).
   - Tipografia (familias, tamanos, pesos).
   - Breakpoints responsive.
   - Border radius, sombras, transiciones.
2. **Organizacion de archivos**:
   - Estructura `abstracts/base/components/layouts/utils` vs
     lo que realmente se usa.
   - Modulos huerfanos (definidos pero no importados).
   - Modulos duplicados.
3. **Hex literales y allowlist**:
   - Conteo real vs declarado en la ADR.
   - Cada entrada de allowlist con su justificacion vigente.
   - Bloqueador pre-push que rechace nuevos hex fuera de
     allowlist (heredado de la iniciativa cancelada).
4. **Convenciones de nombrado**:
   - CSS modules (clases en camelCase o kebab-case, consistencia).
   - Variables SCSS (`$kebab-case`, `$camelCase`, mezcla).
   - Mixins (nombrado y firma).
5. **Pipeline `@use` / `@forward` / `@import`**:
   - ¿Se usa la sintaxis moderna o `@import` legacy?
   - Si se usa `@use`, ¿hay namespaces consistentes?
6. **Variables muertas**:
   - Variables definidas en `_variables.scss` nunca consumidas.
   - Mixins definidos en `_mixins.scss` nunca usados.
7. **Especificidad y herencia**:
   - Reglas con `!important`.
   - Selectores con especificidad > 3 (anti-patron en CSS modules).
   - Anidacion excesiva (> 3 niveles).
8. **Consistencia con la arquitectura del frontend**:
   - Tokens del SCSS vs design system aplicado en componentes.
   - Variables aplicadas via CSS custom properties para ser
     consumibles desde JS (si aplica).
9. **Ritual de monitoreo (heredado)**:
   - Bloqueador mecanico en pre-push.
   - Ritual trimestral de revision de allowlist.

## Que NO esta dentro del alcance preliminar

- **Redisenar la paleta visual** del template. Los tokens se
  auditan, no se cambian estilos de marca.
- **Migrar a otra tecnologia** (Tailwind, CSS-in-JS, vanilla
  extract). El template usa SCSS por decision arquitectonica.
- **Cambiar la decision de CSS modules**. Esa es la arquitectura
  vigente y no se discute aqui.
- **Implementar componentes nuevos**. Solo se audita y mejora lo
  existente.
- **Cambios en stylelint mas alla de los necesarios** para
  soportar la auditoria (e.g. anadir reglas que detecten lo que
  la auditoria expone).

## Documentos esperados

| Documento | Estado |
|-----------|--------|
| `alcance-auditar-scss-completo.md` | Pendiente. Producido tras un analisis preliminar mas detallado. |
| `analisis-auditar-scss-completo.md` | Pendiente. Mapeo formal de cada dimension del alcance con evidencia citada. |
| `plan-auditar-scss-completo.md` | Pendiente. Producido cuando paso a `En ejecucion`. |
| `tareas-auditar-scss-completo.md` | Pendiente. |
| [progreso-auditar-scss-completo.md](progreso-auditar-scss-completo.md) | En uso. |
| `decisiones-auditar-scss-completo.md` | Pendiente. Obligatorio al cierre. |

## Flujo previsto

1. Producir `analisis-auditar-scss-completo.md` con mapeo formal
   de las 9 dimensiones del alcance preliminar.
2. Producir `alcance-auditar-scss-completo.md` con dimensiones
   confirmadas, criterios de evaluacion y criterio de completitud.
3. **Pausa para tu confirmacion del alcance antes de planificar.**
4. Producir plan + tareas, paso a `En ejecucion`.
5. Ejecutar la auditoria dimension por dimension.
6. Producir `decisiones-auditar-scss-completo.md` al cierre con
   ADRs nuevas o ampliacion de las existentes (`dec-color-no-hex`,
   `dec-stylelint-y-checkscss`).
7. Cerrar segun PROC-GESTION-001.

## Relacion con otras iniciativas

| Iniciativa | Relacion |
|-----------|----------|
| `monitorear-y-reducir-allowlist-hex` (Cancelada) | Iniciativa subsumida. Su trabajo planeado (allowlist hex + bloqueador pre-push + ritual trimestral) migra a esta como sub-objetivo del alcance. |
| `resolver-hallazgos-de-deuda-del-template` (Cerrada) | Origen del H-05 que derivo en la cancelada y ahora hereda esta. |
| `revisar-arquitectura-de-mocks` (Cerrada) | Esta iniciativa adopta el mismo patron de auditoria con evidencia citada que aquella ejecuto sobre los mocks. |
| `ampliar-ucs-de-ecommerce` (En analisis pausada) | Independiente. No hay solapamiento de scope (el SCSS no toca contratos de UCs). Esta iniciativa puede ejecutarse en paralelo cuando se desbloquee. |
| `completar-dominio-de-ecommerce` (En ejecucion bloqueada) | Independiente. Aquella toca tipos de TypeScript, esta toca SCSS. Pueden coexistir. |
| `validar-contrato-de-mocks-vs-backend-real` (Backlog #1) | Independiente. |
