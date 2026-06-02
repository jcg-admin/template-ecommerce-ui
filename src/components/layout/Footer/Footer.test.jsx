/**
 * Tests — Footer (UC-CFG-05: datos de contacto + redes dinámicos)
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import apiService from '@services/apiService';
import Footer from './index';

afterEach(() => jest.clearAllMocks());

describe('Footer — datos de contacto (UC-CFG-05)', () => {
  it('renderiza los enlaces de redes sociales desde settings públicos', async () => {
    apiService.get.mockResolvedValue({
      data: {
        support_email: 'soporte@demo.mx',
        support_hours: 'L-V 9-18',
        social_links: { facebook: 'https://facebook.com/demo', instagram: 'https://instagram.com/demo' },
      },
    });
    render(<MemoryRouter><Footer /></MemoryRouter>);

    await waitFor(() =>
      expect(apiService.get).toHaveBeenCalledWith('/api/v1/settings/public/'),
    );
    const fb = await screen.findByRole('link', { name: /Facebook/i });
    expect(fb).toHaveAttribute('href', 'https://facebook.com/demo');
    expect(screen.getByText('soporte@demo.mx')).toBeInTheDocument();
  });

  it('usa los valores por defecto si el endpoint falla (sin regresión)', async () => {
    apiService.get.mockRejectedValue(new Error('offline'));
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(await screen.findByText('hola@practicayoruba.com')).toBeInTheDocument();
  });
});
