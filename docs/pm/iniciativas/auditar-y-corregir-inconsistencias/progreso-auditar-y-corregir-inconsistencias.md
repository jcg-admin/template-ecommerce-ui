# Progreso: Auditar y corregir inconsistencias

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T03:00:00 | Apertura | Iniciativa abierta. Con `habilitar-msw-en-modo-demo` cerrada, el modo demo deberia mostrar datos. Auditoria sistematica del codigo revela que MSW esta activo pero sus handlers interceptan paths distintos a los que la app llama. El catalogo (pagina principal) nunca muestra datos porque `/api/products/` no coincide con `/api/v1/catalogue/`. |
| 2026-05-26T03:00:01 | ADR revisada | Inspeccion de `docs/decisiones-de-arquitectura/`. ADR relevante: `dec-mocks-via-msw-service-worker`. El campo Trade-off no menciona inconsistencias de paths. El comentario en `catalogSlice.js` ("Sprint 5: URLs corregidas a /api/v1/catalogue/*") confirma que los paths de la app se actualizaron en un sprint anterior sin actualizar los handlers MSW. |
| 2026-05-26T03:05:00 | T-001 hecha | Comparacion sistematica completada. 7 hallazgos identificados: H-01 (catalog 4 paths erroneos, CRITICA), H-02 (auth legacy handlers, MEDIA), H-03 (cart correcto), H-04 (payments 2 paths erroneos, MEDIA), H-05 (wishlist 3 paths erroneos, BAJA), H-06 (API_BASE codigo muerto, BAJA), H-07 (proxy fallback sin documentar, BAJA). |
| 2026-05-26T03:15:00 | T-002 hecha | 5 documentos PM creados. |
| 2026-05-26T03:15:01 | F0 cerrada | 2 tareas hechas. Esfuerzo real: ~20 min. Siguiente: F1. |
