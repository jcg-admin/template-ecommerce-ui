#!/usr/bin/env node
/**
 * transform-catalog.mjs — ecommerce-ui
 *
 * Lee el JSON fuente del catalogo de Oja Yoruba (formato del scraper,
 * campos en espanol) y genera `src/mocks/data/catalog.ts` con los
 * datos transformados al formato que los handlers MSW y el tipo
 * `Product` de `domain.ts` esperan.
 *
 * Decisiones de transformacion:
 *
 *   precio_actual = price_with_tax (precio final con IVA que ve el cliente).
 *   En Mexico los precios en tiendas online incluyen IVA por ley.
 *   base_price = round(precio_actual / 1.16, 2)
 *
 *   precio_original = original_price (precio antes del descuento, tambien
 *   con IVA). null si no hay descuento.
 *
 *   stock_disponible -> stock: todos son null en el catalogo -> default 10.
 *
 *   imagenes: solo se usa la primera imagen (MVP). Los productos con
 *   multiples imagenes se quedan con la imagen principal hasta que se
 *   implemente la galeria.
 *
 *   categoria_principal -> category + category_name (categoria primaria).
 *   categorias[] -> all_categories (array de slugs de TODAS las categorias
 *   del producto). Permite filtrar por cualquiera de las 14 categorias,
 *   no solo por las 8 que tienen categoria_principal.
 *
 *   Campos ignorados: url, breadcrumb, fecha_entrega, url_wishlist,
 *   ahorro, unidades_compradas, scrapeado_en.
 *
 * Uso:
 *   node scripts/transform-catalog.mjs <ruta-al-json>
 *   node scripts/transform-catalog.mjs oja/productos/_catalogo_completo.json
 *
 * El archivo de salida se escribe en src/mocks/data/catalog.ts.
 * Es un archivo generado pero se versiona — no se regenera automaticamente
 * en el build. Si el catalogo cambia, ejecutar este script y commitear.
 *
 * Implementado en T-101 de la iniciativa `integrar-catalogo-oja-en-mocks`.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot  = resolve(__dirname, '..');

// =============================================================================
// Argumentos
// =============================================================================
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Uso: node scripts/transform-catalog.mjs <ruta-al-json>');
  console.error('Ejemplo: node scripts/transform-catalog.mjs oja/productos/_catalogo_completo.json');
  process.exit(1);
}

const resolvedInput = resolve(inputPath);
console.log(`Leyendo: ${resolvedInput}`);

let raw;
try {
  raw = readFileSync(resolvedInput, 'utf-8');
} catch (err) {
  console.error(`No se pudo leer el archivo: ${resolvedInput}`);
  console.error(err.message);
  process.exit(1);
}

const source = JSON.parse(raw);
const productos = source.productos ?? source;

if (!Array.isArray(productos)) {
  console.error('El JSON no contiene un array de productos en .productos');
  process.exit(1);
}

// =============================================================================
// 14 Categorias del catalogo Oja (orden por volumen de productos)
// =============================================================================
const CATEGORIAS_MAP = {
  'Lo Nuevo':                    { id: 1,  slug: 'lo-nuevo',                    name: 'Lo Nuevo' },
  'Akoses / Medicinas':          { id: 2,  slug: 'akoses-medicinas',             name: 'Akoses / Medicinas' },
  'Collares y Pulseras':         { id: 3,  slug: 'collares-y-pulseras',          name: 'Collares y Pulseras' },
  'Isan / Iconos':               { id: 4,  slug: 'isan-iconos',                  name: 'Isan / Iconos' },
  'Complementos y Herramientas': { id: 5,  slug: 'complementos-y-herramientas', name: 'Complementos y Herramientas' },
  'Enseres':                     { id: 6,  slug: 'enseres',                      name: 'Enseres' },
  'Collares de Orumila':         { id: 7,  slug: 'collares-de-orumila',          name: 'Collares de Orumila' },
  'Ikoberes / Amuletos':         { id: 8,  slug: 'ikoberes-amuletos',            name: 'Ikoberes / Amuletos' },
  'Semillas':                    { id: 9,  slug: 'semillas',                     name: 'Semillas' },
  'Ropa y Telas':                { id: 10, slug: 'ropa-y-telas',                 name: 'Ropa y Telas' },
  'Varios':                      { id: 11, slug: 'varios',                       name: 'Varios' },
  'Paquetes':                    { id: 12, slug: 'paquetes',                     name: 'Paquetes' },
  'Mayoreo':                     { id: 13, slug: 'mayoreo',                      name: 'Mayoreo' },
  'Titulos':                     { id: 14, slug: 'titulos',                      name: 'Titulos' },
  // Alias del scraper -> categoria canonica
  'Títulos':                     { id: 14, slug: 'titulos',                      name: 'Titulos' },
};

// =============================================================================
// Calcular product_count por categoria desde el array categorias[]
// DECISION: categoria_principal solo tiene 8 valores en el catalogo
// (WooCommerce primary category). Las otras 6 categorias solo aparecen
// en categorias[]. Para que CATALOG_CATEGORIES muestre conteos reales
// se usa el array completo. La asignacion de categoria primaria de cada
// producto sigue usando categoria_principal.
// =============================================================================
const categoryCount = {};
for (const p of productos) {
  for (const cat of (p.categorias ?? [])) {
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
  }
}

// =============================================================================
// Transformacion de un producto
// =============================================================================
function round2(n) {
  return Math.round(n * 100) / 100;
}

function slugToSku(slug) {
  return 'OJA-' + slug.replace(/-/g, '').substring(0, 8).toUpperCase();
}

function transformProduct(p, index) {
  const priceWithTax  = p.precio_actual ?? 0;
  const basePrice     = round2(priceWithTax / 1.16);
  const origWithTax   = p.precio_original ?? null;

  const catKey  = p.categoria_principal ?? '';
  const catData = CATEGORIAS_MAP[catKey];
  if (!catData && catKey) {
    process.stderr.write(`WARN: categoria desconocida "${catKey}" en producto "${p.slug}"\n`);
  }

  const imagenes = p.imagenes ?? [];
  const mainImg  = imagenes[0]?.archivo ?? null;

  // all_categories: slugs de todas las categorias del producto (desde
  // el array categorias[] del scraper). Incluye la categoria principal
  // y las secundarias. Permite filtrar por cualquiera de las 14
  // categorias en el handler, no solo por las 8 con categoria_principal.
  const allCategorySlugs = (p.categorias ?? [])
    .map(cat => CATEGORIAS_MAP[cat]?.slug)
    .filter(Boolean);

  return {
    id:             index + 1,
    slug:           p.slug,
    sku:            slugToSku(p.slug),
    name:           p.nombre,
    description:    p.descripcion ?? '',
    base_price:     basePrice,
    price_with_tax: priceWithTax,
    effective_price: priceWithTax,
    stock:          p.stock_disponible ?? 10,
    category_name:  catData?.name ?? catKey,
    category:       catData
      ? { id: catData.id, name: catData.name, slug: catData.slug, product_count: categoryCount[catKey] ?? 0 }
      : null,
    is_featured:    false,
    rating_avg:     p.valoracion ?? 0,
    review_count:   p.num_resenas ?? 0,
    // Campos extra del shape legacy (no en Product type de domain.ts pero
    // usados por componentes del frontend para mostrar descuentos e imagenes).
    price:          priceWithTax,
    original_price: origWithTax,
    discount_pct:   p.descuento_pct ?? null,
    images:         mainImg
      ? [{ id: 1, url: `/catalog/images/${mainImg}`, is_main: true }]
      : [{ id: 1, url: '/catalog/images/placeholder.png', is_main: true }],
    variants:       [
      { id: 1, name: 'Unico', sku: slugToSku(p.slug) + '-01', stock: p.stock_disponible ?? 10, price: priceWithTax },
    ],
    // all_categories: todos los slugs de categoria del producto.
    // Campo extra fuera del tipo Product de domain.ts. Se usa en el
    // handler para filtrar por cualquiera de las 14 categorias.
    // Correccion de A-07 en la iniciativa `auditar-integracion-catalogo`.
    all_categories: allCategorySlugs,
  };
}

// =============================================================================
// Transformar todos los productos
// =============================================================================
const transformedProducts = productos.map(transformProduct);

// =============================================================================
// Construir lista de categorias con product_count real
// =============================================================================
const transformedCategories = Object.values(CATEGORIAS_MAP)
  // Eliminar duplicados (Titulos / Títulos apuntan al mismo id)
  .filter((cat, idx, arr) => arr.findIndex(c => c.id === cat.id) === idx)
  .sort((a, b) => a.id - b.id)
  .map(cat => {
    // Buscar la clave original del scraper (puede tener tilde)
    const count = Object.entries(categoryCount).find(
      ([k]) => CATEGORIAS_MAP[k]?.id === cat.id
    )?.[1] ?? 0;
    return { ...cat, product_count: count };
  });

// =============================================================================
// Generar archivo TypeScript
// =============================================================================
const header = `/**
 * catalog.ts — datos reales del catalogo Oja Yoruba
 *
 * ARCHIVO GENERADO — no editar manualmente.
 * Regenerar con: node scripts/transform-catalog.mjs <ruta-al-json>
 *
 * Fuente: ${resolvedInput}
 * Generado: ${new Date().toISOString()}
 * Productos: ${transformedProducts.length}
 * Categorias: ${transformedCategories.length}
 *
 * Decisiones de transformacion:
 *   price_with_tax = precio_actual (IVA incluido, lo que ve el cliente)
 *   base_price     = round(precio_actual / 1.16, 2)
 *   stock          = stock_disponible ?? 10 (todos son null en el catalogo)
 *   images         = solo la primera imagen (MVP; 37 productos tienen multiples)
 *   category       = categoria_principal (categoria primaria, 8 valores)
 *   all_categories = slugs de todas las categorias del producto (14 valores)
 */
