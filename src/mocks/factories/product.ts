/**
 * Factory de Product.
 *
 * Genera productos con campos del dominio tipados contra
 * `src/types/domain.ts`, mas los campos extra que el interceptor
 * heredado emitia (price, original_price, images, variants) para que
 * los consumers existentes no rompan. La divergencia tipo-vs-runtime
 * esta documentada como deuda en la iniciativa
 * `completar-dominio-de-ecommerce`.
 *
 * Seed configurable: por defecto faker.seed() no se llama (variabilidad
 * libre). Tests que necesiten datos deterministicos pueden hacer
 * `faker.seed(42)` antes de invocar `createProduct`.
 */

import { faker } from '@faker-js/faker';
import type { Product } from '../handlers/types';

interface ProductOverrides extends Partial<Product> {
  // Campos extra que el shape legacy emite y los consumers usan;
  // no estan en el tipo Product pero los preservamos.
  price?: number;
  original_price?: number | null;
  images?: Array<{ id: number; url: string; is_main: boolean }>;
  variants?: Array<{ id: number; name: string; sku: string; stock: number; price: number }>;
}

// 14 categorias reales del catalogo Oja Yoruba.
// Sincronizadas con CATALOG_CATEGORIES en src/mocks/data/catalog.ts
// y actualizadas en T-501 de la iniciativa `integrar-catalogo-oja-en-mocks`.
const CATEGORIES = [
  { id: 1,  name: 'Lo Nuevo',                    slug: 'lo-nuevo' },
  { id: 2,  name: 'Akoses / Medicinas',           slug: 'akoses-medicinas' },
  { id: 3,  name: 'Collares y Pulseras',          slug: 'collares-y-pulseras' },
  { id: 4,  name: 'Isan / Iconos',               slug: 'isan-iconos' },
  { id: 5,  name: 'Complementos y Herramientas', slug: 'complementos-y-herramientas' },
  { id: 6,  name: 'Enseres',                     slug: 'enseres' },
  { id: 7,  name: 'Collares de Orumila',         slug: 'collares-de-orumila' },
  { id: 8,  name: 'Ikoberes / Amuletos',         slug: 'ikoberes-amuletos' },
  { id: 9,  name: 'Semillas',                    slug: 'semillas' },
  { id: 10, name: 'Ropa y Telas',                slug: 'ropa-y-telas' },
  { id: 11, name: 'Varios',                      slug: 'varios' },
  { id: 12, name: 'Paquetes',                    slug: 'paquetes' },
  { id: 13, name: 'Mayoreo',                     slug: 'mayoreo' },
  { id: 14, name: 'Titulos',                     slug: 'titulos' },
];

export function createProduct(overrides: ProductOverrides = {}): Product {
  const id = overrides.id ?? faker.number.int({ min: 1, max: 9999 });
  const basePrice = overrides.base_price ?? faker.number.int({ min: 100, max: 2500 });
  const priceWithTax = overrides.price_with_tax ?? Math.round(basePrice * 1.16);
  const category = overrides.category ?? faker.helpers.arrayElement(CATEGORIES);
  const stock = overrides.stock ?? faker.number.int({ min: 0, max: 30 });

  const product: Product = {
    id,
    slug: overrides.slug ?? faker.helpers.slugify(faker.commerce.productName().toLowerCase()),
    name: overrides.name ?? faker.commerce.productName(),
    description: overrides.description ?? faker.commerce.productDescription(),
    base_price: basePrice,
    price_with_tax: priceWithTax,
    effective_price: overrides.effective_price ?? priceWithTax,
    stock,
    category_name: overrides.category_name ?? category.name,
    category,
    is_featured: overrides.is_featured ?? faker.datatype.boolean(),
    rating_avg: overrides.rating_avg ?? faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
    review_count: overrides.review_count ?? faker.number.int({ min: 0, max: 200 }),
    sku: overrides.sku ?? `SKU-${id}`,
  };

  // Campos extra del shape legacy (no en el tipo Product).
  const extras = {
    price: overrides.price ?? priceWithTax,
    original_price: overrides.original_price ?? null,
    images: overrides.images ?? [
      { id: 1, url: '/mock-images/product.jpg', is_main: true },
    ],
    variants: overrides.variants ?? [
      { id: 1, name: 'Talla unica', sku: `SKU-${id}-01`, stock: 5, price: priceWithTax },
    ],
  };

  return { ...product, ...extras } as Product;
}

export function createProductList(count: number, overrides: ProductOverrides = {}): Product[] {
  return Array.from({ length: count }, () => createProduct(overrides));
}
