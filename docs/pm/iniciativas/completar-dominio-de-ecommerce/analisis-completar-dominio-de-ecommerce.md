# Analisis — `completar-dominio-de-ecommerce`

| Campo | Valor |
|-------|-------|
| Iniciativa | `completar-dominio-de-ecommerce` |
| Documento | Mapeo formal de gap por item del alcance |
| Fecha | 2026-05-21 |

## Metodologia

Por cada uno de los 7 items del alcance, este analisis recoge:

1. **Estado real en el codigo**: que existe ya (archivos, slices,
   componentes, endpoints, tests), con evidencia citada.
2. **Estado en `domain.ts`**: que tipo declara hoy, si existe.
3. **Gap**: la diferencia exacta entre 1 y 2.
4. **Decision de modelado propuesta**: que campos debe declarar el
   tipo, justificado contra los criterios del template.

Lo que sigue **es el mapeo de evidencia**, no el diseno final. El
diseno final vive en `plan-*.md` (siguiente paso).

## Hallazgo central del analisis

**El patron real no es "entidades faltantes" sino "tipos faltantes
para entidades que ya existen en runtime"**.

El alcance se redacto asumiendo que entidades como `Address`,
`ProductVariant`, `Review` no existian en el template. La inspeccion
mostro que **todas existen en runtime** (slices, hooks, componentes,
paginas, tests), pero **ninguna esta declarada en `domain.ts`**.

El gap es de **tipado**, no de **dominio**. Esto:

- Reduce significativamente el esfuerzo (no hay UCs nuevos que
  implementar; los hay que tipar).
- Alinea con el item 7 del alcance ("divergencia tipo vs runtime"),
  que resulta ser **el item central**, no uno mas.
- Implica que el plan se simplifica a "tipar entidades existentes" y
  "alinear handlers MSW con los tipos", sin tareas de diseno de UI.

El hallazgo se registra en `progreso-*.md` con clase "Hallazgo durante
el analisis".

## Item 1 — `User` parcial

### Estado real

| Archivo | Evidencia |
|---------|-----------|
| `src/redux/slices/authSlice.js` | thunks `loginUser`, `logoutUser`, `registerUser`, `fetchProfile`, `updateProfile`, `changePassword`, `verifyEmail` |
| `src/types/domain.ts:37-49` | interface `User` con 9 campos opcionales en su mayoria |

### Estado en `domain.ts`

```ts
interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_staff?: boolean;
  profile_completeness?: number;
  pending_fields?: string[];
}
```

### Gap

Tres familias de campos no declarados que el JSDoc de cabecera
declara como faltantes:

- **Estado de cuenta**: `is_active` (banear sin borrar), `date_joined`,
  `last_login`.
- **Verificacion**: `email_verified`, `phone_verified`. Hay un thunk
  `verifyEmail` que sugiere que el backend lo expone, pero el tipo
  no lo refleja.
- **Roles granulares**: hoy solo `is_staff`. Un e-commerce comun
  distingue `customer`, `staff`, `admin`, `support`.

No hay sesiones activas ni politicas de bloqueo en runtime; estos
son fuera de alcance porque no hay UC declarado.

### Decision de modelado propuesta

Extender `User` con tres campos confirmados por el codigo:
`is_active`, `date_joined`, `email_verified`. `phone_verified` solo
si la pantalla de perfil lo muestra; verificar en
`ProfilePage.jsx`. Roles granulares: dejar como deuda registrada
para una iniciativa propia si el adoptante lo necesita (la mayoria
de e-commerce B2C funcionan con `is_staff`).

## Item 2 — `Address` no existe (tipo)

### Estado real

| Archivo | Evidencia |
|---------|-----------|
| `src/redux/slices/addressesSlice.js` | slice completo con 5 thunks: `fetchAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`. UC-AUTH-07 declarado. |
| `src/hooks/domain/useAddresses.js` | hook React Query para lecturas |
| `src/pages/account/AddressesPage.jsx` | pagina con form usando los campos `recipient`, `street`, `exterior_number`, `interior_number`, `neighborhood`, `city`, `state`, `postal_code`, `phone`, `country` (default `'MX'`), `is_default` |
| `tests/unit/reducers/ordersSlice.address.test.js` | tests que asumen el shape |
| Endpoints | `/api/v1/auth/addresses/`, `/api/v1/auth/addresses/:id/`, `/api/v1/auth/addresses/:id/set-default/` |

