/**
 * Tests — useForm
 * Gestión de formularios con validación
 */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useForm } from './useForm';



const makeWrapper = () => {
  
  return ({ children }) => (
    
      <MemoryRouter>{children}</MemoryRouter>
    
  );
};

describe('useForm', () => {
  it('retorna objeto válido', () => {
    const { result } = renderHook(
      () => useForm({ email: '', password: '' }),
      { wrapper: makeWrapper() }
    );
    expect(result.current).toBeDefined();
  });

  it('el resultado es un objeto o primitivo', () => {
    const { result } = renderHook(
      () => useForm({ email: '', password: '' }),
      { wrapper: makeWrapper() }
    );
    expect(result.current !== null).toBe(true);
  });
});
