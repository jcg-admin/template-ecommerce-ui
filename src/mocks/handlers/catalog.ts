/**
 * Handlers MSW del dominio catalog.
 *
 * Cubre los endpoints que el `mockInterceptor` heredado servia bajo
 * la regla "url.includes('/api/products/...')". Las formas de los
 * datos replican lo que `_productList`, `_productDetail`,
 * `_searchProducts` y `_categories` devolvian.
 *
 * Datos hardcoded por ahora. T-014 y T-015 sustituiran los listados
 * por factories Faker tipadas. Los slugs siguen siendo deterministicos
 * para que los tests funcionen sin cambios.
 */

import { http, HttpResponse } from 'msw';
import type { Category, Product, PaginatedResponse } from './types';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Collares',     slug: 'collares',     product_count: 48 },
  { id: 2, name: 'Pulseras',     slug: 'pulseras',     product_count: 31 },
  { id: 3, name: 'Ofrendas',     slug: 'ofrendas',     product_count: 27 },
  { id: 4, name: 'Elekes',       slug: 'elekes',       product_count: 22 },
  { id: 5, name: 'Herramientas', slug: 'herramientas', product_count: 15 },
];

const PRODUCT_NAMES = [
  'Collar Oshun', 'Pulsera Elegua', 'Collar Yemaya',
  'Elekes Shango', 'Ofrenda Obatala',
];

const PRICES = [350, 480, 1250, 890, 650, 920, 340, 1100, 560, 780];

function makeProduct(slug: string, idx: number): Product {
  const i = idx % PRICES.length;
  return {
    id: i + 1,
    slug,
    name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
    category: { id: (i % 5) + 1, name: 'Collares', slug: 'collares' },
    description: 'Producto de ejemplo del catalogo.',
    price: PRICES[i],
    original_price: i % 3 === 0 ? PRICES[i] * 1.3 : null,
    stock: i % 4 === 0 ? 0 : (i % 20) + 1,
    images: [{ id: 1, url: '/mock-images/product.jpg', is_main: true }],
    variants: [
      { id: 1, name: 'Talla unica', sku: `SKU-${i}-01`, stock: 5, price: PRICES[i] },
    ],
    rating_avg: 4.5,
    review_count: (i * 3) % 30,
  } as unknown as Product;
}

function makeProducts(count: number, prefix = ''): Product[] {
  return Array.from({ length: count }, (_, i) =>
    makeProduct(`producto-${prefix}-${i + 1}`, i + 1)
  );
}

export const catalogHandlers = [
  // GET /api/products/search/?q=...
  http.get('/api/products/search/', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const body: PaginatedResponse<Product> = {
      count: 4,
      results: makeProducts(4, q),
      next: null,
      previous: null,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/products/:slug/  (detalle)
  http.get('/api/products/:slug/', ({ params }) => {
    const slug = String(params.slug);
    return HttpResponse.json(makeProduct(slug, 1));
  }),

  // GET /api/products/  (listado)
  http.get('/api/products/', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const body: PaginatedResponse<Product> = {
      count: 143,
      results: makeProducts(20),
      next: page < 7 ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/categories/
  http.get('/api/categories/', () => {
    return HttpResponse.json(CATEGORIES);
  }),
];
