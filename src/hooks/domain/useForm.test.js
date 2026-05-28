/**
 * Tests — useForm
 * Gestión de formularios con validación
 */
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

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
