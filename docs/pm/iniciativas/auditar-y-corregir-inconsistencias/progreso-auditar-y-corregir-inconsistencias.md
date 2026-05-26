# Progreso: Auditar y corregir inconsistencias

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T00:39:04 | Apertura | Iniciativa abierta. Con `habilitar-msw-en-modo-demo` cerrada, el modo demo deberia mostrar datos. Auditoria sistematica del codigo revela que MSW esta activo pero sus handlers interceptan paths distintos a los que la app llama. El catalogo (pagina principal) nunca muestra datos porque `/api/products/` no coincide con `/api/v1/catalogue/`. |
| 2026-05-26T00:39:04 | ADR revisada | Inspeccion de `docs/decisiones-de-arquitectura/`. ADR relevante: `dec-mocks-via-msw-service-worker`. El campo Trade-off no menciona inconsistencias de paths. El comentario en `catalogSlice.js` ("Sprint 5: URLs corregidas a /api/v1/catalogue/*") confirma que los paths de la app se actualizaron en un sprint anterior sin actualizar los handlers MSW. |
| 2026-05-26T00:39:04 | T-001 hecha | Comparacion sistematica completada. 7 hallazgos: H-01 (catalog 4 paths erroneos, CRITICA), H-02 (auth legacy handlers, MEDIA), H-03 (cart correcto), H-04 (payments 2 paths erroneos, MEDIA), H-05 (wishlist 3 paths sin /v1/, BAJA), H-06 (API_BASE codigo muerto, BAJA), H-07 (proxy fallback sin documentar, BAJA). |
| 2026-05-26T00:39:04 | T-002 hecha | 5 documentos PM creados. |
| 2026-05-26T00:39:04 | F0 cerrada | 2 tareas hechas. Siguiente: F1. |
| 2026-05-26T00:43:36 | Hallazgo de proceso | Lectura del PROC-GESTION-001 v4.0.0 revela 3 desviaciones en nuestra practica previa: (1) commits por fase en lugar de por tarea; (2) timestamps aproximados en progreso.md; (3) verificacion de cambios declarados no aplicada sistematicamente. A partir de F1 se corrigen las tres. |
| 2026-05-26T00:43:36 | F1 iniciada | Corregir catalog.ts (H-01). T-101..T-106. |
| 2026-05-26T00:44:27 | T-101..T-106 hechas | catalog.ts: 4 paths corregidos (/api/products/* -> /api/v1/catalogue/*, /api/categories/ -> /api/v1/categories/) + JSDoc actualizado. Verificacion: archivo revisado linea a linea. catalogSlice.js y useCategories.js confirmados como referencia de paths reales. |
| 2026-05-26T00:44:27 | F1 cerrada | Commit 4497e8f. Siguiente: F2. |
| 2026-05-26T00:45:25 | Hallazgo durante T-201 | El JSDoc de auth.ts decia "algunos componentes y tests aun los usan" referido a los handlers legacy /api/token/ y /api/auth/*. Grep exhaustivo de src/ confirma que ningun archivo fuera de mocks/handlers los invoca. El comentario era incorrecto desde la migracion del interceptor a MSW. |
| 2026-05-26T00:45:25 | T-201, T-202 hechas | auth.ts: 4 handlers legacy eliminados (/api/token/, /api/auth/logout/, /api/auth/register/, /api/auth/me/). JSDoc actualizado con los paths correctos y nota explicativa de la eliminacion. Verificacion: grep "api/token|api/auth/me" retorna solo las menciones del JSDoc. |
| 2026-05-26T00:45:25 | F2 cerrada | Commit 52c5233. Siguiente: F3. |
| 2026-05-26T00:46:37 | Hallazgo durante T-301 | Existen DOS slices de payments: checkoutSlice.js (legacy, usa /api/payments/* sin versionar) y paymentsSlice.js (activo, usa /api/v1/payments/*, con decoradores y UC-PAY-*). PaymentSelectionPage.jsx importa de paymentsSlice. Los handlers estaban alineados con el legacy. Se alinean con el activo. checkoutSlice.js es deuda tecnica. |
| 2026-05-26T00:46:37 | T-301..T-304 hechas | payments.ts: 2 paths corregidos (/api/payments/*/create/ -> /api/v1/payments/*/checkout). JSDoc actualizado con nota sobre checkoutSlice legacy. cart.ts wishlist: 3 paths corregidos (/api/wishlist/* -> /api/v1/wishlist/*). |
| 2026-05-26T00:46:37 | F3 cerrada | Commit 9b1b11f. Siguiente: F4. |
| 2026-05-26T00:47:22 | T-401..T-403 hechas | constants/index.js: API_BASE eliminado (grep confirma 0 importaciones en src/). webpack.config.js proxy: comentario explicativo agregado. node --check webpack.config.js: OK. |
| 2026-05-26T00:47:22 | F4 cerrada | Commit c292dc9. Siguiente: F5. |
| 2026-05-26T00:48:46 | T-501 hecha | Verificacion final: handlers MSW ahora interceptan paths correctos para catalog, auth (sin legacy), cart, payments y wishlist. 5 paths sin handler documentados como deuda aceptada. |
| 2026-05-26T00:48:46 | T-502 hecha | decisiones-*.md creado (5 decisiones, 4 hallazgos, 8 criterios). index: Cerrada. tareas: 0 Pendientes. indice: Cerrada. |
| 2026-05-26T00:48:46 | F5 cerrada | Commit b1045e1. |
| 2026-05-26T00:48:46 | Iniciativa cerrada | auditar-y-corregir-inconsistencias cerrada. 5 fases, 17 tareas. 4 archivos de codigo corregidos, 1 eliminado, 1 comentado. |
