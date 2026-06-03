/**
 * paymentsSlice — ecommerce-ui
 *
 * Pagos: thunks para mutaciones del dominio payments.
 *
 *   UC-PAY-01 — Iniciar pago Mercado Pago
 *   UC-PAY-02 — Iniciar pago PayPal
 *   UC-PAY-08 — Reintentar pago fallido
 *   UC-PAY-09 — Procesar reembolso manual (admin)
 *
 * Lecturas (estado de pago, historial, listado admin) viven en
 *   src/hooks/domain/usePayments.js via React Query.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';
import { withLogging } from '@decorators/withLogging';
import { withValidation, CommonValidators } from '@decorators/withValidation';

/**
 * Valida que el payload de un thunk de pago contenga un `order_id`
 * con forma de identificador (string o numero no vacio). Se usa para
 * `initiateMercadoPagoPayment` y `retryPayment`, que dependen de ese
 * campo para construir la request HTTP.
 */
const validatePaymentPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Payment payload is required' };
  }
  return CommonValidators.validateId('order_number')(payload.order_number);
};

// Endpoint canónico unificado (api: payments/urls.py): POST /payments/initiate/
// con {order_number, gateway, installments}. Reembolso admin: /payments/admin/<id>/refund/.
const INITIATE_URL        = '/api/v1/payments/initiate/';
const ADMIN_REFUND_URL    = '/api/v1/payments/admin';

// =============================================================================
// Thunks
// =============================================================================

/**
 * UC-PAY-01: inicia el pago con Mercado Pago.
 * Acepta `{ order_id, installments }` (installments opcional — UC-PAY-01-EXT MSI).
 * Respuesta esperada: `{ preference_id, payment_url }`.
 */
export const initiateMercadoPagoPayment = createAsyncThunk(
  'payments/initiateMercadoPago',
  withLogging(
    withValidation(
      async ({ order_number, installments }, { rejectWithValue }) => {
        try {
          const payload = { order_number, gateway: 'MERCADOPAGO' };
          if (installments) payload.installments = Number(installments);
          const res = await apiService.post(INITIATE_URL, payload);
          return res.data;
        } catch (err) {
          return rejectWithValue(serializeApiError(err));
        }
      },
      validatePaymentPayload,
      { throwOnError: true, fnName: 'payments/initiateMercadoPagoPayment' },
    ),
    'payments/initiateMercadoPagoPayment',
    { logArgs: true, logResult: false, logTime: true },
  ),
);

/**
 * UC-PAY-02: inicia el pago con PayPal.
 * Acepta `{ order_id }`. Respuesta: `{ paypal_order_id, approve_url }`.
 */
