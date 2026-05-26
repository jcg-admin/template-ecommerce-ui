# Decisiones: Auditar integracion catalogo

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-integracion-catalogo |
| Fecha de creacion | 2026-05-26T01:21:26 |

## Seccion 1 — Decisiones de diseno

### dec-search-sin-paginacion

El handler de busqueda retorna todos los resultados sin paginar.
Alternativa descartada: implementar paginacion real con `?page=N`.

Razon: la busqueda tipicamente retorna pocos resultados y el frontend
los muestra todos de una vez. El `?page=N` que enviaria el frontend
al hacer siguiente pagina nunca habia funcionado (bug A-02), por lo
que ningun componente depende de esa funcionalidad. Implementar
paginacion real requeriria tambien cambios en el frontend — fuera
del alcance de esta auditoria.

### dec-all-categories-campo-extra

`all_categories` se agrega como campo extra en los productos, fuera
del tipo `Product` de `domain.ts`. Alternativa descartada: extender
el tipo `Product` en `domain.ts`.

Razon: `domain.ts` refleja el contrato del backend real, que no
tiene `all_categories`. Agregar un campo solo para el modo demo al
tipo canonico mezcla responsabilidades. El patron de campos extra ya
existe en el codebase (`price`, `original_price`, `images`,
`variants`, `discount_pct`). El cast `(p as any).all_categories`
en el handler es el precio a pagar — aceptable para un campo de demo.

### dec-as-const-eliminado

`as const` se elimina de los arrays generados. Alternativa descartada:
mantener `as const` y usar `ReadonlyArray<...>` en los tipos del
handler.

Razon: el handler ya hace spread `[...CATALOG_PRODUCTS]` cuando
necesita mutar — la inmutabilidad de `as const` no aportaba ninguna
garantia extra en runtime. En TypeScript strict, `readonly` en los
elementos podia causar conflictos al asignar a tipos no-readonly.
Sin `as const`, los tipos son mutables por defecto y compatibles con
cualquier asignacion.

## Seccion 2 — Hallazgos durante la ejecucion

### hallazgo-referencia-incorrecta-en-t104

Durante T-104 (verificacion del filtro de categoria), el primer test
usaba los conteos de `_resumen.json` como referencia esperada. Esos
conteos son por `categoria_principal` (8 valores), pero el filtro
ahora usa `all_categories[]` (14 valores). El test fallaba para 3
categorias no porque el codigo estuviera mal, sino porque la
referencia era incorrecta. La referencia correcta es
`CATALOG_CATEGORIES.product_count`, que ya usa `categorias[]`.

### hallazgo-a04-inofensivo-confirmado

El conteo de 270 ocurrencias de `"slug":` en el `catalog.ts` original
se confirmo como inofensivo: 256 del array de productos + 14 de
`CATALOG_CATEGORIES`. El catalogo regenerado con `all_categories` tiene
mas ocurrencias de slugs (dentro de `all_categories`) pero el dato es
correcto en todos los casos.

## Seccion 3 — Verificacion post-ejecucion

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| A-07: semillas retorna 10 productos | PASA | simulate: count=10 |
| A-07: ikoberes-amuletos retorna 14 | PASA | simulate: count=14 |
| A-07: 14/14 categorias con conteo correcto | PASA | filter count == product_count para las 14 |
| A-02: search next=null siempre | PASA | grep next catalog.ts handler muestra null |
| A-02: search devuelve todos los resultados | PASA | results sin slice en el codigo |
| A-01: browser.ts sin 'solo en NODE_ENV=development' | PASA | grep no encuentra la cadena |
| A-03: checkoutSlice.js tiene @deprecated | PASA | grep @deprecated checkoutSlice.js |
| A-05: README documenta transform-catalog.mjs | PASA | grep transform-catalog README.md |
| A-06: catalog.ts sin as const | PASA | grep 'as const' retorna vacio |
| A-04: no requeria cambio | N/A | inofensivo por diseno |
