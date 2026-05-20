/**
 * authSlice — pruebas de integracion con withLogging
 *
 * T-011 de la iniciativa resolver-hallazgos-de-deuda-del-template.
 * Verifica que los thunks que tocan credenciales no exponen
 * password en console.log.
 */

import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    post:  jest.fn(),
    get:   jest.fn(),
    patch: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import authReducer, { loginUser, registerUser, changePassword } from '@redux/slices/authSlice';

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });

describe('authSlice — withLogging integration', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy   = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiService.post.mockResolvedValue({ data: { access: 't', refresh: 'r', user: { id: 1 } } });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('loginUser sanitiza password antes de loguear los argumentos', async () => {
    const store = buildStore();
    await store.dispatch(loginUser({ username: 'alice', password: 'super-secreto-123' }));

    const serialized = JSON.stringify(logSpy.mock.calls);
    expect(serialized).not.toContain('super-secreto-123');
    expect(serialized).toContain('***');
    expect(serialized).toContain('auth/loginUser');
  });

  test('registerUser sanitiza password en el data payload', async () => {
    const store = buildStore();
    await store.dispatch(
      registerUser({
        username: 'bob',
        email:    'bob@example.com',
        password: 'otro-pass-secreto',
      }),
    );

    const serialized = JSON.stringify(logSpy.mock.calls);
    expect(serialized).not.toContain('otro-pass-secreto');
    expect(serialized).toContain('***');
    expect(serialized).toContain('auth/registerUser');
  });

  test('changePassword usa logArgs:false: nunca aparecen los campos password en el log', async () => {
    const store = buildStore();
    await store.dispatch(
      changePassword({
        currentPassword: 'pass-actual-secreto',
        newPassword:     'pass-nuevo-secreto',
        confirmPassword: 'pass-nuevo-secreto',
      }),
    );

    const serialized = JSON.stringify(logSpy.mock.calls);
    expect(serialized).not.toContain('pass-actual-secreto');
    expect(serialized).not.toContain('pass-nuevo-secreto');
    // El log de inicio sin args tiene la forma "called" sin "called with"
    const calledNoArgs = logSpy.mock.calls.some(
      c => typeof c[0] === 'string' && c[0].includes('auth/changePassword called'),
    );
    expect(calledNoArgs).toBe(true);
  });

  test('los tres thunks loguean la duracion (logTime: true)', async () => {
    const store = buildStore();
    await store.dispatch(loginUser({ username: 'a', password: 'p' }));
    await store.dispatch(registerUser({ email: 'a@b' }));
    await store.dispatch(
      changePassword({ currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' }),
    );

    const completedCalls = logSpy.mock.calls.filter(
      c => typeof c[0] === 'string' && /completed in [\d.]+ms/.test(c[0]),
    );
    expect(completedCalls.length).toBeGreaterThanOrEqual(3);
  });
});
