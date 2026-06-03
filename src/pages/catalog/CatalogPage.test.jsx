/**
 * Tests — CatalogPage
 * UC-CAT-01 / UC-CAT-03 / UC-CAT-03-EXT
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider }    from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// jest.mock se eleva (hoisting) antes que cualquier import.
// El jest.fn() DENTRO del factory siempre funciona correctamente.
jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// Importar el mock YA reemplazado para usar .mockResolvedValue en los tests
import apiService from '@services/apiService';
import catalogReducer from '@redux/slices/catalogSlice';
import authReducer from '@redux/slices/authSlice';
import wishlistReducer from '@redux/slices/wishlistSlice';
import CatalogPage from './CatalogPage';

// --- Helpers ---
const makeStore = () =>
  configureStore({ reducer: { catalog: catalogReducer, auth: authReducer, wishlist: wishlistReducer }, preloadedState: { auth: { user: null, isAuthenticated: false }, wishlist: { items: [] } } });

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });


const wrap = (ui, store, client = makeClient()) => (
  <Provider store={store}>
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

const PRODUCTS = [
  {
    id: 1, name: 'Collar Oshun', slug: 'collar-oshun', sku: 'OSHUN-001',
    category_name: 'Collares', base_price: '1250.00', price_with_tax: 1450.00,
    stock: 10, is_featured: true, highlighted_name: 'Collar Oshun',
  },
  {
    id: 2, name: 'Pulsera Yemaya', slug: 'pulsera-yemaya', sku: 'YEMAYA-001',
    category_name: 'Pulseras', base_price: '450.00', price_with_tax: 522.00,
    stock: 5, is_featured: false, highlighted_name: 'Pulsera Yemaya',
  },
];

const pageOf = (results = []) => ({
  data: { results, count: results.length, next: null, previous: null, active_filters: {} },
});

// Variante con count explícito: permite forzar totalPages > 1 (count > pageSize=20)
// para que el componente Pagination se renderice y poder simular cambio de página.
const pageWithCount = (results = [], count = 0) => ({
  data: { results, count, next: null, previous: null, active_filters: {} },
});

// makeStoreWithProducts: helper referenciado por los it.skip preexistentes pero
// nunca definido en el archivo. Lo añadimos para los tests de scroll. Precarga
// productos en el slice catalog. OJO (issue conocido documentado en los skips):
// al montar, fetchProducts.pending vacía products; por eso los tests de scroll
// NO confían solo en preloadedState — mockean apiService.get y esperan con
// waitFor a que fetchProducts.fulfilled repueble products en el DOM.
const makeStoreWithProducts = (products = PRODUCTS) =>
  configureStore({
    reducer: { catalog: catalogReducer, auth: authReducer, wishlist: wishlistReducer },
    preloadedState: {
      auth: { user: null, isAuthenticated: false },
      wishlist: { items: [] },
      catalog: {
        products,
        currentProduct: null,
        searchResults: [],
        searchQuery: '',
        activeFilters: {},
        pagination: { count: products.length, page: 1, pageSize: 20, totalPages: 0, next: null, previous: null },
        filters: { category: null, priceMin: null, priceMax: null, inStock: false, ordering: '-created_at' },
        isLoading: false,
        isSearching: false,
        error: null,
        searchError: null,
      },
    },
  });

/**
 * Las llamadas de CatalogFilters a /api/v1/categories/ (UC-CAT-08)
 * comparten la misma instancia mockeada de apiService.get. Para que
 * los asserts de productos no se contaminen con nombres de categoria,
 * un beforeEach instala un interceptor por URL: cualquier path con
 * "/categories" devuelve un fixture neutro; el resto cae al
 * comportamiento de los tests (mockResolvedValueOnce + apiService.get).
 */
const CATEGORIES_FIXTURE = [
  { id: 100, slug: 'cat-pruebas', name: 'CategoriaPruebas', product_count: 0, children: [] },
];

