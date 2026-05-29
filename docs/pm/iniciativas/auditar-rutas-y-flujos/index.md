# auditar-rutas-y-flujos

| Campo | Valor |
|-------|-------|
| Slug | auditar-rutas-y-flujos |
| Estado | En ejecucion |
| Fecha de apertura | 2026-05-28 |
| Origen | Prueba visual en browser — rutas huerfanas, 404 mal manejados, flujos incompletos |

## Objetivo

Garantizar que cada URL del router tenga: pagina JSX conectada, handler MSW que
responda a sus llamadas API, comportamiento correcto de 404, y proteccion adecuada
(publica / auth / admin).

## Hallazgos de apertura

| Hallazgo | Tipo | Severidad |
|---------|------|-----------|
| 12 paginas JSX sin ruta en router | Huerfana | Alta |
| NotFoundPage referenciada en router sin path="/404" correcto | Bug | Media |
| AdminVariantsPage y AdminProductVariantsPage cubren el mismo path | Duplicado | Media |
| ProductPage selector incorrecto (BUG-BROWSER-01) | Bug | Alta — CORREGIDO |
| SearchBar texto invisible (BUG-BROWSER-02) | Bug | Alta — CORREGIDO |
| RangeSlider sin estilos de thumb (BUG-BROWSER-03) | Bug | Media — CORREGIDO |
| CatalogPage ignoraba ?category del URL (BUG-BROWSER-04) | Bug | Alta — CORREGIDO |

## Documentos

| Documento | Estado |
|-----------|--------|
| [auditoria-completa](auditoria-completa.md) | Activo |
| [hallazgos](hallazgos-auditar-rutas-y-flujos.md) | Activo |
| [plan-de-tareas](plan-de-tareas.md) | Activo |
