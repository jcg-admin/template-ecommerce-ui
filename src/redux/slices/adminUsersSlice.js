/**
 * adminUsersSlice — ecommerce-ui
 *
 * Mutaciones admin sobre usuarios. UC-ADM-01.
 *
 *   suspendUser       POST  /api/v1/admin/users/:id/suspend/
 *   reactivateUser    POST  /api/v1/admin/users/:id/reactivate/
 *
 * No hay accion de cambio de rol: AdminUserViewSet expone solo
 * http_method_names = ['get', 'post', ...] con las acciones suspend y
 * reactivate. No existe /admin/users/:id/role/ ni un PATCH de rol en el
 * backend, y el diseno Yoruba removio el selector de rol del UI. El thunk
 * changeUserRole anterior pegaba a una ruta inexistente y no lo consumia
 * ningun componente; se elimino para alinear con el backend real.
 *
 * El listado vive en `useAdminUsers` (React Query). Las mutaciones aqui
 * por consistencia con el resto del codigo admin.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';

const URL_BASE = '/api/v1/admin/users/';

export const suspendUser = createAsyncThunk(
  'adminUsers/suspend',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiService.post(`${URL_BASE}${id}/suspend/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const reactivateUser = createAsyncThunk(
  'adminUsers/reactivate',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiService.post(`${URL_BASE}${id}/reactivate/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

const initialState = { isActioning: false, actionError: null, lastAction: null };

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearAdminUsersActionState(state) {
      state.actionError = null;
      state.lastAction  = null;
    },
  },
  extraReducers: (builder) => {
    const startAction = (state) => { state.isActioning = true; state.actionError = null; };
    const failAction  = (state, action) => { state.isActioning = false; state.actionError = action.payload; };
    builder
      .addCase(suspendUser.pending, startAction)
      .addCase(suspendUser.fulfilled, (state) => { state.isActioning = false; state.lastAction = 'suspended'; })
      .addCase(suspendUser.rejected, failAction)
      .addCase(reactivateUser.pending, startAction)
      .addCase(reactivateUser.fulfilled, (state) => { state.isActioning = false; state.lastAction = 'reactivated'; })
      .addCase(reactivateUser.rejected, failAction);
  },
});

export const { clearAdminUsersActionState } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