### Estado en `domain.ts`

**No existe**. La cabecera del modulo lo declara: "Address como
entidad reutilizable... pertenece a esta iniciativa".

### Gap

Tipo no declarado. Todo el runtime asume el shape de
`AddressesPage.jsx`. Once campos identificados:

```
id            number       PK
recipient     string       destinatario
street        string
exterior_number string
interior_number string?     opcional
neighborhood  string
city          string
state         string
postal_code   string
country       string       default 'MX'
phone         string       contacto
is_default    boolean
```

### Decision de modelado propuesta

Declarar `Address` con los 12 campos arriba. `interior_number` y
`is_default` opcionales; el resto requeridos.

## Item 3 — `ProductVariant` no existe (tipo)

### Estado real

| Archivo | Evidencia |
|---------|-----------|
| `src/components/catalog/VariantSelector/VariantSelector.jsx` | selector de variantes |
| `src/hooks/useAddProductWithVariant.js` | hook que ata producto + variante seleccionada al cart |
| `src/redux/slices/cartSlice.js:54` | `addToCart` envia `variant_id` |
| `src/redux/slices/inventorySlice.js:158-160` | filtra items por `variant_id` |
| `src/mocks/handlers/catalog.ts` (factory) | shape inline `variants: [{ id, name, sku, stock, price }]` |
| `src/types/domain.ts:117` | `CartItem.variant_id?: number` (referencia, no entidad) |

### Estado en `domain.ts`

**No existe**. Solo el campo `variant_id` en `CartItem`.

### Gap

Tipo no declarado. La factory en `product.ts:74-76` lo declara
inline:

```ts
variants: [
  { id: 1, name: 'Talla unica', sku: `SKU-${id}-01`, stock: 5, price: priceWithTax },
],
```

### Decision de modelado propuesta

Declarar `ProductVariant` con 5 campos: `id`, `name`, `sku`, `stock`,
`price`. Anadir `variants?: ProductVariant[]` a `Product`. Eliminar
el array inline del factory en favor de `createVariant()`.

## Item 4 — `Review` no existe (tipo)

### Estado real

| Archivo | Evidencia |
|---------|-----------|
| `src/redux/slices/reviewsSlice.js` | slice con thunks para crear/listar/moderar |
| `src/hooks/domain/useReviews.js` | hook React Query |
| `src/pages/catalog/ProductReviewsListPage.jsx` | usa `r.rating`, `r.title`, `r.body` |
| `src/pages/admin/AdminReviewsModerationPage.jsx` | listado para moderacion |
| Tests | `ProductReviewsListPage.test.jsx`, `AdminReviewsModerationPage.test.jsx` |

### Estado en `domain.ts`

**No existe**. Solo agregados `rating_avg` y `review_count` en
`Product`.

### Gap

Tipo no declarado. Campos vistos en runtime: `rating`, `title`,
`body`. El slice menciona ademas `productId`, `orderId`. La pagina
admin sugiere un campo de estado de moderacion.

### Decision de modelado propuesta

Inspeccionar `reviewsSlice.js` y `AdminReviewsModerationPage.jsx`
**en el plan** para extraer el shape exacto, incluyendo
`moderation_status` (probable enum: `PENDING`, `APPROVED`,
`REJECTED`), `author`, `created_at`, `product_id`, `order_id`.
Tarea de inspeccion separada antes de declarar el tipo.

## Item 5 — Dos familias de paths auth coexisten

### Estado real

| Origen | Path family |
|--------|-------------|
| `authSlice.js` (thunks reales) | `/api/v1/auth/login/`, `/logout/`, `/register/`, `/profile/`, `/change-password/`, `/verify-email/`, `/password-reset/`, `/password-reset/confirm/` |
| `src/mocks/handlers/auth.ts` (handlers) | **ambas familias**: las 8 anteriores + 4 aliases legacy `/api/token/`, `/api/auth/me/`, `/api/auth/logout/`, `/api/auth/register/` |
| Interceptor heredado (ya eliminado) | solo legacy |

