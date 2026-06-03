/**
 * Tests — AdminProductImportPage (UC-INV-05)
 * Importación masiva de productos via CSV — flujo single-shot contra el
 * endpoint real POST /api/v1/admin/inventory/import/ (sin preview/confirm/
 * template; esos endpoints eran inventados y se eliminaron).
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from '../../../src/redux/slices/inventorySlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminProductImportPage from '../../../src/pages/admin/AdminProductImportPage';

const makeStore = () => configureStore({ reducer: { inventory: inventoryReducer } });

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter><AdminProductImportPage /></MemoryRouter>
  </Provider>
);

afterEach(() => jest.clearAllMocks());

describe('AdminProductImportPage (UC-INV-05)', () => {
  it('renderiza el título de importación', () => {
    renderPage();
    expect(document.body.textContent).toMatch(/importar|importación|CSV/i);
  });

  it('tiene zona de carga de archivo', () => {
    renderPage();
    expect(document.querySelector('input[type=file]')).toBeTruthy();
  });

  it('muestra las columnas CSV esperadas por el backend real', () => {
    renderPage();
    const body = document.body.textContent;
    expect(body).toMatch(/sku/i);
    expect(body).toMatch(/base_price/i);
    expect(body).toMatch(/category_slug/i);
  });

  it('permite elegir el estado inicial (borrador/publicado)', () => {
    renderPage();
    expect(screen.getByLabelText(/estado inicial/i)).toBeInTheDocument();
  });

  it('importa via POST /admin/inventory/import/ con el archivo y estado', async () => {
    apiService.post.mockResolvedValue({
      data: {
        created: 2, failed: 0, products_created: 2, products_failed: 0,
        error_report: null, download_url: null,
      },
    });
    renderPage();

    const file = new File(['sku,name,base_price,category_slug\nA,B,10,c'], 'p.csv', { type: 'text/csv' });
    fireEvent.change(document.querySelector('input[type=file]'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /^Importar$/i }));

    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/inventory/import/',
        expect.any(FormData),
      ),
    );
  });

  it('muestra el reporte single-shot al completar (creados/fallidos)', async () => {
    apiService.post.mockResolvedValue({
      data: {
        created: 5, failed: 1, products_created: 5, products_failed: 1,
        error_report: [{ row: 3, field: 'base_price', reason: 'Precio inválido' }],
        download_url: '/api/v1/admin/inventory/import-reports/9.csv',
      },
    });
    renderPage();

    const file = new File(['x'], 'p.csv', { type: 'text/csv' });
    fireEvent.change(document.querySelector('input[type=file]'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /^Importar$/i }));

    expect(await screen.findByText(/Importación con errores/i)).toBeInTheDocument();
    expect(screen.getByText('Precio inválido')).toBeInTheDocument();
  });
});
