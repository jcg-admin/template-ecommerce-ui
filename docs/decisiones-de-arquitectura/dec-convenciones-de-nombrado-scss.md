# dec-convenciones-de-nombrado-scss

| Campo | Valor |
|-------|-------|
| ID | dec-convenciones-de-nombrado-scss |
| Estado | Activa |
| Fecha | 2026-05-27 |
| Iniciativa | mapear-y-corregir-scss-completo (T-019) |

## Contexto

El template usa CSS Modules para todos los estilos de componentes.
Los archivos de abstracts (variables, mixins, functions) son partials
SCSS sin output CSS propio — solo se consumen vía `@use`.

## Decisiones

### Nombrado de archivos

- Módulos de componente: `ComponentName.module.scss` (PascalCase)
- Partials de abstracts: `_nombre-con-guiones.scss` (kebab-case, prefijo _)
- Barrel de abstracts: `_index.scss`

### Nombrado de variables SCSS

- Variables: `$kebab-case` (convención SCSS estándar)
- Familias semánticas: prefijo descriptivo → `$color-*`, `$font-*`, `$spacing-*`
- Variables de ui-core portadas: se mantiene el nombre original de ui-core

### Nombrado de clases CSS en módulos

- Convención principal: camelCase (`cardHeader`, `btnPrimary`)
- Excepción permitida: kebab-case para modificadores BEM-like (`card--featured`)
- NO se activa `selector-class-pattern` en stylelint porque los módulos
  existentes mezclan patrones de forma legítima

### Mixins

- Archivos en `abstracts/mixins/`: `_kebab-case.scss`
- Nombre del mixin: `kebab-case` (convención Sass)

## Consecuencias

- Los 122 módulos SCSS existentes no necesitan renombrado
- Las herramientas de lint validan compilación y patrones de import
- Los nombres de ui-core portados no se adaptan al nombrado local
  (evitar divergencia con la referencia upstream)
