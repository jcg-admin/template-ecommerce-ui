/**
 * Tests: ToastContainer
 * Cubre: BUG-T01 (pausa timer en hover), BUG-T02 (role ARIA por tipo)
 * Iniciativa: integrar-componentes-ui-core-ui (T-205)
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {  } from '@redux/slices/uiSlice';
import ToastContainer from './ToastContainer';

jest.useFakeTimers();

const makeStore = (toasts = []) =>
  configureStore({ reducer: { ui: uiReducer },
    preloadedState: { ui: { toasts, sidebar: false, darkMode: false } } });

const renderWithStore = (store) =>
  render(<Provider store={store}><ToastContainer /></Provider>);

describe('ToastContainer — BUG-T02: role ARIA', () => {
  it('toast de error tiene role=alert', () => {
    const store = makeStore([{ id: '1', type: 'error', message: 'Fallo', duration: 5000 }]);
    renderWithStore(store);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('toast de warning tiene role=alert', () => {
    const store = makeStore([{ id: '1', type: 'warning', message: 'Aviso', duration: 5000 }]);
    renderWithStore(store);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('toast de success tiene role=status', () => {
    const store = makeStore([{ id: '1', type: 'success', message: 'OK', duration: 5000 }]);
    renderWithStore(store);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ToastContainer — BUG-T01: pausa en hover', () => {
  it('el toast NO desaparece mientras el raton esta encima', () => {
    const store = makeStore([{ id: '1', type: 'info', message: 'Leyendo', duration: 3000 }]);
    renderWithStore(store);
    const toast = screen.getByRole('status');

    // Simular hover — el timer debe pausarse
    fireEvent.mouseEnter(toast);
    act(() => jest.advanceTimersByTime(5000));

    // El toast sigue ahí porque el timer estaba pausado
    expect(screen.getByText('Leyendo')).toBeInTheDocument();
  });

  it('el toast desaparece tras duration cuando no hay hover', () => {
    const store = makeStore([{ id: '1', type: 'info', message: 'Temporal', duration: 3000 }]);
    renderWithStore(store);

    act(() => jest.advanceTimersByTime(3100));

    expect(screen.queryByText('Temporal')).not.toBeInTheDocument();
  });

  it('el timer reanuda al quitar el raton', () => {
    const store = makeStore([{ id: '1', type: 'info', message: 'Reanuda', duration: 3000 }]);
    renderWithStore(store);
    const toast = screen.getByRole('status');

    fireEvent.mouseEnter(toast);
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByText('Reanuda')).toBeInTheDocument();

    // Al salir se crea un timer nuevo de 3000ms
    fireEvent.mouseLeave(toast);
    act(() => jest.advanceTimersByTime(3100));
    expect(screen.queryByText('Reanuda')).not.toBeInTheDocument();
  });
});
