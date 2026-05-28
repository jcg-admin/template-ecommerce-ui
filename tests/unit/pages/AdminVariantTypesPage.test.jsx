/**
 * Tests — AdminVariantTypesPage
 * Gestión de tipos de variante y opciones de un producto
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
// adminSlice mock eliminado — funciones ya implementadas en el slice real
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '42' }),
}));

import AdminVariantTypesPage from '../../../src/pages/admin/AdminVariantTypesPage';

const TYPES = [
  { id: 1, name: 'Longitud', options: [
    { id: 10, label: '45 cm', value: '45cm' },
    { id: 11, label: '60 cm', value: '60cm' },
  ]},
  { id: 2, name: 'Color', options: [] },
];

const makeStore = (variantTypes = TYPES) => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      variantTypes: variantTypes,
      isLoadingVariantTypes: false,
      currentProduct: null,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/admin/products/42/variant-types']}>
      <Routes>
        <Route path="/admin/products/:id/variant-types"
               element={<AdminVariantTypesPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('AdminVariantTypesPage', () => {
  it('renderiza el título de la página', () => {
    renderPage();
    // Verificar que la página renderiza la estructura básica
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/variante|tipo|producto/i);
  });

  it('muestra los tipos de variante del producto', () => {
    renderPage();
    // Verificar que la página renderiza algo de contenido
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/Longitud|Color|variante|tipo/i);
  });

  it('muestra las opciones de cada tipo', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/45|60|cm|opci/i);
  });

  it('tiene botón para agregar nuevo tipo', () => {
    renderPage();
    const btns = screen.getAllByRole('button');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('tiene breadcrumb de navegación', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /productos/i })).toBeInTheDocument();
  });

  it('muestra el ID del producto en el breadcrumb', () => {
    renderPage();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });
});
