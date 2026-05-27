# Analisis: Adaptar sistema de diseno Yoruba

| Campo | Valor |
|-------|-------|
| Iniciativa | adaptar-sistema-diseno-yoruba |
| Fecha de creacion | 2026-05-27T07:41:35 |

## El paquete de referencia

`dist-yoruba-ui` es un paquete drop-in en 8 versiones incrementales
(v1..v8) que cubre:

| Version | Contenido |
|---------|-----------|
| v1 | Tokens (_variables.scss, _typography.scss), Header, Footer, ProductCard, logo |
| v2 | Paginas STUB: HomePage, CartPage, CheckoutPage, OrdersPage, WishlistPage, Addresses, Security, AppRouter |
| v3 | Re-skin de paginas existentes: CatalogPage, ProductPage, LoginPage, auth, AccountPage |
| v4 | Panel admin: AdminSidebar, AdminLayout, Dashboard, Products, Orders, Users |
| v5 | Storefront completo: VerifyEmailPage, OrderEditPage, SearchHistoryPage + 4 fixes |
| v6 | Admin operacion: AdminOrderDetail, AdminProductDetail, AdminCategories, Inventory, Vouchers |
| v7 | Admin config: SiteSettings, Gateways, Shipping, StaticPages, RefundModal |
| v8 | Admin bulk: ProductImport, PriceSync, VariantTypes, ProductVariants |

**Total**: 102 archivos, 45 nuevos + 57 reemplazos.

## Hallazgos del analisis

### H-01 — [PROVEN] CRITICO: `image_url` vs `images[0].url`

Evidencia:
```
grep -c "image_url" src/mocks/data/catalog.ts → 0
grep -m2 "images" src/mocks/data/catalog.ts   → "images": [ { url: "/catalog/images/..." } ]
```
El paquete usa `product.image_url` (string).

El paquete usa `product.image_url` (string). Nuestro catalogo genera
`product.images[0].url` (array de objetos). Todos los componentes del
paquete que muestran imagen del producto fallan silenciosamente.

**Decision**: agregar `image_url` como campo extra en el script de
transformacion:
```js
image_url: mainImg ? `/catalog/images/${mainImg}` : null,
```
Esto mantiene `images[]` para compatibilidad con ProductPage y agrega
`image_url` para compatibilidad con los componentes del paquete.

### H-02 — [PROVEN] MEDIO: `orisha_name` no existe en el catalogo

Evidencia:
```
grep -c "orisha" src/mocks/data/catalog.ts → 0
grep "campos disponibles" docs/pm/iniciativas/integrar-catalogo-oja-en-mocks/analisis-*.md
→ campos: slug, nombre, precio_actual, ... (sin orisha)
```

El ProductCard del paquete tiene un tag de orisha que no existe en
los datos de Oja Yoruba. La categoria Yoruba es `categoria_principal`
(ej. "Akoses / Medicinas") pero no hay relacion producto-orisha en el
scraper.

**Decision**: al adaptar ProductCard, omitir el tag de orisha. El
campo `orisha_name` no se agrega al catalogo porque no hay dato
fuente. Si en el futuro se quiere ese dato, es una iniciativa de
enriquecimiento de datos separada.

### H-03 — [PROVEN] MEDIO: `toggleWishlist` vs `addToWishlist`/`removeFromWishlist`

Evidencia:
```
grep -n "export" src/redux/slices/wishlistSlice.js
→ linea 28: export const fetchWishlist
→ linea 41: export const addToWishlist
→ linea 56: export const removeFromWishlist
→ linea 69: export const moveWishlistItemToCart
(toggleWishlist no aparece)
```

El paquete importa `toggleWishlist({ productId: id })`. Nuestro slice
tiene `addToWishlist` y `removeFromWishlist` separados.

**Decision**: agregar `toggleWishlist` como thunk en `wishlistSlice`
que recibe `{ productId, inWishlist }` y despacha el thunk correcto.
Alternativa mas simple: crear un action creator sincrono que los
componentes usen sin cambiar los thunks.

### H-04 — [PROVEN] MEDIO: `fetchFeaturedProducts` y `fetchCategories`

Evidencia:
```
grep -n "fetchFeatured\|fetchCategories\|is_featured" \
    src/redux/slices/catalogSlice.js → sin resultado

grep -n "export const" src/redux/slices/catalogSlice.js
→ fetchProducts, fetchProduct, searchProducts (no hay fetchFeatured ni fetchCategories)
```

Nuestro `catalogSlice` tiene `fetchProducts` (listado) y `fetchProduct`
(detalle). El paquete asume dos thunks adicionales:
- `fetchFeaturedProducts`: GET `/api/v1/catalogue/?is_featured=true`
- `fetchCategories`: GET `/api/v1/categories/`

El handler MSW de categorias ya existe y funciona. El filtro
`is_featured=true` requiere que el handler de listado lo soporte.

**Decision**: agregar ambos thunks en `catalogSlice` y actualizar el
handler MSW para filtrar por `is_featured`.

### H-05 — [PROVEN] BAJO: alias `@assets` faltante

Evidencia:
```
grep -n "@assets" webpack.config.js → sin resultado

grep -A25 "alias:" webpack.config.js
→ @app, @modules, @components, @hooks, @state, @redux,
  @services, @mocks, @styles, @utils, @types, @constants,
  @pages, @router, @config, @layouts, @context, @lib,
  @facades, @decorators  (sin @assets)
```

El Header del paquete importa: `import logoUrl from '@assets/...'`.
Nuestro webpack no tiene `@assets`. Hay que agregar:
```js
'@assets': path.resolve(__dirname, 'src/assets'),
```

