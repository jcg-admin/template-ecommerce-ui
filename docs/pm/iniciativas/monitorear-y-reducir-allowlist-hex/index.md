# Iniciativa: monitorear-y-reducir-allowlist-hex

| Campo | Valor |
|-------|-------|
| Slug | `monitorear-y-reducir-allowlist-hex` |
| Estado | Backlog |
| Orden de backlog | 3 |
| Fecha de creacion (directorio) | 2026-05-21 |
| Iniciativa origen | `resolver-hallazgos-de-deuda-del-template` (delegacion del hallazgo H-05) |

## Motivo de existencia

PR #4 redujo los `#hex` literales del codigo SCSS de 525 a 17, todos
en allowlist. Cada entrada de la allowlist tiene justificacion en
una decision de arquitectura. La tarea continua es **mantener la
allowlist plana o decreciente, no creciente**.

La combinacion de un bloqueador mecanico en pre-push (que rechace
nuevos `#hex` fuera de la allowlist) con un ritual trimestral
documentado (revision de cada entrada vigente, decision de retirar
si la justificacion ya no aplica) constituye una unidad de trabajo
cohesiva que merece su propia iniciativa.

## Estado actual

Iniciativa registrada en backlog. **No abierta todavia**. No tiene
documentos canonicos.

## Como se abre

Cuando llegue su turno segun el orden de backlog (ver
[indice-de-iniciativas.md](../indice-de-iniciativas.md)):

1. Cambiar el estado en el indice de `Backlog` a `En analisis`.
2. Producir `alcance-monitorear-y-reducir-allowlist-hex.md`.
3. Seguir el procedimiento en
   [como-gestionar-iniciativas.md](../../como-gestionar-iniciativas.md).
