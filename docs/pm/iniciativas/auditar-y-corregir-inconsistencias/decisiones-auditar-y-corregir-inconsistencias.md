# Decisiones: Auditar y corregir inconsistencias

| Campo | Valor |
|-------|-------|
| Iniciativa | auditar-y-corregir-inconsistencias |
| Fecha de creacion | 2026-05-26T00:39:04 |

## Seccion 1 — Decisiones de diseno

### dec-alinear-con-slice-activo-no-legacy

Para H-04 (payments) existian dos slices con paths distintos:
`checkoutSlice.js` (legacy, `/api/payments/*/create/`) y
`paymentsSlice.js` (activo, `/api/v1/payments/*/checkout`). Los
handlers se alinearon con el slice activo (`paymentsSlice.js`) que
es el que usa `PaymentSelectionPage.jsx`.

`checkoutSlice.js` es deuda tecnica declarada — no se elimina en
esta iniciativa porque puede tener tests o componentes dependientes
que no se auditaron en su totalidad.

### dec-handlers-legacy-auth-eliminados

El JSDoc de `auth.ts` decia "algunos componentes y tests aun los
usan" sobre los handlers legacy `/api/token/` y `/api/auth/*`.
Un grep exhaustivo de `src/` (excluyendo `mocks/handlers/`) confirmo
que ningun archivo los invocaba. El comentario era incorrecto desde
la migracion del interceptor a MSW.

Decision: eliminar. El riesgo de romper algo es cero — ningun
archivo los llama. Conservarlos seria continuar documentando algo
falso.

### dec-paths-sin-handler-aceptados

Al final de F5, 5 paths de la app no tienen handler MSW:
`/api/cart/save/`, `/api/cart/sync/`, `/api/v1/auth/addresses/`,
`/api/v1/payments/retry`, `/api/v1/auth/resend-verification/`.

Estos se aceptan en esta iniciativa porque:
- `onUnhandledRequest: 'bypass'` los deja pasar sin crashear
- Son endpoints de flujos secundarios (sync, save, retry)
- Implementar sus handlers merece tareas propias con datos realistas

### dec-api-base-eliminado

`API_BASE` en `constants/index.js` era codigo muerto. `apiService.js`
lee `process.env.API_URL` directamente en su constructor. Ningun
archivo importaba `API_BASE`. Eliminar es mas honesto que mantener
una exportacion que nadie usa con un comentario que explica algo
que ya hace el codigo en otro lugar.

### dec-proxy-fallback-documentado-no-eliminado

El fallback `http://localhost:8000` en el proxy de devServer es
correcto para desarrollo local. Se agrego un comentario explicativo
en lugar de eliminarlo. Eliminarlo romperia el flujo de desarrolladores
que corren el backend Django localmente.

## Seccion 2 — Hallazgos durante la ejecucion

### hallazgo-dos-slices-de-payments

Existen dos slices de payments: `checkoutSlice.js` (legacy) y
`paymentsSlice.js` (activo). Sus paths son distintos y ambos
tienen thunks de nombre parecido (`initMercadoPago` vs
`initiateMercadoPagoPayment`). La app usa el activo pero el legacy
sigue existiendo como codigo sin usar. Es deuda tecnica que merece
su propia iniciativa de limpieza.

### hallazgo-jsdoc-auth-incorrecto

El JSDoc de `auth.ts` contenia afirmaciones falsas ("algunos
componentes y tests aun los usan" sobre los handlers legacy). La
evidencia del grep lo contradecia. El JSDoc incorrecto es mas
peligroso que la ausencia de JSDoc porque guia al lector a una
decision incorrecta.

### hallazgo-proc-gestion-001-desviaciones

La lectura del PROC-GESTION-001 v4.0.0 subido por el usuario revelo
3 desviaciones en nuestra practica previa:
1. Commits por fase en lugar de por tarea.
2. Timestamps aproximados en progreso.md.
3. "Verificacion de cambios declarados" no aplicada sistematicamente.
A partir de esta iniciativa se corrigieron las tres.

### hallazgo-cart-save-sync-sin-handler

`/api/cart/save/` y `/api/cart/sync/` no tienen handler MSW. En
modo demo, cualquier accion que los invoque fallara silenciosamente
(bypass). Estos endpoints probablemente son para sincronizacion
de carrito entre sesiones o dispositivos. Se documentan como
deuda de handlers pendiente.

## Seccion 3 — Verificacion post-ejecucion

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| catalog.ts: 4 paths correctos | PASA | `grep http.get src/mocks/handlers/catalog.ts` muestra `/api/v1/catalogue/`, `/api/v1/catalogue/search/`, `/api/v1/catalogue/:slug/`, `/api/v1/categories/` |
| auth.ts: 0 handlers legacy | PASA | `grep "api/token\|api/auth/me"` retorna solo menciones del JSDoc explicativo |
| payments.ts: 2 paths correctos | PASA | `grep http.post src/mocks/handlers/payments.ts` muestra `/api/v1/payments/mercadopago/checkout` y `/api/v1/payments/paypal/checkout` |
| cart.ts wishlist: 3 paths correctos | PASA | `grep wishlist src/mocks/handlers/cart.ts` muestra `/api/v1/wishlist/` en los 3 handlers |
| API_BASE eliminado de constants | PASA | `grep API_BASE src/constants/index.js` retorna vacío |
| Sin importaciones de API_BASE en src/ | PASA | `grep -r API_BASE src/` retorna vacío |
| devServer proxy comentado | PASA | `sed -n '283,300p' webpack.config.js` muestra el comentario |
| webpack.config.js sintaxis | PASA | `node --check webpack.config.js` retorna 0 |
