# Iniciativa: adaptar-componentes-kno-react

**Estado:** EN EJECUCIÓN
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
- **F1 HECHA** — 4 componentes nativos propios construidos con tests (un agente
  por componente, en paralelo): `ProductGallery`, `FileUpload`, `GanttChart`,
  `PdfViewer` bajo `src/components/common/`.
- **F2 EN CURSO** — `ProductGallery` integrado en `ProductPage` (UC-CAT-GAL).
  Las otras 3 integraciones quedan como tareas (ver plan); PdfViewer depende de
  decidir la fuente del PDF en DEMO_MODE.
- Verificado: jest 1385 passed / 0 fallos; check-scss 153 clean; build:demo OK.
- **Plan ampliado (F1-F9)** para cubrir los **22 UCs** (4 hechos + 18 nuevos)
  con tareas atómicas, agrupadas por tier (A/B/C). Ejecución pendiente.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-adaptar-componentes-kno-react.md` | Premisa verificada, qué cubre, criterio, fuera de alcance |
| `analisis-inventario-y-mapeo.md` | 41 paquetes `kno-react-*` mapeados al dominio ecommerce |
| `ucs-componentes-nativos.md` | Los 4 UCs (UC-CAT-GAL, UC-ADM-IMG, UC-LOG-GANTT, UC-ORD-PDF) |
| `plan-componentes-nativos.md` | Fases (F1 componentes, F2 integraciones, F3 E2E) |
| `tareas-componentes-nativos.md` | Lista plana de tareas |
| `progreso-componentes-nativos.md` | Log de progreso |
