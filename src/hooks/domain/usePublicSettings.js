/**
 * usePublicSettings — UC-CFG-05 (lectura publica de datos de contacto)
 *
 * Lee el subconjunto publico de SiteSettings (email, telefono, direccion,
 * redes sociales) para el footer y la pagina de contacto. POST-02: los
 * cambios del admin son visibles de inmediato en el storefront.
 *
 *   GET /api/v1/config/settings/
 *
 * No usa React Query a proposito: el Footer se monta en casi todas las
 * vistas (y tests) y no debe exigir un QueryClientProvider. Hace un fetch
 * tolerante a fallos y cae a `fallback` si el endpoint no responde.
 */
import { useEffect, useState } from 'react';
import apiService from '@services/apiService';

const URL = '/api/v1/config/settings/';

export function usePublicSettings(fallback = {}) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // `await` tolera que apiService.get devuelva undefined (mocks de test).
        const res = await apiService.get(URL);
        if (alive && res?.data) setData((prev) => ({ ...prev, ...res.data }));
      } catch { /* degradado: se conserva el fallback */ }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

export default usePublicSettings;
