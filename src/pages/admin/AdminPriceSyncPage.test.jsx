/**
 * Tests — AdminPriceSyncPage (UC-CAT-12)
 *
 * Flujo único contra el backend real (apps/catalogue/price_sync_views.py):
 *   POST /admin/price-sync/preview-csv/ → { session_id, preview, errors }
 *   POST /admin/price-sync/apply-csv/   ← { session_id } → { updated_count }
 * uploadPriceCSV normaliza la respuesta a { session_id, diffs, not_found }.
 * No hay edición de precios en cliente: apply-csv aplica la sesión del server.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer    from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminPriceSyncPage from './AdminPriceSyncPage';

// Shape REAL que devuelve preview-csv (el thunk lo normaliza).
const PREVIEW_RAW = {
  session_id:    'sess-1',
  valid_count:   2,
  invalid_count: 0,
  preview: [
    { sku: 'SKU-1', product_id: 1, product_name: 'Elekes de Oshún', old_price: '100', new_price: '110', diff_pct: 10 },
    { sku: 'SKU-2', product_id: 2, product_name: 'Sopera Yemayá',   old_price: '200', new_price: '220', diff_pct: 10 },
  ],
  errors: [],
};

const makeStore = () =>
  configureStore({ reducer: { admin: adminReducer, ui: uiReducer } });

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter>
      <AdminPriceSyncPage />
    </MemoryRouter>
  </Provider>,
);

const uploadCsv = () => {
  const input = document.querySelector('input[type="file"]');
  const file = new File(['sku,price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });
  Object.defineProperty(input, 'files', { value: [file] });
  fireEvent.change(input);
};

afterEach(() => jest.clearAllMocks());

describe('AdminPriceSyncPage (UC-CAT-12)', () => {
  it('muestra el titulo «Sincronizar precios»', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /^sincronizar precios$/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('muestra la zona de drop con las columnas reales (sku, price)', () => {
    renderPage();
    expect(screen.getByText(/arrastra el csv de precios/i)).toBeInTheDocument();
    expect(screen.getByText(/columnas: sku, price/i)).toBeInTheDocument();
  });

  it('muestra el botón de descargar plantilla', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /plantilla csv/i })).toBeInTheDocument();
  });

  it('al subir un CSV llama a preview-csv y muestra el preview normalizado', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW_RAW });
    renderPage();
    uploadCsv();

    expect(await screen.findByText(/productos cambiarán de precio/i)).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
    expect(screen.getByText('SKU-2')).toBeInTheDocument();
    // Nombre normalizado desde product_name.
    expect(screen.getByText('Elekes de Oshún')).toBeInTheDocument();
    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/price-sync/preview-csv/',
        expect.any(FormData),
      ),
    );
  });

  it('en el estado de preview muestra botón de confirmar y cancelar', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW_RAW });
    renderPage();
    uploadCsv();

    await screen.findByText(/productos cambiarán de precio/i);
    expect(screen.getByRole('button', { name: /confirmar.*cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('al confirmar llama a apply-csv con { session_id } y muestra éxito', async () => {
    apiService.post
      .mockResolvedValueOnce({ data: PREVIEW_RAW })
      .mockResolvedValueOnce({ data: { updated_count: 2, message: 'ok' } });

    renderPage();
    uploadCsv();

    await screen.findByText(/productos cambiarán de precio/i);
    fireEvent.click(screen.getByRole('button', { name: /confirmar.*cambios/i }));

    await waitFor(() =>
      expect(apiService.post).toHaveBeenLastCalledWith(
        '/api/v1/admin/price-sync/apply-csv/',
        { session_id: 'sess-1' },
      ),
    );
    expect(screen.getByText(/precios actualizados/i)).toBeInTheDocument();
  });
});

describe('AdminPriceSyncPage — modo porcentaje (UC-CAT-12)', () => {
  const PCT_RAW = {
    session_id: 'sess-pct',
    valid_count: 2,
    pct: 10,
    preview: [
      { sku: 'SKU-1', product_id: 1, product_name: 'Elekes de Oshún', old_price: '100', new_price: '110', diff_pct: 10 },
      { sku: 'SKU-2', product_id: 2, product_name: 'Sopera Yemayá',   old_price: '200', new_price: '220', diff_pct: 10 },
    ],
    errors: [],
  };

  const gotoPercentage = () => {
    renderPage();
    fireEvent.click(screen.getByRole('tab', { name: /ajuste por porcentaje/i }));
  };

  it('previsualiza el ajuste llamando a preview-percentage con { pct }', async () => {
    apiService.post.mockResolvedValueOnce({ data: PCT_RAW });
    gotoPercentage();

    fireEvent.change(screen.getByLabelText(/porcentaje de ajuste/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /previsualizar ajuste/i }));

    expect(await screen.findByText(/productos cambiarán de precio/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/price-sync/preview-percentage/',
        expect.objectContaining({ pct: 10 }),
      ),
    );
  });

  it('al confirmar llama a apply-percentage con { session_id }', async () => {
    apiService.post
      .mockResolvedValueOnce({ data: PCT_RAW })
      .mockResolvedValueOnce({ data: { updated_count: 2, message: 'ok' } });
    gotoPercentage();

    fireEvent.change(screen.getByLabelText(/porcentaje de ajuste/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /previsualizar ajuste/i }));
    await screen.findByText(/productos cambiarán de precio/i);
    fireEvent.click(screen.getByRole('button', { name: /confirmar.*cambios/i }));

    await waitFor(() =>
      expect(apiService.post).toHaveBeenLastCalledWith(
        '/api/v1/admin/price-sync/apply-percentage/',
        { session_id: 'sess-pct' },
      ),
    );
    expect(screen.getByText(/precios actualizados/i)).toBeInTheDocument();
  });
});
