# Alcance — adaptar-componentes-kno-react

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0c (trazado end-to-end) |
| Red flags activos | RF-2 (licensing/state), RF-6 (infra compartida: nuevos componentes y UCs), RF-3 (no aplica cross-repo) |
| Resultado | EXPANDIR / REORIENTAR (a implementación nativa) |
| Evidencia | `/tmp/references/-progress/` tiene 70 paquetes `kno-*` (41 `kno-react-*`). Los paquetes vienen compilados (`ScrollView.mjs` minificado) + typings `.d.ts`; la API pública y el README sirven como referencia de diseño. El catálogo está modelado sobre KendoReact (`productCode: "KENDOUIREACT"`). |
| Iniciativas previas revisadas | `integrar-componentes-ui-core-js` (precedente: adaptar lógica a React propio, no importar el origen), `implementar-componentes-diferidos-ui-core`, `adaptar-sistema-diseno-yoruba` |

## Por qué existe

El template necesita varias capacidades de UI ricas (galería/carrusel de
producto, visor de PDF para facturas/fichas, timelines tipo Gantt para
logística, grids avanzados para admin, upload de imágenes). KendoReact las
implementa con un diseño maduro de API y UX que vale como **referencia**.

## Qué cubre

1. Inventario de los 41 paquetes `kno-react-*` y clasificación por relevancia
   al dominio ecommerce (alta / media / baja / descartar).
2. Para cada candidato relevante: qué resuelve, qué API/UX expone KendoReact
   (leído de `.d.ts`/README como inspiración), y qué tiene HOY el template
   (para no duplicar).
3. Propuesta de UCs nuevos o ampliaciones de UCs existentes, a implementar
   **nativamente** (código propio: hooks + componentes funcionales + SCSS del
   sistema de diseño Yoruba), con tests.

## Criterio de aceptación

- Cada componente/UC adaptado es **código propio**, sin dependencia de
  `@progress/kno-*` ni copia de su código.
- Se reutiliza el sistema de diseño del template (`@use '@styles/abstracts'`,
  tokens, primitives) y los patrones de estado (Redux Toolkit / React Query).
- Cobertura de tests (unit + E2E donde aplique, vía el harness `tests/e2e/`).
- Trazabilidad: cada UC referencia el componente KendoReact que lo inspiró
  como "referencia de diseño", nunca como dependencia.

## Fuera de alcance

- **Importar o empaquetar** `@progress/kno-*` en el bundle de producción: el
  objetivo es código nativo propio en el stack del template, no una dependencia.
- Reproducir 1:1 el API de KendoReact: se toma como referencia de diseño, no
  como contrato a cumplir.
- Componentes sin encaje claro en un ecommerce (ver clasificación "descartar"
  en el análisis).

## Esfuerzo

Indeterminado hasta priorizar. La iniciativa entra **En análisis**; el plan por
fases se redacta cuando el usuario elija el subconjunto inicial de componentes.
