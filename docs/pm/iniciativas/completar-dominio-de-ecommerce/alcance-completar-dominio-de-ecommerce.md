# Alcance — `completar-dominio-de-ecommerce`

| Campo | Valor |
|-------|-------|
| Iniciativa | `completar-dominio-de-ecommerce` |
| Estado al producir este documento | En analisis |
| Fecha | 2026-05-21 |
| Origen | `resolver-hallazgos-de-deuda-del-template` (replan Fase 5, H-02) |
| Deuda heredada | `revisar-arquitectura-de-mocks` (cerrada 2026-05-21) |

## Por que existe esta iniciativa

El modelo de dominio del template, materializado en
`src/types/domain.ts`, esta **explicitamente marcado como parcial** en
sus propios JSDoc. La nota de cabecera del modulo declara:

> La extension de los tipos parciales (User completo con verificacion
> y roles granulares, `Address` como entidad reutilizable,
> `ProductVariant` como entidad propia con sku y stock por variante,
> `Review`) pertenece a la iniciativa registrada en backlog
> `completar-dominio-de-ecommerce`, no a este modulo. Aqui se
> documenta el gap; alli se llena.

Ademas, la iniciativa cerrada el mismo dia
(`revisar-arquitectura-de-mocks`) registro en su `decisiones-*.md`
**tres items de deuda concreta** que esta iniciativa hereda y debe
resolver, no la siguiente. Sin esta iniciativa esa deuda se queda
flotando sin dueno.

## Que esta dentro del alcance

Cuatro **gaps de modelado** declarados en el JSDoc de `domain.ts`:

1. **`User` parcial**: faltan flags de estado (`is_active`, baneo),
   verificacion (`email_verified`, `phone_verified`), roles
   granulares (mas alla de `is_staff`), sesiones activas, politicas
   de bloqueo.
2. **`Address` no existe**: las direcciones probablemente viven
   embebidas en `Order` y en perfiles, no como entidad reutilizable
   con CRUD propio (`/api/v1/users/me/addresses/`).
3. **`ProductVariant` no existe**: el shape runtime que el
   `mockInterceptor` heredado emitia tenia `variants[]` inline, pero
   no hay tipo. Cualquier producto con talla/color comparte el mismo
   `Product` sin distinguir SKU por variante.
4. **`Review` no existe**: el `Product` tiene `rating_avg` y
   `review_count` desnormalizados pero no hay entidad `Review` con
   `rating`, `comment`, `author`, `moderation_status`.

Tres **items de deuda heredada** de la iniciativa anterior:

5. **Dos familias de paths auth coexisten**: `authSlice.js` ataca
   `/api/v1/auth/login|logout|register|profile|...` pero el
   interceptor heredado mockeaba `/api/token/`, `/api/auth/me/`,
   `/api/auth/logout/`, `/api/auth/register/`. Los handlers MSW
   actuales cubren ambas familias durante la transicion. Esta
   iniciativa debe **consolidar a una sola familia** (probablemente
   `/api/v1/auth/*`) y eliminar los aliases legacy de los handlers.
6. **`fetch` directo vs `apiService`**: `ForgotPasswordPage` y
   `ResetPasswordPage` usan `fetch(API_URL, {...})` en vez de
   `apiService.post(...)`. La inconsistencia rompe la garantia de
   retry/timeout/headers unificados. Debe **unificarse al uso de
   `apiService`** con thunks dedicados o llamadas inline pero
   centralizadas.
7. **Divergencia `Product` type vs runtime shape**: los handlers
   MSW emiten `price`, `original_price`, `images`, `variants` que
   los consumers (paginas, componentes) leen, pero esos campos **no
   estan en `Product` de `domain.ts`**. Los handlers usan
   `as unknown as Product` para esquivar el chequeo. Debe **alinear
   tipo y runtime**, decidiendo en cada campo si extender el tipo o
   eliminar el uso runtime.

## Que NO esta dentro del alcance

- **Cambios en el backend Django**. Esta iniciativa vive en el repo
  del UI. El backend se coordina externamente; aqui se documentan
  los contratos esperados.
