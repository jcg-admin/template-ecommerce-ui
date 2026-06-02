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
 * PAGE_SIZE=20. Acepta ?page=N y ?category=<slug>. El filtro
 * usa el campo `all_categories` del producto para cubrir las 14
 * categorias, incluidas las 6 que no son categoria_principal.
 *
 * Categorias (`/api/v1/categories/`): retorna CATALOG_CATEGORIES.
 *
 * Correccion A-07 de la iniciativa `auditar-integracion-catalogo`:
 * filtro por `all_categories.includes()` en lugar de `category?.slug ===`.
 */

import { http, HttpResponse } from 'msw';
import type { PaginatedResponse } from './types';
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from '../data/catalog';

const PAGE_SIZE = 20;

export const catalogHandlers = [
  // GET /api/v1/catalogue/search/suggestions/?q=...  (UC-SRCH-02)
  // Autocomplete con sugerencias en vivo: devuelve nombres de productos
  // del catalogo cuyo nombre coincide (case-insensitive) con `q`.
  // Se registra ANTES de /search/ y /:slug/ para que la ruta mas
  // especifica gane el match.
  http.get('/api/v1/catalogue/search/suggestions/', ({ request }) => {
    const url = new URL(request.url);
    const q   = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    if (q.length < 2) {
      return HttpResponse.json({ suggestions: [], count: 0 });
    }

    // Nombres unicos que contienen el termino, ordenados por
    // relevancia simple (prefijo primero) y acotados a 8 resultados.
    const seen = new Set<string>();
    const matches = CATALOG_PRODUCTS
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => p.name)
      .filter(name => {
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const ap = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bp = b.toLowerCase().startsWith(q) ? 0 : 1;
        return ap - bp || a.localeCompare(b);
      })
      .slice(0, 8);

    return HttpResponse.json({ suggestions: matches, count: matches.length });
  }),

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
      // Filtra por all_categories para cubrir las 6 categorias que no
      // tienen categoria_principal en el JSON del scraper (A-07).
      results = results.filter(p =>
        (p as any).all_categories?.includes(catSlug)
      );
    }

    // La busqueda retorna todos los resultados sin paginar.
    // Razon: una busqueda tipicamente devuelve pocos resultados y el
    // frontend muestra todos de una vez. La paginacion artificial
    // (A-02) generaba un `next` hardcodeado a page=2 que no funcionaba.
    const body: PaginatedResponse<typeof results[number]> = {
      count:    total,
      results,
      next:     page < pages ? `/api/v1/catalogue/?page=${page + 1}` : null,
      previous: page > 1    ? `/api/v1/catalogue/?page=${page - 1}` : null,
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

  // GET /api/v1/catalogue/?page=N&category=<slug>&is_featured=true
  http.get('/api/v1/catalogue/', ({ request }) => {
    const url        = new URL(request.url);
    const page       = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const catSlug    = url.searchParams.get('category') ?? '';
    const isFeatured = url.searchParams.get('is_featured') === 'true';

    let all = [...CATALOG_PRODUCTS];
    if (catSlug) {
      // Filtra por all_categories para cubrir las 6 categorias que no
      // tienen categoria_principal en el JSON del scraper (A-07).
      all = all.filter(p => (p as any).all_categories?.includes(catSlug));
    }
    // is_featured: en el catalogo real es_destacado vendria del backend.
    // En el mock usamos los primeros 12 productos como featured (T-206).
    if (isFeatured) {
      all = all.filter((_p, i) => i < 12);
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