export const initiatePayPalPayment = createAsyncThunk(
  'payments/initiatePayPal',
  async ({ order_number }, { rejectWithValue }) => {
    try {
      const res = await apiService.post(INITIATE_URL, { order_number, gateway: 'PAYPAL' });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  }
);

/**
 * UC-PAY-08: reintenta el pago de una orden en `PENDING_PAYMENT`,
 * permitiendo cambiar el gateway.
 * Acepta `{ order_id, gateway }`. Respuesta: `{ preference_id|paypal_order_id, payment_url|approve_url }`.
 */
export const retryPayment = createAsyncThunk(
  'payments/retry',
  withLogging(
    withValidation(
      async ({ order_number, gateway }, { rejectWithValue }) => {
        try {
          // Reintento = re-iniciar el pago (posiblemente con otro gateway).
          const res = await apiService.post(INITIATE_URL, { order_number, gateway });
          return res.data;
        } catch (err) {
          return rejectWithValue(serializeApiError(err));
        }
      },
      validatePaymentPayload,
      { throwOnError: true, fnName: 'payments/retryPayment' },
    ),
    'payments/retryPayment',
    { logArgs: true, logResult: false, logTime: true },
  ),
);

/**
 * UC-PAY-09: el admin procesa manualmente un reembolso sobre un Payment APPROVED.
 * Acepta `{ payment_id, amount, reason }`.
 */
export const requestAdminRefund = createAsyncThunk(
  'payments/adminRefund',
  async ({ payment_id, amount, reason }, { rejectWithValue }) => {
    try {
      const url = `${ADMIN_REFUND_URL}/${payment_id}/refund/`;
      const res = await apiService.post(url, { amount, reason });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  }
);

// =============================================================================
// Slice
// =============================================================================

const initialState = {
  isActioning:    false,
  actionError:    null,
  lastAction:     null, // 'mp_initiated' | 'paypal_initiated' | 'retried' | 'refunded'
  lastInitiation: null, // { gateway, payment_url|approve_url, preference_id|paypal_order_id }
  lastRefund:     null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,

  reducers: {
    clearPaymentsActionState(state) {
      state.actionError    = null;
      state.lastAction     = null;
      state.lastInitiation = null;
      state.lastRefund     = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // initiateMercadoPagoPayment (UC-PAY-01)
      .addCase(initiateMercadoPagoPayment.pending, (state) => {
        state.isActioning    = true;
        state.actionError    = null;
        state.lastInitiation = null;
      })
      .addCase(initiateMercadoPagoPayment.fulfilled, (state, action) => {
        state.isActioning    = false;
        state.lastAction     = 'mp_initiated';
        state.lastInitiation = { gateway: 'mercadopago', ...action.payload };
      })
      .addCase(initiateMercadoPagoPayment.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      })

      // initiatePayPalPayment (UC-PAY-02)
      .addCase(initiatePayPalPayment.pending, (state) => {
        state.isActioning    = true;
        state.actionError    = null;
        state.lastInitiation = null;
      })
      .addCase(initiatePayPalPayment.fulfilled, (state, action) => {
        state.isActioning    = false;
        state.lastAction     = 'paypal_initiated';
        state.lastInitiation = { gateway: 'paypal', ...action.payload };
      })
      .addCase(initiatePayPalPayment.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      })

      // retryPayment (UC-PAY-08)
      .addCase(retryPayment.pending, (state) => {
        state.isActioning    = true;
        state.actionError    = null;
        state.lastInitiation = null;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        state.isActioning    = false;
        state.lastAction     = 'retried';
        state.lastInitiation = action.payload;
      })
      .addCase(retryPayment.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      })

      // requestAdminRefund (UC-PAY-09)
      .addCase(requestAdminRefund.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
        state.lastRefund  = null;
      })
      .addCase(requestAdminRefund.fulfilled, (state, action) => {
        state.isActioning = false;
        state.lastAction  = 'refunded';
        state.lastRefund  = action.payload;
      })
      .addCase(requestAdminRefund.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearPaymentsActionState } = paymentsSlice.actions;
export default paymentsSlice.reducer;

// ─── Thunks adicionales para el sistema de diseno Yoruba (F4) ───────────────

/**
 * initiatePayment — thunk unificado para iniciar un pago.
 * El paquete Yoruba usa initiatePayment({order_number, gateway}).
 * Internamente delega a paymentsSlice segun el gateway.
 * Agregado en H-F4-02 de adaptar-sistema-diseno-yoruba.
 */
export const initiatePayment = createAsyncThunk(
  'payments/initiatePayment',
  async ({ order_number, gateway }, { rejectWithValue }) => {
    try {
      const res = await apiService.post(
        `/api/v1/payments/${order_number}/initiate/`,
        { gateway },
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * fetchPaymentHistory — historial de intentos de pago de una orden.
 * GET /api/v1/payments/:order_number/history/
 * Usado por PaymentFailedPage. Agregado en H-F4-05.
 */
export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchPaymentHistory',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const res = await apiService.get(
        `/api/v1/payments/${orderNumber}/history/`,
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * fetchExpressEligibility — verifica si el usuario puede hacer express checkout.
 * GET /api/v1/checkout/eligibility/
 * Usado por ExpressCheckoutPage. Agregado en H-F4-05.
 */
export const fetchExpressEligibility = createAsyncThunk(
  'payments/fetchExpressEligibility',
  async (_arg, { rejectWithValue }) => {
    try {
      const res = await apiService.get('/api/v1/checkout/eligibility/');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * submitExpress — ejecuta el express checkout con los datos guardados.
 * POST /api/v1/checkout/express/
 * Usado por ExpressCheckoutPage. Agregado en H-F4-05.
 */
export const submitExpress = createAsyncThunk(
  'payments/submitExpress',
  async (_arg, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/v1/checkout/express/');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
