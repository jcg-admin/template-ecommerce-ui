# Tareas: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Iniciativa | resolver-hallazgos-de-deuda-del-template |
| Tipo | Lista plana de tareas con estado |
| Fecha de creacion | 2026-05-20T21:30:00 |
| Total de tareas | 25 |

> **Como leer este documento.** Este es el panel operativo de la
> iniciativa. Cada fila es una tarea atomica T-NNN derivada del
> plan. La columna **Estado** se actualiza al iniciar y al cerrar
> cada tarea. La columna **Commit** se rellena con el hash corto
> tras el commit Tim Pope que la cierra.
>
> Para el diseno de cada tarea (criterio de hecho, archivos, costo),
> ver `plan-resolver-hallazgos-de-deuda-del-template.md`.

## Estado de las tareas

| ID | Tarea | Hallazgo | Fase | Estado | Commit |
|----|-------|----------|------|--------|--------|
| T-001 | Retirar 5 entradas historicas del inventario de riesgos y deuda | H-06, H-09, H-10, H-11, H-12 | 0 | pendiente | |
| T-002 | Retirar 4 historicos y consolidar 4 duplicados de la iniciativa previa | H-13, H-14, H-15, H-16, H-17, H-18, H-19, H-20 | 0 | pendiente | |
| T-003 | Marcar H-05 y H-07 como delegados a iniciativa propia | H-05, H-07 | 0 | pendiente | |
| T-004 | Anadir seccion de documentacion completa al README raiz | H-04 | 1 | pendiente | |
| T-005 | Crear tsconfig.json con allowJs y strict | H-03 | 2 | pendiente | |
| T-006 | Verificar babel-jest procesa .ts/.tsx y anadir babel.config.cjs si falta | H-03 | 2 | pendiente | |
| T-007 | Smoke test compilando un dummy.ts | H-03 | 2 | pendiente | |
| T-008 | Migrar PropShapes.js a PropShapes.ts con interfaces y prop-types exportados | H-03, H-02 | 3 | pendiente | |
| T-009 | Migrar serializeApiError.js a serializeApiError.ts con tipo del error normalizado | H-03 | 3 | pendiente | |
| T-010 | Aplicar withLogging a apiService.fetch | H-01 | 4 | pendiente | |
| T-011 | Aplicar withLogging a thunks de authSlice | H-01 | 4 | pendiente | |
| T-012 | Aplicar withLogging + withValidation a thunks de paymentsSlice | H-01 | 4 | pendiente | |
| T-013 | Aplicar withValidation a cartSlice.applyVoucher | H-01 | 4 | pendiente | |
| T-014 | Aplicar withCaching a catalogSlice.searchProducts | H-01 | 4 | pendiente | |
| T-015 | Aplicar ProductShape a ProductCard, VariantSelector y ProductPage | H-02 | 5 | pendiente | |
| T-016 | Aplicar CartItemShape a CartPage | H-02 | 5 | pendiente | |
| T-017 | Aplicar OrderShape a OrderDetailPage y OrdersPage | H-02 | 5 | pendiente | |
| T-018 | Aplicar AddressShape a AddressesPage | H-02 | 5 | pendiente | |
| T-019 | Aplicar UserShape, VoucherShape y ToastShape a sus componentes | H-02 | 5 | pendiente | |
| T-020 | Crear scripts/verify-build.mjs | H-08 | 6 | pendiente | |
| T-021 | Anadir npm script verify-build | H-08 | 6 | pendiente | |
| T-022 | Exponer window.__APP_CONFIG__ via webpack DefinePlugin | H-08 | 6 | pendiente | |
| T-023 | Documentar el procedimiento de verificacion del build | H-08 | 6 | pendiente | |
| T-024 | Actualizar riesgos-y-deuda-tecnica.md con estado final | H-01, H-02, H-03, H-04, H-05, H-07, H-08 | 7 | pendiente | |
| T-025 | Crear decisiones-resolver-hallazgos-de-deuda-del-template.md y cerrar iniciativa | (cierre) | 7 | pendiente | |

## Vista por estado

| Estado | Conteo |
|--------|--------|
| pendiente | 25 |
| en curso | 0 |
| hecha | 0 |

## Valores validos del campo Estado

- `pendiente`: la tarea esta declarada pero no ha empezado.
- `en curso`: la tarea esta siendo trabajada activamente.
- `hecha`: la tarea esta cerrada con commit referenciado.
- `bloqueada`: la tarea no puede avanzar; ver `progreso-*.md` para razon.
- `descartada`: la tarea no se ejecutara; ver `progreso-*.md` para razon.
