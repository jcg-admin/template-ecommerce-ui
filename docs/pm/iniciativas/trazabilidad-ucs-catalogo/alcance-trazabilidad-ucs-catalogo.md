# Alcance — trazabilidad-ucs-catalogo

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0c (cross-repo + clasificación exhaustiva con evidencia) |
| Red flags activos | RF-3 (referencia cross-repo: catálogo en la documentación de e-commerce vs `template-ecommerce-ui`), RF-7 (iniciativas previas implementaron UCs; ¿sin tag?) |
| Resultado | **COLAPSAR** |
| Evidencia | `matriz-trazabilidad-ucs.md`: 158 UCs del catálogo clasificados por 5 agentes con evidencia de archivo. 123 IMPLEMENTADO, 23 BACKEND-OPS, **8 AUSENTE-UI**. RF-7 desactivada: casi todo el código lleva el tag `UC-XXX-NN` embebido. |
| Iniciativas previas revisadas | `completar-dominio-de-ecommerce`, `ampliar-ucs-de-ecommerce`, `adaptar-componentes-kno-react` (origen de gran parte de los UCs ya implementados) |

**Conclusión del gate:** la premisa "implementar los UCs del catálogo" es real
pero su alcance **colapsa**: el template ya implementa 123 UCs y 23 son del
backend (`template-ecommerce-server`), fuera de un repo de UI. El trabajo real
es (a) **documentar la trazabilidad** (matriz) y (b) **cerrar los 8 huecos de
UI** genuinos.

## Por qué existe

El catálogo formal de UCs vive en la documentación de e-commerce (Sphinx) y no había un mapeo
explícito catálogo→implementación en el UI. Sin él no se sabía qué falta. Esta
iniciativa produce esa trazabilidad y cierra los huecos de UI reales.

## Qué cubre

1. **Matriz de trazabilidad** de los 158 UCs del catálogo (estado + evidencia).
2. **Implementación de los 8 UCs AUSENTE-UI** con TDD + MSW + test:
   - UC-AUTH-16 — dar de baja la cuenta (cablear `SecurityPage`).
   - UC-SRCH-02 — autocomplete con sugerencias en vivo.
   - UC-PRO-04 — reporte de uso de vouchers (admin).
   - UC-PRO-05 — código de referido (cuenta).
   - UC-LOG-01 — crear guía de envío (admin).
   - UC-LOG-02 — registrar número de rastreo (admin).
   - UC-LOG-06 — gestionar couriers (admin, CRUD).
   - UC-LOG-07 — reportar problema de envío (comprador).

## Criterio de completitud

- Matriz publicada y versionada.
- Los 8 UCs AUSENTE-UI implementados con test verde + handler MSW (demo).
- `npm test` 0 fallos, `check-scss` clean, `build:demo` OK.

## Fuera de alcance

- Los 23 UCs **BACKEND-OPS** (webhooks, emails transaccionales, cron, SSL/SSH,
  reportes a nivel de BD): pertenecen a `template-ecommerce-server`. Se listan
  en la matriz para trazabilidad, pero no se implementan aquí.
- Editar el repo la documentación de e-commerce (fuera del alcance de push autorizado).
