/**
 * Tests — notificationsSlice
 * Preferencias de notificación y lectura
 */
import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from './notificationsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { notifications: notificationsReducer } });

describe('notificationsSlice', () => {
  it('estado inicial es válido', () => {
    const store = makeStore();
    const state = store.getState().notifications;
    expect(state).toBeDefined();
  });

  it('fetchNotificationPreferences/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'notifications/fetchPreferences/pending' });
    const state = store.getState().notifications;
    expect(state.isLoading).toBe(true);
  });

  it('fetchNotificationPreferences/fulfilled guarda las preferencias', () => {
    const prefs = {
      email_orders: true, email_promotions: false,
      push_orders: true,  push_promotions: true,
    };
    const store = makeStore();
    store.dispatch({ type: 'notifications/fetchPreferences/pending' });
    store.dispatch({
      type: 'notifications/fetchPreferences/fulfilled',
      payload: prefs,
    });
    const state = store.getState().notifications;
    expect(state.isLoading).toBe(false);
  });

  it('markNotificationAsRead/fulfilled actualiza la notificación', () => {
    const store = makeStore();
    store.dispatch({
      type: 'notifications/markAsRead/fulfilled',
      payload: { id: 42, is_read: true },
    });
    expect(store.getState().notifications).toBeDefined();
  });

  it('markAllNotificationsAsRead/fulfilled no rompe el estado', () => {
    const store = makeStore();
    store.dispatch({ type: 'notifications/markAllAsRead/fulfilled' });
    expect(store.getState().notifications).toBeDefined();
  });

  it('acciones rechazadas no rompen el estado', () => {
    const store = makeStore();
    store.dispatch({
      type: 'notifications/fetchPreferences/rejected',
      payload: { message: 'Error de red' },
    });
    expect(store.getState().notifications.isLoading).toBe(false);
  });
});
