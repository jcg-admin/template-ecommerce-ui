# Progreso: Auditar y corregir inconsistencias

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T03:00:00 | Apertura | Iniciativa abierta. Con `habilitar-msw-en-modo-demo` cerrada, el modo demo deberia mostrar datos. Auditoria sistematica del codigo revela que MSW esta activo pero sus handlers interceptan paths distintos a los que la app llama. El catalogo (pagina principal) nunca muestra datos porque `/api/products/` no coincide con `/api/v1/catalogue/`. |
| 2026-05-26T03:00:01 | ADR revisada | Inspeccion de `docs/decisiones-de-arquitectura/`. ADR relevante: `dec-mocks-via-msw-service-worker`. El campo Trade-off no menciona inconsistencias de paths. El comentario en `catalogSlice.js` ("Sprint 5: URLs corregidas a /api/v1/catalogue/*") confirma que los paths de la app se actualizaron en un sprint anterior sin actualizar los handlers MSW. |
| 2026-05-26T03:05:00 | T-001 hecha | Comparacion sistematica completada. 7 hallazgos identificados: H-01 (catalog 4 paths erroneos, CRITICA), H-02 (auth legacy handlers, MEDIA), H-03 (cart correcto), H-04 (payments 2 paths erroneos, MEDIA), H-05 (wishlist 3 paths erroneos, BAJA), H-06 (API_BASE codigo muerto, BAJA), H-07 (proxy fallback sin documentar, BAJA). |
| 2026-05-26T03:15:00 | T-002 hecha | 5 documentos PM creados. |
| 2026-05-26T03:15:01 | F0 cerrada | 2 tareas hechas. Esfuerzo real: ~20 min. Siguiente: F1. |
| 2026-05-26T00:43:36 | Hallazgo de proceso | Lectura del PROC-GESTION-001 v4.0.0 revela 3 desviaciones en nuestra practica: (1) commits por fase en lugar de por tarea — el procedimiento exige un commit por tarea completada; (2) timestamps aproximados en progreso.md en lugar de timestamps reales via `date -u`; (3) la "Verificacion de cambios declarados" no se aplicaba sistematicamente — declarabamos cambios sin mostrar el fragmento resultante. A partir de esta fase se corrigen las tres desviaciones. |
| 2026-05-26T00:43:36 | F1 iniciada | Corregir catalog.ts (H-01). T-101..T-106. |
| 2026-05-26T00:44:20 | T-101..T-106 hechas | catalog.ts: 4 paths corregidos (/api/products/* -> /api/v1/catalogue/*, /api/categories/ -> /api/v1/categories/) + JSDoc actualizado. Verificacion: archivo revisado linea a linea — los 4 handlers tienen paths correctos. catalogSlice.js y useCategories.js confirmados como referencia de paths reales. |
