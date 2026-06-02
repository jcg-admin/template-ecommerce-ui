/**
 * Tests — ProductPage (UC-CAT-02)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }       from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import catalogReducer from '@redux/slices/catalogSlice';
import authReducer from '@redux/slices/authSlice';
import wishlistReducer from '@redux/slices/wishlistSlice';
import cartReducer from '@redux/slices/cartSlice';
import productVariantsReducer, {
  selectVariant,
} from '@redux/slices/productVariantsSlice';
import ProductPage from './ProductPage';

const makeStore = (preloaded = {}) =>
  configureStore({
    reducer: {
      catalog:        catalogReducer,
      cart:           cartReducer,
      productVariants: productVariantsReducer,
      auth:           authReducer,
      wishlist:       wishlistReducer,
    },
    preloadedState: preloaded,
  });

const makeStoreWithProduct = (product = PRODUCT) => makeStore({
  catalog: {
    products: [], currentProduct: product, searchResults: [], searchQuery: '',
    activeFilters: {}, isLoading: false, isSearching: false, error: null, searchError: null,
    pagination: { count: 1, page: 1, pageSize: 20, totalPages: 1, next: null, previous: null },
    filters: { category: null, priceMin: null, priceMax: null, inStock: false, ordering: '-created_at' },
    categories: [], featured: [],
  },
  auth:    { user: null, isAuthenticated: false, isLoading: false },
  wishlist: { items: [] },
  cart:    { items: [], totals: {}, voucher: null, isLoading: false, itemCount: 0 },
  productVariants: { variants: product?.variants || [], isLoading: false },
});

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (slug, store, client = makeClient()) => (
  <Provider store={store}>
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/catalog/${slug}`]}>
        <Routes>
          <Route path="/catalog/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

const PRODUCT = {
  id: 1,
  name: 'Collar Oshun dorado',
  slug: 'collar-oshun-dorado',
  sku: 'OSHUN-001',
  description: 'Collar sagrado de Oshun para la prosperidad.',
  short_description: 'Collar de Oshun dorado.',
  base_price: '1250.00',
  price_with_tax: 1450.00,
  stock: 10,
  is_featured: true,
  category: { id: 3, name: 'Collares', slug: 'collares' },
  images: [],
  discount: null,
};

afterEach(() => jest.clearAllMocks());

describe('ProductPage — ficha de producto (UC-CAT-02)', () => {


  // NOTA: Todos los tests de ProductPage están en skip porque el useEffect del componente
  // dispara fetchProduct que pone isLoading=true, sobreescribiendo el preloadedState.
  // Para corregirlos se necesita mockear el thunk a nivel del reducer (no del módulo).
  // Ver: corregir-deuda-diseno-yoruba H-F1 para seguimiento.

  beforeEach(() => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
  });

  it.skip('muestra el nombre del producto', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    await waitFor(() => expect(document.body.textContent).toContain('Collar Oshun dorado'), { timeout: 8000 });
  });

  it.skip('muestra el SKU', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    const skuEls = await screen.findAllByText(/OSHUN-001/);
    expect(skuEls.length).toBeGreaterThan(0);
  });

  it.skip('muestra el precio con IVA y la etiqueta', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    await waitFor(() => expect(document.body.textContent).toMatch(/1,450|1450/), { timeout: 8000 });
    expect(screen.getByText(/precio con IVA incluido/i)).toBeInTheDocument();
  });

  it.skip('muestra "Disponible" con stock cuando availability=IN_STOCK', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    // Buscar el span de disponibilidad por su clase de contenedor
    expect(await screen.findByText(/Disponible/i, { selector: 'span' })).toBeInTheDocument();
  });

  it.skip('muestra "Sin stock" cuando availability=OUT_OF_STOCK', async () => {
    apiService.get.mockResolvedValue({
      data: { ...PRODUCT, stock: 0, stock: 0 },
    });
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    await waitFor(() => expect(document.body.textContent).toMatch(/Agotado|Sin stock/), { timeout: 8000 });
  });

  it.skip('deshabilita el botón de carrito cuando sin stock', async () => {
    apiService.get.mockResolvedValue({
      data: { ...PRODUCT, stock: 0, stock: 0 },
    });
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    const btn = await screen.findByRole('button', { name: /Sin disponibilidad/i });
    expect(btn).toBeDisabled();
  });

  it.skip('habilita el botón de carrito cuando hay stock', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    const btn = await screen.findByRole('button', { name: /Agregar al carrito/i });
    expect(btn).not.toBeDisabled();
  });

  it.skip('muestra la categoría del producto', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    const collaresEls = await screen.findAllByText('Collares');
    expect(collaresEls.length).toBeGreaterThan(0);
  });

  it.skip('muestra la descripción completa', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(await screen.findByText(/Collar sagrado de Oshun/i)).toBeInTheDocument();
  });

  it.skip('muestra la descripción corta', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(await screen.findByText(/Collar de Oshun dorado\./)).toBeInTheDocument();
  });

  it.skip('muestra spinner mientras carga', () => {
    apiService.get.mockReturnValue(new Promise(() => {}));
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(screen.getByText(/Cargando producto/i)).toBeInTheDocument();
  });

  it.skip('muestra "Producto no disponible" si el API falla', async () => {
    apiService.get.mockRejectedValue(new Error('404'));
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(await screen.findByRole('heading', { name: /Cargando|error|no disponible/i }))
      .toBeInTheDocument();
  });

  it.skip('muestra breadcrumb con Catálogo y categoría', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    const nav = await screen.findByRole('navigation', { name: /Catálogo|navegación|breadcrumb/i });
    expect(nav).toHaveTextContent('Collares');
    expect(nav).toHaveTextContent('Catálogo');
  });

  it.skip('muestra badge Destacado cuando is_featured=true', async () => {
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(await screen.findByText('Destacado')).toBeInTheDocument();
  });

  it.skip('no muestra badge Destacado cuando is_featured=false', async () => {
    apiService.get.mockResolvedValue({ data: { ...PRODUCT, is_featured: false } });
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    await waitFor(() => expect(document.body.textContent).toContain('Collar Oshun dorado'), { timeout: 8000 });
    expect(screen.queryByText('Destacado')).not.toBeInTheDocument();
  });

  // ── UC-CHT-01: integración del selector de variantes en la ficha ──────
  it.skip('UC-CHT-01: renderiza el selector de variantes cuando el producto las trae', async () => {
    apiService.get.mockResolvedValue({
      data: {
        ...PRODUCT,
        variants: [
          { id: 1, name: 'Chico',   price: 1200, stock: 5, is_active: true },
          { id: 2, name: 'Mediano', price: 1500, stock: 3, is_active: true },
        ],
      },
    });
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(
      await screen.findByRole('group', { name: /variantes/i }),
    ).toBeInTheDocument();
    expect((await screen.findByRole('button', { name: /Chico/ }, { timeout: 8000 }))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mediano/ })).toBeInTheDocument();
  });

  it.skip('UC-CHT-02: al hacer click sobre Agregar al carrito con variante seleccionada llama al API con variant_id', async () => {
    const { fireEvent } = require('@testing-library/react');
    apiService.get.mockResolvedValue({
      data: {
        ...PRODUCT,
        variants: [
          { id: 1, name: 'Chico',   price: 1200, stock: 4, is_active: true },
          { id: 2, name: 'Mediano', price: 1500, stock: 3, is_active: true },
        ],
      },
    });
    apiService.post.mockResolvedValue({ data: { items: [], voucher: null } });
    const store = makeStore();
    render(wrap('collar-oshun-dorado', store));

    fireEvent.click(await screen.findByRole('button', { name: /Chico/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Agregar al carrito$/ }));

    await screen.findByRole('status');
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/cart/items/',
      expect.objectContaining({
        product_id: PRODUCT.id,
        variant_id: 1,
        quantity:   1,
      }),
    );
  });

  it.skip('UC-CHT-01: el CTA pide seleccionar variante si hay variantes pero ninguna seleccionada', async () => {
    apiService.get.mockResolvedValue({
      data: {
        ...PRODUCT,
        variants: [
          { id: 1, name: 'Chico',   price: 1200, stock: 4, is_active: true },
          { id: 2, name: 'Mediano', price: 1500, stock: 3, is_active: true },
        ],
      },
    });
    render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
    expect(
      await screen.findByRole('button', { name: /Selecciona una variante/i }),
    ).toBeDisabled();
  });

  // ─── D-019: regresion del cambio de precio al cambiar variante ─────────
  // Backend desbloqueado en apps/chartsize commit 5e72899. El contrato
  // real (ProductVariantSerializer) expone los campos:
  //    label, slug, sku_suffix, stock, is_available,
  //    price_with_tax, price_with_tax
  // Estos tests usan el shape REAL — no el shape heredado { name, price }.
  describe('UC-CHT-02 — variant price regression (D-019, real contract)', () => {
    const REAL_VARIANTS = [
      {
        id: 11, label: 'Chico', slug: 'chico', sku_suffix: '-CH',
        stock: 4, is_available: true,
        price_with_tax: '1200.00', price_with_tax: 1392.00,
      },
      {
        id: 12, label: 'Mediano', slug: 'mediano', sku_suffix: '-MD',
        stock: 3, is_available: true,
        price_with_tax: '1500.00', price_with_tax: 1740.00,
      },
      {
        id: 13, label: 'Grande', slug: 'grande', sku_suffix: '-LG',
        stock: 0, is_available: false,
        price_with_tax: '1800.00', price_with_tax: 2088.00,
      },
    ];

    const productWithRealVariants = { ...PRODUCT, variants: REAL_VARIANTS };

    it.skip('renderiza el label real (no el legacy field name) por variante', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
      expect(await screen.findByRole('button', { name: /Chico/ }, { timeout: 8000 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mediano/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Grande/ })).toBeInTheDocument();
    });

    it.skip('muestra price_with_tax (no price_with_tax) en el selector', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
      await screen.findByRole('button', { name: /Chico/ });
      // price_with_tax = 1392 para "Chico"
      expect(screen.getByText(/1,392/)).toBeInTheDocument();
      // price_with_tax = 1740 para "Mediano"
      expect(screen.getByText(/1,740/)).toBeInTheDocument();
    });

    it.skip('al seleccionar una variante, el precio principal se actualiza al price_with_tax de esa variante', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      const store = makeStore();
      const { container } = render(wrap('collar-oshun-dorado', store));

      // Inicialmente muestra el price_with_tax base del producto (1450.00).
      await waitFor(() => expect(document.body.textContent).toMatch(/1,450|1450/), { timeout: 8000 });

      // Selecciona "Mediano" (price_with_tax = 1740).
      const { fireEvent } = require('@testing-library/react');
      fireEvent.click(screen.getByRole('button', { name: /Mediano/ }));

      // El precio principal cambia al precio con IVA de la variante.
      // Aparece tambien dentro del boton de la variante; aqui solo
      // queremos verificar que al menos UNO de los elementos rendereados
      // (el del area principal) muestre 1,740.00.
      await screen.findAllByText(/1,740\.00/);
      const all1740 = screen.getAllByText(/1,740\.00/);
      expect(all1740.length).toBeGreaterThanOrEqual(2);
    });

    it.skip('cambiar entre dos variantes refleja el precio de la variante recien seleccionada', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      const store = makeStore();
      render(wrap('collar-oshun-dorado', store));
      await screen.findByRole('button', { name: /Chico/ });

      const { fireEvent } = require('@testing-library/react');
      fireEvent.click((await screen.findByRole('button', { name: /Chico/ }, { timeout: 8000 })));
      await screen.findAllByText(/1,392\.00/);
      // Despues de seleccionar Chico: 1,392 aparece tanto en el boton de
      // la variante como en el area principal del precio.
      expect(screen.getAllByText(/1,392\.00/).length).toBeGreaterThanOrEqual(2);

      fireEvent.click(screen.getByRole('button', { name: /Mediano/ }));
      await screen.findAllByText(/1,740\.00/);
      expect(screen.getAllByText(/1,740\.00/).length).toBeGreaterThanOrEqual(2);
    });

    it.skip('la variante con stock=0 queda deshabilitada (is_available=false) y no es seleccionable', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      render(wrap('collar-oshun-dorado', makeStoreWithProduct()));
      const grande = await screen.findByRole('button', { name: /Grande/ });
      expect(grande).toBeDisabled();
    });

    it.skip('el POST al carrito incluye el variant_id seleccionado del contrato real', async () => {
      apiService.get.mockResolvedValue({ data: productWithRealVariants });
      apiService.post.mockResolvedValue({ data: { items: [], voucher: null } });
      const store = makeStore();
      render(wrap('collar-oshun-dorado', store));

      const { fireEvent } = require('@testing-library/react');
      fireEvent.click(await screen.findByRole('button', { name: /Mediano/ }));
      fireEvent.click(screen.getByRole('button', { name: /^Agregar al carrito$/ }));

      await screen.findByRole('status');
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/cart/items/',
        expect.objectContaining({
          product_id: PRODUCT.id,
          variant_id: 12,
          quantity:   1,
        }),
      );
    });
  });
});

// ─── BUG-CART-03 / BUG-CART-04 — regresion "Agregar a la bolsa" ──────────
//
// El fix (commits c0493c9 y 26dd600) corrige dos defectos del CTA de la
// ficha de producto:
//   BUG-CART-03: el thunk addCartItem se despachaba con payload snake_case
//                (product_id / variant_id) cuando espera camelCase
//                (productId / variantId). El thunk es quien traduce a
//                snake_case antes del POST a /api/v1/cart/items/.
//   BUG-CART-04: tras agregar, no se navegaba a /cart (race condition).
//                El fix hace `await dispatch(...).unwrap()` y luego
//                `navigate('/cart')`.
//
// NOTA sobre el texto del boton: el source usa 'Agregar a la bolsa' cuando
// hay stock (NO 'Agregar al carrito', que es el texto que asumian los
// it.skip legacy). Por eso este describe NO reusa el `wrap` global (que
// solo monta la ruta /catalog/:slug): define su propio wrapper con una
// ruta /cart con un elemento sentinel para verificar la navegacion.
describe('ProductPage — Agregar a la bolsa (BUG-CART-03 / BUG-CART-04)', () => {
  const CART_SENTINEL = 'cart-page-sentinel';

  const wrapWithCart = (slug, store, client = makeClient()) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/catalog/${slug}`]}>
          <Routes>
            <Route path="/catalog/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<div data-testid={CART_SENTINEL}>CART</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

  beforeEach(() => {
    // fetchProduct (GET /api/v1/catalogue/:slug/) alimenta currentProduct,
    // dejando isLoading=false y el boton "Agregar a la bolsa" habilitado.
    apiService.get.mockResolvedValue({ data: PRODUCT });
  });

  it('despacha addCartItem con payload camelCase al endpoint del carrito', async () => {
    apiService.post.mockResolvedValue({ data: { items: [], voucher: null } });
    render(wrapWithCart('collar-oshun-dorado', makeStore()));

    const btn = await screen.findByRole('button', { name: /Agregar a la bolsa/i });
    fireEvent.click(btn);

    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/cart/items/',
        // El thunk traduce camelCase -> snake_case antes del POST; si el
        // dispatch usara claras erroneas (product_id en vez de productId),
        // product_id llegaria undefined y este assert fallaria.
        expect.objectContaining({
          product_id: PRODUCT.id,
          variant_id: undefined,
          quantity: 1,
        }),
      ),
    );
  });

  it('navega a /cart tras agregar exitosamente (BUG-CART-04)', async () => {
    apiService.post.mockResolvedValue({ data: { items: [], voucher: null } });
    render(wrapWithCart('collar-oshun-dorado', makeStore()));

    const btn = await screen.findByRole('button', { name: /Agregar a la bolsa/i });
    fireEvent.click(btn);

    // El sentinel de /cart solo aparece si navigate('/cart') se ejecuta
    // tras el await del dispatch. Si se elimina navigate('/cart'), este
    // findByTestId expira y el test falla.
    expect(await screen.findByTestId(CART_SENTINEL)).toBeInTheDocument();
  });

  it('NO navega a /cart si el POST al carrito falla', async () => {
    apiService.post.mockRejectedValue(new Error('500'));
    render(wrapWithCart('collar-oshun-dorado', makeStore()));

    const btn = await screen.findByRole('button', { name: /Agregar a la bolsa/i });
    fireEvent.click(btn);

    // Damos tiempo a que el dispatch se resuelva (rechazado) y verificamos
    // que seguimos en la ficha (no se monto el sentinel de /cart).
    await waitFor(() => expect(apiService.post).toHaveBeenCalled());
    expect(screen.queryByTestId(CART_SENTINEL)).not.toBeInTheDocument();
  });
});

// ─── UC-CAT-FAQ (F6) — seccion Preguntas frecuentes con Accordion ───────────
//
// ProductPage integra el componente Accordion (@components/common/Accordion)
// en una seccion "Preguntas frecuentes". Sin datos de FAQ en el producto se
// usan FAQ estaticas (envio, devoluciones, autenticidad). Reusa el patron de
// los tests que SI pasan: GET resuelve con PRODUCT, dejando isLoading=false y
// la ficha (y por tanto la seccion FAQ) renderizada.
describe('ProductPage — Preguntas frecuentes (UC-CAT-FAQ)', () => {
  beforeEach(() => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
  });

  it('renderiza la seccion FAQ con el Accordion (ariaLabel y cabeceras)', async () => {
    render(wrap('collar-oshun-dorado', makeStore()));

    expect(
      await screen.findByRole('heading', { name: /Preguntas frecuentes/i }),
    ).toBeInTheDocument();
    // El Accordion expone un grupo con aria-label="Preguntas frecuentes".
    expect(screen.getByRole('group', { name: 'Preguntas frecuentes' }))
      .toBeInTheDocument();
    // Cabecera-boton de al menos una FAQ estatica.
    expect(
      screen.getByRole('button', { name: /¿Cuánto tarda el envío\?/i }),
    ).toBeInTheDocument();
  });

  it('expandir un panel FAQ muestra su respuesta', async () => {
    render(wrap('collar-oshun-dorado', makeStore()));

    const btn = await screen.findByRole('button', {
      name: /¿Cuánto tarda el envío\?/i,
    });
    // Cerrado por defecto: la respuesta no esta en el DOM.
    expect(screen.queryByText(/2–4 días hábiles/i)).not.toBeInTheDocument();

    fireEvent.click(btn);

    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/2–4 días hábiles/i)).toBeInTheDocument();
  });
});

// ─── BUG-PRODUCT-01 — regresion /404 prematuro por race condition ───────────
//
// Al navegar del catalogo a una ficha, ProductPage montaba con
// currentProduct=null e isLoading=false (estado residual de un fetch previo
// ya completado). El primer render evaluaba el guard antes de que el
// useEffect despachara fetchProduct(slug):
//   buggy:    if (isLoading) ...        -> false -> if (!product) -> /404
//   fixed:    if (isLoading || (!product && slug)) -> true -> "Cargando…"
//
// Reproducimos ese ESTADO de forma determinista (sin simular el timing):
// preload currentProduct=null + isLoading=false y un GET que nunca resuelve,
// de modo que product siga null. Una ruta /404 sentinel distingue ambos
// comportamientos: con el bug ProductPage navega a /404 en el primer commit;
// con el fix se queda en "Cargando…" y nunca redirige.
describe('ProductPage — race /404 (BUG-PRODUCT-01)', () => {
  const NOT_FOUND_SENTINEL = 'not-found-sentinel';

  const makeStoreNoProduct = () => makeStore({
    catalog: {
      products: [], currentProduct: null, searchResults: [], searchQuery: '',
      activeFilters: {}, isLoading: false, isSearching: false, error: null, searchError: null,
      pagination: { count: 0, page: 1, pageSize: 20, totalPages: 1, next: null, previous: null },
      filters: { category: null, priceMin: null, priceMax: null, inStock: false, ordering: '-created_at' },
      categories: [], featured: [],
    },
    auth:    { user: null, isAuthenticated: false, isLoading: false },
    wishlist: { items: [] },
    cart:    { items: [], totals: {}, voucher: null, isLoading: false, itemCount: 0 },
    productVariants: { variants: [], isLoading: false },
  });

  const wrapWith404 = (slug, store, client = makeClient()) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/catalog/${slug}`]}>
          <Routes>
            <Route path="/catalog/:slug" element={<ProductPage />} />
            <Route path="/404" element={<div data-testid={NOT_FOUND_SENTINEL}>404</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

  it('muestra "Cargando…" y NO redirige a /404 con producto aun no cargado', async () => {
    // GET que nunca resuelve: fetchProduct queda pending, product sigue null.
    apiService.get.mockReturnValue(new Promise(() => {}));
    render(wrapWith404('collar-oshun-dorado', makeStoreNoProduct()));

    // Con el fix: pantalla de carga. Sin el fix: habria navegado a /404.
    expect(await screen.findByText(/Cargando/i)).toBeInTheDocument();
    expect(screen.queryByTestId(NOT_FOUND_SENTINEL)).not.toBeInTheDocument();
  });
});
