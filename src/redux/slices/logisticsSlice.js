/**
 * logisticsSlice — dominio de logistica
 *
 * Endpoints alineados con el backend real (apps.logistics, P-13):
 *   UC-LOG-01  createShipmentGuide  POST   /api/v1/logistics/guides/
 *                                   body { order_id, courier_id, tracking_number, notes }
 *   UC-LOG-02  updateGuideStatus    PATCH  /api/v1/logistics/guides/:guideId/
 *                                   body { status, description }
 *   UC-LOG-06  fetchCouriers        GET    /api/v1/logistics/couriers/
 *              createCourier        POST   /api/v1/logistics/couriers/
 *              updateCourier        PATCH  /api/v1/logistics/couriers/:id/
 *              deleteCourier        DELETE /api/v1/logistics/couriers/:id/
 *   UC-LOG-08  confirmDelivery      POST   /api/v1/logistics/guides/:guideId/confirm-delivery/
 *
 * La lectura del panel (grupos A y B) la expone `useLogistics`.
 * Identificadores y campos en ingles (DEC-DOC-005).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';

// ─── UC-LOG-08 — confirmar entrega (preexistente) ───────────────────────────
export const confirmDelivery = createAsyncThunk(
  'logistics/confirmDelivery',
  async (guideId, { rejectWithValue }) => {
    try {
      const res = await apiService.post(
        `/api/v1/logistics/guides/${guideId}/confirm-delivery/`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

// ─── UC-LOG-01 — crear guia de envio (admin) ────────────────────────────────
// Real: POST /api/v1/logistics/guides/ con { order_id, courier_id,
// tracking_number, notes } (ShipmentGuideCreateSerializer).
export const createShipmentGuide = createAsyncThunk(
  'logistics/createShipmentGuide',
  async ({ orderId, courierId, trackingNumber, notes }, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/v1/logistics/guides/', {
        ...(orderId != null ? { order_id: orderId } : {}),
        ...(courierId != null ? { courier_id: courierId } : {}),
        ...(trackingNumber != null ? { tracking_number: trackingNumber } : {}),
        ...(notes != null ? { notes } : {}),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

// ─── UC-LOG-02 — actualizar estado de la guia (admin) ───────────────────────
// Real: PATCH /api/v1/logistics/guides/:guideId/ con { status, description }
// (ShipmentGuideDetailView). El tracking_number se fija al crear la guia y es
// inmutable; no existe endpoint para "registrar rastreo" por separado.
export const updateGuideStatus = createAsyncThunk(
  'logistics/updateGuideStatus',
  async ({ guideId, status, description }, { rejectWithValue }) => {
    try {
      const res = await apiService.patch(
        `/api/v1/logistics/guides/${guideId}/`,
        { status, ...(description != null ? { description } : {}) },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

// ─── UC-LOG-06 — CRUD de couriers / paqueterias (admin) ─────────────────────
const COURIERS_URL = '/api/v1/logistics/couriers/';

export const fetchCouriers = createAsyncThunk(
  'logistics/fetchCouriers',
  async (_arg, { rejectWithValue }) => {
    try {
      const res = await apiService.get(COURIERS_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const createCourier = createAsyncThunk(
  'logistics/createCourier',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiService.post(COURIERS_URL, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const updateCourier = createAsyncThunk(
  'logistics/updateCourier',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiService.patch(`${COURIERS_URL}${id}/`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const deleteCourier = createAsyncThunk(
  'logistics/deleteCourier',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`${COURIERS_URL}${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

const initialState = {
  isActioning:  false,
  actionError:  null,
  lastAction:   null,
  couriers:     [],     // UC-LOG-06
  currentGuide: null,   // UC-LOG-01 / UC-LOG-02
  error:        null,   // errores de lectura (fetchCouriers)
};

const logisticsSlice = createSlice({
  name: 'logistics',
  initialState,
  reducers: {
    clearLogisticsActionState(state) {
      state.actionError = null;
      state.lastAction  = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // UC-LOG-08 confirmDelivery
      .addCase(confirmDelivery.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(confirmDelivery.fulfilled, (state) => {
        state.isActioning = false; state.lastAction = 'delivery_confirmed';
      })
      .addCase(confirmDelivery.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      })

      // UC-LOG-01 createShipmentGuide
      .addCase(createShipmentGuide.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(createShipmentGuide.fulfilled, (state, action) => {
        state.isActioning  = false;
        state.lastAction   = 'guide_created';
        state.currentGuide = action.payload ?? null;
      })
      .addCase(createShipmentGuide.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      })

      // UC-LOG-02 updateGuideStatus
      .addCase(updateGuideStatus.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(updateGuideStatus.fulfilled, (state, action) => {
        state.isActioning  = false;
        state.lastAction   = 'guide_status_updated';
        state.currentGuide = { ...(state.currentGuide ?? {}), ...(action.payload ?? {}) };
      })
      .addCase(updateGuideStatus.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      })

      // UC-LOG-06 fetchCouriers
      .addCase(fetchCouriers.pending, (state) => {
        state.isActioning = true; state.error = null;
      })
      .addCase(fetchCouriers.fulfilled, (state, action) => {
        const payload = action.payload ?? {};
        const results = payload.results ?? payload ?? [];
        state.couriers    = Array.isArray(results) ? results : [];
        state.isActioning = false;
      })
      .addCase(fetchCouriers.rejected, (state, action) => {
        state.isActioning = false; state.error = action.payload;
      })

      // UC-LOG-06 createCourier
      .addCase(createCourier.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(createCourier.fulfilled, (state, action) => {
        state.isActioning = false;
        state.lastAction  = 'courier_created';
        if (action.payload) state.couriers.push(action.payload);
      })
      .addCase(createCourier.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      })

      // UC-LOG-06 updateCourier
      .addCase(updateCourier.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(updateCourier.fulfilled, (state, action) => {
        state.isActioning = false;
        state.lastAction  = 'courier_updated';
        const updated = action.payload;
        if (updated?.id != null) {
          state.couriers = state.couriers.map((c) =>
            c.id === updated.id ? { ...c, ...updated } : c,
          );
        }
      })
      .addCase(updateCourier.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      })

      // UC-LOG-06 deleteCourier
      .addCase(deleteCourier.pending, (state) => {
        state.isActioning = true; state.actionError = null;
      })
      .addCase(deleteCourier.fulfilled, (state, action) => {
        state.isActioning = false;
        state.lastAction  = 'courier_deleted';
        state.couriers    = state.couriers.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCourier.rejected, (state, action) => {
        state.isActioning = false; state.actionError = action.payload;
      });
  },
});

export const { clearLogisticsActionState } = logisticsSlice.actions;
export default logisticsSlice.reducer;
