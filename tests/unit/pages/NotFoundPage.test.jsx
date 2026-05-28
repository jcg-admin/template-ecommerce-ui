/**
 * Tests — NotFoundPage
 * Página 404 con CTA al catálogo
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../../src/pages/NotFoundPage';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const renderPage = () => render(
  <MemoryRouter><NotFoundPage /></MemoryRouter>
);

describe('NotFoundPage', () => {
  it('muestra el código de error 404', () => {
    renderPage();
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  it('tiene un mensaje explicativo', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/encontr|página|existe|not found/i);
  });

  it('tiene un enlace de vuelta al catálogo o inicio', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('el enlace principal lleva a una ruta válida', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const mainLink = links[0];
    expect(mainLink.getAttribute('href')).toBeTruthy();
  });
});
