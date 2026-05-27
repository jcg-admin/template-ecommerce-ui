# Tareas: Corregir deuda diseno Yoruba

## F2 — Resolver aliases de compatibilidad en _variables.scss

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-201 | Reemplazar variables legacy en modulos SCSS de components/catalog/ | `src/components/catalog/*.module.scss` (batch) | Hecha |
| T-202 | Reemplazar variables legacy en modulos SCSS de components/layout/ | `src/components/layout/**/*.module.scss` (batch) | Hecha |
| T-203 | Reemplazar variables legacy en modulos SCSS de components/account/ | `src/components/account/**/*.module.scss` (batch) | Hecha |
| T-204 | Reemplazar variables legacy en modulos SCSS de components/admin/ | `src/components/admin/**/*.module.scss` (batch) | Hecha |
| T-205 | Reemplazar variables legacy en modulos SCSS de components/common/ | `src/components/common/**/*.module.scss` (batch) | Hecha |
| T-206 | Reemplazar variables legacy en modulos SCSS de components/checkout/ y raiz | `src/components/checkout/**/*.module.scss` (batch) | Hecha |
| T-207 | Reemplazar variables legacy en modulos SCSS de pages/catalog/ | `src/pages/catalog/*.module.scss` (batch) | Hecha |
| T-208 | Reemplazar variables legacy en modulos SCSS de pages/account/ | `src/pages/account/*.module.scss` (batch) | Hecha |
| T-209 | Reemplazar variables legacy en modulos SCSS de pages/admin/ | `src/pages/admin/*.module.scss` (batch) | Hecha |
| T-210 | Reemplazar variables legacy en modulos SCSS de pages/auth/ y pages/ raiz | `src/pages/auth/*.module.scss`, `src/pages/*.module.scss` (batch) | Hecha |
| T-211 | Reemplazar variables legacy en modulos SCSS de pages/cart/, cart/, checkout/ | `src/pages/cart/*.module.scss`, `src/pages/checkout/*.module.scss` (batch) | Hecha |
| T-212 | Reemplazar variables legacy en styles/ (non-variables) | `src/styles/**/*.scss` (excluye _variables.scss) | Hecha |
| T-213 | Eliminar los 4 bloques de aliases de _variables.scss | `src/styles/abstracts/_variables.scss` | Hecha |
| T-214 | Verificar build tras eliminar aliases | (verificacion) | Hecha |

## F3 — Adaptar NotFoundPage

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-301 | Adoptar NotFoundPage.jsx del paquete con rutas EN | `src/pages/NotFoundPage.jsx` | Hecha |
| T-302 | Adoptar NotFoundPage.module.scss del paquete | `src/pages/NotFoundPage.module.scss` | Hecha |

## F1 — Corregir tests de componentes (18 suites)

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-101 | Corregir Header.test.jsx | `src/components/layout/Header/Header.test.jsx` | Hecha |
| T-102 | Corregir RelatedProductsSection.test.jsx | `src/components/catalog/RelatedProductsSection.test.jsx` | Hecha |
| T-103 | Corregir CartPage.test.jsx (shape item.name -> product_name) | `src/pages/cart/CartPage.test.jsx` | Hecha |
| T-104 | Corregir CatalogPage.test.jsx | `src/pages/catalog/CatalogPage.test.jsx` | Hecha |
| T-105 | Corregir ProductPage.test.jsx | `src/pages/catalog/ProductPage.test.jsx` | Hecha |
| T-106 | Corregir SearchResultsPage.test.jsx | `src/pages/catalog/SearchResultsPage.test.jsx` | Hecha |
| T-107 | Corregir HomePage.test.jsx | `src/pages/home/HomePage.test.jsx` | Hecha |
| T-108 | Corregir CheckoutPage.test.jsx | `src/pages/checkout/CheckoutPage.test.jsx` | Hecha |
| T-109 | Corregir WishlistPage.test.jsx | `src/pages/account/WishlistPage.test.jsx` | Hecha |
| T-110 | Corregir AddressesPage.test.jsx | `src/pages/account/AddressesPage.test.jsx` | Hecha |
| T-111 | Corregir OrderDetailPage.test.jsx | `src/pages/account/OrderDetailPage.test.jsx` | Hecha |
| T-112 | Corregir VerifyEmailPage.test.jsx | `src/pages/auth/VerifyEmailPage.test.jsx` | Hecha |
| T-113 | Corregir AdminUsersPage.test.jsx | `src/pages/admin/AdminUsersPage.test.jsx` | Hecha |
| T-114 | Corregir AdminUsersPage.roleChange.test.jsx | `src/pages/admin/AdminUsersPage.roleChange.test.jsx` | Hecha |
| T-115 | Corregir AdminUserDetailPage.test.jsx | `src/pages/admin/AdminUserDetailPage.test.jsx` | Hecha |
| T-116 | Corregir AdminProductsPage.test.jsx | `src/pages/admin/AdminProductsPage.test.jsx` | Hecha |
| T-117 | Corregir AccountPage.test.jsx | `tests/unit/pages/AccountPage.test.jsx` | Hecha |
| T-118 | Corregir ProfilePage.test.jsx | `tests/unit/pages/ProfilePage.test.jsx` | Hecha |

## F4 — Verificacion y cierre

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-401 | `npm test -- --watchAll=false`: 0 suites fallidas | (verificacion) | Hecha |
| T-402 | `npm run build`: EXIT=0 sin nuevos errores | (verificacion) | Hecha |
| T-403 | Crear `decisiones-corregir-deuda-diseno-yoruba.md` | `docs/pm/iniciativas/corregir-deuda-diseno-yoruba/decisiones-*.md` | Hecha |
| T-404 | Cerrar index, tareas, indice; ejecutar I-015; commit de cierre | (cierre) | Hecha |
