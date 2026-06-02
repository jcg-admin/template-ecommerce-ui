/**
 * useSystemSettings — UC-ADM-04
 *
 * GET /api/v1/config/settings/
 *
 * Devuelve la configuracion actual del sistema (objeto plano).
 */
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/apiService';

const URL = '/api/v1/config/settings/';
export const SYSTEM_SETTINGS_KEY = ['admin', 'settings'];

export function useSystemSettings() {
  return useQuery({
    queryKey: SYSTEM_SETTINGS_KEY,
    queryFn:  async ({ signal }) => {
      const { data } = await apiService.get(URL, { signal });
      return data ?? {};
    },
  });
}

export default useSystemSettings;
