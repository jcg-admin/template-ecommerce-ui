/**
 * useSearchSuggestions — UC-SRCH-02 (autocomplete con sugerencias en vivo).
 *
 * Consulta sugerencias de busqueda mientras el usuario escribe. Aplica un
 * debounce (~250ms) sobre el termino y exige un minimo de 2 caracteres para
 * evitar peticiones por cada tecla. Cuando el termino es demasiado corto la
 * query de React Query queda deshabilitada (sin red ni cache sucia).
 *
 * Endpoint:
 *   GET /api/v1/catalogue/search/suggestions/?q=<term>
 *     → { suggestions: string[] }
 *
 * Retorna `{ suggestions, isLoading }` para alimentar el primitivo
 * Autocomplete / la lista de sugerencias del SearchBar.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/apiService';

const SUGGESTIONS_URL = '/api/v1/catalogue/search/suggestions/';
export const SUGGESTIONS_KEY = ['catalog', 'search', 'suggestions'];

const MIN_LENGTH    = 2;
const DEBOUNCE_MS   = 250;

export function normalizeQuery(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/\s+/g, ' ');
}

export function useSearchSuggestions(rawQuery = '', options = {}) {
  const normalized = normalizeQuery(rawQuery);

  // Debounce: solo promovemos el termino al estado consultado tras la pausa.
  // Arranca vacio para que ningun termino se consulte antes del primer
  // intervalo de debounce (incluido el valor inicial del input).
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(normalized), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [normalized]);

  const enabled =
    (options.enabled ?? true) && debounced.length >= MIN_LENGTH;

  const query = useQuery({
    queryKey: [...SUGGESTIONS_KEY, debounced],
    queryFn:  async ({ signal }) => {
      const { data } = await apiService.get(SUGGESTIONS_URL, {
        params: { q: debounced },
        signal,
      });
      const list = data?.suggestions ?? data?.results ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return {
    suggestions: query.data ?? [],
    isLoading:   enabled && query.isFetching,
  };
}

export default useSearchSuggestions;
