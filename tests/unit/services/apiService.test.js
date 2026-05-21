/**
 * apiService — pruebas de integracion con withLogging
 *
 * T-010 de la iniciativa resolver-hallazgos-de-deuda-del-template.
 * Verifica que cada request HTTP pasa por withLogging:
 *
 *   - Se loguea inicio con args sanitizados.
 *   - Se loguea duracion al completar.
 *   - Campos sensibles (password, token, apiKey) en el primer
 *     argumento objeto se ocultan en el log.
 *
 * Actualizacion T-016 de revisar-arquitectura-de-mocks: el test ya no
 * mockea `mockInterceptor` (eliminado del `apiService`). Usa MSW
 * `server.use()` para responder a cualquier URL que la suite golpee.
 */

import { http, HttpResponse } from 'msw';
import { server } from '@mocks/node';
import { APIService } from '@services/apiService';

describe('apiService — withLogging integration', () => {
  let api;
  let logSpy;

  beforeEach(() => {
    api = new APIService('https://api.test');
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // MSW responde 200 OK para cualquier URL de este test.
    server.use(
      http.all('https://api.test/*', () =>
        HttpResponse.json({ ok: true })
      )
    );
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('loguea inicio de cada request HTTP con el nombre apiService._request', async () => {
    await api.get('/health');

    const calledMessages = logSpy.mock.calls.map(c => c[0]);
    expect(
      calledMessages.some(m => typeof m === 'string' && m.includes('apiService._request called'))
    ).toBe(true);
  });

  it('loguea la duracion al completar la request', async () => {
    await api.post('/orders', { amount: 100 });

    const calledMessages = logSpy.mock.calls.map(c => c[0]);
    expect(
      calledMessages.some(
        m => typeof m === 'string' && /apiService\._request completed in [\d.]+ms/.test(m)
      )
    ).toBe(true);
  });

  it('no loguea el resultado (logResult: false en la configuracion)', async () => {
    await api.get('/users/1');

    const calledMessages = logSpy.mock.calls.map(c => c[0]);
    const hasResultLog = calledMessages.some(
      m => typeof m === 'string' && m.includes('apiService._request result:')
    );
    expect(hasResultLog).toBe(false);
  });

  it('sanitiza campos sensibles del primer argumento objeto antes de loguear', async () => {
    // withLogging sanitiza password/token/apiKey cuando el arg es un
    // objeto de primer nivel. Aqui pasamos un options con esos campos
    // para verificar el comportamiento.
    await api._request('GET', '/sensible', {
      password: 'super-secreto',
      token:    'jwt-secreto',
      apiKey:   'k-secreto',
    });

    // Buscar el call que registro los argumentos
    const argsCall = logSpy.mock.calls.find(
      c => typeof c[0] === 'string' && c[0].includes('called with')
    );
    expect(argsCall).toBeDefined();

    const serialized = JSON.stringify(argsCall);
    expect(serialized).not.toContain('super-secreto');
    expect(serialized).not.toContain('jwt-secreto');
    expect(serialized).not.toContain('k-secreto');
    expect(serialized).toContain('***');
  });
});
