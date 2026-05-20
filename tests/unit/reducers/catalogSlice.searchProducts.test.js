/**
 * catalogSlice.searchProducts — pruebas con withCaching
 *
 * T-014 de la iniciativa resolver-hallazgos-de-deuda-del-template.
 *
 * Verifica que la primera llamada con un conjunto de parametros toca
 * la API y la segunda con los mismos parametros devuelve el resultado
 * cacheado sin volver a llamar a apiService. Llamadas con parametros
 * distintos generan claves distintas.
 *
 * El cache vive en el closure del decorator y persiste mientras el
 * modulo este cargado. Para evitar contaminacion entre tests se usan
 * queries unicas por test.
 */

import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import apiService from '@services/apiService';
import catalogReducer, { searchProducts } from '@redux/slices/catalogSlice';

const buildStore = () =>
  configureStore({
    reducer: { catalog: catalogReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });

describe('catalogSlice.searchProducts — withCaching integration', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    apiService.get.mockResolvedValue({
      data: { results: [{ id: 1, name: 'P' }], count: 1 },
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('primera llamada con una query toca la API (cache miss)', async () => {
    const store = buildStore();
    const params = { q: 'unique-query-miss-1', page: 1 };

    const result = await store.dispatch(searchProducts(params));

    expect(result.type).toBe('catalog/searchProducts/fulfilled');
    expect(apiService.get).toHaveBeenCalledTimes(1);
    const cacheMissLog = logSpy.mock.calls.some(
      c => typeof c[0] === 'string' && c[0].includes('[CACHE MISS]'),
    );
    expect(cacheMissLog).toBe(true);
  });

  test('segunda llamada con los mismos params no toca la API (cache hit)', async () => {
    const store = buildStore();
    const params = { q: 'unique-query-hit-2', page: 1 };

    // Primera llamada: miss + invocacion real
    await store.dispatch(searchProducts(params));
    expect(apiService.get).toHaveBeenCalledTimes(1);

    // Reset solo del mock de la API, no del cache
    apiService.get.mockClear();
    logSpy.mockClear();

    // Segunda llamada con el MISMO objeto: hit, no debe invocar la API
    const result = await store.dispatch(searchProducts(params));
    expect(result.type).toBe('catalog/searchProducts/fulfilled');
    expect(apiService.get).not.toHaveBeenCalled();

    const cacheHitLog = logSpy.mock.calls.some(
      c => typeof c[0] === 'string' && c[0].includes('[CACHE HIT]'),
    );
    expect(cacheHitLog).toBe(true);
  });

  test('parametros distintos generan claves de cache distintas (la API vuelve a ser llamada)', async () => {
    const store = buildStore();

    await store.dispatch(searchProducts({ q: 'distinct-query-3a' }));
    expect(apiService.get).toHaveBeenCalledTimes(1);

    await store.dispatch(searchProducts({ q: 'distinct-query-3b' }));
    expect(apiService.get).toHaveBeenCalledTimes(2);
  });

  test('cambio de filtros con la misma q tambien genera clave distinta', async () => {
    const store = buildStore();

    await store.dispatch(searchProducts({ q: 'filter-query-4', page: 1 }));
    await store.dispatch(searchProducts({ q: 'filter-query-4', page: 2 }));

    expect(apiService.get).toHaveBeenCalledTimes(2);
  });
});
