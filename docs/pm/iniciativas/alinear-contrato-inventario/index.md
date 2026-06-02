# Iniciativa: alinear-contrato-inventario

**Estado:** EN ANÁLISIS (bloqueada — decisión de modelo + backend ausente)
**Creada:** 2026-06-02
**Origen:** Deep audit de `cablear-rutas-huerfanas` (H-09) — drift de endpoints
del módulo de inventario, archivo NO tocado por las iniciativas recientes.

## Premisa (a verificar al ejecutar)

`src/hooks/domain/useInventory.js:11,13` usa:
- `GET /api/v1/admin/inventory/`
- `/api/v1/admin/inventory/variants/{variantId}/movements/`

El contrato canónico (`/tmp/references/e-comerce-docs/source/backend/
rest-api-conventions.rst:507-518`) declara solo:
- `/api/v1/inventory/{product_id}/`
- `/api/v1/inventory/imports/`

(sin prefijo `/admin/`, sin endpoint de `movements`). El propio doc registra
deuda de URLs de frontend en §8.

## Alcance (propuesto)

Reconciliar los endpoints de inventario del UI (`useInventory`, `inventorySlice`,
páginas `AdminInventory*`, mocks) con el contrato canónico, o — si el backend
real expone `/admin/inventory/*` — actualizar el catálogo. Decisión pendiente de
abrir la iniciativa formalmente (requiere confirmar el backend real, hoy no
disponible en `/tmp/references/e-comerce/api`, vacío).

## Por qué separada

Toca un módulo (inventario) ajeno a las 4 iniciativas recientes; mezclarlo
violaría el foco. Principio-rector Cláusula 4 (sub-iniciativa explícita).
