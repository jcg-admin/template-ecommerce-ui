# Progreso: Integrar catalogo Oja en mocks

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T01:04:49 | Apertura | Iniciativa abierta. El catalogo de Oja Yoruba (256 productos, 14 categorias, 320 PNGs / 24 MB) reemplaza los datos de Faker en los handlers MSW. Tres dimensiones: transformacion ES->EN, imagenes como assets estaticos en DEMO_MODE, 14 categorias reales. Esfuerzo estimado: ~2 horas. |
| 2026-05-26T01:04:49 | ADR revisada | dec-mocks-via-msw-service-worker: no se supersede. Esta iniciativa rellena el contenido de los mocks, no cambia su arquitectura. DEMO_MODE de habilitar-msw-en-modo-demo es el mecanismo; esta iniciativa pone datos reales. |
| 2026-05-26T01:04:49 | T-001 hecha | Analisis completo: 256 productos, 104 con descuento (5%-65%), todos stock null, 320 PNGs / 24 MB / 77 KB promedio. 14 categorias reales identificadas. Mapeo campo a campo ES->EN documentado. Opcion A elegida para imagenes (public/catalog/images/ + CopyPlugin condicional). |
| 2026-05-26T01:04:49 | T-002 hecha | 5 documentos PM creados siguiendo formato del repo UI. |
| 2026-05-26T01:04:49 | F0 cerrada | 2 tareas hechas. Esfuerzo real: ~30 min. Siguiente: F1 (script) y F2 (imagenes) en paralelo. |
