/**
 * Tests — logisticsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './logisticsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('logisticsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('logistics/confirmDelivery/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('logistics/confirmDelivery/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    store.dispatch({ type: 'logistics/confirmDelivery/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('logistics/confirmDelivery/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    store.dispatch({ type: 'logistics/confirmDelivery/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// UCs ausentes implementadas: LOG-01, LOG-02, LOG-06, LOG-07
// ════════════════════════════════════════════════════════════════════════════
import apiService from '@services/apiService';
import logisticsReducer, {
  createShipmentGuide,
  setTrackingNumber,
  fetchCouriers,
  createCourier,
  updateCourier,
  deleteCourier,
  reportShippingIssue,
  clearLogisticsActionState,
} from './logisticsSlice';

const makeUcStore = () =>
  configureStore({ reducer: { logistics: logisticsReducer } });

afterEach(() => jest.clearAllMocks());

// ─── UC-LOG-01 — crear guia ─────────────────────────────────────────────────
describe('logisticsSlice — createShipmentGuide (UC-LOG-01)', () => {
  it('hace POST a la URL de guias con orderNumber y datos', async () => {
    apiService.post.mockResolvedValue({ data: { guide_id: 'G-1', tracking: null } });
    const store = makeUcStore();
    await store.dispatch(createShipmentGuide({
      orderNumber: 'PY-2026-000101', courierId: 3, weight_kg: 2.5,
    }));
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/admin/orders/PY-2026-000101/guide/',
      expect.objectContaining({ courier_id: 3, weight_kg: 2.5 }),
    );
    const s = store.getState().logistics;
    expect(s.lastAction).toBe('guide_created');
    expect(s.currentGuide).toMatchObject({ guide_id: 'G-1' });
    expect(s.isActioning).toBe(false);
  });

  it('rejected — guarda actionError', async () => {
    apiService.post.mockRejectedValue({ body: { detail: 'ORDEN_SIN_DIRECCION' }, message: '422' });
    const store = makeUcStore();
    await store.dispatch(createShipmentGuide({ orderNumber: 'PY-X' }));
    expect(store.getState().logistics.actionError).toMatchObject({
      message: 'ORDEN_SIN_DIRECCION',
    });
  });
});

// ─── UC-LOG-02 — registrar rastreo ──────────────────────────────────────────
describe('logisticsSlice — setTrackingNumber (UC-LOG-02)', () => {
  it('hace PATCH a la URL de tracking con el numero', async () => {
    apiService.patch.mockResolvedValue({ data: { order_number: 'PY-1', tracking: 'TRK-99' } });
    const store = makeUcStore();
    await store.dispatch(setTrackingNumber({ orderNumber: 'PY-1', tracking: 'TRK-99' }));
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/v1/admin/orders/PY-1/tracking/',
      { tracking: 'TRK-99' },
    );
    const s = store.getState().logistics;
    expect(s.lastAction).toBe('tracking_set');
    expect(s.currentGuide).toMatchObject({ tracking: 'TRK-99' });
  });

  it('rejected — guarda actionError', async () => {
    apiService.patch.mockRejectedValue({ body: { detail: 'GUIA_INEXISTENTE' }, message: '404' });
    const store = makeUcStore();
    await store.dispatch(setTrackingNumber({ orderNumber: 'PY-1', tracking: 'X' }));
    expect(store.getState().logistics.actionError).toMatchObject({
      message: 'GUIA_INEXISTENTE',
    });
  });
});

// ─── UC-LOG-06 — CRUD de couriers ───────────────────────────────────────────
describe('logisticsSlice — couriers CRUD (UC-LOG-06)', () => {
  it('fetchCouriers — pobla couriers', async () => {
    apiService.get.mockResolvedValue({ data: { results: [
      { id: 1, name: 'DHL', code: 'DHL', is_active: true },
      { id: 2, name: 'FedEx', code: 'FDX', is_active: true },
    ] } });
    const store = makeUcStore();
    await store.dispatch(fetchCouriers());
    expect(apiService.get).toHaveBeenCalledWith('/api/v1/admin/couriers/');
    const s = store.getState().logistics;
    expect(s.couriers).toHaveLength(2);
    expect(s.couriers[0].name).toBe('DHL');
  });

  it('createCourier — POST y agrega a la lista', async () => {
    apiService.post.mockResolvedValue({ data: { id: 9, name: 'Estafeta', code: 'EST', is_active: true } });
    const store = makeUcStore();
    await store.dispatch(createCourier({ name: 'Estafeta', code: 'EST' }));
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/admin/couriers/',
      expect.objectContaining({ name: 'Estafeta', code: 'EST' }),
    );
    const s = store.getState().logistics;
    expect(s.couriers.some((c) => c.id === 9)).toBe(true);
    expect(s.lastAction).toBe('courier_created');
  });

  it('updateCourier — PATCH y actualiza en la lista', async () => {
    apiService.patch.mockResolvedValue({ data: { id: 1, name: 'DHL Express', code: 'DHL', is_active: false } });
    const store = makeUcStore();
    store.dispatch({ type: 'logistics/fetchCouriers/fulfilled',
      payload: { results: [{ id: 1, name: 'DHL', code: 'DHL', is_active: true }] } });
    await store.dispatch(updateCourier({ id: 1, data: { name: 'DHL Express', is_active: false } }));
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/v1/admin/couriers/1/',
      expect.objectContaining({ name: 'DHL Express', is_active: false }),
    );
    const s = store.getState().logistics;
    expect(s.couriers[0].name).toBe('DHL Express');
    expect(s.couriers[0].is_active).toBe(false);
    expect(s.lastAction).toBe('courier_updated');
  });

  it('deleteCourier — DELETE y remueve de la lista', async () => {
    apiService.delete.mockResolvedValue({ data: {} });
    const store = makeUcStore();
    store.dispatch({ type: 'logistics/fetchCouriers/fulfilled',
      payload: { results: [
        { id: 1, name: 'DHL' }, { id: 2, name: 'FedEx' },
      ] } });
    await store.dispatch(deleteCourier(1));
    expect(apiService.delete).toHaveBeenCalledWith('/api/v1/admin/couriers/1/');
    const s = store.getState().logistics;
    expect(s.couriers.some((c) => c.id === 1)).toBe(false);
    expect(s.couriers).toHaveLength(1);
    expect(s.lastAction).toBe('courier_deleted');
  });

  it('fetchCouriers rejected — guarda error', async () => {
    apiService.get.mockRejectedValue(new Error('Network'));
    const store = makeUcStore();
    await store.dispatch(fetchCouriers());
    expect(store.getState().logistics.error).toBeDefined();
  });
});

// ─── UC-LOG-07 — reportar problema ──────────────────────────────────────────
describe('logisticsSlice — reportShippingIssue (UC-LOG-07)', () => {
  it('hace POST a la URL de incidencias con orderNumber y mensaje', async () => {
    apiService.post.mockResolvedValue({ data: { id: 7, status: 'OPEN' } });
    const store = makeUcStore();
    await store.dispatch(reportShippingIssue({
      orderNumber: 'PY-1', message: 'No llegó nada',
    }));
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/orders/PY-1/shipping-issue/',
      expect.objectContaining({ message: 'No llegó nada' }),
    );
    const s = store.getState().logistics;
    expect(s.lastAction).toBe('issue_reported');
    expect(s.isActioning).toBe(false);
  });

  it('rejected — guarda actionError', async () => {
    apiService.post.mockRejectedValue({ body: { detail: 'MENSAJE_VACIO' }, message: '422' });
    const store = makeUcStore();
    await store.dispatch(reportShippingIssue({ orderNumber: 'PY-1', message: '' }));
    expect(store.getState().logistics.actionError).toMatchObject({
      message: 'MENSAJE_VACIO',
    });
  });
});

describe('logisticsSlice — clearLogisticsActionState (UCs nuevas)', () => {
  it('limpia error y lastAction', () => {
    const store = makeUcStore();
    store.dispatch({ type: 'logistics/createShipmentGuide/rejected', payload: 'X' });
    store.dispatch(clearLogisticsActionState());
    expect(store.getState().logistics.actionError).toBeNull();
    expect(store.getState().logistics.lastAction).toBeNull();
  });
});
