# Iniciativa: completar-dominio-de-ecommerce

| Campo | Valor |
|-------|-------|
| Slug | `completar-dominio-de-ecommerce` |
| Estado | Backlog |
| Orden de backlog | 3 |
| Fecha de creacion (directorio) | 2026-05-21 |
| Iniciativa origen | `resolver-hallazgos-de-deuda-del-template` (replan de Fase 5, relacionada con H-02) |

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

Iniciativa registrada en backlog. **No abierta todavia**. No tiene
documentos canonicos. El analisis detallado de "que esta completo,
parcial o ausente" pertenece a esta iniciativa, no a la iniciativa
origen.

## Como se abre

Cuando llegue su turno segun el orden de backlog (ver
[indice-de-iniciativas.md](../indice-de-iniciativas.md)):

1. Cambiar el estado en el indice de `Backlog` a `En analisis`.
2. Producir `alcance-completar-dominio-de-ecommerce.md`.
3. Seguir el procedimiento en
   [como-gestionar-iniciativas.md](../../como-gestionar-iniciativas.md).
4. El analisis debe empezar por mapeo formal de gap por entidad
   con evidencia (archivos, endpoints, UCs del backend), antes de
   proponer cualquier diseno.
