/**
 * referralSlice — UC-PRO-05.
 *
 * Codigo de referido de la cuenta del comprador. Lectura del programa de
 * referidos mediante el thunk `fetchReferral`, que llama:
 *
 *   GET /api/v1/account/referral/
 *     -> { code, share_url, invited_count, rewards }
 *
 * Patron canonico D-010: serializeApiError preserva code / statusCode /
 * validationErrors (DEC-DOC-008: nunca silenciar errores).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';

const REFERRAL_URL = '/api/v1/account/referral/';

// =============================================================================
// Thunk
// =============================================================================

/** UC-PRO-05: obtiene el codigo de referido y las metricas del comprador. */
export const fetchReferral = createAsyncThunk(
  'referral/fetch',
  async (_arg, { rejectWithValue }) => {
    try {
      const res = await apiService.get(REFERRAL_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

// =============================================================================
// Slice
// =============================================================================

const initialState = {
  code:         null,
  shareUrl:     null,
  invitedCount: 0,
  rewards:      0,
  isLoading:    false,
  error:        null,
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,

  reducers: {
    clearReferralError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReferral.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchReferral.fulfilled, (state, action) => {
        const payload = action.payload ?? {};
        state.code         = payload.code ?? null;
        state.shareUrl     = payload.share_url ?? null;
        state.invitedCount = payload.invited_count ?? 0;
        state.rewards      = payload.rewards ?? 0;
        state.isLoading    = false;
      })
      .addCase(fetchReferral.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload ?? { message: 'Error al cargar el programa de referidos.' };
      });
  },
});

export const { clearReferralError } = referralSlice.actions;
export default referralSlice.reducer;
