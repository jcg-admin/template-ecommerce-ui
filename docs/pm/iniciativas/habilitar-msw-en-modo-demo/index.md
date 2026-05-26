# Iniciativa: habilitar-msw-en-modo-demo

| Campo | Valor |
|-------|-------|
| Slug | `habilitar-msw-en-modo-demo` |
| Estado | Cerrada |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-26T00:25:12 |
| Fecha de apertura formal | 2026-05-26T00:25:12 |
| Fecha de paso a ejecucion | 2026-05-26T00:25:12 |
| Fecha de cierre | 2026-05-26T00:31:28 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

El `dist/` producido por `npm run build` servido via Nginx no muestra
datos. La causa es una combinacion de dos decisiones correctas pero
que juntas producen un comportamiento no obvio para quien adopta el
template:

1. **MSW esta guardado por `NODE_ENV`**: `src/index.jsx` solo arranca
   el Service Worker si `NODE_ENV !== 'production'`. Un build de
   produccion nunca arranca MSW, por diseno.

2. **`mockServiceWorker.js` no se copia a `dist/`**: webpack solo
   procesa `public/index.html` via `HtmlWebpackPlugin`. No hay
   `copy-webpack-plugin` que copie `public/mockServiceWorker.js` al
   directorio de salida.

La ADR `dec-mocks-via-msw-service-worker` documenta el trade-off del
service worker y lista cuatro mitigaciones aplicadas. Ninguna de ellas
resuelve el caso de uso de demostrar el template con datos de mock
sobre el bundle compilado.

Esta iniciativa agrega un **modo demo**: una tercera condicion de
arranque (`DEMO_MODE=true`) que permite que MSW arranque sobre el
bundle de produccion, copiando `mockServiceWorker.js` a `dist/` para
ese caso especifico.

El modo demo es explicito y opt-in. Un build de produccion sin
`DEMO_MODE=true` no cambia en absoluto.

## ADR relacionada

`dec-mocks-via-msw-service-worker` (Estado: Aceptada) no se supersede.
Esta iniciativa extiende las mitigaciones listadas en el campo
"Trade-off del Service Worker" de esa ADR. El guard `NODE_ENV` se
mantiene; se agrega un guard adicional `DEMO_MODE`.

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-26.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-habilitar-msw-en-modo-demo.md](alcance-habilitar-msw-en-modo-demo.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance. |
| [analisis-habilitar-msw-en-modo-demo.md](analisis-habilitar-msw-en-modo-demo.md) | Diagnostico de por que no carga nada, alternativas de solucion, decision tomada. |
| [plan-habilitar-msw-en-modo-demo.md](plan-habilitar-msw-en-modo-demo.md) | Plan de ejecucion en fases con tareas atomicas T-NNN y DAG. |
| [tareas-habilitar-msw-en-modo-demo.md](tareas-habilitar-msw-en-modo-demo.md) | Lista plana de las tareas con su estado actual. |
| [progreso-habilitar-msw-en-modo-demo.md](progreso-habilitar-msw-en-modo-demo.md) | Log temporal del avance, con una entrada por evento relevante. |
| [decisiones-habilitar-msw-en-modo-demo.md](decisiones-habilitar-msw-en-modo-demo.md) | Decisiones de diseno, hallazgos y verificacion post-ejecucion. Obligatorio por PROC-GESTION-001. |
