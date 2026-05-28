import { renderHook } from '@testing-library/react';
import useFloating from './useFloating';

describe('useFloating', () => {
  it('retorna refs y floatingStyles', () => {
    const { result } = renderHook(() => useFloating());
    expect(result.current.refs).toBeDefined();
    expect(result.current.floatingStyles).toBeDefined();
  });

  it('acepta placement personalizado', () => {
    const { result } = renderHook(() => useFloating({ placement: 'top' }));
    expect(result.current).toHaveProperty('refs');
  });

  it('funciona con enabled=false (sin autoUpdate)', () => {
    const { result } = renderHook(() => useFloating({ enabled: false }));
    expect(result.current.refs).toBeDefined();
  });
});
