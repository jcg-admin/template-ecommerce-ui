/**
 * Admin Slice — ecommerce-ui
 * Gestión de usuarios desde el panel admin.
 *
 * Sprint 4:
 *   UC-AUTH-12 — Ver perfil de usuario (Admin)
 *   UC-AUTH-13 — Suspender cuenta de usuario
 *   UC-AUTH-14 — Reactivar cuenta de usuario
 *   UC-AUTH-15 — Crear usuario administrador
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';

const ADMIN_USERS_URL = '/api/v1/admin/users/';

// =============================================================================
// Thunks
// =============================================================================

/** UC-AUTH-11: Listar usuarios con búsqueda y paginación */
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiService.get(ADMIN_USERS_URL, { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** UC-AUTH-12: Ver perfil completo de un usuario */
export const fetchAdminUser = createAsyncThunk(
  'admin/fetchUser',
  async (pk, { rejectWithValue }) => {
    try {
      const res = await apiService.get(`${ADMIN_USERS_URL}${pk}/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** UC-AUTH-13: Suspender cuenta de usuario */
export const suspendUser = createAsyncThunk(
  'admin/suspendUser',
  async (pk, { rejectWithValue }) => {
    try {
      const res = await apiService.post(`${ADMIN_USERS_URL}${pk}/suspend/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** UC-AUTH-14: Reactivar cuenta de usuario */
export const reactivateUser = createAsyncThunk(
  'admin/reactivateUser',
  async (pk, { rejectWithValue }) => {
    try {
      const res = await apiService.post(`${ADMIN_USERS_URL}${pk}/reactivate/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** UC-AUTH-15: Crear usuario administrador */
export const createAdminUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await apiService.post(ADMIN_USERS_URL, userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// =============================================================================
// Slice
// =============================================================================

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users:       [],
    currentUser: null,
    pagination: {
      count:      0,
      page:       1,
      pageSize:   20,
      totalPages: 0,
      next:       null,
      previous:   null,
    },
    search: '',

    metrics:          null,   // BUG-ADM-01: agregado — antes no existía
    isLoadingMetrics: false,
    metricsError:     null,
    // BUG-ADM-05: listado de órdenes admin
    orders:           [],
    isLoadingOrders:  false,
    // BUG-ADM-02: orden admin individual
    currentOrder:     null,
    isLoadingOrder:   false,
    // BUG-ADM-03: vouchers admin
    vouchers:         [],
    isLoadingVouchers: false,
    // BUG-ADM-04: categorías admin
    categoryTree:     [],
    isLoadingCategories: false,
    isLoading:        false,
    isLoadingUser:    false,
    isActioning:      false,   // suspend / reactivate / create
    error:            null,
    userError:        null,
    actionError:      null,
    lastAction:       null,    // 'suspended' | 'reactivated' | 'created'
    // HALLAZGO-ADMIN-SLICE-01: claves agregadas 2026-05-28
    currentProduct:     null,
    isLoadingProduct:   false,
    products:           [],
    isLoadingProducts:  false,
    productImages:      [],
    csvImport:          { status: 'idle', result: null, errors: [] },
    productVariants:    [],
    isLoadingVariants:  false,
    variantTypes:       [],
    isLoadingVariantTypes: false,
    gateways:           [],
    isLoadingGateways:  false,
    gatewayTestResults: {},
    shippingMethods:    [],
    isLoadingShipping:  false,
    staticPages:        [],
    currentPage:        null,
    isLoadingPages:     false,
    currentVoucher:     null,
    isLoadingVoucher:   false,
    voucherChangelog:   [],
    inventoryDashboard: null,
    stockAlerts:        [],
    isLoadingInventory: false,
    isLoadingAlerts:    false,
    siteSettings:       null,
    isLoadingSettings:  false,
  },

  reducers: {
    setSearch(state, action) {
      state.search         = action.payload;
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.userError   = null;
    },
    clearActionState(state) {
      state.actionError = null;
      state.lastAction  = null;
    },
  },

  extraReducers: (builder) => {
    // fetchAdminUsers
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        const { results, count, next, previous } = action.payload;
        state.users                  = results ?? [];
        state.pagination.count       = count ?? 0;
        state.pagination.next        = next ?? null;
        state.pagination.previous    = previous ?? null;
        state.pagination.totalPages  = count
          ? Math.ceil(count / state.pagination.pageSize)
          : 0;
        state.isLoading = false;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // fetchAdminUser
    builder
      .addCase(fetchAdminUser.pending, (state) => {
        state.isLoadingUser = true;
        state.userError     = null;
        state.currentUser   = null;
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.currentUser   = action.payload;
        state.isLoadingUser = false;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.isLoadingUser = false;
        state.userError     = action.payload;
      });

    // suspendUser
    builder
      .addCase(suspendUser.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(suspendUser.fulfilled, (state) => {
        state.isActioning = false;
        state.lastAction  = 'suspended';
        // Actualizar en lista local si existe
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, is_active: false };
        }
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      });

    // reactivateUser
    builder
      .addCase(reactivateUser.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(reactivateUser.fulfilled, (state) => {
        state.isActioning = false;
        state.lastAction  = 'reactivated';
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, is_active: true };
        }
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      });

    // createAdminUser
    builder
      .addCase(createAdminUser.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.isActioning = false;
        state.lastAction  = 'created';
        state.users       = [action.payload, ...state.users];
        state.pagination.count += 1;
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload;
      })
      // fetchAdminProducts — lista de productos del panel admin
      .addCase(fetchAdminProducts.pending, (state) => {
        state.isLoadingProducts = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.isLoadingProducts = false;
        const payload = action.payload ?? {};
        state.products = payload.results ?? payload ?? [];
      })
      .addCase(fetchAdminProducts.rejected, (state) => {
        state.isLoadingProducts = false;
      })
      // BUG-ADM-05: fetchAdminOrders (listado paginado)
      .addCase(fetchAdminOrders.pending,   (state) => { state.isLoadingOrders = true; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoadingOrders = false;
        state.orders = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchAdminOrders.rejected,  (state) => { state.isLoadingOrders = false; })
      // BUG-ADM-02: fetchAdminOrder, updateOrderStatus, adminCancelOrder
      .addCase(fetchAdminOrder.pending,   (state) => { state.isLoadingOrder = true; })
      .addCase(fetchAdminOrder.fulfilled, (state, action) => {
        state.isLoadingOrder = false;
        state.currentOrder   = action.payload ?? null;
      })
      .addCase(fetchAdminOrder.rejected,  (state) => { state.isLoadingOrder = false; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (state.currentOrder) state.currentOrder.status = action.payload?.status;
      })
      .addCase(adminCancelOrder.fulfilled, (state) => {
        if (state.currentOrder) state.currentOrder.status = 'CANCELLED';
      })
      // BUG-ADM-03: fetchAdminVouchers
      .addCase(fetchAdminVouchers.pending,   (state) => { state.isLoadingVouchers = true; })
      .addCase(fetchAdminVouchers.fulfilled, (state, action) => {
        state.isLoadingVouchers = false;
        state.vouchers = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchAdminVouchers.rejected,  (state) => { state.isLoadingVouchers = false; })
      // BUG-ADM-04: fetchAdminCategories, createCategory, updateCategory
      .addCase(fetchAdminCategories.pending,   (state) => { state.isLoadingCategories = true; })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.isLoadingCategories = false;
        state.categoryTree = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchAdminCategories.rejected,  (state) => { state.isLoadingCategories = false; })
      .addCase(createCategory.fulfilled, (state, action) => {
        if (action.payload) state.categoryTree.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.categoryTree.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.categoryTree[idx] = action.payload;
      })
            // BUG-ADM-01 corregido: fetchAdminMetrics sin addCase — state.metrics nunca se actualizaba
      .addCase(fetchAdminMetrics.pending, (state) => {
        state.isLoadingMetrics = true;
        state.metricsError     = null;
      })
      .addCase(fetchAdminMetrics.fulfilled, (state, action) => {
        state.isLoadingMetrics = false;
        state.metrics          = action.payload ?? null;
      })

      // ── BUG-TH-03: fetchInventoryDashboard ───────────────────────────────
      .addCase(fetchInventoryDashboard.pending,   (state) => {
        state.isLoadingInventory = true;
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.isLoadingInventory  = false;
        state.inventoryDashboard  = action.payload ?? null;
      })
      .addCase(fetchInventoryDashboard.rejected,  (state) => {
        state.isLoadingInventory  = false;
      })

      // ── BUG-TH-03: fetchStockAlerts ──────────────────────────────────────
      .addCase(fetchStockAlerts.pending,   (state) => {
        state.isLoadingAlerts = true;
      })
      .addCase(fetchStockAlerts.fulfilled, (state, action) => {
        state.isLoadingAlerts = false;
        state.stockAlerts     = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchStockAlerts.rejected,  (state) => {
        state.isLoadingAlerts = false;
      })

      // ── BUG-SL-03: fetchSiteSettings + updateSiteSettings ────────────────
      .addCase(fetchSiteSettings.pending,   (state) => {
        state.isLoadingSettings = true;
      })
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        state.isLoadingSettings = false;
        state.siteSettings      = action.payload ?? null;
      })
      .addCase(fetchSiteSettings.rejected,  (state) => {
        state.isLoadingSettings = false;
      })
      .addCase(updateSiteSettings.pending,   (state) => {
        state.isActioning = true;
      })
      .addCase(updateSiteSettings.fulfilled, (state, action) => {
        state.isActioning  = false;
        state.siteSettings = action.payload ?? state.siteSettings;
        state.lastAction   = 'settings_updated';
      })
      .addCase(updateSiteSettings.rejected,  (state, action) => {
        state.isActioning  = false;
        state.actionError  = action.payload ?? null;
      })

      // ── BUG-SL-04: fetchAdminVoucher + CRUD ──────────────────────────────
      .addCase(fetchAdminVoucher.pending,   (state) => {
        state.isLoadingVoucher = true;
      })
      .addCase(fetchAdminVoucher.fulfilled, (state, action) => {
        state.isLoadingVoucher = false;
        state.currentVoucher   = action.payload ?? null;
      })
      .addCase(fetchAdminVoucher.rejected,  (state) => {
        state.isLoadingVoucher = false;
      })
      .addCase(createVoucher.pending,   (state) => { state.isActioning = true; })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.isActioning    = false;
        state.currentVoucher = action.payload ?? null;
        state.lastAction     = 'created';
      })
      .addCase(createVoucher.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })
      .addCase(updateVoucher.pending,   (state) => { state.isActioning = true; })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.isActioning    = false;
        state.currentVoucher = action.payload ?? null;
        state.lastAction     = 'updated';
      })
      .addCase(updateVoucher.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })
      .addCase(deleteVoucher.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteVoucher.fulfilled, (state) => {
        state.isActioning    = false;
        state.currentVoucher = null;
        state.lastAction     = 'deleted';
      })
      .addCase(deleteVoucher.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })

      // ── fetchAdminPages + fetchAdminPage + savePageDraft + publishPage ────
      .addCase(fetchAdminPages.pending,   (state) => {
        state.isLoadingPages = true;
      })
      .addCase(fetchAdminPages.fulfilled, (state, action) => {
        state.isLoadingPages = false;
        state.staticPages    = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchAdminPages.rejected,  (state) => {
        state.isLoadingPages = false;
      })
      .addCase(fetchAdminPage.pending,   (state) => {
        state.isLoadingPages = true;
      })
      .addCase(fetchAdminPage.fulfilled, (state, action) => {
        state.isLoadingPages = false;
        state.currentPage    = action.payload ?? null;
      })
      .addCase(fetchAdminPage.rejected,  (state) => {
        state.isLoadingPages = false;
      })
      .addCase(savePageDraft.pending,   (state) => { state.isActioning = true; })
      .addCase(savePageDraft.fulfilled, (state, action) => {
        state.isActioning = false;
        state.currentPage = action.payload ?? state.currentPage;
        state.lastAction  = 'draft_saved';
      })
      .addCase(savePageDraft.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })
      .addCase(publishPage.pending,   (state) => { state.isActioning = true; })
      .addCase(publishPage.fulfilled, (state, action) => {
        state.isActioning = false;
        state.currentPage = { ...state.currentPage, ...action.payload };
        state.lastAction  = 'published';
      })
      .addCase(publishPage.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })
      .addCase(fetchAdminMetrics.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.metricsError     = action.payload ?? 'Error al cargar métricas';
      });
  },
});

export const {
  setSearch, setPage,
  clearCurrentUser, clearActionState,
} = adminSlice.actions;

export default adminSlice.reducer;

// ── Thunks para el sistema de diseno Yoruba — panel admin (F6, H-F6-01) ──

export const fetchAdminMetrics = createAsyncThunk(
  'admin/metrics', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/metrics/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchAdminOrders = createAsyncThunk(
  'admin/orders', async (params = {}, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/orders/', { params })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchAdminProducts = createAsyncThunk(
  'admin/products', async (params = {}, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/products/', { params })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct', async (id, { rejectWithValue }) => {
    try { await apiService.delete(`/api/v1/admin/products/${id}/`); return id; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const toggleProductFeatured = createAsyncThunk(
  'admin/toggleFeatured', async ({ id, is_featured }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/products/${id}/`, { is_featured })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const adjustProductStock = createAsyncThunk(
  'admin/adjustStock', async ({ productId, delta, reason }, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/products/${productId}/adjust-stock/`, { delta, reason })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const adjustVariantStock = createAsyncThunk(
  'admin/adjustVariantStock', async ({ variantId, delta, reason }, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/variants/${variantId}/adjust-stock/`, { delta, reason })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const adminCreateRefund = createAsyncThunk(
  'admin/createRefund', async ({ orderNumber, amount, reason }, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/orders/${orderNumber}/refund/`, { amount, reason })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchInventoryDashboard = createAsyncThunk(
  'admin/inventoryDashboard', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/inventory/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchStockAlerts = createAsyncThunk(
  'admin/stockAlerts', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/inventory/alerts/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchSiteSettings = createAsyncThunk(
  'admin/siteSettings', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/settings/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const updateSiteSettings = createAsyncThunk(
  'admin/updateSettings', async (data, { rejectWithValue }) => {
    try { return (await apiService.patch('/api/v1/admin/settings/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);
export const fetchAdminPages = createAsyncThunk(
  'admin/pages', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/pages/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// toggleUserActive: alias para suspender/reactivar según el estado del usuario
export const toggleUserActive = (userId) => async (dispatch, getState) => {
  const user = getState().admin.currentUser;
  if (user?.is_active) {
    return dispatch(suspendUser(userId));
  } else {
    return dispatch(reactivateUser(userId));
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// BUG-ADM-02: fetchAdminOrder, updateOrderStatus, adminCancelOrder
// Importados por AdminOrderDetailPage pero no definidos en el slice.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAdminOrder = createAsyncThunk(
  'admin/fetchAdminOrder',
  async (orderNumber, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/orders/${orderNumber}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderNumber, status, note }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/orders/${orderNumber}/status/`,
        { status, notes: note },
      )).data;
    }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const adminCancelOrder = createAsyncThunk(
  'admin/adminCancelOrder',
  async ({ orderNumber, reason }, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/orders/${orderNumber}/cancel/`,
        { reason },
      )).data;
    }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// BUG-ADM-03: fetchAdminVouchers, duplicateVoucher, toggleVoucherActive
// Importados por AdminVouchersPage pero no definidos en el slice.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAdminVouchers = createAsyncThunk(
  'admin/fetchAdminVouchers',
  async (params = {}, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/vouchers/', { params })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const duplicateVoucher = createAsyncThunk(
  'admin/duplicateVoucher',
  async (id, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/vouchers/${id}/duplicate/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const toggleVoucherActive = createAsyncThunk(
  'admin/toggleVoucherActive',
  async (id, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/vouchers/${id}/toggle/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// BUG-ADM-04: fetchAdminCategories, createCategory, updateCategory
// Importados por AdminCategoriesPage pero no definidos en el slice.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAdminCategories = createAsyncThunk(
  'admin/fetchAdminCategories',
  async (_, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/categories/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/categories/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/categories/${id}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// BUG-PS02: uploadPriceCSV, confirmPriceSync, downloadPriceTemplate
// Importados por AdminPriceSyncPage pero no definidos.
// ─────────────────────────────────────────────────────────────────────────────
export const uploadPriceCSV = createAsyncThunk(
  'admin/uploadPriceCSV',
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return (await apiService.post('/api/v1/admin/price-sync/preview-csv/', fd)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const confirmPriceSync = createAsyncThunk(
  'admin/confirmPriceSync',
  async (syncId, { rejectWithValue }) => {
    try {
      return (await apiService.post('/api/v1/admin/price-sync/apply-csv/', { sync_id: syncId })).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const downloadPriceTemplate = createAsyncThunk(
  'admin/downloadPriceTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get('/api/v1/admin/price-sync/template/');
      return res.data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// =============================================================================
// HALLAZGO-ADMIN-SLICE-01: Thunks faltantes — implementados 2026-05-28
// =============================================================================

// ── Producto detalle ─────────────────────────────────────────────────────────
export const fetchAdminProduct = createAsyncThunk(
  'admin/fetchProduct',
  async (id, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/products/${id}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/products/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/products/${id}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const uploadProductImage = createAsyncThunk(
  'admin/uploadProductImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      return (await apiService.post(`/api/v1/admin/products/${productId}/images/`, fd)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const deleteProductImage = createAsyncThunk(
  'admin/deleteProductImage',
  async ({ productId, imageId }, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/v1/admin/products/${productId}/images/${imageId}/`);
      return imageId;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const reorderProductImages = createAsyncThunk(
  'admin/reorderProductImages',
  async ({ productId, order }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/admin/products/${productId}/images/reorder/`, { order }
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Importación de productos ─────────────────────────────────────────────────
export const uploadProductCSV = createAsyncThunk(
  'admin/uploadProductCSV',
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return (await apiService.post('/api/v1/admin/products/import/', fd)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const confirmProductImport = createAsyncThunk(
  'admin/confirmProductImport',
  async (importId, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/products/import/${importId}/confirm/`
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const fetchImportStatus = createAsyncThunk(
  'admin/fetchImportStatus',
  async (importId, { rejectWithValue }) => {
    try {
      return (await apiService.get(`/api/v1/admin/products/import/${importId}/`)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const downloadImportTemplate = createAsyncThunk(
  'admin/downloadImportTemplate',
  async (_, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/products/import/template/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Variantes ────────────────────────────────────────────────────────────────
export const fetchProductVariants = createAsyncThunk(
  'admin/fetchProductVariants',
  async (productId, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/products/${productId}/variants/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const bulkUpdateVariants = createAsyncThunk(
  'admin/bulkUpdateVariants',
  async ({ productId, variants }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/admin/products/${productId}/variants/bulk/`, { variants }
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const regenerateVariants = createAsyncThunk(
  'admin/regenerateVariants',
  async (productId, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/products/${productId}/variants/regenerate/`
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Tipos de variante ────────────────────────────────────────────────────────
export const fetchVariantTypes = createAsyncThunk(
  'admin/fetchVariantTypes',
  async (productId, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/products/${productId}/variant-types/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createVariantType = createAsyncThunk(
  'admin/createVariantType',
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/products/${productId}/variant-types/`, data
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateVariantType = createAsyncThunk(
  'admin/updateVariantType',
  async ({ productId, typeId, data }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/admin/products/${productId}/variant-types/${typeId}/`, data
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const deleteVariantType = createAsyncThunk(
  'admin/deleteVariantType',
  async ({ productId, typeId }, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/v1/admin/products/${productId}/variant-types/${typeId}/`);
      return typeId;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const createVariantOption = createAsyncThunk(
  'admin/createVariantOption',
  async ({ productId, typeId, data }, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/products/${productId}/variant-types/${typeId}/options/`, data
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateVariantOption = createAsyncThunk(
  'admin/updateVariantOption',
  async ({ productId, typeId, optionId, data }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/admin/products/${productId}/variant-types/${typeId}/options/${optionId}/`, data
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const deleteVariantOption = createAsyncThunk(
  'admin/deleteVariantOption',
  async ({ productId, typeId, optionId }, { rejectWithValue }) => {
    try {
      await apiService.delete(
        `/api/v1/admin/products/${productId}/variant-types/${typeId}/options/${optionId}/`
      );
      return optionId;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Pasarelas de pago ────────────────────────────────────────────────────────
export const fetchGateways = createAsyncThunk(
  'admin/fetchGateways',
  async (_, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/gateways/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateGateway = createAsyncThunk(
  'admin/updateGateway',
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/gateways/${id}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const testGatewayConnection = createAsyncThunk(
  'admin/testGatewayConnection',
  async (gateway, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/gateways/${gateway}/test/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Métodos de envío ─────────────────────────────────────────────────────────
export const fetchShippingMethods = createAsyncThunk(
  'admin/fetchShippingMethods',
  async (_, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/shipping-methods/')).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createShippingMethod = createAsyncThunk(
  'admin/createShippingMethod',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/shipping-methods/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateShippingMethod = createAsyncThunk(
  'admin/updateShippingMethod',
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/shipping-methods/${id}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const deleteShippingMethod = createAsyncThunk(
  'admin/deleteShippingMethod',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/v1/admin/shipping-methods/${id}/`);
      return id;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Páginas estáticas (CMS) ──────────────────────────────────────────────────


export const fetchAdminPage = createAsyncThunk(
  'admin/fetchAdminPage',
  async (slug, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/pages/${slug}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const savePageDraft = createAsyncThunk(
  'admin/savePageDraft',
  async ({ slug, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/pages/${slug}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const publishPage = createAsyncThunk(
  'admin/publishPage',
  async (slug, { rejectWithValue }) => {
    try { return (await apiService.post(`/api/v1/admin/pages/${slug}/publish/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const restorePageVersion = createAsyncThunk(
  'admin/restorePageVersion',
  async ({ slug, versionId }, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/pages/${slug}/restore/${versionId}/`
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const createAdminPage = createAsyncThunk(
  'admin/createAdminPage',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/pages/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateAdminPage = createAsyncThunk(
  'admin/updateAdminPage',
  async ({ slug, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/pages/${slug}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Vouchers / Cupones ────────────────────────────────────────────────────────
export const fetchAdminVoucher = createAsyncThunk(
  'admin/fetchAdminVoucher',
  async (id, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/vouchers/${id}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createVoucher = createAsyncThunk(
  'admin/createVoucher',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/vouchers/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateVoucher = createAsyncThunk(
  'admin/updateVoucher',
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/vouchers/${id}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const deleteVoucher = createAsyncThunk(
  'admin/deleteVoucher',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/v1/admin/vouchers/${id}/`);
      return id;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Usuarios admin — acciones faltantes ─────────────────────────────────────
export const setUserActiveStatus = createAsyncThunk(
  'admin/setUserActiveStatus',
  async ({ userId, active }, { rejectWithValue }) => {
    try {
      const url = active
        ? `/api/v1/admin/users/${userId}/reactivate/`
        : `/api/v1/admin/users/${userId}/suspend/`;
      return (await apiService.post(url)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const resetUserPassword = createAsyncThunk(
  'admin/resetUserPassword',
  async (userId, { rejectWithValue }) => {
    try {
      return (await apiService.post(`/api/v1/admin/users/${userId}/reset-password/`)).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const makeUserAdmin = createAsyncThunk(
  'admin/makeUserAdmin',
  async ({ userId, isAdmin }, { rejectWithValue }) => {
    try {
      return (await apiService.patch(
        `/api/v1/admin/users/${userId}/`, { is_staff: isAdmin }
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

// ── Categorías — acciones faltantes ─────────────────────────────────────────
export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/v1/admin/categories/${id}/`);
      return id;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const moveCategoryNode = createAsyncThunk(
  'admin/moveCategoryNode',
  async ({ id, targetId, position }, { rejectWithValue }) => {
    try {
      return (await apiService.post(
        `/api/v1/admin/categories/${id}/move/`, { target: targetId, position }
      )).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);
