/**
 * Auth Slice — ecommerce-ui
 *
 * SEGURIDAD:
 *   - NO se guardan tokens en Redux ni en localStorage.
 *   - Los tokens JWT los maneja el backend en httpOnly cookies.
 *   - Solo se guarda la informacion del usuario para mostrar en la UI.
 *
 * Sprint 2: URLs corregidas a /api/v1/, thunks de perfil añadidos.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';
import { withLogging } from '@decorators/withLogging';

// ─── Thunks — Sprint 1 ────────────────────────────────────────────────

/** Inicia sesion y obtiene tokens JWT. */
export const loginUser = createAsyncThunk(
  'auth/login',
  withLogging(
    async ({ username, email, password }, { rejectWithValue }) => {
      // Aceptar email como alias de username
      const user = username || email;
      try {
        const response = await apiService.post('/api/v1/auth/login/', { username: user, password });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message || 'Error al iniciar sesion');
      }
    },
    'auth/loginUser',
    { logArgs: true, logResult: false, logTime: true },
  ),
);

/** Cierra sesion e invalida el refresh token en blacklist. */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.post('/api/v1/auth/logout/', {});
      return null;
    } catch {
      // Proceder con logout local aunque falle el backend
      return null;
    }
  }
);

/** Registra una nueva cuenta de comprador (is_active=False hasta verificar email). */
export const registerUser = createAsyncThunk(
  'auth/register',
  withLogging(
    async (data, { rejectWithValue }) => {
      try {
        const response = await apiService.post('/api/v1/auth/register/', data);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    },
    'auth/registerUser',
    { logArgs: true, logResult: false, logTime: true },
  ),
);

// ─── Thunks — Sprint 2 ────────────────────────────────────────────────

/** Obtiene el perfil del comprador autenticado (UC-AUTH-05). */
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/api/v1/auth/profile/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** Actualiza los datos del perfil (UC-AUTH-06). */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.patch('/api/v1/auth/profile/', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/** Cambia la contrasena del comprador autenticado (UC-AUTH-08). */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  withLogging(
    async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
      try {
        const response = await apiService.post('/api/v1/auth/change-password/', {
          current_password: currentPassword,
          new_password:     newPassword,
          confirm_password: confirmPassword,
        });
        return response.data;
      } catch (err) {
        return rejectWithValue(serializeApiError(err));
      }
    },
    'auth/changePassword',
    // logArgs: false porque los campos del payload se llaman
    // `currentPassword`/`newPassword`, no `password`; el sanitizer
    // de withLogging busca `password` literal y no los ocultaria.
    // Mejor no loguear ningun arg que loguearlos en claro.
    { logArgs: false, logResult: false, logTime: true },
  ),
);

/** Verifica el email del usuario con el token recibido (UC-AUTH-10). */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/api/v1/auth/verify-email/', {
        token,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  }
);

/** Solicita el reenvio del correo de verificacion (UC-AUTH-10 Alt). */
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        '/api/v1/auth/resend-verification/',
        { email },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  }
);

// UC-AUTH-16 — Dar de baja la cuenta.
/** Elimina (da de baja) la cuenta del comprador autenticado. */
// UC-AUTH-16: baja logica de la propia cuenta. Requiere reautenticacion
// con la contrasena actual (POST /auth/me/deactivate/ con {password}).
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async ({ password } = {}, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/v1/auth/me/deactivate/', { password });
      return res?.data ?? null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,    // { id, email, first_name, last_name, phone, avatar_url,
                              //   is_staff, profile_completeness, pending_fields }
    isAuthenticated: false,
    isLoading:       false,
    error:           null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user ?? action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // El registro no inicia sesion automaticamente (is_active=False)
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // fetchProfile (Sprint 2)
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // updateProfile (Sprint 2)
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // changePassword (Sprint 2)
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // deleteAccount (UC-AUTH-16) — dar de baja la cuenta
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        // Baja exitosa: limpiar la sesion igual que en logout.
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        // La baja fallo: preservar la sesion y exponer el error.
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

// fetchAddresses: lectura de direcciones del usuario autenticado.
// GET /api/v1/auth/addresses/
// Usado por CheckoutPage y AddressesPage del paquete Yoruba.
// Agregado en H-F4-04 de adaptar-sistema-diseno-yoruba.
export const fetchAddresses = createAsyncThunk(
  'auth/fetchAddresses',
  async (_arg, { rejectWithValue }) => {
    try {
      const res = await apiService.get('/api/v1/auth/addresses/');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ── Aliases y thunks para compatibilidad con sistema de diseno Yoruba (F5, H-F5-01) ──

export const login             = loginUser;
export const logoutAllSessions = logoutUser;
export const resendVerification = resendVerificationEmail;

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/v1/auth/password-reset/', { email });
      return res.data;
    } catch (error) { return rejectWithValue(error.message); }
  },
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async ({ uid, token, new_password }, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/v1/auth/password-reset/confirm/', { uid, token, new_password });
      return res.data;
    } catch (error) { return rejectWithValue(error.message); }
  },
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await apiService.patch('/api/v1/auth/profile/avatar/', fd);
      return res.data;
    } catch (error) { return rejectWithValue(error.message); }
  },
);
