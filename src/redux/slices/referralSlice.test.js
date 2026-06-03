/**
 * Tests — referralSlice (UC-PRO-05).
 * Codigo de referido de la cuenta del comprador.
 * Thunk fetchReferral: fulfilled / rejected + pending.
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchReferral } from './referralSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

import apiService from '@services/apiService';

const makeStore = () => configureStore({ reducer: { referral: reducer } });

const REFERRAL = {
  code: 'NESTOR-2026',
  share_url: 'https://shop.example.com/?ref=NESTOR-2026',
  invited_count: 4,
  rewards: 200,
};

afterEach(() => jest.clearAllMocks());

describe('referralSlice (UC-PRO-05)', () => {
  it('estado inicial es valido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().referral;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
    expect(state.code).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('fetchReferral/pending activa isLoading y limpia error', () => {
    const store = makeStore();
    store.dispatch({ type: fetchReferral.pending.type });
    expect(store.getState().referral.isLoading).toBe(true);
    expect(store.getState().referral.error).toBeNull();
  });

  it('fetchReferral fulfilled guarda el codigo y las metricas', async () => {
    apiService.get.mockResolvedValue({ data: REFERRAL });
    const store = makeStore();
    await store.dispatch(fetchReferral());
    const state = store.getState().referral;
    expect(apiService.get).toHaveBeenCalledWith('/api/v1/account/referral/');
    expect(state.code).toBe('NESTOR-2026');
    expect(state.shareUrl).toBe(REFERRAL.share_url);
    expect(state.invitedCount).toBe(4);
    expect(state.rewards).toBe(200);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchReferral rejected guarda el error y apaga isLoading', async () => {
    apiService.get.mockRejectedValue({ message: 'Boom', statusCode: 500 });
    const store = makeStore();
    await store.dispatch(fetchReferral());
    const state = store.getState().referral;
    expect(state.isLoading).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.code).toBeNull();
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
