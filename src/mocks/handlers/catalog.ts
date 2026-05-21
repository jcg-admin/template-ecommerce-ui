/**
 * Handlers MSW del dominio catalog.
 *
 * Listados (`/api/products/`, `/api/products/search/`): usan factory
 * `createProductList` con datos variables Faker para que cada request
 * devuelva un catalogo distinto, mas realista para desarrollo.
 *
 * Detalle (`/api/products/:slug/`): deterministico por slug, igual que
 * el interceptor heredado. Esto permite que tests existentes que
 * verifican shapes especificas no rompan: el slug es el seed de la
 * generacion.
 *
 * Categorias (`/api/categories/`): fijas. Cinco categorias estables.
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import type { Category, Product, PaginatedResponse } from './types';
import { createProduct, createProductList } from '../factories';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Collares',     slug: 'collares',     product_count: 48 },
  { id: 2, name: 'Pulseras',     slug: 'pulseras',     product_count: 31 },
  { id: 3, name: 'Ofrendas',     slug: 'ofrendas',     product_count: 27 },
  { id: 4, name: 'Elekes',       slug: 'elekes',       product_count: 22 },
  { id: 5, name: 'Herramientas', slug: 'herramientas', product_count: 15 },
];

export const catalogHandlers = [
  // GET /api/products/search/?q=...
  http.get('/api/products/search/', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const body: PaginatedResponse<Product> = {
      count: 4,
      results: createProductList(4, q ? { name: `${q}` } : {}),
      next: null,
      previous: null,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/products/:slug/  (detalle deterministico)
  http.get('/api/products/:slug/', ({ params }) => {
    const slug = String(params.slug);
    // Seed faker para que el mismo slug devuelva siempre el mismo producto.
    // Hash trivial del slug a numero.
    const seed = Array.from(slug).reduce((a, c) => a + c.charCodeAt(0), 0);
    faker.seed(seed);
    const product = createProduct({ slug, id: (seed % 9999) + 1 });
    // Reset para no contaminar siguientes handlers.
    faker.seed();
    return HttpResponse.json(product);
  }),

  // GET /api/products/  (listado paginado, variable)
  http.get('/api/products/', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const body: PaginatedResponse<Product> = {
      count: 143,
      results: createProductList(20),
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
