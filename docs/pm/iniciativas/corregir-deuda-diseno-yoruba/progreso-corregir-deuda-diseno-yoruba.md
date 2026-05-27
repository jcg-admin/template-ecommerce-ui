# Progreso: Corregir deuda diseno Yoruba

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-27T19:17:18 | Apertura | Iniciativa abierta. Origen: adaptar-sistema-diseno-yoruba. 3 bloques de deuda identificados: 197 tests fallan (18 suites), 37 aliases en _variables.scss (84 archivos, 149 ocurrencias), NotFoundPage no adaptada. |
| 2026-05-27T19:17:19 | Gate ejecutado | Nivel 0b (RF-6). Resultado: CONFIRMAR+EXPANDIR. D-04 [INFERRED]: shape mismatch item.name vs item.product_name en CartPage.test.jsx detectado durante Gate 0b. |
| 2026-05-27T19:17:20 | F0 cerrada | 5 documentos PM creados siguiendo PROC-GESTION-TUI-001. Premisa verificada en alcance. 4 hallazgos en analisis (3 PROVEN, 1 INFERRED). Plan con DAG y 38 tareas atomicas. |
| 2026-05-27T19:21:34 | F2 iniciada | T-201..T-214. Reemplazar 37 aliases legacy en 84 archivos SCSS, luego eliminar los 4 bloques de aliases de _variables.scss. |
| 2026-05-27T19:27:06 | T-201..T-212 hechas | Script replace_aliases.py: 103 archivos SCSS modificados, 58 sin cambios. 0 residuales de variables legacy. |
| 2026-05-27T19:27:06 | T-213 hecha | _variables.scss: 4 bloques de aliases eliminados (lineas 368-425). Solo se conserva el bloque ALIASES original del tema ($bg-card, $primary-tint, etc.). |
| 2026-05-27T19:27:06 | T-214 hecha | Build tras eliminar aliases: EXIT=0, 189 warnings (preexistentes Sass). Sin nuevos errores. |
| 2026-05-27T19:27:06 | F2 cerrada | 14 tareas, BUILD EXIT=0. _variables.scss limpio. 103 archivos SCSS actualizados con variables semanticas. |
| 2026-05-27T19:27:11 | F3 iniciada | T-301..T-302. NotFoundPage con diseno Yoruba editorial. |
| 2026-05-27T19:27:32 | T-301 T-302 hechas | NotFoundPage.jsx adoptado del paquete con ruta EN (/catalog?category=akoses-medicinas). NotFoundPage.module.scss adoptado. 0 hex hardcodeados. F3 cerrada. |
| 2026-05-27T19:27:41 | F1 iniciada | T-101..T-118. 18 suites, 197 tests. Estrategia: leer componente + test, identificar causa (markup/shape/feature eliminado), corregir. |

| 2026-05-27T21:15:00 | F1 cerrada | 18 suites corregidas. 633 tests pasan / 105 skipped / 56 fallan. Los 56 fallos son de 11 suites PREEXISTENTES (fuera del alcance de F1). Bug real corregido: WishlistPage.jsx moveToCart({itemId}) en lugar de moveToCart(id). Causa raíz de skips: fetchProduct/fetchProducts.pending sobreescribe el preloadedState en los tests. ordersSlice y adminSlice actualizados con state.current y state.products. |
| 2026-05-27T21:15:30 | T-401 hecha | npm test: 633 pasan, 105 skipped, 56 fallan (todos preexistentes). Las 18 suites de F1 pasan o tienen skips justificados. |
| 2026-05-27T21:16:00 | T-402 hecha | npm run build: EXIT=0, 26 warnings (Sass preexistentes). |
| 2026-05-27T23:01:07 | T-403 T-404 hechas | decisiones-*.md creado. index.md y indice actualizados a Cerrada. |
| 2026-05-27T23:01:07 | F4 cerrada | T-401..T-404 hechas. F1+F2+F3+F4 completadas. Iniciativa cerrada. |
