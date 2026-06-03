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
    variants:           [],
    isLoadingVariants:  false,
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
    pageVersions:       [],
    isLoadingPages:     false,
    currentVoucher:     null,
    isLoadingVoucher:   false,
    voucherChangelog:   [],
    inventoryDashboard: null,
    stockAlerts:        [],
    isLoadingInventory: false,
    isLoadingAlerts:    false,
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

      // ── fetchAdminPages + fetchAdminPage + savePageDraft ─────────────────
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
        // Las versiones vienen anidadas en el detail serializer (versions[]).
        state.pageVersions   = action.payload?.versions ?? [];
      })
      .addCase(fetchAdminPage.rejected,  (state) => {
        state.isLoadingPages = false;
      })
      .addCase(savePageDraft.pending,   (state) => { state.isActioning = true; })
      .addCase(savePageDraft.fulfilled, (state, action) => {
        state.isActioning = false;
        state.currentPage = action.payload ?? state.currentPage;
        state.pageVersions = action.payload?.versions ?? state.pageVersions;
        state.lastAction  = 'draft_saved';
      })
      .addCase(savePageDraft.rejected,  (state, action) => {
        state.isActioning = false;
        state.actionError = action.payload ?? null;
      })
      .addCase(fetchAdminMetrics.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.metricsError     = action.payload ?? 'Error al cargar métricas';
      })
      // ── Grupo A: fetch de datos ───────────────────────────────────────────
      .addCase(fetchAdminProduct.pending,   (state) => { state.isLoadingProduct = true; })
      .addCase(fetchAdminProduct.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.currentProduct   = action.payload ?? null;
      })
      .addCase(fetchAdminProduct.rejected,  (state) => { state.isLoadingProduct = false; })
      .addCase(fetchProductVariants.pending,   (state) => { state.isLoadingVariants = true; })
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.isLoadingVariants = false;
        state.variants          = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchProductVariants.rejected,  (state) => { state.isLoadingVariants = false; })
      .addCase(saveVariantChanges.pending,   (state) => { state.isActioning = true; })
      .addCase(saveVariantChanges.fulfilled, (state) => { state.isActioning = false; })
      .addCase(saveVariantChanges.rejected,  (state) => { state.isActioning = false; })
      .addCase(fetchVariantTypes.pending,   (state) => { state.isLoadingVariantTypes = true; })
      .addCase(fetchVariantTypes.fulfilled, (state, action) => {
        state.isLoadingVariantTypes = false;
        state.variantTypes          = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchVariantTypes.rejected,  (state) => { state.isLoadingVariantTypes = false; })
      .addCase(fetchGateways.pending,   (state) => { state.isLoadingGateways = true; })
      .addCase(fetchGateways.fulfilled, (state, action) => {
        state.isLoadingGateways = false;
        state.gateways          = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchGateways.rejected,  (state) => { state.isLoadingGateways = false; })
      .addCase(fetchShippingMethods.pending,   (state) => { state.isLoadingShipping = true; })
      .addCase(fetchShippingMethods.fulfilled, (state, action) => {
        state.isLoadingShipping = false;
        state.shippingMethods   = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchShippingMethods.rejected,  (state) => { state.isLoadingShipping = false; })
      // ── Grupo B: mutaciones ───────────────────────────────────────────────
      .addCase(createProduct.pending,   (state) => { state.isActioning = true; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isActioning    = false; state.currentProduct = action.payload ?? null;
        state.lastAction     = 'product_created';
      })
      .addCase(createProduct.rejected,  (state, action) => { state.isActioning = false; state.actionError = action.payload ?? null; })
      .addCase(updateProduct.pending,   (state) => { state.isActioning = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isActioning    = false; state.currentProduct = action.payload ?? state.currentProduct;
        state.lastAction     = 'product_updated';
      })
      .addCase(updateProduct.rejected,  (state, action) => { state.isActioning = false; state.actionError = action.payload ?? null; })
      .addCase(deleteProduct.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteProduct.fulfilled, (state) => { state.isActioning = false; state.currentProduct = null; state.lastAction = 'product_deleted'; })
      .addCase(deleteProduct.rejected,  (state, action) => { state.isActioning = false; state.actionError = action.payload ?? null; })
      .addCase(toggleProductFeatured.pending,   (state) => { state.isActioning = true; })
      .addCase(toggleProductFeatured.fulfilled, (state, action) => {
        state.isActioning = false;
        if (state.currentProduct && action.payload) state.currentProduct.is_featured = action.payload.is_featured;
      })
      .addCase(toggleProductFeatured.rejected,  (state) => { state.isActioning = false; })
      .addCase(adjustProductStock.pending,   (state) => { state.isActioning = true; })
      .addCase(adjustProductStock.fulfilled, (state) => { state.isActioning = false; })
      .addCase(adjustProductStock.rejected,  (state) => { state.isActioning = false; })
      .addCase(adjustVariantStock.pending,   (state) => { state.isActioning = true; })
      .addCase(adjustVariantStock.fulfilled, (state) => { state.isActioning = false; })
      .addCase(adjustVariantStock.rejected,  (state) => { state.isActioning = false; })
      .addCase(toggleVoucherActive.pending,   (state) => { state.isActioning = true; })
      .addCase(toggleVoucherActive.fulfilled, (state, action) => {
        state.isActioning = false;
        if (state.currentVoucher && action.payload) state.currentVoucher.is_active = action.payload.is_active;
      })
      .addCase(toggleVoucherActive.rejected,  (state) => { state.isActioning = false; })
      .addCase(createShippingMethod.pending,   (state) => { state.isActioning = true; })
      .addCase(createShippingMethod.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) state.shippingMethods = [...state.shippingMethods, action.payload];
      })
      .addCase(createShippingMethod.rejected,  (state) => { state.isActioning = false; })
      .addCase(updateShippingMethod.pending,   (state) => { state.isActioning = true; })
      .addCase(updateShippingMethod.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) { const i = state.shippingMethods.findIndex(m => m.id === action.payload.id); if (i >= 0) state.shippingMethods[i] = action.payload; }
      })
      .addCase(updateShippingMethod.rejected,  (state) => { state.isActioning = false; })
      .addCase(deleteShippingMethod.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteShippingMethod.fulfilled, (state, action) => {
        state.isActioning = false;
        state.shippingMethods = state.shippingMethods.filter(m => m.id !== action.payload?.id);
      })
      .addCase(deleteShippingMethod.rejected,  (state) => { state.isActioning = false; })
      .addCase(createVariantType.pending,   (state) => { state.isActioning = true; })
      .addCase(createVariantType.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) state.variantTypes = [...state.variantTypes, action.payload];
      })
      .addCase(createVariantType.rejected,  (state) => { state.isActioning = false; })
      .addCase(updateVariantType.pending,   (state) => { state.isActioning = true; })
      .addCase(updateVariantType.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) { const i = state.variantTypes.findIndex(t => t.id === action.payload.id); if (i >= 0) state.variantTypes[i] = action.payload; }
      })
      .addCase(updateVariantType.rejected,  (state) => { state.isActioning = false; })
      .addCase(deleteVariantType.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteVariantType.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload?.typeId !== undefined) state.variantTypes = state.variantTypes.filter(t => t.id !== action.payload.typeId);
      })
      .addCase(deleteVariantType.rejected,  (state) => { state.isActioning = false; })
      .addCase(deleteCategory.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isActioning = false;
        state.categoryTree = state.categoryTree.filter(c => c.id !== action.payload?.id);
      })
      .addCase(deleteCategory.rejected,  (state) => { state.isActioning = false; })
      .addCase(setUserActiveStatus.pending,   (state) => { state.isActioning = true; })
      .addCase(setUserActiveStatus.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) { const i = state.users.findIndex(u => u.id === action.payload.id); if (i >= 0) state.users[i] = action.payload; }
      })
      .addCase(setUserActiveStatus.rejected,  (state) => { state.isActioning = false; })
      .addCase(resetUserPassword.pending,   (state) => { state.isActioning = true; })
      .addCase(resetUserPassword.fulfilled, (state) => { state.isActioning = false; })
      .addCase(resetUserPassword.rejected,  (state) => { state.isActioning = false; })
      .addCase(makeUserAdmin.pending,   (state) => { state.isActioning = true; })
      .addCase(makeUserAdmin.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) { const i = state.users.findIndex(u => u.id === action.payload.id); if (i >= 0) state.users[i] = action.payload; }
      })
      .addCase(makeUserAdmin.rejected,  (state) => { state.isActioning = false; })
      .addCase(adminCreateRefund.pending,   (state) => { state.isActioning = true; })
      .addCase(adminCreateRefund.fulfilled, (state) => { state.isActioning = false; state.lastAction = 'refund_created'; })
      .addCase(adminCreateRefund.rejected,  (state) => { state.isActioning = false; })
      .addCase(fetchPublicPage.pending,   (state) => { state.isLoadingPages = true; })
      .addCase(fetchPublicPage.fulfilled, (state, action) => { state.isLoadingPages = false; state.currentPage = action.payload ?? null; })
      .addCase(fetchPublicPage.rejected,  (state) => { state.isLoadingPages = false; })
      .addCase(createAdminPage.pending,   (state) => { state.isActioning = true; })
      .addCase(createAdminPage.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) state.staticPages = [...state.staticPages, action.payload];
      })
      .addCase(createAdminPage.rejected,  (state) => { state.isActioning = false; })
      .addCase(updateAdminPage.pending,   (state) => { state.isActioning = true; })
      .addCase(updateAdminPage.fulfilled, (state, action) => { state.isActioning = false; state.currentPage = action.payload ?? state.currentPage; })
      .addCase(updateAdminPage.rejected,  (state) => { state.isActioning = false; })
      .addCase(updateGateway.pending,   (state) => { state.isActioning = true; })
      .addCase(updateGateway.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) { const i = state.gateways.findIndex(g => g.id === action.payload.id); if (i >= 0) state.gateways[i] = action.payload; }
      })
      .addCase(updateGateway.rejected,  (state) => { state.isActioning = false; })
      .addCase(testGatewayConnection.pending,   (state) => { state.isActioning = true; })
      .addCase(testGatewayConnection.fulfilled, (state) => { state.isActioning = false; })
      .addCase(testGatewayConnection.rejected,  (state) => { state.isActioning = false; })
      // ── Grupo C: upload/import ────────────────────────────────────────────
      .addCase(uploadPriceCSV.pending,   (state) => { state.isActioning = true; })
      .addCase(uploadPriceCSV.fulfilled, (state, action) => {
        state.isActioning = false;
        if (action.payload) state.csvImport = { ...state.csvImport, ...action.payload };
      })
      .addCase(uploadPriceCSV.rejected,  (state, action) => { state.isActioning = false; state.actionError = action.payload ?? null; })
      .addCase(confirmPriceSync.pending,   (state) => { state.isActioning = true; })
      .addCase(confirmPriceSync.fulfilled, (state) => { state.isActioning = false; state.csvImport = { status: 'idle', result: null, errors: [] }; state.lastAction = 'price_sync_confirmed'; })
      .addCase(confirmPriceSync.rejected,  (state) => { state.isActioning = false; })
      .addCase(uploadProductImage.pending,   (state) => { state.isActioning = true; })
      .addCase(uploadProductImage.fulfilled, (state) => { state.isActioning = false; })
      .addCase(uploadProductImage.rejected,  (state) => { state.isActioning = false; })
      .addCase(deleteProductImage.pending,   (state) => { state.isActioning = true; })
      .addCase(deleteProductImage.fulfilled, (state) => { state.isActioning = false; })
      .addCase(deleteProductImage.rejected,  (state) => { state.isActioning = false; })
      .addCase(reorderProductImages.pending,   (state) => { state.isActioning = true; })
      .addCase(reorderProductImages.fulfilled, (state) => { state.isActioning = false; })
      .addCase(reorderProductImages.rejected,  (state) => { state.isActioning = false; })
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
export const fetchAdminPages = createAsyncThunk(
  'admin/pages', async (_a, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/static-content/')).data; }
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
// BUG-ADM-03: fetchAdminVouchers, toggleVoucherActive
// Importados por AdminVouchersPage pero no definidos en el slice.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAdminVouchers = createAsyncThunk(
  'admin/fetchAdminVouchers',
  async (params = {}, { rejectWithValue }) => {
    try { return (await apiService.get('/api/v1/admin/vouchers/', { params })).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// El VoucherViewSet real solo expone @action activate/deactivate/report
// (apps/voucher/views.py:105,124,161). No hay endpoint toggle ni duplicate:
// toggle se resuelve eligiendo activate/deactivate según el estado actual.
export const toggleVoucherActive = createAsyncThunk(
  'admin/toggleVoucherActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      return (await apiService.post(`/api/v1/admin/vouchers/${id}/${action}/`)).data;
    } catch (e) { return rejectWithValue(e.message); }
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
// Contrato real (apps/catalogue/price_sync_views.py):
//   preview-csv → { session_id, valid_count, invalid_count,
//                   preview: [{sku, product_id, product_name, old_price,
//                              new_price, diff_pct}], errors: [{sku,error,line}] }
//   apply-csv   ← { session_id }  → { updated_count, message }
//   template    → GET price-sync/template.csv
// Normalizamos la respuesta de preview a la forma que consume la página
// (diffs/not_found/session_id) para no acoplar el render al naming del backend.
export const uploadPriceCSV = createAsyncThunk(
  'admin/uploadPriceCSV',
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = (await apiService.post('/api/v1/admin/price-sync/preview-csv/', fd)).data;
      const diffs = (data.preview ?? []).map((r) => ({
        sku:       r.sku,
        name:      r.product_name,
        old_price: Number(r.old_price),
        new_price: Number(r.new_price),
        diff_pct:  r.diff_pct,
      }));
      const total_increase = diffs.reduce((acc, d) => acc + (d.new_price - d.old_price), 0);
      return {
        session_id:    data.session_id,
        diffs,
        not_found:     data.errors ?? [],
        valid_count:   data.valid_count,
        invalid_count: data.invalid_count,
        total_increase,
      };
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const confirmPriceSync = createAsyncThunk(
  'admin/confirmPriceSync',
  async (sessionId, { rejectWithValue }) => {
    try {
      return (await apiService.post('/api/v1/admin/price-sync/apply-csv/', { session_id: sessionId })).data;
    } catch (e) { return rejectWithValue(e.message); }
  },
);

export const downloadPriceTemplate = createAsyncThunk(
  'admin/downloadPriceTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get('/api/v1/admin/price-sync/template.csv');
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

// Importación de productos: la página admin/products/import delega en
// inventorySlice.importProductsCsv → POST /api/v1/admin/inventory/import/
// (single-shot real). Los thunks products/import/* (upload/confirm/status/
// template) eran endpoints inventados sin respaldo en el backend real y se
// eliminaron junto con sus mocks.

// ── Variantes ────────────────────────────────────────────────────────────────
export const fetchProductVariants = createAsyncThunk(
  'admin/fetchProductVariants',
  async (productId, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/products/${productId}/variants/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

/**
 * Guardar cambios de varias variantes.
 *
 * El backend (ProductVariantAdminViewSet) NO expone un endpoint
 * `variants/bulk/`; cada variante se actualiza con un PATCH individual
 * al detail `variants/<id>/` (ViewSet.partial_update). Este thunk
 * recorre las variantes editadas y emite un PATCH por cada una.
 */
export const saveVariantChanges = createAsyncThunk(
  'admin/saveVariantChanges',
  async ({ productId, variants }, { rejectWithValue }) => {
    try {
      const results = [];
      for (const { id, ...changes } of variants) {
        const res = await apiService.patch(
          `/api/v1/admin/products/${productId}/variants/${id}/`, changes,
        );
        results.push(res.data);
      }
      return results;
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


// Real: StaticContentDetailView. La respuesta incluye las versiones anidadas
// (campo `versions[]` del StaticContentSerializer); no hay endpoint separado
// de versions/, ni de publish/ ni de restore/ (no existen en el backend).
export const fetchAdminPage = createAsyncThunk(
  'admin/fetchAdminPage',
  async (slug, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/static-content/${slug}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const fetchPublicPage = createAsyncThunk(
  'admin/fetchPublicPage',
  async (slug, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/static-content/${slug}/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

// Real: PATCH /api/v1/admin/static-content/:slug/ — edita la pagina y bumpea
// version (crea StaticContentVersion). No hay distincion borrador/publicado.
export const savePageDraft = createAsyncThunk(
  'admin/savePageDraft',
  async ({ slug, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/static-content/${slug}/`, data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const createAdminPage = createAsyncThunk(
  'admin/createAdminPage',
  async (data, { rejectWithValue }) => {
    try { return (await apiService.post('/api/v1/admin/static-content/', data)).data; }
    catch (e) { return rejectWithValue(e.message); }
  },
);

export const updateAdminPage = createAsyncThunk(
  'admin/updateAdminPage',
  async ({ slug, data }, { rejectWithValue }) => {
    try { return (await apiService.patch(`/api/v1/admin/static-content/${slug}/`, data)).data; }
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
