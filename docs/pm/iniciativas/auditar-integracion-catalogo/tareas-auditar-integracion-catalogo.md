# Plan y Tareas: Auditar integracion catalogo

## Prioridad de hallazgos

| ID | Tipo | Severidad | Se corrige |
|----|------|-----------|-----------|
| A-07 | Bug funcional | MEDIA | Si — F1 |
| A-02 | Bug funcional | MEDIA | Si — F2 |
| A-03 | Bug latente | BAJA | Si — F3 (comentario) |
| A-01 | Documentacion | BAJA | Si — F3 |
| A-05 | Usabilidad | BAJA | Si — F3 |
| A-06 | Tipos TS | BAJA | Si — F4 |
| A-04 | Ninguna | NINGUNA | No requiere cambio |

## F0 - Analisis + PM docs (hecha)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-001 | Auditar codigo de las tres iniciativas recientes | Hecha |
| T-002 | Crear documentos PM | Hecha |

## F1 - Corregir A-07: filtro de categoria (el mas critico)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-101 | Agregar campo `all_categories` al script `transform-catalog.mjs`: array de slugs de todas las categorias del producto | Pendiente |
| T-102 | Regenerar `src/mocks/data/catalog.ts` con el nuevo campo | Pendiente |
| T-103 | Actualizar handler: filtrar por `all_categories.includes(catSlug)` en lugar de `category?.slug === catSlug` | Pendiente |
| T-104 | Verificar: `?category=semillas` retorna los 10 productos correctos | Pendiente |

## F2 - Corregir A-02: paginacion de busqueda

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-201 | Simplificar handler search: retornar todos los resultados sin paginacion artificial (busqueda no pagina en la mayoria de implementaciones reales) | Pendiente |
| T-202 | Verificar que `next` y `previous` son null en la respuesta de search | Pendiente |

## F3 - Deuda documental: A-01, A-03, A-05

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-301 | Actualizar JSDoc de `browser.ts`: el worker se importa cuando `NODE_ENV !== 'production' OR DEMO_MODE === 'true'` | Pendiente |
| T-302 | Agregar comentario `@deprecated` en `checkoutSlice.js` apuntando a `paymentsSlice.js` | Pendiente |
| T-303 | Documentar uso del script en `README.md` bajo una seccion de herramientas de desarrollo | Pendiente |

## F4 - Tipos TypeScript: A-06

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-401 | Cambiar `as const` por tipo explicito en `catalog.ts` generado: actualizar el script para emitir `satisfies` o tipo sin `as const` | Pendiente |
| T-402 | Regenerar `catalog.ts` y verificar que los tipos del handler no se quejam | Pendiente |

## F5 - Verificacion y cierre

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-501 | Verificar filtro por las 14 categorias: todas retornan resultados | Pendiente |
| T-502 | Verificar busqueda: `next` y `previous` correctos | Pendiente |
| T-503 | Crear `decisiones-*.md`; cerrar index e indice; commit | Pendiente |
