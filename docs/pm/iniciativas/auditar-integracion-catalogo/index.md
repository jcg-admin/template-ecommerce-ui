# Iniciativa: auditar-integracion-catalogo

| Campo | Valor |
|-------|-------|
| Slug | `auditar-integracion-catalogo` |
| Estado | En ejecucion |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-26 |
| Fecha de apertura formal | 2026-05-26 |
| Fecha de paso a ejecucion | 2026-05-26 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

Revision sistematica del codigo producido por las tres iniciativas
recientes antes de generar el tarball de entrega:

- `habilitar-msw-en-modo-demo`
- `auditar-y-corregir-inconsistencias`
- `integrar-catalogo-oja-en-mocks`

La auditoria encontro 7 hallazgos. Tres son bugs confirmados que
afectan el comportamiento en runtime. Cuatro son deuda documental
o de codigo sin impacto funcional inmediato.

## Hallazgos

| ID | Tipo | Descripcion | Impacto |
|----|------|-------------|---------|
| A-01 | Bug | `browser.ts` dice "solo en NODE_ENV=development" — incorrecto desde que DEMO_MODE extiende el guard en `index.jsx` | Documentacion incorrecta; ningun efecto funcional |
| A-02 | Bug | Handler de busqueda construye `next` con `?q=${q}&page=2` hardcodeado — no es una URL relativa correcta ni incluye todos los params | Paginacion de busqueda no funciona desde pagina 2 |
| A-03 | Bug | `checkoutSlice.js` (legacy) usa `/api/payments/*/create/` que no tiene handler. Existe como codigo muerto pero si algun componente lo invoca, fallaria silenciosamente | Riesgo latente |
| A-04 | Deuda | `catalog.ts` generado tiene 270 ocurrencias de `"slug":` (256 productos + 14 variantes duplican el campo) — el campo `sku` de las variantes repite el slug transformado | Inofensivo; el dato es correcto |
| A-05 | Deuda | `scripts/transform-catalog.mjs` no tiene entrada en `package.json` como script npm | El operador debe conocer la ruta exacta para ejecutarlo |
| A-06 | Bug | `as const` en `CATALOG_PRODUCTS` hace el array `readonly`. El handler hace `[...CATALOG_PRODUCTS]` (spread correcto) pero `CATALOG_PRODUCTS.find()` retorna un elemento `readonly` que `HttpResponse.json()` acepta — sin problema en runtime pero TypeScript puede quejarse en modo strict | Potencial error de tipos en TS strict |
| A-07 | Deuda | Las 6 categorias sin `categoria_principal` (Ikoberes, Semillas, etc.) tienen `product_count` correcto en `CATALOG_CATEGORIES` pero ningun producto del catalogo tiene `category.slug` = esos slugs. Filtrar por `?category=ikoberes-amuletos` retorna 0 resultados aunque hay 14 productos en esa categoria. | El filtro por categoria no funciona para 6 de las 14 |

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-26.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [analisis-auditar-integracion-catalogo.md](analisis-auditar-integracion-catalogo.md) | Evidencia de cada hallazgo con fragmento de codigo. |
| [plan-auditar-integracion-catalogo.md](plan-auditar-integracion-catalogo.md) | Tareas por hallazgo y DAG. |
| [tareas-auditar-integracion-catalogo.md](tareas-auditar-integracion-catalogo.md) | Lista plana de tareas con estado. |
| [progreso-auditar-integracion-catalogo.md](progreso-auditar-integracion-catalogo.md) | Log del avance. |