`;

// Nota sobre tipos: se omite `as const` para que los arrays sean
// mutables. `as const` hacia los elementos readonly, lo que podia
// causar conflictos con tipos no-readonly en modo TypeScript strict.
// El handler usa spread [...CATALOG_PRODUCTS] cuando necesita mutar.
const categoriesTs = `export const CATALOG_CATEGORIES = ${JSON.stringify(transformedCategories, null, 2)};
`;

const productsTs = `export const CATALOG_PRODUCTS = ${JSON.stringify(transformedProducts, null, 2)};
`;

const footer = `
// Tipos inferidos de los arrays generados.
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];
export type CatalogProduct  = (typeof CATALOG_PRODUCTS)[number];
`;

const output = [header, categoriesTs, productsTs, footer].join('\n');

// =============================================================================
// Escribir archivo de salida
// =============================================================================
const outputDir  = resolve(repoRoot, 'src/mocks/data');
const outputPath = resolve(outputDir, 'catalog.ts');

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, output, 'utf-8');

// =============================================================================
// Resumen
// =============================================================================
console.log(`\nOK — archivo generado: ${outputPath}`);
console.log(`  Productos:  ${transformedProducts.length}`);
console.log(`  Categorias: ${transformedCategories.length}`);

const sinCategoria = transformedProducts.filter(p => !p.category);
if (sinCategoria.length > 0) {
  console.warn(`\nWARN: ${sinCategoria.length} productos sin categoria mapeada:`);
  sinCategoria.forEach(p => console.warn(`  ${p.slug}`));
}

const sinImagen = transformedProducts.filter(p => p.images[0].url.includes('placeholder'));
if (sinImagen.length > 0) {
  console.warn(`\nWARN: ${sinImagen.length} productos sin imagen — usan placeholder`);
}

console.log('\nSiguiente paso:');
console.log('  Copiar imagenes a public/catalog/images/');
console.log('  Ver: npm run build:demo');