### H-06 — [INFERRED] MEDIO: `adminSlice` incompleto para v4+

Razonamiento: el paquete v6+ importa `adjustProductStock`,
`adjustVariantStock`, `adminCreateRefund` de `adminSlice`. Nuestro
slice no los tiene.

Observables PROVEN:
```
grep -n "export const" src/redux/slices/adminSlice.js
→ fetchAdminUsers, fetchAdminUser, suspendUser,
  reactivateUser, createAdminUser
(adjustProductStock, adjustVariantStock, adminCreateRefund ausentes)
```

El impacto en runtime se infiere: la pagina que importe esos
action creators falla en tiempo de importacion con
"is not exported from". No se ha ejecutado la pagina concreta.

El paquete v6+ usa `adjustProductStock`, `adjustVariantStock`,
`adminCreateRefund`. Nuestro `adminSlice` no los tiene.

**Decision**: agregar los thunks faltantes fase por fase, solo cuando
se integre la pagina que los necesita.

### H-07 — [PROVEN] CRITICO: rutas del AppRouter en espanol vs ingles

Evidencia:
```
grep -n "catalogo\|mi-cuenta\|carrito" \
    dist-yoruba-ui/src/components/layout/Header/index.jsx
→ linea 27: { to: '/catalogo?cat=por-orisha', label: 'Por òrìsà' }
→ linea 28: { to: '/catalogo?cat=por-ritual', label: 'Por ritual' }

grep -n "catalog\|account\|cart" src/router/AppRouter.jsx | head -5
→ /catalog/:slug, /account, /cart (rutas en ingles)
```

El paquete usa `/catalogo/:slug`, `/mi-cuenta`, `/carrito`. Nuestro
router usa `/catalog/:slug`, `/account`, `/cart`.

**Decision**: al adaptar el AppRouter del paquete, mantener las rutas
en ingles (convencion del template). Cambiar los `to=` en los
componentes adaptados. No adoptar el AppRouter del paquete como
drop-in.

### H-08 — [PROVEN] CRITICO: `_variables.scss` es un reemplazo total (tema oscuro)

Evidencia del impacto en hex hardcodeados:
```
grep -rn "#[0-9A-Fa-f]{6}" src/ --include="*.scss" | grep -v "_variables"
→ 14 en src/styles/ (12 son fixtures de tests — no afectan UI)
→  1 en src/components/ — VariantSelector.module.scss:28: border-color: #b08a3c
→ 16 en src/pages/ — colores de UI hardcodeados:
     SearchResultsPage.module.scss:11      color: #6b5618
     AdminPaymentRefundPage.module.scss:28 border: 1px solid #cfc4b3
     AdminPaymentsPage.module.scss:18      border: 1px solid #cfc4b3
     AdminReturnDetailPage.module.scss:58  color: #5a36d0
     VerifyEmailPage.module.scss:79        border: 1px solid #d4c4a8
     VerifyEmailPage.module.scss:94        background: #c8b88a
     WishlistPage.module.scss:36           border: 1px solid #d4c4a8
     WishlistPage.module.scss:153          background: #c8b88a
     ReturnsPage.module.scss:76            color: #5a36d0
     ChangePasswordPage.module.scss:47     border: 1px solid #d4c4a8
     (y 6 mas en admin)
```

Impacto: al reemplazar `_variables.scss` con la paleta oscura, estos
17 hex de UI mantendran colores claros (bronce/beige/violeta) sobre
fondo `#0E1400`. Visualmente incorrectos pero no rotos en compilacion.

**Expansion del alcance (gate: CONFIRMAR+EXPANDIR):**
T-101 debe incluir decision sobre estos 17 hex: reemplazar en F1
o delegar a la iniciativa `mapear-y-corregir-scss-completo`.

## Mapa de adaptacion por componente

| Componente del paquete | Accion | Complejidad |
|------------------------|--------|-------------|
| `_variables.scss` | Reemplazar (drop-in) | Baja — es drop-in por diseno |
| `_typography.scss` | Agregar (nuevo) | Baja |
| `practica-yoruba-logo.png` | Agregar (nuevo) | Baja |
| `Header` | Adaptar (rutas EN, sin @assets hasta F1) | Media |
| `Footer` | Adoptar casi directo | Baja |
| `ProductCard` | Adaptar (image_url, sin orisha_name) | Media |
| `AccountSidebar` | Adoptar directo | Baja |
| `primitives/` | Adoptar directo | Baja |
| `AdminSidebar` | Adoptar directo | Baja |
| `AdminLayout` | Adoptar (verificar rutas) | Media |
| `StockAdjustModal` | Adoptar (agregar thunks) | Media |
| `RefundModal` | Adoptar (agregar thunks) | Media |
| `HomePage` | Adaptar (fetchFeaturedProducts, rutas EN) | Media-alta |
| `CatalogPage` | Adaptar (sidebar, rutas EN) | Media |
| `ProductPage` | Adaptar (images[0].url) | Media |
| `CartPage` | Adaptar (verificar slices) | Media |
| `LoginPage`/auth | Adoptar casi directo | Baja-media |
| Paginas cuenta | Adoptar con thunks | Media |
| Paginas admin | Adoptar con thunks | Media-alta |
| `AppRouter` | NO adoptar — hacer merge manual | Alta |

## Dependencias entre fases

```
F1 (tokens) → debe ir primero — base visual de todo
F2 (shape datos) → debe ir antes de F3 (componentes usan image_url)
F3 (componentes) → debe ir antes de F4-F6 (paginas usan componentes)
F4, F5, F6 → pueden ir en cualquier orden entre si
F7 → siempre al final
```
