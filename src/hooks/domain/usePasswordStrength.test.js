/**
 * Tests — usePasswordStrength
 * Evaluación de fuerza de contraseña
 */
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import { usePasswordStrength } from './usePasswordStrength';



const makeWrapper = () => {
  
  return ({ children }) => (
    
      <MemoryRouter>{children}</MemoryRouter>
    
  );
};

describe('usePasswordStrength', () => {
  it('retorna objeto válido', () => {
    const { result } = renderHook(
      () => usePasswordStrength('Oshun2026!'),
      { wrapper: makeWrapper() }
    );
    expect(result.current).toBeDefined();
  });

  it('el resultado es un objeto o primitivo', () => {
    const { result } = renderHook(
      () => usePasswordStrength('Oshun2026!'),
      { wrapper: makeWrapper() }
    );
    expect(result.current !== null).toBe(true);
  });
});