### Gap

Los 4 aliases legacy ya no tienen consumer en el codigo actual. La
iniciativa anterior los anadio al handler MSW por precaucion durante
la migracion, no porque algun thunk los necesite.

### Decision propuesta

Eliminar los 4 aliases legacy de `auth.ts`. Verificar con grep que
ningun thunk ni componente los invoca antes de eliminar (esperado:
cero matches).

## Item 6 — `fetch` directo vs `apiService`

### Estado real

| Archivo | Uso |
|---------|-----|
| `src/pages/auth/ForgotPasswordPage.jsx:33` | `await fetch('/api/v1/auth/password-reset/', { method: 'POST', ... })` |
| `src/pages/auth/ResetPasswordPage.jsx:50` | `await fetch('/api/v1/auth/password-reset/confirm/', { method: 'POST', ... })` |
| Resto del codigo | `apiService.get/post/patch/delete(...)` |

### Gap

Dos paginas hacen `fetch` directo. Las dos llaman a endpoints
existentes. La inconsistencia rompe la garantia de retry/timeout/
headers unificados que `apiService` da.

### Decision propuesta

Anadir dos thunks al `authSlice`: `requestPasswordReset(email)` y
`confirmPasswordReset({ token, new_password })`. Las paginas
despachan el thunk en vez de hacer fetch. Eliminar las constantes
`API_URL` locales de las dos paginas.

## Item 7 — `Product` type vs runtime divergence

### Estado real

| Campo runtime | Declarado en tipo Product? |
|---------------|----------------------------|
| `id` | si |
| `slug` | si |
| `name` | si |
| `description` | si |
| `base_price` | si |
| `price_with_tax` | si |
| `category`, `category_name` | si |
| `stock` | si |
| `rating_avg`, `review_count` | si |
| `is_featured`, `highlighted_name` | si |
| `sku` | si |
| `price` | **NO** (los handlers emiten para legacy consumers) |
| `original_price` | **NO** (idem) |
| `images` | **NO** |
| `variants` | **NO** (se resuelve con Item 3) |

### Gap

Cuatro campos runtime sin tipo. Los handlers usan
`as unknown as Product` para esquivar el chequeo.

### Decision propuesta

- `images: ProductImage[]` con `id`, `url`, `is_main`. Declarar
  `ProductImage` como tipo propio.
- `price` y `original_price`: decidir si son necesarios. `price`
  duplica `price_with_tax` segun el factory; `original_price`
  permite mostrar descuento ("antes 1500, ahora 1200"). Recomendado:
  **mantener ambos**, declararlos opcionales en `Product` con JSDoc
  explicando el rol.
- `variants` se cubre por Item 3.
- Eliminar **todos** los `as unknown as Product` del codigo de
  handlers tras la extension.

## Resumen del gap

| # | Item | Tipo de gap | Esfuerzo estimado |
|---|------|-------------|-------------------|
| 1 | `User` parcial | Anadir 3 campos confirmados al tipo | 20 min |
| 2 | `Address` no tipado | Declarar interface 12 campos | 20 min |
| 3 | `ProductVariant` no tipado | Declarar interface 5 campos + ajustar factory | 40 min |
| 4 | `Review` no tipado | Inspeccion + interface ~7 campos | 60 min |
| 5 | Aliases auth legacy | Verificar y eliminar 4 handlers | 25 min |
| 6 | fetch directo vs apiService | 2 thunks + refactor 2 paginas | 60 min |
| 7 | Product divergence | Anadir 3 campos + `ProductImage` tipo + limpiar casts | 50 min |

**Esfuerzo total estimado: ~275 min (~4.5h).** Significativamente
menor que el ~10h tipico de una iniciativa porque el patron real es
**tipar runtime existente**, no implementar entidades nuevas.

## Que sigue

1. Producir `plan-completar-dominio-de-ecommerce.md` con tareas
   atomicas por item, DAG, trazabilidad a UCs.
2. Pasar a `En ejecucion` actualizando indice global e index.md.
3. Ejecutar las tareas en secuencia, una por commit.
