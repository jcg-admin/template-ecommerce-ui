# Plan: Integrar catalogo Oja en mocks

## DAG de fases

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'background': '#0f172a',
  'primaryColor': '#1e293b',
  'primaryTextColor': '#f1f5f9',
  'primaryBorderColor': '#94a3b8',
  'lineColor': '#cbd5e1',
  'fontSize': '13px'
}}}%%
flowchart LR
    f0["<b>F0</b><br/>Analisis<br/>+ PM docs<br/><i>25 min</i>"]
    f1["<b>F1</b><br/>Script de<br/>transformacion<br/><i>30 min</i>"]
    f2["<b>F2</b><br/>Imagenes<br/>public/ + webpack<br/><i>15 min</i>"]
    f3["<b>F3</b><br/>catalog.ts<br/>datos generados<br/><i>10 min</i>"]
    f4["<b>F4</b><br/>Handler<br/>catalog.ts<br/><i>20 min</i>"]
    f5["<b>F5</b><br/>Factory<br/>product.ts<br/><i>10 min</i>"]
    f6["<b>F6</b><br/>Verificacion<br/>y cierre<br/><i>15 min</i>"]

    f0 --> f1
    f1 --> f3
    f2 --> f4
    f3 --> f4
    f4 --> f5
    f5 --> f6

    classDef doneNode fill:#14532d,stroke:#4ade80,stroke-width:2px,color:#f0fdf4
    classDef stepNode fill:#1e293b,stroke:#60a5fa,stroke-width:2px,color:#f1f5f9

    class f0 doneNode
    class f1,f2,f3,f4,f5,f6 stepNode
```

F1 y F2 son paralelos (no dependen entre si).
F3 depende de F1 (usa el script para generar los datos).
F4 depende de F2 y F3 (necesita las imagenes y los datos).

## F0 - Analisis + PM docs (25 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-001 | Analizar el catalogo: peso de imagenes, campos, categorias, casos especiales | 15 min |
| T-002 | Crear 5 documentos PM | 10 min |

## F1 - Script de transformacion (30 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-101 | Crear `scripts/transform-catalog.mjs`: lee JSON fuente, mapea campos ES->EN, genera `src/mocks/data/catalog.ts` | 25 min |
| T-102 | Verificar que el script genera datos validos (256 productos, 14 categorias, paths de imagen correctos) | 5 min |

## F2 - Imagenes: public/ + webpack (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-201 | Copiar 320 PNGs a `public/catalog/images/` | 3 min |
| T-202 | Extender `CopyPlugin` en `webpack.config.js` para incluir `catalog/images/` en DEMO_MODE | 7 min |
| T-203 | Verificar que `npm run dev` sirve las imagenes en `/catalog/images/` | 5 min |

## F3 - Datos generados (10 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-301 | Ejecutar `scripts/transform-catalog.mjs` con el JSON fuente | 2 min |
| T-302 | Revisar `src/mocks/data/catalog.ts` generado: estructura correcta, sin datos corruptos | 8 min |

## F4 - Handler catalog.ts (20 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-401 | Importar `CATALOG_PRODUCTS` y `CATALOG_CATEGORIES` en `catalog.ts` | 3 min |
| T-402 | Reemplazar handler `GET /api/v1/catalogue/`: paginacion sobre `CATALOG_PRODUCTS` | 5 min |
| T-403 | Reemplazar handler `GET /api/v1/catalogue/:slug/`: busqueda en `CATALOG_PRODUCTS` | 5 min |
| T-404 | Reemplazar handler `GET /api/v1/catalogue/search/`: filtro por nombre en `CATALOG_PRODUCTS` | 5 min |
| T-405 | Reemplazar handler `GET /api/v1/categories/`: retornar `CATALOG_CATEGORIES` | 2 min |

## F5 - Factory product.ts (10 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-501 | Actualizar `CATEGORIES` en `product.ts` con las 14 categorias reales | 10 min |

## F6 - Verificacion y cierre (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-601 | Verificar estructura de `catalog.ts`: 256 productos, 14 categorias, paths de imagen validos | 5 min |
| T-602 | Verificar que `npm run build:demo` incluye `dist/catalog/images/` y no `npm run build` | 5 min |
| T-603 | Crear `decisiones-*.md`; actualizar index e indice; commit de cierre | 5 min |