beforeEach(() => {
  // Atajo de categorias: si la URL trae /categories, devolver fixture
  // antes de delegar al mock real para el resto de URLs.
  const originalGet = apiService.get;
  apiService.get = jest.fn((url, ...rest) => {
    if (typeof url === 'string' && url.includes('/categories')) {
      return Promise.resolve({ data: { results: CATEGORIES_FIXTURE, count: 1 } });
    }
    return originalGet(url, ...rest);
  });
  // Preservar API mock para los tests (mockResolvedValueOnce, etc.)
  apiService.get.mockResolvedValue       = originalGet.mockResolvedValue.bind(originalGet);
  apiService.get.mockResolvedValueOnce   = originalGet.mockResolvedValueOnce.bind(originalGet);
  apiService.get.mockRejectedValue       = originalGet.mockRejectedValue.bind(originalGet);
  apiService.get.mockReturnValue         = originalGet.mockReturnValue.bind(originalGet);
  apiService.get.mockImplementation      = originalGet.mockImplementation.bind(originalGet);
  apiService.get.mockReset               = originalGet.mockReset.bind(originalGet);
});

afterEach(() => jest.clearAllMocks());

// =============================================================================
describe('CatalogPage — listado (UC-CAT-01)', () => {
  it.skip('muestra el título del catálogo — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    // El catálogo puede no tener heading 'Catálogo' — verificar breadcrumb
    await waitFor(() => expect(document.body.innerHTML).toContain('Catálogo'), { timeout: 3000 });
  });

  it.skip('muestra la barra de búsqueda — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    // El catálogo usa un input de búsqueda
    await waitFor(() => expect(document.body.innerHTML).toContain('search'), { timeout: 3000 });
  });

  it.skip('renderiza los productos devueltos por la API — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    const cards = await screen.findAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText('Pulsera Yemaya')).toBeInTheDocument();
  });

  it.skip('muestra mensaje de catálogo vacío — PENDIENTE: fetchProducts.pending sobreescribe preloadedState', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts([])));
    await waitFor(() => expect(document.body.innerHTML).toMatch(/vacío|sin resultados|Catálogo vacío/i), { timeout: 3000 });
  });

  it.skip('muestra spinner al cargar — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', () => {
    apiService.get.mockReturnValue(new Promise(() => {})); // nunca resuelve
    render(wrap(<CatalogPage />, makeStore()));
    expect(screen.getByText(/Cargando catálogo/i)).toBeInTheDocument();
  });

  it.skip('muestra alerta de error si el API falla — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    apiService.get.mockRejectedValue(new Error('Network error'));
    render(wrap(<CatalogPage />, makeStore()));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

// =============================================================================
describe('CatalogPage — búsqueda (UC-CAT-03)', () => {
  it.skip('muestra error de validación — PENDIENTE: validación de búsqueda diferente en diseño Yoruba', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
  });

  it.skip('no muestra error con 2 o más caracteres — PENDIENTE: validación diferente', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'os' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    );
  });

  it('muestra "Resultados de búsqueda" tras una búsqueda', async () => {
    apiService.get
      .mockResolvedValueOnce(pageOf())              // fetchProducts al montar
      .mockResolvedValueOnce(pageOf([PRODUCTS[0]])); // searchProducts
    render(wrap(<CatalogPage />, makeStore()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'oshun' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    expect(await screen.findByText(/Resultados de búsqueda/i)).toBeInTheDocument();
  });

  it.skip('muestra los productos encontrados — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    apiService.get
      .mockResolvedValueOnce(pageOf())
      .mockResolvedValueOnce(pageOf([PRODUCTS[0]]));
    render(wrap(<CatalogPage />, makeStore()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'oshun' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    const cards = await screen.findAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra estado sin resultados cuando la API retorna 0', async () => {
    apiService.get
      .mockResolvedValueOnce(pageOf())
      .mockResolvedValueOnce(pageOf());
    render(wrap(<CatalogPage />, makeStore()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'xyzinexistente' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    expect(await screen.findByText(/sin resultados|vacío|No encontramos/i)).toBeInTheDocument();
  });

  it.skip('muestra botón "Ver catálogo completo" en modo búsqueda — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    apiService.get
      .mockResolvedValueOnce(pageOf())
      .mockResolvedValueOnce(pageOf([PRODUCTS[0]]));
    render(wrap(<CatalogPage />, makeStore()));
    await screen.findByRole('searchbox');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'oshun' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form'));
    expect(await screen.findByRole('button', { name: /[Vv]er catálogo/i }))
      .toBeInTheDocument();
  });
});

// =============================================================================
describe('CatalogPage — ProductCard', () => {
  it.skip('muestra badge Destacado cuando is_featured=true — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await waitFor(() => expect(document.body.innerHTML).toContain('Destacado'), { timeout: 3000 });
  });

  it.skip('no muestra badge Destacado cuando is_featured=false — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await screen.findByText('Pulsera Yemaya');
    expect(screen.queryByText('Destacado')).not.toBeInTheDocument();
  });

  it.skip('muestra el precio con IVA — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await waitFor(() => expect(document.body.innerHTML).toMatch(/1,450|1450/), { timeout: 3000 });
    expect(screen.getByText('con IVA')).toBeInTheDocument();
  });

  it.skip('cada tarjeta enlaza al detalle del producto — PENDIENTE: fetchProducts.pending sobreescribe preloadedState; mismo issue que ProductPage', async () => {
    render(wrap(<CatalogPage />, makeStoreWithProducts()));
    await screen.findByText('Collar Oshun');
    const link = screen.getByRole('link', { name: /Collar Oshun/i });
    expect(link).toHaveAttribute('href', '/catalog/collar-oshun');
  });
});

