/**
 * Tests — SupportTicketActions
 * UC-SUPP-04: Cerrar / Reabrir ticket
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';


jest.mock('@components/shared/ConfirmModal/ConfirmModal', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function ConfirmModal({ open, onConfirm, onClose, message }) {
      if (!open) return null;
      return React.createElement('div', { 'data-testid': 'confirm-modal' },
        React.createElement('p', null, message),
        React.createElement('button', { type: 'button', onClick: onConfirm }, 'Confirmar'),
        React.createElement('button', { type: 'button', onClick: onClose }, 'Cancelar'),
      );
    },
  };
});
jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import supportTicketsReducer from '@redux/slices/supportTicketsSlice';
import SupportTicketActions from './SupportTicketActions';

const makeStore = () =>
  configureStore({ reducer: { supportTickets: supportTicketsReducer } });

const wrap = (ui, store) => (
  <Provider store={store}>
    <MemoryRouter>{ui}</MemoryRouter>
  </Provider>
);

afterEach(() => jest.clearAllMocks());

describe('SupportTicketActions (UC-SUPP-04)', () => {
  it('muestra boton de cerrar cuando el ticket esta OPEN', () => {
    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'OPEN' }} />,
      makeStore(),
    ));
    expect(
      screen.getByRole('button', { name: /Cerrar ticket/i })
    ).toBeInTheDocument();
  });

  it('muestra boton de cerrar cuando el ticket esta REPLIED', () => {
    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'REPLIED' }} />,
      makeStore(),
    ));
    expect(
      screen.getByRole('button', { name: /Cerrar ticket/i })
    ).toBeInTheDocument();
  });

  it('muestra boton de reabrir cuando el ticket esta CLOSED', () => {
    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'CLOSED' }} />,
      makeStore(),
    ));
    expect(
      screen.getByRole('button', { name: /Reabrir ticket/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cerrar ticket/i })
    ).not.toBeInTheDocument();
  });

  it('llama al endpoint de cerrar al confirmar', async () => {
    apiService.post.mockResolvedValue({
      data: { id: 7, status: 'CLOSED' },
    });

    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'OPEN' }} />,
      makeStore(),
    ));
    // Abrir el Modal de confirmación
    fireEvent.click(screen.getByRole('button', { name: /Cerrar ticket/i }));
    // Confirmar en el Modal
    await waitFor(() => screen.getByRole('button', { name: /Confirmar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        expect.stringContaining('/support/tickets/7/close/'),
        expect.any(Object),
      );
    });
  });

  it('no cierra si el usuario cancela la confirmacion', async () => {
    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'OPEN' }} />,
      makeStore(),
    ));
    // Abrir el Modal y cancelar
    fireEvent.click(screen.getByRole('button', { name: /Cerrar ticket/i }));
    await waitFor(() => screen.getByRole('button', { name: /Cancelar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('llama al endpoint de reabrir al confirmar', async () => {
    apiService.post.mockResolvedValue({
      data: { id: 7, status: 'OPEN' },
    });

    render(wrap(
      <SupportTicketActions ticket={{ id: 7, status: 'CLOSED' }} />,
      makeStore(),
    ));
    // Abrir Modal y confirmar
    fireEvent.click(screen.getByRole('button', { name: /Reabrir ticket/i }));
    await waitFor(() => screen.getByRole('button', { name: /Confirmar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        expect.stringContaining('/support/tickets/7/reopen/'),
      );
    });
  });
});
