# Iniciativa: alinear-ui-al-backend-real

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-02
**Origen:** Tras poblar el submódulo `api` (backend Django real,
`/tmp/references/e-comerce/api` @ develop), auditar TODO el UI (slices/hooks/
mocks) contra el contrato REAL (urls.py + serializers), no solo specs.

## Premisa

El backend real está disponible (`git submodule update --init api`). La
auditoría previa contra specs (`e-comerce-docs`) tenía tablas incompletas
(p.ej. inventario). El contrato autoritativo es el código Django real.

## Alcance

- 5 agentes de auditoría por dominio (read-only) → reportes de drift en
  `audits/`. Excluye **settings** (corregido en paralelo por el ejecutor) e
  **inventario** (ya verificado: UI correcto).
- Corrección de settings: endpoint split (admin `/admin/settings/`, público
  `/config/settings/`) + campos reales del serializer + mock + tests (TDD).
- Consolidación + corrección de drifts accionables + verificación + cierre.
