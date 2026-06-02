# Análisis (DISCOVER) — alinear-contrato-inventario

```yml
fecha: 2026-06-02T22:19:57
autor: claude
fuente_canonica: /tmp/references/e-comerce-docs/source/backend/rest-api-conventions.rst:505-518
              + source/requisitos/casos-uso/inventario/uc-inv-0{1..5}*.rst
estado: DISCOVER completado — BLOQUEADO por decisión de modelo + backend ausente
```

## Mapa de drift (UI vs contrato canónico)

| Operación | UI actual | Canónico | Drift |
|-----------|-----------|----------|-------|
| Ver stock (UC-INV-01) | `GET /api/v1/admin/inventory/` (lista) | `GET /api/v1/inventory/{product_id}/` | prefijo `/admin/`; **lista vs por-product_id**; granularidad |
| Ajuste manual (UC-INV-04) | `POST /api/v1/admin/inventory/variants/{variantId}/adjust/` | `PATCH /api/v1/inventory/{product_id}/` | prefijo; **verbo** (POST vs PATCH); **variant_id vs product_id** |
| Importar CSV (UC-INV-05) | `POST /api/v1/admin/inventory/import/` | `POST /api/v1/inventory/imports/` | prefijo; `import/` vs `imports/` |
| Movimientos | `GET /api/v1/admin/inventory/variants/{variantId}/movements/` | (no existe en el catálogo) | endpoint extra del UI |
| Alertas stock | `GET /api/v1/admin/inventory/alerts/` | (no existe en el catálogo) | endpoint extra del UI |

Archivos UI afectados: `src/hooks/domain/useInventory.js`,
`src/redux/slices/inventorySlice.js`, `src/mocks/handlers/inventory.ts`,
páginas `AdminInventoryPage`, `AdminInventoryAdjustPage`,
`AdminInventoryMovementsPage`, `AdminInventoryImportPage`, `AdminStockAlertsPage`.

## La decisión de fondo (no es un rename)

1. **Granularidad `variant_id` vs `product_id`.** El UI modela el inventario por
   **variante** (consistente con UC-CHT variantes + `StockAdjustModal` por
   `variant_id`). El catálogo canónico lo expresa por **producto**
   (`/inventory/{product_id}/`). No se puede "renombrar" sin decidir el modelo.
2. **`movements` y `alerts`** existen en el UI pero NO en la tabla canónica de
   conventions. Pueden ser (a) deuda documentada del catálogo, o (b) endpoints
   inventados por el UI. No verificable sin el backend.
3. **Backend ausente:** `/tmp/references/e-comerce/api` está vacío; no se puede
   confirmar si el backend real expone `/admin/inventory/*` por variante (y el
   conventions está incompleto) o si el UI driftó.

## Desenlaces posibles (para decisión del ejecutor)

- **A — Alinear UI → canónico por producto:** refactor grande (5 páginas + hook +
  slice + mocks + tests), y **cambia el modelo** a inventario por producto. Riesgo
  alto; contradice el modelo por-variante del template.
- **B — Mantener UI por-variante y corregir el catálogo:** registrar en
  `e-comerce-docs` que el inventario admin es por variante con `movements`/`alerts`
  y prefijo `/admin/`. El UI solo ajustaría `import/`→`imports/` si se confirma.
- **C — Esperar backend real** (`e-comerce-api`) para confirmar el contrato antes
  de tocar nada.

## Recomendación

**B + C**: el modelo por-variante del UI es coherente con UC-CHT y el resto del
template; lo más probable es que el conventions esté incompleto (solo lista la
vista por-producto del comprador, no las ops admin por-variante). Recomendado:
(1) registrar el gap en `e-comerce-docs` para que el catálogo documente las ops
admin de inventario por variante; (2) confirmar contra `e-comerce-api` cuando
esté disponible; (3) único cambio de bajo riesgo candidato: `import/`→`imports/`
(pendiente de confirmar). **No ejecutar refactor de granularidad sin la decisión
y el backend.**

## Estado

DISCOVER completo. **BLOQUEADO**: requiere (a) decisión A/B/C del ejecutor y
(b) backend real para confirmar. No se ejecuta refactor en esta pasada.
