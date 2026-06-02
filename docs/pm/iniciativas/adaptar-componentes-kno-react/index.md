# Iniciativa: adaptar-componentes-kno-react

**Estado:** CERRADA
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — estudiar el repo `NestorMonroy/-progress` (paquetes
`kno-*`) para adaptar de manera **nativa** componentes como ScrollView,
PDF Viewer, Gantt, etc. al dominio del template.
**Rama:** claude/brave-lamport-BUmBM

## Motivo

El usuario quiere incorporar al template las capacidades de una librería de
componentes rica (ScrollView/carrusel, visor PDF, Gantt, grid avanzado, upload,
etc.). El repo de referencia se clonó en `/tmp/references/-progress` (no
versionado en este repo).

## Enfoque que gobierna la iniciativa (Premise Gate)

El objetivo declarado es adaptar **de manera nativa** estos componentes al
template. Por tanto la estrategia es la misma que en la iniciativa previa
`integrar-componentes-ui-core-js`: **estudiar el catálogo, las APIs públicas
(`.d.ts`) y los patrones de UX como referencia de diseño, e implementar
componentes y UCs propios desde cero** en el stack del template (React + hooks
+ Redux/React Query + SCSS del sistema Yoruba). El resultado es código propio;
el repo de referencia no se importa ni se empaqueta en producción.

Datos observados del repo (neutrales, para contexto de la referencia):

- Los `package.json` usan el scope `@progress/kno-react-*` y metadatos con
  `productCode: "KENDOUIREACT"`; los `README.md` mencionan "license key". O sea,
  el catálogo está modelado sobre **KendoReact**, una librería madura — buena
  como referencia de API y UX.
- Los paquetes vienen **compilados/minificados** (`.mjs`/`.js`) + typings
  `.d.ts`. La fuente útil para inspirarse es la **API pública** (`.d.ts`,
  README) y el comportamiento, no los internals.

> Nota de procedencia: la conclusión sobre uso/licencia del código de referencia
> la define el dueño del proyecto. Esta iniciativa no copia ni redistribuye ese
> código; produce implementaciones nativas, por lo que el enfoque es válido con
> independencia de la procedencia.

## Estado actual

- Repo clonado y auditado: 70 paquetes `kno-*` (41 `kno-react-*`); inventario y
  mapeo en `analisis-inventario-y-mapeo.md`.
- **22 componentes nativos** construidos con TDD (F1 + Tier A/B/C), uno por
  agente en paralelo, todos con unit tests verdes.
- **23 integraciones HECHAS** (F2-F7 + UC-ORD-PDFGEN): cada UC integrado en su
  página con test. `jspdf` es la única dependencia nueva (aprobada, para
  UC-ORD-PDFGEN).
- **F8 E2E HECHA**: 23 checks en Chromium real (storefront + admin, con
  `navigateInApp` para preservar la sesión admin) → **17 pass / 6 warn / 0
  fail**; los WARN son límites de datos/demo, cubiertos por unit tests.
- **F9 HECHA**: `decisiones-*` (4 secciones), docs al día, deuda menor
  documentada como decisiones aceptadas.
- Verificado: **jest 1630 passed / 0 fallos**; check-scss **169 clean**;
  `build:demo` OK; E2E **0 fail**. Sin diferidos.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-adaptar-componentes-kno-react.md` | Premisa verificada, qué cubre, criterio, fuera de alcance |
| `analisis-inventario-y-mapeo.md` | 41 paquetes `kno-react-*` mapeados al dominio ecommerce |
| `ucs-componentes-nativos.md` | Los 4 UCs (UC-CAT-GAL, UC-ADM-IMG, UC-LOG-GANTT, UC-ORD-PDF) |
| `plan-componentes-nativos.md` | Fases (F1 componentes, F2 integraciones, F3 E2E) |
| `tareas-componentes-nativos.md` | Lista plana de tareas |
| `progreso-componentes-nativos.md` | Log de progreso |
