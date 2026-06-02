/**
 * Tests — SearchBar (UC-CAT-03 / UC-SRCH-01 + autocomplete UC-SRCH-02).
 *
 * Verifica:
 *   - submit clasico (fallback) sigue disparando onSearch,
 *   - validacion de minimo 2 caracteres,
 *   - al teclear (>=2 chars) aparecen sugerencias en vivo,
 *   - al elegir una sugerencia se dispara onSearch con ese termino.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import apiService from '@services/apiService';
import SearchBar from './SearchBar';

const renderBar = (props = {}) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSearch = jest.fn();
  const utils = render(
    <QueryClientProvider client={qc}>
      <SearchBar onSearch={onSearch} {...props} />
    </QueryClientProvider>,
  );
  return { onSearch, ...utils };
};

afterEach(() => jest.clearAllMocks());

describe('SearchBar (UC-SRCH-01 / UC-SRCH-02)', () => {
  it('dispara onSearch en el submit clasico (fallback)', async () => {
    apiService.get.mockResolvedValue({ data: { suggestions: [] } });
    const user = userEvent.setup();
    const { onSearch } = renderBar();

    await user.type(screen.getByRole('combobox'), 'collar');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('collar');
  });

  it('muestra error y no busca con menos de 2 caracteres', async () => {
    apiService.get.mockResolvedValue({ data: { suggestions: [] } });
    const user = userEvent.setup();
    const { onSearch } = renderBar();

    await user.type(screen.getByRole('combobox'), 'c');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('al teclear aparecen sugerencias en vivo (UC-SRCH-02)', async () => {
    apiService.get.mockResolvedValue({
      data: { suggestions: ['Collar Oshun', 'Collar Yemaya'] },
    });
    const user = userEvent.setup();
    renderBar();

    await user.type(screen.getByRole('combobox'), 'col');

    await waitFor(() =>
      expect(apiService.get).toHaveBeenCalledWith(
        '/api/v1/catalogue/search/suggestions/',
        expect.objectContaining({ params: expect.objectContaining({ q: 'col' }) }),
      ),
    );

    expect(await screen.findByText('Collar Oshun')).toBeInTheDocument();
    expect(screen.getByText('Collar Yemaya')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('al elegir una sugerencia dispara onSearch con ese termino', async () => {
    apiService.get.mockResolvedValue({
      data: { suggestions: ['Collar Oshun', 'Collar Yemaya'] },
    });
    const user = userEvent.setup();
    const { onSearch } = renderBar();

    await user.type(screen.getByRole('combobox'), 'col');

    const option = await screen.findByText('Collar Oshun');
    await user.click(option);

    expect(onSearch).toHaveBeenCalledWith('Collar Oshun');
  });
});