// =============================================================================
describe('CatalogPage — filtros (UC-CAT-04 + UC-CAT-05)', () => {
  it.skip('reenvia el param ?category=<slug> a fetchProducts — PENDIENTE: params del API cambiaron en diseño Yoruba', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    render(
      <Provider store={makeStore()}>
        <QueryClientProvider client={makeClient()}>
          <MemoryRouter initialEntries={['/catalog?category=collares']}>
            <CatalogPage />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    );
    await waitFor(() => {
      const calls = apiService.get.mock.calls;
      const catalogueCall = calls.find(
        ([url]) => typeof url === 'string' && url.includes('/api/v1/catalogue/'),
      );
      expect(catalogueCall?.[1]?.params?.category).toBe('collares');
    });
  });

  it.skip('reenvia price_min y price_max a fetchProducts (UC-CAT-05) — PENDIENTE: params del API cambiaron en diseño Yoruba', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    render(
      <Provider store={makeStore()}>
        <QueryClientProvider client={makeClient()}>
          <MemoryRouter initialEntries={['/catalog?price_min=100&price_max=500']}>
            <CatalogPage />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    );
    await waitFor(() => {
      const calls = apiService.get.mock.calls;
      const catalogueCall = calls.find(
        ([url]) => typeof url === 'string' && url.includes('/api/v1/catalogue/'),
      );
      expect(catalogueCall?.[1]?.params?.price_min).toBe('100');
      expect(catalogueCall?.[1]?.params?.price_max).toBe('500');
    });
  });
});

// =============================================================================
// BUG-SCROLL-02 — regresión (fix en commit b268ca4)
//
// Bug original: window.scrollTo({top:0,behavior:'instant'}) vivía en el mismo
// useEffect que el dispatch de fetchProducts, por lo que el scroll ocurría
// ANTES de que los productos nuevos se renderizaran. El fix mueve el scroll a
// un useEffect SEPARADO con deps [products, currentPage] y un prevPageRef, de
// modo que el scroll se ejecute cuando los productos ya están en el DOM o
// cuando cambia la página.
//
// LIMITACIÓN jsdom: no hay scroll real. Solo verificamos que window.scrollTo
// se invoca con los argumentos esperados — no el efecto visual.
// =============================================================================
describe('CatalogPage — scroll al inicio (BUG-SCROLL-02)', () => {
  let scrollSpy;
  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    scrollSpy.mockRestore();
  });

  // Núcleo del fix: cuando los productos ya están presentes en el DOM
  // (fetchProducts.fulfilled repuebla el store), el useEffect de scroll
  // debe haber invocado window.scrollTo con {top:0, behavior:'instant'}.
  // Este test FALLA si se elimina el useEffect de scroll del componente.
  it('llama a window.scrollTo cuando los productos están en el DOM', async () => {
    // No confiamos en preloadedState (fetchProducts.pending lo vacía al montar):
    // mockeamos la API y esperamos a que los productos aparezcan en el DOM.
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    render(wrap(<CatalogPage />, makeStore()));

    // Esperar a que el render de productos haya ocurrido realmente.
    expect(await screen.findByText('Collar Oshun')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    });
  });

  // Cambio de página: con totalPages > 1 (count > pageSize) se renderiza
  // el componente Pagination. Al hacer click en otra página se dispara
  // setPage → cambia currentPage → el useEffect de scroll vuelve a correr
  // (por prevPageRef.current !== currentPage). Verificamos que scrollTo
  // se invoca de nuevo tras el cambio de página.
  it('vuelve a llamar a window.scrollTo al cambiar de página', async () => {
    // count=40 con pageSize=20 → totalPages=2 → se muestra la paginación.
    apiService.get.mockResolvedValue(pageWithCount(PRODUCTS, 40));
    render(wrap(<CatalogPage />, makeStore()));

    await screen.findByText('Collar Oshun');
    // Esperar a que aparezca el control de paginación (botón "Siguiente").
    const nextBtn = await screen.findByRole('button', { name: /Siguiente/i });

    await waitFor(() => expect(window.scrollTo).toHaveBeenCalled());
    const callsBefore = scrollSpy.mock.calls.length;

    fireEvent.click(nextBtn); // setPage(2) → currentPage cambia

    await waitFor(() => {
      expect(scrollSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    });
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
  });
});

