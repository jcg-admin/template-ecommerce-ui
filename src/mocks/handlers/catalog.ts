/**
 * Handlers MSW del dominio catalog.
 *
 * Paths alineados con catalogSlice.js (Sprint 5: /api/v1/catalogue/*).
 * Datos reales del catalogo Oja Yoruba via CATALOG_PRODUCTS y
 * CATALOG_CATEGORIES generados en src/mocks/data/catalog.ts.
 * Faker ya no se usa en este handler.
 *
 * Busqueda (`/api/v1/catalogue/search/`): filtra CATALOG_PRODUCTS
 * por coincidencia de nombre (case-insensitive) y opcionalmente
 * por slug de categoria.
 *
 * Detalle (`/api/v1/catalogue/:slug/`): busca en CATALOG_PRODUCTS
 * por slug exacto. Retorna 404 si no existe.
 *
 * Listado (`/api/v1/catalogue/`): pagina CATALOG_PRODUCTS con
 * PAGE_SIZE=20. Acepta ?page=N y ?category=<slug>.
 *
 * Categorias (`/api/v1/categories/`): retorna CATALOG_CATEGORIES.
 *
 * Implementado en F4 de la iniciativa `integrar-catalogo-oja-en-mocks`.
 */

import { http, HttpResponse } from 'msw';
import type { PaginatedResponse } from './types';
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from '../data/catalog';

const PAGE_SIZE = 20;

export const catalogHandlers = [
  // GET /api/v1/catalogue/search/?q=...&category=<slug>
  http.get('/api/v1/catalogue/search/', ({ request }) => {
    const url      = new URL(request.url);
    const q        = (url.searchParams.get('q') ?? '').toLowerCase();
    const catSlug  = url.searchParams.get('category') ?? '';

    let results = [...CATALOG_PRODUCTS];

    if (q) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    }
    if (catSlug) {
      results = results.filter(p => p.category?.slug === catSlug);
    }

    const body: PaginatedResponse<typeof results[number]> = {
      count:    results.length,
      results:  results.slice(0, PAGE_SIZE),
      next:     results.length > PAGE_SIZE ? `?q=${q}&page=2` : null,
      previous: null,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/v1/catalogue/:slug/  (detalle por slug exacto)
  http.get('/api/v1/catalogue/:slug/', ({ params }) => {
    const slug    = String(params.slug);
    const product = CATALOG_PRODUCTS.find(p => p.slug === slug);

    if (!product) {
      return HttpResponse.json(
        { detail: `Producto "${slug}" no encontrado.` },
        { status: 404 }
      );
    }
    return HttpResponse.json(product);
  }),

  // GET /api/v1/catalogue/?page=N&category=<slug>
  http.get('/api/v1/catalogue/', ({ request }) => {
    const url     = new URL(request.url);
    const page    = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const catSlug = url.searchParams.get('category') ?? '';

    let all = [...CATALOG_PRODUCTS];
    if (catSlug) {
      all = all.filter(p => p.category?.slug === catSlug);
    }

    const total  = all.length;
    const pages  = Math.ceil(total / PAGE_SIZE);
    const start  = (page - 1) * PAGE_SIZE;
    const end    = start + PAGE_SIZE;

    const body: PaginatedResponse<typeof all[number]> = {
      count:    total,
      results:  all.slice(start, end),
      next:     page < pages ? `?page=${page + 1}` : null,
      previous: page > 1     ? `?page=${page - 1}` : null,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/v1/categories/
  http.get('/api/v1/categories/', () => {
    return HttpResponse.json(CATALOG_CATEGORIES);
  }),
];
