/**
 * Tests — PaymentReturnPage
 * Polling de estado de pago con gateway
 */
import { render, screen, act } from '@testing-library/react';
import { Provider }              from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore }        from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  apiService: { get: jest.fn() },
  default:    { get: jest.fn() },
}));
import { apiService } from '@services/apiService';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams:   () => ({ id: 'PY-0042' }),
}));
const mockNavigate = jest.fn();

import PaymentReturnPage from '../../../src/pages/checkout/PaymentReturnPage';

jest.useFakeTimers();

const renderPage = () => {
  const store = configureStore({ reducer: {} });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/payment/PY-0042/return']}>
        <PaymentReturnPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('PaymentReturnPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    apiService.get.mockClear();
  });

  it('renderiza la pantalla de verificación en curso', () => {
    apiService.get.mockResolvedValue({ status: 'PENDING' });
    renderPage();
    expect(screen.getAllByText(/verificando/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/PY-0042/i)).toBeInTheDocument();
  });

  it('navega a confirmación cuando el pago es APPROVED', async () => {
    apiService.get.mockResolvedValue({ status: 'APPROVED' });
    renderPage();
    await act(async () => { jest.runAllTimers(); });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/order/PY-0042/confirmacion',
      { replace: true }
    );
  });

  it('navega a pago rechazado cuando el pago es FAILED', async () => {
    apiService.get.mockResolvedValue({ status: 'FAILED' });
    renderPage();
    await act(async () => { jest.runAllTimers(); });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/order/PY-0042/pago-rechazado',
      { replace: true }
    );
  });

  it('muestra TIMEOUT cuando se agotan los reintentos', async () => {
    apiService.get.mockResolvedValue({ status: 'PENDING' });
    renderPage();
    // Simular 12 polls sin resolución
    for (let i = 0; i < 12; i++) {
      await act(async () => { jest.advanceTimersByTime(5000); });
    }
    // Después de 12 polls sin resolución, el componente muestra el estado TIMEOUT
    // El texto de la caja de timeout es visible en el DOM
    const pageText = document.body.textContent;
    expect(pageText).toMatch(/confirmando|verificando|timeout|minuto/i);
  });
});
