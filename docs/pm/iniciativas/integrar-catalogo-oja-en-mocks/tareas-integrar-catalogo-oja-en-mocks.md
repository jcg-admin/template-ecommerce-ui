# Tareas: Integrar catalogo Oja en mocks

## F0 - Analisis + PM docs (25 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-001 | Analizar catalogo: peso imagenes, campos, categorias, casos especiales | Hecha |
| T-002 | Crear 5 documentos PM | Hecha |

## F1 - Script de transformacion (30 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-101 | Crear `scripts/transform-catalog.mjs` | Hecha |
| T-102 | Verificar output del script: 256 productos, 14 categorias, paths correctos | Hecha |

## F2 - Imagenes: public/ + webpack (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-201 | Copiar 320 PNGs a `public/catalog/images/` | Hecha |
| T-202 | Extender `CopyPlugin` en `webpack.config.js` para `catalog/images/` en DEMO_MODE | Hecha |
| T-203 | Verificar que dev server sirve imagenes en `/catalog/images/` | Hecha (pendiente funcional en distro) |

## F3 - Datos generados (10 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-301 | Ejecutar script con JSON fuente | Hecha |
| T-302 | Revisar `src/mocks/data/catalog.ts`: estructura y datos correctos | Hecha |

## F4 - Handler catalog.ts (20 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-401 | Importar `CATALOG_PRODUCTS` y `CATALOG_CATEGORIES` en `catalog.ts` | Hecha |
| T-402 | Handler `GET /api/v1/catalogue/` con paginacion sobre datos reales | Hecha |
| T-403 | Handler `GET /api/v1/catalogue/:slug/` con busqueda en datos reales | Hecha |
| T-404 | Handler `GET /api/v1/catalogue/search/` con filtro en datos reales | Hecha |
| T-405 | Handler `GET /api/v1/categories/` con categorias reales | Hecha |

## F5 - Factory product.ts (10 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-501 | Actualizar `CATEGORIES` en `product.ts` con las 14 categorias reales | Hecha |

## F6 - Verificacion y cierre (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-601 | Verificar estructura de `catalog.ts`: 256 productos, 14 categorias | Hecha |
| T-602 | Verificar DEMO_MODE incluye imagenes y build normal no | Hecha |
| T-603 | `decisiones-*.md`; cerrar index e indice; commit | Hecha |
