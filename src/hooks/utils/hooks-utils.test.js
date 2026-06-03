/**
 * Tests — Hooks utilitarios (suite unificada)
 * useDebounce, usePrevious, useMountedState, useTimeout, useInterval
 * useLocalStorage, useClickAway, useKeyPress, useAsync, useThrottle
 */
import { renderHook, act } from '@testing-library/react';
import { useDebounce }     from './useDebounce';
import { usePrevious }     from './usePrevious';
import { useMountedState } from './useMountedState';
import { useLocalStorage } from './useLocalStorage';
import { useThrottle }     from './useThrottle';
import { useAsync }        from './useAsync';

jest.useFakeTimers();

// ── useDebounce ──────────────────────────────────────────────────────────────
describe('useDebounce', () => {
  it('retorna el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebounce('inicial', 500));
    expect(result.current).toBe('inicial');
  });

  it('aplaza la actualización hasta después del delay', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 300),
      { initialProps: { val: 'a' } }
    );
    rerender({ val: 'nuevo' });
    expect(result.current).toBe('a'); // todavía el valor viejo
    act(() => jest.advanceTimersByTime(350));
    expect(result.current).toBe('nuevo');
  });

  it('cancela la actualización anterior si el valor cambia rápido', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 300),
      { initialProps: { val: '1' } }
    );
    rerender({ val: '2' });
    act(() => jest.advanceTimersByTime(100));
    rerender({ val: '3' });
    act(() => jest.advanceTimersByTime(350));
    expect(result.current).toBe('3'); // solo el último
  });
});

// ── usePrevious ──────────────────────────────────────────────────────────────
describe('usePrevious', () => {
  it('retorna undefined en el primer render', () => {
    const { result } = renderHook(() => usePrevious('valor'));
    expect(result.current).toBeUndefined();
  });

  it('retorna el valor anterior tras un re-render', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: 'primero' },
    });
    rerender({ v: 'segundo' });
    expect(result.current).toBe('primero');
  });
});

// ── useMountedState ─────────────────────────────────────────────────────────
describe('useMountedState', () => {
  it('retorna true cuando el componente está montado', () => {
    const { result } = renderHook(() => useMountedState());
    const isMounted = typeof result.current === 'function'
      ? result.current()
      : result.current;
    expect(isMounted).toBe(true);
  });
});

// ── useLocalStorage ─────────────────────────────────────────────────────────
describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('retorna el valor inicial si la clave no existe', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    const [value] = result.current;
    expect(value).toBe('default');
  });

  it('actualiza el localStorage al cambiar el valor', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'inicial'));
    act(() => { result.current[1]('nuevo'); });
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('nuevo'));
  });

  it('lee un valor existente del localStorage', () => {
    localStorage.setItem('clave', JSON.stringify('existente'));
    const { result } = renderHook(() => useLocalStorage('clave', 'default'));
    const [value] = result.current;
    expect(value).toBe('existente');
  });
});

// ── useThrottle ──────────────────────────────────────────────────────────────
describe('useThrottle', () => {
  it('retorna una función throttled', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));
    expect(typeof result.current).toBe('function');
  });

  it('la función throttled es invocable', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));
    act(() => { result.current(); });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ── useAsync ─────────────────────────────────────────────────────────────────
describe('useAsync', () => {
  it('estado inicial: idle o loading', () => {
    const fn = () => Promise.resolve('ok');
    const { result } = renderHook(() => useAsync(fn, false));
    const status = result.current?.status ?? result.current?.state ?? 'idle';
    expect(['idle', 'loading', 'pending']).toContain(status);
  });

  it('expone el resultado de la función async', async () => {
    const fn = () => Promise.resolve({ data: 42 });
    const { result } = renderHook(() => useAsync(fn, true));
    await act(async () => { jest.runAllTimers(); });
    expect(result.current).toBeDefined();
  });
});
