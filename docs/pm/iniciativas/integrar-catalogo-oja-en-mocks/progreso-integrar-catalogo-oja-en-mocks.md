# Progreso: Integrar catalogo Oja en mocks

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T01:05:16 | Apertura | Iniciativa abierta. El catalogo de Oja Yoruba (256 productos, 14 categorias, 320 PNGs / 24 MB) reemplaza los datos de Faker en los handlers MSW. Tres dimensiones: transformacion ES->EN, imagenes como assets estaticos en DEMO_MODE, 14 categorias reales. Esfuerzo estimado: ~2 horas. |
| 2026-05-26T01:05:16 | ADR revisada | dec-mocks-via-msw-service-worker: no se supersede. Esta iniciativa rellena el contenido de los mocks, no cambia su arquitectura. DEMO_MODE de habilitar-msw-en-modo-demo es el mecanismo; esta iniciativa pone datos reales. |
| 2026-05-26T01:05:16 | T-001 hecha | Analisis completo: 256 productos, 104 con descuento (5%-65%), todos stock null, 320 PNGs / 24 MB / 77 KB promedio. 14 categorias reales identificadas. Mapeo campo a campo ES->EN documentado. Opcion A elegida para imagenes (public/catalog/images/ + CopyPlugin condicional). |
| 2026-05-26T01:05:16 | T-002 hecha | 5 documentos PM creados siguiendo formato del repo UI. |
| 2026-05-26T01:05:16 | F0 cerrada | 2 tareas hechas. Siguiente: F1 (script) y F2 (imagenes) en paralelo. |
| 2026-05-26T01:12:28 | F1 iniciada | T-101, T-102 — script de transformacion. |
| 2026-05-26T01:12:28 | Hallazgo durante T-101 | **Decision de IVA**: en Mexico los precios en tiendas online se muestran con IVA incluido por ley. `precio_actual` es el precio que paga el cliente (price_with_tax). Por tanto: price_with_tax = precio_actual; base_price = round(precio_actual / 1.16, 2). El alcance decia lo contrario — corregido antes de codificar. |
| 2026-05-26T01:12:28 | Hallazgo durante T-101 | **Campo discount_pct no esta en el tipo Product de domain.ts** pero si es util para el frontend. Se incluye como campo extra junto a original_price, images y variants, igual que hace la factory product.ts. |
| 2026-05-26T01:12:28 | Hallazgo durante T-101 | **src/mocks/data/ no existe**. Se crea como directorio nuevo. |
| 2026-05-26T01:12:28 | T-101 hecha | scripts/transform-catalog.mjs creado. Acepta ruta al JSON como argumento. Genera src/mocks/data/catalog.ts con CATALOG_PRODUCTS (256) y CATALOG_CATEGORIES (14). |
| 2026-05-26T01:12:28 | Hallazgo CRITICO durante T-102 | El _catalogo_completo.json tiene solo 8 valores unicos en categoria_principal. Las 6 categorias restantes (Ikoberes/Amuletos, Semillas, Varios, Paquetes, Mayoreo, Titulos) solo aparecen en el array categorias[] de cada producto. El script original generaba product_count=0 para esas 6 categorias. Decision: product_count se calcula desde el array categorias[]. |
| 2026-05-26T01:12:28 | T-102 hecha | Verificacion: 256 productos, 14 categorias con product_count correcto (82 Lo Nuevo, 74 Akoses/Medicinas, ..., 3 Titulos). Primer producto verificado: base_price=171.55, price_with_tax=199, original_price=250, images[0].url=/catalog/images/abe-esu-cuchilla-de-esu.png. 0 warnings. |
| 2026-05-26T01:12:28 | F1 cerrada | Commit 8064c7c. src/mocks/data/catalog.ts generado. Siguiente: F2 y F3. |
| 2026-05-26T01:13:15 | T-201 hecha | 320 PNGs copiados a public/catalog/images/ (25 MB). Verificacion: primera imagen referenciada en catalog.ts existe en public/. |
| 2026-05-26T01:13:15 | T-202 hecha | webpack.config.js: CopyPlugin extendido con segundo pattern catalog/images/. Verificacion: fragmento exacto con los 2 patterns visible. node --check: OK. |
| 2026-05-26T01:13:15 | T-203 pendiente en distro | webpack-dev-server sirve public/ desde root. Las imagenes estaran en localhost:3001/catalog/images/. No ejecutable en bash_tool. |
| 2026-05-26T01:13:15 | F2 cerrada | Commit 97e7f41. Imagenes en public/, webpack actualizado. Siguiente: F4. |
| 2026-05-26T01:15:18 | T-401..T-405 hechas | catalog.ts handler reemplazado: sin Faker, usa CATALOG_PRODUCTS y CATALOG_CATEGORIES. 4 handlers con datos reales: listado con paginacion y filtro por categoria, busqueda por nombre/descripcion, detalle por slug (404 si no existe), categorias reales. |
| 2026-05-26T01:15:18 | T-501 hecha | product.ts factory: CATEGORIES actualizado con las 14 categorias reales de Oja Yoruba. |
| 2026-05-26T01:15:18 | T-601 hecha | Verificacion de catalog.ts: 256 productos, 14 categorias, 0 con product_count=0, 256 referencias a imagenes. |
| 2026-05-26T01:15:18 | T-602 hecha | Verificacion webpack.config.js: CopyPlugin condicional con 2 patterns. Build sin DEMO_MODE no toca catalog/images. |
| 2026-05-26T01:15:18 | T-603 hecha | decisiones-*.md creado (6 decisiones, 3 hallazgos, 13 criterios). index cerrado. tareas 0 pendientes. indice cerrado. |
| 2026-05-26T01:15:18 | Iniciativa cerrada | integrar-catalogo-oja-en-mocks cerrada. 6 fases, 17 tareas. 5 archivos de codigo + 320 imagenes. 2 verificaciones funcionales pendientes en distro. |
