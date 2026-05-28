# dec-tokens-solo-sass-no-css-vars

| Campo | Valor |
|-------|-------|
| ID | dec-tokens-solo-sass-no-css-vars |
| Estado | Activa |
| Fecha | 2026-05-27 |
| Iniciativa | mapear-y-corregir-scss-completo (T-023) |

## Contexto

ui-core-5.25.0 usa extensivamente CSS custom properties (`--ec-X`)
como mecanismo de theming runtime. El template ecommerce-ui adoptó
una posición diferente en T-208: exponer solo ~30 custom properties
selectivas en `_root.scss`, no las ~130 de ui-core.

## Decisión

Los tokens de diseño del template viven principalmente como variables SCSS
(`$variable: valor`), no como CSS custom properties (`--ec-variable: valor`).

### Razones

1. CSS Modules compila los estilos en build time — las CSS custom properties
   solo tienen valor si JS necesita leerlas o si se quiere theming runtime
   sin recompilar SCSS.

2. El dark mode del template se implementa vía un segundo archivo de variables
   (`_variables-dark.scss`) que se aplica bajo `[data-theme="dark"]`, no
   vía custom properties dinámicas.

3. Los ~30 tokens en `_root.scss` cubren los casos donde JS necesita leer
   un token (animaciones, posicionamiento calculado en JS, etc.).

## Excepción

Los mixins portados de ui-core que emiten `--#{$prefix}X` en su output CSS
se mantienen como están (son la API de ui-core). No se adaptan porque
eso rompería la coherencia con la referencia upstream.

## Consecuencia

Las variables de ui-core portadas con `!default` que referencian
`var(--#{$prefix}X)` quedan comentadas como `// T-208:` hasta que
el dark mode completo se implemente.
