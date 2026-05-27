# Tareas: Adaptar sistema de diseno Yoruba

## F0 - Analisis + PM docs

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-001 | Analizar paquete de referencia: inventario, hallazgos, estrategia | Hecha |
| T-002 | Crear 5 documentos PM | Hecha |

## F1 - Tokens y tipografia

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-101 | Auditar hex hardcodeados en `.scss` | Pendiente |
| T-102 | Reemplazar `_variables.scss` | Pendiente |
| T-103 | Agregar `_typography.scss` | Pendiente |
| T-104 | Importar `_typography` en `main.scss` | Pendiente |
| T-105 | Agregar alias `@assets` en webpack | Pendiente |
| T-106 | Copiar logo a `src/assets/` | Pendiente |
| T-107 | Verificar build tras cambio de variables | Pendiente |

## F2 - Adaptacion del shape de datos

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-201 | `transform-catalog.mjs`: agregar `image_url` | Pendiente |
| T-202 | Regenerar `catalog.ts` | Pendiente |
| T-203 | `wishlistSlice`: agregar `toggleWishlist` | Pendiente |
| T-204 | `catalogSlice`: agregar `fetchFeaturedProducts` | Pendiente |
| T-205 | `catalogSlice`: agregar `fetchCategories` | Pendiente |
| T-206 | Handler MSW: filtro `?is_featured=true` | Pendiente |

## F3 - Componentes base

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-301 | Adaptar `Header` | Pendiente |
| T-302 | Adoptar `Footer` | Pendiente |
| T-303 | Adaptar `ProductCard` | Pendiente |
| T-304 | Adoptar `AccountSidebar` | Pendiente |
| T-305 | Adoptar `primitives/` | Pendiente |
| T-306 | Verificar ProductCard en dev server | Pendiente |

## F4 - Paginas del storefront

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-401 | Adaptar `CatalogPage` | Pendiente |
| T-402 | Adaptar `ProductPage` | Pendiente |
| T-403 | Adaptar `HomePage` | Pendiente |
| T-404 | Adaptar `CartPage` | Pendiente |
| T-405 | Adaptar `CheckoutPage`, `OrderSuccessPage` | Pendiente |
| T-406 | Agregar paginas nuevas de pago | Pendiente |

## F5 - Cuenta y auth

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-501 | Adaptar `LoginPage`, `RegisterPage` | Pendiente |
| T-502 | Adaptar paginas auth restantes | Pendiente |
| T-503 | Adaptar `AccountPage`, `ProfilePage` | Pendiente |
| T-504 | Adaptar paginas de pedidos | Pendiente |
| T-505 | Adaptar paginas de cuenta restantes | Pendiente |

## F6 - Panel administrativo

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-601 | Adoptar `AdminSidebar`, `AdminLayout` | Pendiente |
| T-602 | Adaptar paginas admin v4 | Pendiente |
| T-603 | Adaptar Users, UserDetail | Pendiente |
| T-604 | Adoptar paginas admin v6 | Pendiente |
| T-605 | Adoptar paginas admin v7 | Pendiente |
| T-606 | Adoptar paginas admin v8 | Pendiente |
| T-607 | Thunks faltantes en `adminSlice` | Pendiente |
| T-608 | AppRouter: merge manual | Pendiente |

## F7 - Verificacion y cierre

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-701 | `npm run build:demo` sin errores | Pendiente |
| T-702 | Verificacion visual en dev server | Pendiente |
| T-703 | `npm test`: 0 regresiones | Pendiente |
| T-704 | `decisiones-*.md` y cierre | Pendiente |
