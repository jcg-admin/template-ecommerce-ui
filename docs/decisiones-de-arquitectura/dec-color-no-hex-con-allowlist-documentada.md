# dec-color-no-hex-con-allowlist-documentada

| Campo | Valor |
|-------|-------|
| ID | dec-color-no-hex-con-allowlist-documentada |
| Estado | Activa — actualizada |
| Fecha | 2026-05-27 |
| Iniciativa | mapear-y-corregir-scss-completo (T-022) |
| Supersede | (version inicial de la decision) |

## Contexto

El template activa la regla `color-no-hex` de stylelint para forzar
que todos los colores se definan como variables SCSS en `_variables.scss`.
En T-009..T-013 se tokenizaron los 23 hex azules (#1C5BD8 familia)
que quedaban en los módulos de producción.

## Categorías de hex permitidos

### 1. _variables.scss — definiciones de token (exento de la regla)
El archivo de variables es la fuente de verdad. Todos los hex aquí
son intencionales y definen la paleta.

### 2. Archivos de test SCSS
`src/styles/tests/` — los hex son valores de input para tests de funciones
(#ff0000, #ffffff, #000000). Son legítimos y no representan decisiones de diseño.

### 3. Archivos portados de ui-core (abstracts/mixins/)
Los archivos portados de ui-core tienen `stylelint-disable` en la cabecera.
Sus hex son internos al mixin y no escapan al CSS de producción.

### 4. #212631 en _variables-dark.scss
Color de mezcla interno del dark mode (color.mix con $gray-800-dark).
No tiene variable canónica — se difiere a la implementación completa del dark mode.

## Estado tras T-009..T-013

- Hex en módulos de producción: 0
- Hex en abstracts de producción: 0 (excepto _variables.scss por diseño)
- Hex en tests: legítimos
- Hex en mixins portados: bajo stylelint-disable declarado
