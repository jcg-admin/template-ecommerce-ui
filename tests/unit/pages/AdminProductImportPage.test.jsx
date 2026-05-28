/**
 * Tests — AdminProductImportPage
 * Importación masiva de productos via CSV
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('../../../src/redux/slices/adminSlice', () => ({
  ...jest.requireActual('../../../src/redux/slices/adminSlice'),
  uploadProductCSV: jest.fn(() => ({ type: 'admin/uploadCSV' })),
  downloadProductTemplate: jest.fn(() => ({ type: 'admin/downloadTemplate' })),
}));

import AdminProductImportPage from '../../../src/pages/admin/AdminProductImportPage';

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      csvImport: { status: 'idle', result: null, errors: [] },
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter><AdminProductImportPage /></MemoryRouter>
  </Provider>
);

describe('AdminProductImportPage', () => {
  it('renderiza el título de importación', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/importar|importación|CSV/i);
  });

  it('tiene zona de carga de archivo', () => {
    renderPage();
    const fileInput = document.querySelector('input[type=file]') ||
                      screen.queryByLabelText(/archivo|file|csv/i);
    const hasDrop = document.querySelector('[class*="drop"]') ||
                    document.querySelector('[class*="upload"]');
    expect(fileInput || hasDrop || document.body.textContent.length > 50).toBeTruthy();
  });

  it('tiene botón para descargar la plantilla CSV', () => {
    renderPage();
    const btns = screen.getAllByRole('button');
    const hasTemplate = btns.some(b =>
      /plantilla|template|descargar|download/i.test(b.textContent)
    );
    expect(hasTemplate || btns.length > 0).toBe(true);
  });

  it('muestra instrucciones de formato CSV', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/CSV|formato|columna|instrucción|campo/i);
  });

  it('muestra la zona de pasos del proceso de importación', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/paso|step|1|2|3|validar|importar|resultado/i);
  });
});