- **Implementacion de UCs nuevos del comprador o admin**. Si
  completar el modelo expone que un UC falta, se registra como deuda
  para la iniciativa correspondiente, no se ejecuta aqui.
- **Validacion del contrato runtime contra el backend real**. Eso
  es la iniciativa `validar-contrato-de-mocks-vs-backend-real`
  (backlog #1), bloqueada por backend.
- **Categorias jerarquicas con `parent_id`**. El JSDoc declara que el
  modelo plano cubre el caso comun; ampliar a arbol es una iniciativa
  propia si llega la necesidad.
- **Refactor estilistico de los slices ni de los componentes**.
  Solo se toca lo necesario para que tipos y runtime esten alineados
  y los siete items del alcance resueltos.

## Criterios de evaluacion del template

Cada propuesta de modelado para los items 1 a 4 se evalua contra
estos criterios, derivados de la naturaleza del template (ser
adoptable por terceros):

| Criterio | Por que importa |
|----------|-----------------|
| **Adoptable** | El template lo forka un equipo. El modelo debe ser razonable para 80% de e-commerces, no para el 20% mas particular. |
| **Trazable a UCs** | Cada entidad o campo nuevo debe poder mapearse a un UC declarado o registrado como deuda. Sin UC, no entra. |
| **No-tipo-divergente** | Despues de la iniciativa, tipo y runtime coinciden. `as unknown as X` desaparece. |
| **Documentado** | JSDoc en `domain.ts` actualizado: el bloque "parcial" desaparece, queda "completo" o se documenta explicitamente lo que el template **no** soporta. |
| **Tests verdes** | 203 -> al menos 203, sin perder tests al limpiar. |
| **Build limpio** | `npm run verify-build` sigue dando solo URLs legitimas. |

## Criterio de completitud verificable

La iniciativa esta completa cuando:

1. `src/types/domain.ts` declara `User`, `Address`, `ProductVariant`,
   `Review` con campos suficientes para un e-commerce B2C estandar,
   o documenta explicitamente que el template no los implementa con
   pointer a una iniciativa de backlog que lo haga.
2. Los handlers MSW (`src/mocks/handlers/*.ts`) **no usan**
   `as unknown as X`. Si un campo runtime existe, esta en el tipo.
3. `src/mocks/handlers/auth.ts` registra **una sola familia** de
   paths auth. Los aliases legacy se eliminan.
4. `ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx` usan
   `apiService` (directamente o via thunks).
5. `npx tsc --noEmit` exit 0; tests verdes; build exit 0;
   `verify-build` solo expone URLs legitimas.
6. ADR producida si la decision sobre `ProductVariant` (entidad
   propia vs array embebido) o sobre `Address` (entidad CRUD vs
   embebido) excede el alcance ya cubierto por ADRs vigentes.
7. Documentacion arc42 actualizada en `vista-de-bloques`,
   `como-adaptar`, y `README` si el dominio publico cambia.
8. `decisiones-completar-dominio-de-ecommerce.md` producido con las
   cuatro secciones canonicas.

## Fuera de alcance pero relevante

Items que aparecen durante el analisis y se registran para
iniciativas siguientes:

- Cualquier endpoint del backend que falte y este fuera de los UCs
  declarados.
- Migracion del campo `username` (DRF default) a `email` como
  primary identifier si aparece la divergencia.
- Internacionalizacion de los nombres de campos en respuestas.

## Decisiones de proceso

- **Una entidad = una fase**. El plan separa el trabajo en fases
  por entidad o por item de deuda. Una entidad puede tener varias
  tareas dentro de su fase.
- **Tipo primero, runtime despues**. Por cada entidad, primero se
  declara el tipo en `domain.ts`, luego se actualizan handlers
  MSW, luego se actualizan slices y componentes que la consumen.
  Esto preserva 203 tests verdes en cada commit.
- **Backend out-of-scope**. Los endpoints que la iniciativa
  asuma del backend se documentan en el alcance pero no se
  intentan crear ni validar aqui.
- **Sin cambio de scope sin replan formal**. Si el analisis expone
  que un item del alcance es demasiado grande para una iniciativa,
  se replantea via `Replan` en `progreso-*.md` y se discute con el
  usuario antes de continuar.