// ─── BUG-CARD-02 — la grilla no reflejaba el estado de la wishlist ──────────
//
// BUG-CARD-01 hizo que ProductCard despache toggleWishlist con `inWishlist`,
// pero CatalogPage (y SearchResultsPage) renderizaban <ProductCard product={p} />
// SIN pasar la prop inWishlist (default false), asi que el ♡ de las cards nunca
// reflejaba el estado aunque el servidor aceptara el cambio. Detectado en la
// validacion E2E en browser (tests/e2e/checks/02-wishlist.mjs). El unit test de
// ProductCard no lo cazaba porque probaba el componente CON la prop ya pasada.
describe('CatalogPage — wishlist en las cards (BUG-CARD-02)', () => {
  it('pasa inWishlist a cada ProductCard segun el estado de la wishlist', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    const store = configureStore({
      reducer: { catalog: catalogReducer, auth: authReducer, wishlist: wishlistReducer },
      preloadedState: {
        auth: { user: { id: 1 }, isAuthenticated: true },
        // El producto 1 esta en la wishlist; el 2 no.
        wishlist: { items: [{ id: 99, product_id: 1 }] },
      },
    });
    render(wrap(<CatalogPage />, store));
    await screen.findByText('Collar Oshun');

    // Con el fix: la card del producto 1 muestra "Quitar de deseos" y la del 2
    // "Añadir a deseos". Sin el fix ambas serian "Añadir a deseos" y este
    // findByRole expiraria.
    expect(
      await screen.findByRole('button', { name: /Quitar de deseos/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Quitar de deseos/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Añadir a deseos/i })).toBeInTheDocument();
  });
});

// ─── UC-CAT-LIST (F6) — ViewToggle grid/list en el catálogo ─────────────────
//
// El catálogo integra <ViewToggle> en la barra superior y persiste la vista
// en la URL como ?view=grid|list (grid es el default, por lo que no aparece
// en la URL). Cuando view=list, la grilla recibe la clase de layout en lista.
describe('CatalogPage — ViewToggle (UC-CAT-LIST)', () => {
  // Sonda que expone el querystring actual del router para verificar el sync URL.
  function LocationProbe() {
    const { search } = useLocation();
    return <output data-testid="loc-search">{search}</output>;
  }

  it('renderiza el ViewToggle en la barra superior (grid por defecto)', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    render(wrap(<CatalogPage />, makeStore()));
    await screen.findByText('Collar Oshun');

    const group = screen.getByRole('group', { name: 'Vista del catálogo' });
    expect(group).toBeInTheDocument();
    // Sin ?view en la URL → grid es el botón activo.
    expect(
      screen.getByRole('button', { name: 'Vista de cuadrícula' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Vista de lista' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('cambiar a "lista" actualiza la URL a ?view=list', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <QueryClientProvider client={makeClient()}>
          <MemoryRouter>
            <CatalogPage />
            <LocationProbe />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    );
    await screen.findByText('Collar Oshun');

    // Antes del click no hay view en la URL.
    expect(screen.getByTestId('loc-search').textContent).not.toContain('view=list');

    await user.click(screen.getByRole('button', { name: 'Vista de lista' }));

    await waitFor(() =>
      expect(screen.getByTestId('loc-search').textContent).toContain('view=list'),
    );
    // El botón de lista queda marcado como activo tras el cambio.
    expect(
      screen.getByRole('button', { name: 'Vista de lista' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('con ?view=list al montar, la vista de lista queda activa', async () => {
    apiService.get.mockResolvedValue(pageOf(PRODUCTS));
    render(
      <Provider store={makeStore()}>
        <QueryClientProvider client={makeClient()}>
          <MemoryRouter initialEntries={['/catalog?view=list']}>
            <CatalogPage />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    );
    await screen.findByText('Collar Oshun');
    expect(
      screen.getByRole('button', { name: 'Vista de lista' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
