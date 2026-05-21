# Iniciativa: monitorear-y-reducir-allowlist-hex

| Campo | Valor |
|-------|-------|
| Slug | `monitorear-y-reducir-allowlist-hex` |
| Estado | **Cancelada** (subsumida por `auditar-scss-completo`) |
| Orden de backlog (historico) | 3 (cuando estaba en backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de cancelacion | 2026-05-21 |
| Iniciativa origen | `resolver-hallazgos-de-deuda-del-template` (delegacion del hallazgo H-05) |
| Iniciativa que la subsume | [`auditar-scss-completo`](../auditar-scss-completo/) |

## Motivo de existencia (historico)

PR #4 redujo los `#hex` literales del codigo SCSS de 525 a 17, todos
en allowlist. Cada entrada de la allowlist tiene justificacion en
una decision de arquitectura. La tarea continua era **mantener la
allowlist plana o decreciente, no creciente**.

La combinacion de un bloqueador mecanico en pre-push (que rechace
nuevos `#hex` fuera de la allowlist) con un ritual trimestral
documentado (revision de cada entrada vigente, decision de retirar
si la justificacion ya no aplica) se planeo como unidad de trabajo
cohesiva.

## Por que se cancela

El 2026-05-21 el usuario solicito ampliar el scope: en vez de
limitarse a la allowlist de `#hex`, **auditar todo el SCSS** del
template. Esto incluye:

- Allowlist hex (sigue dentro, pero ya no es el centro).
- Variables CSS y organizacion (custom properties, mixins,
  partials).
- Convenciones de nombrado (BEM, CSS Modules, scoping).
- Uso de SCSS modules vs estilos globales.
- Pipeline `@use` / `@forward` / `@import` (parcialmente cubierto
  por ADR previa, pero pendiente de auditoria).
- Especificidad y herencia.
- Tokens de diseno (colores, espaciados, tipografia, breakpoints).
- Variables muertas, duplicadas o nunca usadas.
- Consistencia con la arquitectura del frontend ya definida.

La iniciativa **subsume** a esta. El trabajo planeado aqui (allowlist
hex + bloqueador pre-push + ritual trimestral) queda como un
sub-objetivo dentro de su alcance.

## Justificacion para cancelar en vez de replanear

Tres opciones se evaluaron al recibir la solicitud del usuario:

- **Opcion A**: renombrar `monitorear-y-reducir-allowlist-hex` ->
  `auditar-scss-completo` in-place. Pro: preserva el orden de
  backlog. Contra: el slug historico citado por
  `resolver-hallazgos-de-deuda-del-template` (H-05) se pierde sin
  rastro.
- **Opcion B (adoptada)**: cancelar esta iniciativa, abrir
  `auditar-scss-completo` nueva que la subsume. Pro: slug describe
  trabajo, trazabilidad limpia (esta cancelada apunta a la nueva),
  cualquier referencia historica a H-05 sigue resolvible. Contra:
  una iniciativa cancelada sin ejecutar como ruido de gestion.
- **Opcion C**: replan formal manteniendo este slug. Pro: preserva
  slug y backlog. Contra: el nombre del slug ya no describe el
  trabajo.

El usuario eligio B explicitamente.

## Trabajo no ejecutado que migra a `auditar-scss-completo`

- Bloqueador mecanico en pre-push contra nuevos `#hex` fuera de
  allowlist.
- Ritual trimestral de revision de cada entrada vigente.
- Cualquier decision sobre como retirar entradas cuando su
  justificacion ya no aplica.

Estos tres puntos los hereda `auditar-scss-completo` como parte de
su alcance.

## Como se cierra

Esta iniciativa se considera **Cancelada** (no Cerrada). La
diferencia es importante:

- **Cerrada**: la iniciativa ejecuto su trabajo y produjo
  resultados. Tiene `decisiones-*.md` con las cuatro secciones
  canonicas.
- **Cancelada**: la iniciativa no se ejecuto y su scope fue
  absorbido por otra. No requiere `decisiones-*.md` propio (las
  decisiones se toman en la iniciativa que la subsume).

Este `index.md` documenta la cancelacion y la trazabilidad. No se
producen otros artefactos canonicos.
