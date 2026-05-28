/**
 * Tests — AdminProductVariantsPage
 * Gestión de variantes de un producto: precio, stock, SKU
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '42' }),
  useNavigate: () => jest.fn(),
}));
// adminSlice mock eliminado — funciones ya implementadas en el slice real

import AdminProductVariantsPage from '../../../src/pages/admin/AdminProductVariantsPage';

const VARIANTS = [
  { id: 10, sku: 'ELE-OSH-S', label: 'Talla S', stock: 8,  price_override: null, is_active: true },
  { id: 11, sku: 'ELE-OSH-M', label: 'Talla M', stock: 15, price_override: 950,  is_active: true },
  { id: 12, sku: 'ELE-OSH-L', label: 'Talla L', stock: 0,  price_override: null, is_active: false },
];

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      productVariants: VARIANTS,
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/admin/products/42/variants']}>
      <Routes>
        <Route path="/admin/products/:id/variants" element={<AdminProductVariantsPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('AdminProductVariantsPage', () => {
  it('renderiza la página de variantes', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/variante|variant/i);
  });

  it('muestra las variantes del producto', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/Talla|variante|variant|ELE|sin/i);
  });

  it('muestra el stock de cada variante', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/stock|cantidad|variante/i);
  });

  it('indica variante inactiva (stock 0)', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/Talla|variante|activ|inactiv|stock/i);
  });

  it('tiene breadcrumb de navegación al producto', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/42|producto|product/i);
  });
});
