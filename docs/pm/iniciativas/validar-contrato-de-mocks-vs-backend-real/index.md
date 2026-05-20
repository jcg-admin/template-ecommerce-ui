# Iniciativa: validar-contrato-de-mocks-vs-backend-real

| Campo | Valor |
|-------|-------|
| Slug | `validar-contrato-de-mocks-vs-backend-real` |
| Estado | Backlog |
| Orden de backlog | 1 |
| Fecha de creacion (directorio) | 2026-05-21 |
| Iniciativa origen | `resolver-hallazgos-de-deuda-del-template` (delegacion del hallazgo H-07) |

## Motivo de existencia

Los mocks de `src/mocks/` pueden divergir del contrato real del
backend Django+DRF sin que ningun test lo detecte. Un cambio en la
API (anadir campo, cambiar tipo de un enum, renombrar) deja el UI
roto en modo `real` pero verde en modo `mock`.

Esta iniciativa disenara y aplicara una mitigacion concreta. Las
opciones reales (schema por endpoint con ajv o zod, generador desde
OpenAPI compartido, smoke tests contra staging) requieren cada una
su propio analisis con MoSCoW y, en algunos casos, coordinacion con
el repositorio del backend.

## Estado actual

Iniciativa registrada en backlog. **No abierta todavia**. No tiene
documentos canonicos (alcance, analisis, plan, tareas, progreso,
decisiones) porque esos se producen cuando la iniciativa transiciona
de `Backlog` a `En analisis`.

## Como se abre

Cuando llegue su turno segun el orden de backlog (ver
[indice-de-iniciativas.md](../indice-de-iniciativas.md)):

1. Cambiar el estado en el indice de `Backlog` a `En analisis`.
2. Producir `alcance-validar-contrato-de-mocks-vs-backend-real.md`.
3. Seguir el procedimiento en
   [como-gestionar-iniciativas.md](../../como-gestionar-iniciativas.md).
