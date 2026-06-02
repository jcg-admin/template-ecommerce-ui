/**
 * Tests — AdminPriceSyncPage (UC-CAT-12)
 *
 * BUG-TEST-PS01: el test original importaba priceSyncSlice (no existe) y
 * buscaba tabs "cargar csv"/"ajuste porcentual" que el componente no tiene.
 * La página es un flujo único: subir CSV → preview → confirmar.
 *
 * BUG-PS02: uploadPriceCSV, confirmPriceSync, downloadPriceTemplate no
 * estaban definidos en adminSlice — corregidos.
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

const PREVIEW = {
  sync_id: 'preview-abc',
  diffs: [
    { sku: 'SKU-1', name: 'Elekes de Oshún', old_price: 100, new_price: 110 },
    { sku: 'SKU-2', name: 'Sopera Yemayá',   old_price: 200, new_price: 220 },
  ],
  total_increase: 30,
  not_found: [],
};

const makeStore = () =>
  configureStore({ reducer: { admin: adminReducer, ui: uiReducer } });

const renderPage = () => {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <AdminPriceSyncPage />
      </MemoryRouter>
    </Provider>,
  );
};

afterEach(() => jest.clearAllMocks());

describe('AdminPriceSyncPage (UC-CAT-12)', () => {
  it('muestra el titulo «Sincronizar precios desde CSV»', () => {
    // BUG-TEST-PS01: título real, no hay Tabs en este componente
    renderPage();
    expect(
      screen.getByRole('heading', { name: /sincronizar precios desde csv/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('muestra la zona de drop para subir el CSV', () => {
    renderPage();
    expect(screen.getByText(/arrastra el csv de precios/i)).toBeInTheDocument();
    expect(screen.getByText(/columnas: sku, new_price/i)).toBeInTheDocument();
  });

  it('muestra el botón de descargar plantilla', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /plantilla csv/i })).toBeInTheDocument();
  });

  it('al subir un CSV llama a uploadPriceCSV y muestra preview', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW });
    renderPage();

    // El input de file está oculto — disparar onChange directamente
    const input = document.querySelector('input[type="file"]');
    const file = new File(['sku,new_price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });

    // Mockear el thunk via apiService.post ya mockeado
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(await screen.findByText(/productos cambiarán de precio/i)).toBeInTheDocument();
    // SKU aparece en la tabla de preview y en la hoja de edición rápida (DataSheet).
    expect(screen.getAllByText('SKU-1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SKU-2').length).toBeGreaterThan(0);
  });

  it('en el estado de preview muestra botón de confirmar y cancelar', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW });
    renderPage();

    const input = document.querySelector('input[type="file"]');
    const file = new File(['sku,new_price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await screen.findByText(/productos cambiarán de precio/i);
    expect(screen.getByRole('button', { name: /confirmar.*cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('al confirmar llama a confirmPriceSync y muestra estado de éxito', async () => {
    apiService.post
      .mockResolvedValueOnce({ data: PREVIEW })
      .mockResolvedValueOnce({ data: { ok: true } });

    renderPage();

    const input = document.querySelector('input[type="file"]');
    const file = new File(['sku,new_price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await screen.findByText(/productos cambiarán de precio/i);
    fireEvent.click(screen.getByRole('button', { name: /confirmar.*cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/precios actualizados/i)).toBeInTheDocument();
    });
  });

  // UC-ADM-SHEET (F7) — DataSheet de edición rápida
  it('renderiza la hoja editable «Edición rápida» con las filas de preview', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW });
    renderPage();

    const input = document.querySelector('input[type="file"]');
    const file = new File(['sku,new_price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await screen.findByText(/edición rápida/i);
    const sheet = screen.getByRole('table', { name: /edición rápida de precios/i });
    expect(sheet).toBeInTheDocument();

    // Una celda editable de precio por fila de preview (new_price, type number).
    const priceInputs = screen.getAllByLabelText(/precio nuevo fila/i);
    expect(priceInputs).toHaveLength(PREVIEW.diffs.length);
    expect(priceInputs[0]).toHaveValue(110);
  });

  it('editar una celda de precio actualiza el estado local de las filas', async () => {
    apiService.post.mockResolvedValueOnce({ data: PREVIEW });
    renderPage();

    const input = document.querySelector('input[type="file"]');
    const file = new File(['sku,new_price\nSKU-1,110'], 'precios.csv', { type: 'text/csv' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await screen.findByText(/edición rápida/i);
    const priceInputs = screen.getAllByLabelText(/precio nuevo fila/i);

    fireEvent.change(priceInputs[0], { target: { value: '150' } });

    // El input es controlado: el nuevo valor refleja el estado actualizado.
    expect(priceInputs[0]).toHaveValue(150);
  });
});
