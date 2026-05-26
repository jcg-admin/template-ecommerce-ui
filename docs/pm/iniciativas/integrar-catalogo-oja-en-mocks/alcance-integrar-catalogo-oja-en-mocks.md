# Alcance: Integrar catalogo Oja en mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-catalogo-oja-en-mocks |
| Estado | En ejecucion |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-26 |
| Iniciativa origen | (raiz) |

## Por que existe esta iniciativa

El modo demo (`DEMO_MODE=true npm run build`) muestra la app con datos
generados por Faker: nombres en ingles generico ("Ergonomic Steel Hat"),
precios arbitrarios, categorias sin contexto. Existe un catalogo real
de 256 productos del negocio Ọja Yoruba que le da contexto real al
template para demostraciones.

## Que esta dentro del alcance

### 1. Script de transformacion (Node.js)

Un script en `scripts/transform-catalog.mjs` que lee el archivo fuente
del catalogo y genera `src/mocks/data/catalog.ts` con los datos ya
transformados al formato que los handlers esperan.

El script mapea campos español → inglés:

| Campo fuente (ES) | Campo destino (EN) | Notas |
|-------------------|--------------------|-------|
| `slug` | `slug` | Sin cambio |
| `nombre` | `name` | Sin cambio de contenido |
| `precio_actual` | `base_price` | Precio MXN; `price_with_tax = base_price * 1.16` |
| `precio_original` | `original_price` | null si no hay descuento |
| `descuento_pct` | `discount_pct` | Campo extra, no en `Product` type |
| `descripcion` | `description` | Sin cambio de contenido |
| `stock_disponible` | `stock` | Siempre null en el catalogo -> default 10 |
| `categoria_principal` | `category_name` + `category` | Mapea a objeto `Category` |
| `categorias` | ignorado | Solo se usa `categoria_principal` |
| `valoracion` | `rating_avg` | Sin cambio |
| `num_resenas` | `review_count` | Sin cambio |
| `imagenes[0].archivo` | `images[0].url` | `/catalog/images/<archivo>` |
| resto de campos | ignorados | `url`, `breadcrumb`, `fecha_entrega`, etc. |

### 2. Datos generados: `src/mocks/data/catalog.ts`

Archivo TypeScript generado por el script que exporta:
- `CATALOG_PRODUCTS`: array de 256 productos transformados
- `CATALOG_CATEGORIES`: array de 14 categorias con id, name, slug y product_count

Este archivo se versiona en el repo (es el resultado de la
transformacion, no el scraper original).

### 3. Imagenes como assets estaticos (solo DEMO_MODE)

Las 320 imagenes PNG (24 MB total, 77 KB promedio) se sirven como
archivos estaticos. El mecanismo:

- Las imagenes viven en `public/catalog/images/`
- `copy-webpack-plugin` las copia a `dist/catalog/images/` **solo
  cuando `DEMO_MODE=true`** (extension del patron ya establecido para
  `mockServiceWorker.js`)
- El bundle JS referencia las rutas como strings:
  `/catalog/images/nombre-del-producto.png`
- En `npm run dev`, webpack-dev-server sirve `public/` directamente,
  por lo que las imagenes estan disponibles sin build

### 4. Actualizacion de handlers

`catalog.ts` deja de usar Faker y usa `CATALOG_PRODUCTS` y
`CATALOG_CATEGORIES` del archivo de datos:

```typescript
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from '../data/catalog';

// GET /api/v1/catalogue/ - usa CATALOG_PRODUCTS con paginacion
// GET /api/v1/catalogue/:slug/ - busca en CATALOG_PRODUCTS por slug
// GET /api/v1/catalogue/search/ - filtra CATALOG_PRODUCTS por nombre
// GET /api/v1/categories/ - retorna CATALOG_CATEGORIES
```

### 5. Actualizacion de `product.ts` factory

Las categorias de la factory (`CATEGORIES` array) se actualizan con
las 14 categorias reales. La factory sigue siendo util para tests que
necesiten productos con overrides arbitrarios.

## Criterio de completitud

1. `scripts/transform-catalog.mjs` existe y transforma correctamente.
2. `src/mocks/data/catalog.ts` contiene 256 productos y 14 categorias.
3. `public/catalog/images/` contiene las 320 imagenes PNG.
4. `npm run build:demo` incluye `dist/catalog/images/` en el output.
5. `npm run build` sin `DEMO_MODE` no incluye `dist/catalog/images/`.
6. En modo demo, el catalogo muestra productos reales de Ọja Yoruba.
7. `npm run dev` muestra productos reales en el dev server.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Internacionalizar los nombres (yoruba/espanol) | Los nombres son el dato real del negocio; no se traducen |
| Agregar resenas reales | Las resenas son texto libre scrapeado; fuera de este alcance |
| Multiples imagenes por producto | 37 productos tienen 2-4 imagenes; para el MVP se usa solo la primera |
| Subir imagenes a CDN | El template es local; CDN es decision del adoptante |
| Backend real de Ọja Yoruba | El template es agnostico del backend |

## Estimacion de esfuerzo

| Fase | Descripcion | Esfuerzo |
|------|-------------|----------|
| F0 | Analisis + PM docs | 25 min |
| F1 | Script de transformacion | 30 min |
| F2 | Imagenes: copiar a public/ + webpack config | 15 min |
| F3 | src/mocks/data/catalog.ts generado | 10 min |
| F4 | Actualizar catalog.ts handler | 20 min |
| F5 | Actualizar product.ts factory | 10 min |
| F6 | Verificacion y cierre | 15 min |
| Total | | ~2 horas |
