# Progreso: Auditar integracion catalogo

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T01:21:12 | Apertura | Auditoria sistematica de habilitar-msw-en-modo-demo, auditar-y-corregir-inconsistencias e integrar-catalogo-oja-en-mocks. 7 hallazgos: 3 bugs (A-02 paginacion, A-03 legacy, A-07 filtro de categoria), 3 deuda documental (A-01 browser.ts, A-03 checkoutSlice, A-05 script npm), 1 tipo TS (A-06 as const). A-04 es inofensivo y no requiere cambio. |
| 2026-05-26T01:21:12 | T-001, T-002 hechas | Analisis completo. 5 documentos PM creados. F0 cerrada. |
| 2026-05-26T01:21:12 | F0 cerrada | Siguiente: F1 (A-07, el mas critico). |
| 2026-05-26T01:30:48 | F1 iniciada | T-101..T-104. Corregir A-07: filtro de categoria retorna 0 para 6 de 14 categorias. Fix: campo all_categories[] en el script y filtro por includes() en el handler. |
| 2026-05-26T01:31:27 | T-101 hecha | transform-catalog.mjs: campo all_categories[] agregado. Mapea categorias[] del scraper a slugs canonicos via CATEGORIAS_MAP. Filtra nulls (categorias sin mapeo). JSDoc y header del archivo generado actualizados. |
| 2026-05-26T01:31:51 | T-102 hecha | catalog.ts regenerado. Verificacion: 0 productos sin all_categories. Conteos por categoria secundaria: semillas=10, ikoberes-amuletos=14, varios=7, mayoreo=3, paquetes=5, titulos=3 — todos coinciden con el esperado. Ejemplo: atare tiene category.slug=enseres (principal) y all_categories=['enseres','semillas']. |
| 2026-05-26T01:32:21 | T-103 hecha | catalog.ts handler: filtro de categoria cambiado de category?.slug === catSlug a all_categories?.includes(catSlug) en listado y busqueda. JSDoc actualizado con la correccion A-07. |
| 2026-05-26T01:33:08 | T-104 hecha | Verificacion: filtro all_categories.includes(catSlug) coincide con product_count en CATALOG_CATEGORIES para las 14 categorias. 14/14 PASAN. Los 'fallos' del test anterior usaban el conteo de _resumen.json (categoria_principal, 8 valores) como referencia incorrecta — la referencia correcta es CATALOG_CATEGORIES.product_count que ya usa categorias[]. Consistencia total. |
| 2026-05-26T01:33:08 | F1 cerrada | A-07 resuelto. 4 commits: b217683 (script), 783b9cd (datos), 7bfc283 (handler), este (progreso). Siguiente: F2. |
