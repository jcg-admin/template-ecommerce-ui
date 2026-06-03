/**
 * Tests — AdminCouriersPage (UC-LOG-06)
 * CRUD de couriers / paqueterías.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import apiService from '@services/apiService';
import logisticsReducer from '@redux/slices/logisticsSlice';
import AdminCouriersPage from './AdminCouriersPage';

const makeStore = () => configureStore({ reducer: { logistics: logisticsReducer } });

const wrap = (ui, store) => (
  <Provider store={store}>
    <MemoryRouter>{ui}</MemoryRouter>
  </Provider>
);

afterEach(() => jest.clearAllMocks());

describe('AdminCouriersPage (UC-LOG-06)', () => {
  it('al montar hace GET de couriers y los lista', async () => {
    apiService.get.mockResolvedValue({ data: { results: [
      { id: 1, name: 'DHL Express', code: 'DHL', is_active: true },
    ] } });
    render(wrap(<AdminCouriersPage />, makeStore()));
    expect(apiService.get).toHaveBeenCalledWith('/api/v1/logistics/couriers/');
    expect(await screen.findByText('DHL Express')).toBeInTheDocument();
  });

  it('crear courier dispara POST', async () => {
    apiService.get.mockResolvedValue({ data: { results: [] } });
    apiService.post.mockResolvedValue({ data: { id: 9, name: 'Estafeta', code: 'EST', is_active: true } });
    render(wrap(<AdminCouriersPage />, makeStore()));

    fireEvent.click(screen.getByRole('button', { name: /Nuevo courier/i }));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Estafeta' } });
    fireEvent.change(screen.getByLabelText(/Código/i), { target: { value: 'EST' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/logistics/couriers/',
        expect.objectContaining({ name: 'Estafeta', code: 'EST' }),
      );
    });
  });

  it('editar courier dispara PATCH', async () => {
    apiService.get.mockResolvedValue({ data: { results: [
      { id: 1, name: 'DHL', code: 'DHL', is_active: true },
    ] } });
    apiService.patch.mockResolvedValue({ data: { id: 1, name: 'DHL Express', code: 'DHL', is_active: true } });
    render(wrap(<AdminCouriersPage />, makeStore()));

    fireEvent.click(await screen.findByRole('button', { name: /Editar DHL/i }));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'DHL Express' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/logistics/couriers/1/',
        expect.objectContaining({ name: 'DHL Express' }),
      );
    });
  });

  it('eliminar courier dispara DELETE tras confirmar', async () => {
    apiService.get.mockResolvedValue({ data: { results: [
      { id: 1, name: 'DHL', code: 'DHL', is_active: true },
    ] } });
    apiService.delete.mockResolvedValue({ data: {} });
    render(wrap(<AdminCouriersPage />, makeStore()));

    fireEvent.click(await screen.findByRole('button', { name: /Eliminar DHL/i }));
    // ConfirmModal: confirmar
    fireEvent.click(screen.getByRole('button', { name: /^Confirmar$/i }));

    await waitFor(() => {
      expect(apiService.delete).toHaveBeenCalledWith('/api/v1/logistics/couriers/1/');
    });
  });
});
