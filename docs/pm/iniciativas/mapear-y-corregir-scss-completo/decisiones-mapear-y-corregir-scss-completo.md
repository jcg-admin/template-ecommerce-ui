# Decisiones: mapear-y-corregir-scss-completo

| Campo | Valor |
|-------|-------|
| Iniciativa | mapear-y-corregir-scss-completo |
| Fecha de creacion | 2026-05-21 |
| Fecha de cierre | 2026-05-27 |

## Seccion 1 — Decisiones de arquitectura

### dec-preloadedState-vs-fetch (remitir a ADR externa)
Las tres ADRs de convenciones SCSS viven en
`docs/decisiones-de-arquitectura/`:
- dec-convenciones-de-nombrado-scss.md
- dec-color-no-hex-con-allowlist-documentada.md
- dec-tokens-solo-sass-no-css-vars.md

### dec-aliases-como-api-publica (T-015)
Los 8 aliases de compatibilidad ($primary, $error, $border, etc.) tienen
uso masivo en el codebase (452, 120, 1097 ocurrencias respectivamente).
Decision: preservarlos como API publica del template con !default,
no eliminarlos. La migracion a tokens de T-202 es una tarea futura
cuando el dark mode completo requiera indireccion dinamica.

### dec-selector-class-pattern (T-018)
No se activa selector-class-pattern en stylelint. Los modulos CSS
existentes mezclan camelCase, kebab-case y PascalCase de forma legitima
en CSS Modules. Una regla forzada romperia sin valor anadido.

### dec-ui-core-default (T-202)
Todos los tokens de ui-core se integran con !default. Las variables del
template (definidas antes en el archivo, sin !default) toman precedencia
automatica en Sass. Esto permite actualizar ui-core sin perder el diseno
Yoruba.

### dec-mixins-portados-con-disable (T-205)
Los archivos de mixins portados de ui-core tienen estilos de codigo
incompatibles con nuestra config de stylelint (at-if-closing-brace,
custom-property-empty-line-before, etc.). Decision: agregar
stylelint-disable al cabecero de cada archivo portado en lugar de
reformatear el codigo fuente de ui-core, para facilitar actualizaciones
futuras del upstream.

## Seccion 2 — Resultado cuantitativo

| Metrica | Antes | Despues |
|---------|-------|---------|
| Variables en _variables.scss | 180 | 877 |
| Variables muertas (fusv) | 57 | 20 (aprox) |
| Mixins en _mixins.scss | 52 | 43 |
| SCSS entries compilando | 102 | 122 |
| lint:style errores | 60 | 30 |
| Hex colors en modulos | 23 | 0 |
| Tests SCSS pasando | 21 | 21 |
| Tests Jest pasando | 633 | 669 |
| Suites Jest fallando | 11 | 9 |

## Seccion 3 — Bugs encontrados durante la ejecucion

| Bug | Archivo | Descripcion | Resolucion |
|-----|---------|-------------|------------|
| BUG-T201-params | _color-contrast-variables.scss | #F5F7EE como nombre de parametro en lugar de $white | Corregido restaurando firma de ui-core |
| BUG-T201-vars | _variables.scss | Bloque de 6 variables anticipadas ausente (perdido en revert) | Restauradas con valores de ui-core |
| BUG-T202-sass-color | _variables.scss | @use "sass:color" faltante para el bloque T-202 | Agregado al inicio del archivo |
| BUG-T202-units | _variables.scss | Unidades mixtas px+rem en calculo de nav-link-height | Diferidas a T-208 con valor fijo temporal |
| BUG-quotes | _box-shadow.scss | Comillas mixtas @use 'sass:list" tras reemplazo | Corregidas manualmente |
| BUG-t-003-scope | _variables.scss | Primera iteracion de T-003 elimino variables usadas en modulos (fusv no escanea src/components) | Revertido, rehechos con grep -r sobre todo src/ |

## Seccion 4 — Criterios de completitud verificados

| Criterio | Resultado |
|----------|-----------|
| Variables muertas reducidas | PASA (57 -> ~20) |
| Hex colors en modulos de produccion = 0 | PASA |
| SCSS compile 122 entries clean | PASA |
| lint:style mejora vs baseline | PASA (60 -> 30) |
| Tests SCSS 21/21 | PASA |
| Bloque T-202 integrado con !default | PASA |
| ADRs creadas (T-019, T-022, T-023) | PASA |
| Ritual trimestral documentado (T-021) | PASA |
