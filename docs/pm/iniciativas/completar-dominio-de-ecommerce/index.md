# Iniciativa: completar-dominio-de-ecommerce

| Campo | Valor |
|-------|-------|
| Slug | `completar-dominio-de-ecommerce` |
| Estado | En analisis |
| Orden de backlog | (vacio: ya no esta en backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Iniciativa origen | `resolver-hallazgos-de-deuda-del-template` (replan de Fase 5, relacionada con H-02) |
| Iniciativa que aporto deuda registrada | `revisar-arquitectura-de-mocks` (cerrada 2026-05-21) |

## Motivo de existencia

El modelo de dominio del template esta incompleto frente a lo que
todos los e-commerce comparten:

- `User` existe pero parcial (faltan flags de estado, verificacion,
  roles granulares mas alla de `is_staff`).
- `Address` no existe como entidad reutilizable; probablemente vive
  embebida en orden y perfil.
- `ProductVariant` no existe (talla, color, sku, stock y precio
  por variante).
- `Review` no existe (rating, comentario, moderacion).
- Otras posibles ausencias menores (paginacion tipada, shipment
  con tracking).

Esta iniciativa completara el modelo a nivel de entidades comunes
a cualquier e-commerce, junto con los UCs del backend que las
soporten. Tocara `src/types/`, slices, services, UI minima y
posiblemente el repositorio del backend en coordinacion externa.

## Estado actual

Iniciativa abierta en **analisis** el 2026-05-21. Estado: `En analisis`.

Apertura motivada por dos razones documentadas:

1. **Sucesora natural del backlog**: era la siguiente iniciativa
   ejecutable (orden 2). La iniciativa orden 1
   (`validar-contrato-de-mocks-vs-backend-real`) requiere un backend
   Django real corriendo para validar contratos, y en este entorno
   no esta disponible. Lo correcto es desbloquear las iniciativas
   no-bloqueadas antes que mantener el orden estricto.

2. **Deuda recien registrada**: la iniciativa `revisar-arquitectura-de-mocks`,
   cerrada el 2026-05-21, dejo registrada en su documento
   `decisiones-*.md` deuda concreta que **esta** iniciativa debe
   resolver, no la siguiente. Hacer la iniciativa con contexto fresco
   evita re-mapear evidencia. Items registrados a propagar a esta
   iniciativa:
   - Consolidacion de dos familias de paths auth (`/api/auth/` legacy
     vs `/api/v1/auth/` usado por `authSlice`).
   - Unificacion de `fetch` directo (en `ForgotPasswordPage`,
     `ResetPasswordPage`) vs uso de `apiService`.
   - Divergencia tipo `Product` vs shapes runtime que los consumers
     leen (`price`, `original_price`, `images`, `variants` no estan
     en `src/types/domain.ts` pero los handlers MSW y las pages los
     usan).

El analisis detallado de **que esta completo, parcial o ausente** por
entidad pertenece a esta iniciativa, no a la iniciativa origen.

## Documentos esperados

Segun PROC-GESTION-001, una iniciativa en analisis produce:

| Documento | Estado |
|-----------|--------|
| [alcance-completar-dominio-de-ecommerce.md](alcance-completar-dominio-de-ecommerce.md) | Producido. Define los 7 items del alcance (4 gaps de modelado + 3 deudas heredadas), criterios de evaluacion, criterio de completitud y decisiones de proceso. |
| [analisis-completar-dominio-de-ecommerce.md](analisis-completar-dominio-de-ecommerce.md) | Producido. Mapeo de gap por entidad con evidencia citada. Hallazgo central: el patron real es "tipos faltantes para entidades existentes en runtime", no "entidades nuevas que disenar". Esfuerzo estimado ~4.5h. |
| `plan-completar-dominio-de-ecommerce.md` | Pendiente. Producido cuando paso a `En ejecucion`. |
| `tareas-completar-dominio-de-ecommerce.md` | Pendiente. |
| `progreso-completar-dominio-de-ecommerce.md` | Pendiente. |
| `decisiones-completar-dominio-de-ecommerce.md` | Pendiente. Obligatorio al cierre. |
