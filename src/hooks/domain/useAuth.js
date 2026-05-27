/**
 * useAuth — ecommerce-ui
 * Hook de autenticación. Combina Redux auth + acciones.
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  selectUser, selectIsAuthenticated, selectIsAdmin,
  selectIsStaff, selectIsSuperAdmin,
  selectAuthLoading, selectAuthError,
} from '@redux/selectors';
import {
  loginUser, logoutUser, registerUser,
  getCurrentUser, clearError, updateUser,
} from '@redux/slices/authSlice';

export function useAuth() {
  const dispatch        = useDispatch();
  const user            = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const isStaff         = useSelector(selectIsStaff);
  const isSuperAdmin    = useSelector(selectIsSuperAdmin);
  const isLoading       = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);

  const login    = useCallback((creds) => dispatch(loginUser(creds)),    [dispatch]);
  const logout   = useCallback(()      => dispatch(logoutUser()),         [dispatch]);
  const register = useCallback((data)  => dispatch(registerUser(data)),   [dispatch]);
  const refresh  = useCallback(()      => dispatch(getCurrentUser()),      [dispatch]);
  const clear    = useCallback(()      => dispatch(clearError()),          [dispatch]);
  const update   = useCallback((data)  => dispatch(updateUser(data)),      [dispatch]);

  return {
    user, isAuthenticated, isAdmin, isStaff, isSuperAdmin, isLoading, error,
    login, logout, register, refresh, clearError: clear, updateUser: update,
  };
}
