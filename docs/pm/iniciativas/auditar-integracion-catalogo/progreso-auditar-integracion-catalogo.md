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
| 2026-05-26T01:33:19 | F2 iniciada | T-201, T-202. Corregir A-02: handler de busqueda devuelve todos los resultados sin paginacion artificial. next y previous siempre null. |
| 2026-05-26T01:33:36 | T-201, T-202 hechas | Handler search: results devuelve todos sin slice. next=null, previous=null. Verificacion: fragmento exacto muestra results sin slice y ambos campos null. F2 cerrada. |
| 2026-05-26T01:33:42 | F3 iniciada | T-301 (browser.ts), T-302 (checkoutSlice deprecated), T-303 (README script). |
| 2026-05-26T01:33:59 | T-301 hecha | browser.ts: JSDoc corregido. Ya no dice 'solo en NODE_ENV=development'. Documenta los dos casos: desarrollo (NODE_ENV) y demo (DEMO_MODE). |
| 2026-05-26T01:34:18 | T-302 hecha | checkoutSlice.js: @deprecated agregado apuntando a paymentsSlice.js con la razon (paths legacy sin handler MSW). |
| 2026-05-26T01:34:47 | T-303 hecha | README.md: seccion 'Modo demo' actualizada (ya no dice Faker sino datos reales Oja Yoruba). Seccion 'Herramientas de desarrollo' agregada con uso de transform-catalog.mjs. |
| 2026-05-26T01:34:47 | F3 cerrada | A-01, A-03, A-05 resueltos. 3 commits. Siguiente: F4 (A-06 tipos TS). |
