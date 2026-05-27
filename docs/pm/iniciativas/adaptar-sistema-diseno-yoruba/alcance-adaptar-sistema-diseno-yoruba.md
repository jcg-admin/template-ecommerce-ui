# Alcance: Adaptar sistema de diseno Yoruba

| Campo | Valor |
|-------|-------|
| Iniciativa | adaptar-sistema-diseno-yoruba |
| Estado | En ejecucion |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-27T07:41:35 |
| Iniciativa origen | (raiz) |

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0b (RF-6 activo: toca webpack.config.js + SCSS globals) |
| Red flags activos | RF-6 — fix toca infraestructura compartida (webpack config, SCSS globals) |
| Resultado | CONFIRMAR con expansion — H-08 era SPECULATIVE, ahora PROVEN con grep ejecutado |
| Evidencia H-01 | `grep -c "image_url" src/mocks/data/catalog.ts` → 0; campo no existe — PROVEN |
| Evidencia H-03 | `grep -n "toggleWishlist" src/redux/slices/wishlistSlice.js` → sin resultado — PROVEN |
| Evidencia H-04 | `grep -n "fetchFeatured\|fetchCategories" src/redux/slices/catalogSlice.js` → sin resultado — PROVEN |
| Evidencia H-05 | `grep -n "@assets" webpack.config.js` → sin resultado — PROVEN |
| Evidencia H-07 | `grep -n "catalogo" dist-yoruba-ui/src/components/layout/Header/index.jsx` → linea 27: `/catalogo?cat=por-orisha` — PROVEN |
| Evidencia H-08 | `grep -rn "#[0-9A-Fa-f]{6}" src/ --include="*.scss" \| grep -v "_variables"` → 31 hex totales (14 styles/tests fixtures, 1 components/, 16 pages/) — PROVEN |
| Iniciativas previas revisadas | `mapear-y-corregir-scss-completo` (En ejecucion/pausada) cubre hex en SCSS — verificado: no cierra H-08 porque esta pausada y no cubre el reemplazo de _variables.scss |

## Por que existe esta iniciativa

El template tiene el sistema de diseno generico del bootstrap inicial.
Se recibe un paquete de referencia (`dist-yoruba-ui`, 8 versiones) con
el sistema de diseno editorial de Practica Yoruba. La iniciativa
integra ese sistema de forma selectiva y adaptada, respetando las
convenciones del repo (`catalog/` en ingles, `images[0].url` en lugar
de `image_url`, slices existentes).

## Que esta dentro del alcance

### F1 — Tokens y tipografia
- Reemplazar `src/styles/abstracts/_variables.scss` con la paleta
  del brazalete (verde lima + vino + bronce + coral, tema oscuro)
- Agregar `src/styles/abstracts/_typography.scss` (Fraunces + IBM Plex)
- Importar `_typography.scss` en `src/styles/main.scss`
- Agregar alias `@assets` en `webpack.config.js`
- Copiar `practica-yoruba-logo.png` a `src/assets/`

### F2 — Adaptacion del shape de datos
- `transform-catalog.mjs`: agregar campo `image_url` como alias de
  `images[0].url` para compatibilidad con los componentes del paquete
- `wishlistSlice`: agregar `toggleWishlist` que llama a `addToWishlist`
  o `removeFromWishlist` segun el estado actual
- `catalogSlice`: agregar `fetchFeaturedProducts` y `fetchCategories`
- Handler MSW: agregar soporte para `?is_featured=true` en listado

### F3 — Componentes base
- `Header`: adaptar version del paquete a rutas en ingles, sin
  `@assets/logo` (usar ruta relativa hasta confirmar alias), integrando
  los selectors y slices existentes
- `Footer`: adoptar version del paquete (es nueva, no reemplaza)
- `ProductCard`: adaptar version del paquete usando `images[0].url`
  en lugar de `image_url`, sin `orisha_name` (campo inexistente)

### F4 — Paginas del storefront
- `CatalogPage`: sidebar de filtros + grid 3 columnas del paquete v3
- `ProductPage`: galeria + variantes + trust strip del paquete v3
- `HomePage`: featured products + categorias del paquete v2
- `CartPage`: version completa del paquete v2

### F5 — Paginas de cuenta y auth
- `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`
  (layout editorial split 50/50 de v3)
- `AccountPage`, `ProfilePage`, `OrdersPage`, `OrderDetailPage`,
  `WishlistPage`, `AddressesPage` (paginas de cuenta de v2+v3)

### F6 — Panel administrativo
- `AdminDashboard`, `AdminProducts`, `AdminOrders`, `AdminUsers`,
  `AdminUserDetail` (v4)
- Componentes nuevos: `AdminSidebar`, `AdminLayout`, `StockAdjustModal`,
  `RefundModal` (v4, v6, v7)
- Thunks faltantes en `adminSlice` (v4+, v6+)
- Paginas de operacion: categorias, inventario, vales, sitio (v6, v7)

### F7 — Verificacion y cierre
- `npm run build:demo` sin errores
- App visual correcta en dev server
- `decisiones-*.md` con todas las decisiones tomadas

## Criterio de completitud

1. La paleta visual del brazalete es visible en toda la app.
2. `npm run build:demo` compila sin errores.
3. Los handlers MSW siguen sirviendo datos (sin regresion).
4. Los tests existentes pasan (0 nuevas regresiones).
5. `ProductCard` muestra imagen, categoria y precio con la nueva paleta.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Aplicar `cp -R` masivo del paquete sin adaptacion | Romperia slices, rutas y tests |
| Traducir rutas de `/catalog/` a `/catalogo/` | El template usa convencion en ingles |
| Campo `orisha_name` en los datos del catalogo | No existe en el JSON del scraper de Oja Yoruba |
| Backend Django (serializers.py) | Es el servidor separado (`template-ecommerce-server`) |
| Tests de snapshot de componentes visuales | No hay snapshot tests en el repo |

## Estimacion de esfuerzo

| Fase | Archivos | Esfuerzo estimado |
|------|----------|-------------------|
| F0 | 0 (analisis) | Hecha |
| F1 | 4-5 archivos | 30 min |
| F2 | 3 archivos | 45 min |
| F3 | 6 archivos | 60 min |
| F4 | 8 archivos | 90 min |
| F5 | 10 archivos | 90 min |
| F6 | 15+ archivos | 120 min |
| F7 | verificacion | 30 min |
| **Total** | **~47 archivos** | **~8 horas** |
