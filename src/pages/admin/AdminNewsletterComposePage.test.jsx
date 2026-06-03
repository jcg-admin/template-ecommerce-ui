/**
 * Tests — AdminNewsletterComposePage
 * UC-NEW-04: el admin compone y envia una campana.
 *
 * El backend (CampaignCreateSerializer) acepta `subject`, `body` y
 * `audience_filter` (PENDING|CONFIRMED|UNSUBSCRIBED, default CONFIRMED).
 * No existen `html_body`/`text_body`/`segment`/`scheduled_at`.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import newsletterReducer from '@redux/slices/newsletterSlice';
import AdminNewsletterComposePage from './AdminNewsletterComposePage';

const makeStore = () =>
  configureStore({ reducer: { newsletter: newsletterReducer } });

const wrap = (ui, store) => (
  <Provider store={store}>
    <MemoryRouter>{ui}</MemoryRouter>
  </Provider>
);

afterEach(() => jest.clearAllMocks());

describe('AdminNewsletterComposePage (UC-NEW-04)', () => {
  it('muestra el titulo del compositor', () => {
    render(wrap(<AdminNewsletterComposePage />, makeStore()));
    expect(
      screen.getByRole('heading', { name: /Nueva campa[nñ]a/i }),
    ).toBeInTheDocument();
  });

  it('exige asunto y contenido antes de enviar', () => {
    render(wrap(<AdminNewsletterComposePage />, makeStore()));
    fireEvent.click(screen.getByRole('button', { name: /Enviar campa[nñ]a/i }));
    expect(apiService.post).not.toHaveBeenCalled();
    expect(screen.getByText(/El asunto es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/El contenido es obligatorio/i)).toBeInTheDocument();
  });

  it('al enviar, hace POST con subject, body y audience_filter', async () => {
    apiService.post.mockResolvedValue({
      data: { id: 5, status: 'QUEUED', recipients_count: 120 },
    });
    render(wrap(<AdminNewsletterComposePage />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Asunto/i),
      { target: { value: 'Boletin de mayo' } });
    fireEvent.change(screen.getByLabelText(/Contenido/i),
      { target: { value: 'Hola a todos, novedades del mes.' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar campa[nñ]a/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/newsletter/campaigns/',
        expect.objectContaining({
          subject:         'Boletin de mayo',
          body:            'Hola a todos, novedades del mes.',
          audience_filter: 'CONFIRMED',
        }),
      );
    });
    // Campos inventados que el backend no acepta NO deben enviarse.
    const payload = apiService.post.mock.calls[0][1];
    expect(payload).not.toHaveProperty('html_body');
    expect(payload).not.toHaveProperty('text_body');
    expect(payload).not.toHaveProperty('segment');
    expect(payload).not.toHaveProperty('scheduled_at');
  });

  it('permite elegir la audiencia de la campana', async () => {
    apiService.post.mockResolvedValue({ data: { id: 6, status: 'QUEUED' } });
    render(wrap(<AdminNewsletterComposePage />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Asunto/i),
      { target: { value: 'Reengage' } });
    fireEvent.change(screen.getByLabelText(/Contenido/i),
      { target: { value: 'Vuelve con nosotros, te extranamos.' } });
    fireEvent.change(screen.getByLabelText(/Audiencia/i),
      { target: { value: 'PENDING' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar campa[nñ]a/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/newsletter/campaigns/',
        expect.objectContaining({ audience_filter: 'PENDING' }),
      );
    });
  });

  it('muestra el reporte de exito con el numero de destinatarios', async () => {
    apiService.post.mockResolvedValue({
      data: { id: 5, status: 'QUEUED', recipients_count: 120 },
    });
    render(wrap(<AdminNewsletterComposePage />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Asunto/i),
      { target: { value: 'Boletin' } });
    fireEvent.change(screen.getByLabelText(/Contenido/i),
      { target: { value: 'Contenido de la campana de prueba.' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar campa[nñ]a/i }));

    expect(
      await screen.findByText(/120 destinatarios/i),
    ).toBeInTheDocument();
  });
});
