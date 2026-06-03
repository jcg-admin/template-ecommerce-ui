/**
 * Tests — ShippingIssueReport (UC-LOG-07 reportar problema de envío)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import apiService from '@services/apiService';
import ordersReducer from '@redux/slices/ordersSlice';
import ShippingIssueReport from './index';

const renderCmp = (orderId = 42) => {
  const store = configureStore({ reducer: { orders: ordersReducer } });
  return render(
    <Provider store={store}><ShippingIssueReport orderId={orderId} /></Provider>,
  );
};

afterEach(() => jest.clearAllMocks());

describe('ShippingIssueReport (UC-LOG-07)', () => {
  it('muestra el botón colapsado de reportar', () => {
    renderCmp();
    expect(screen.getByRole('button', { name: /reportar problema de envío/i })).toBeInTheDocument();
  });

  it('al abrir muestra el formulario (motivo + descripción)', () => {
    renderCmp();
    fireEvent.click(screen.getByRole('button', { name: /reportar problema de envío/i }));
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('valida que motivo y descripción son obligatorios', () => {
    renderCmp();
    fireEvent.click(screen.getByRole('button', { name: /reportar problema de envío/i }));
    fireEvent.click(screen.getByRole('button', { name: /enviar reporte/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/motivo|describe/i);
    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('envía POST /logistics/shipping-issues/ con order_id, reason y description', async () => {
    apiService.post.mockResolvedValue({
      data: { id: 1, order_id: 42, reason: 'DANADO', description: 'Caja rota', status: 'ABIERTO' },
    });
    renderCmp(42);
    fireEvent.click(screen.getByRole('button', { name: /reportar problema de envío/i }));
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'DANADO' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Caja rota' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar reporte/i }));

    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/logistics/shipping-issues/',
        { order_id: 42, reason: 'DANADO', description: 'Caja rota' },
      ),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(/reporte enviado/i);
  });
});
